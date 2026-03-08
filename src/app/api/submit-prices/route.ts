import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { inferBeerType } from "@/lib/beer-types";

export const dynamic = "force-dynamic";

const MAX_SUBMISSIONS_PER_HOUR = 3;

interface PriceRow {
  brand: string;
  price: number; // pounds as decimal e.g. 5.50
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Honeypot check
  if (body.website) {
    return NextResponse.json({ success: true });
  }

  const { pubId, newPub, prices } = body as {
    pubId?: string;
    newPub?: {
      name: string;
      address: string;
      postcode: string;
      borough?: string;
      neighbourhood?: string;
      lat?: string;
      lng?: string;
    };
    prices: PriceRow[];
  };

  // Validate: must have either pubId or newPub
  if (!pubId && !newPub) {
    return NextResponse.json(
      { error: "Please select a pub or add a new one." },
      { status: 400 }
    );
  }

  // Validate prices
  if (!prices || prices.length === 0) {
    return NextResponse.json(
      { error: "Please add at least one beer price." },
      { status: 400 }
    );
  }

  if (prices.length > 10) {
    return NextResponse.json(
      { error: "Maximum 10 prices per submission." },
      { status: 400 }
    );
  }

  for (const p of prices) {
    if (!p.brand?.trim() || !p.price || p.price <= 0 || p.price > 20) {
      return NextResponse.json(
        { error: "Each beer needs a name and a valid price (£0.01–£20.00)." },
        { status: 400 }
      );
    }
  }

  // Validate new pub fields
  if (newPub) {
    if (!newPub.name?.trim() || !newPub.address?.trim() || !newPub.postcode?.trim()) {
      return NextResponse.json(
        { error: "New pub requires name, address, and postcode." },
        { status: 400 }
      );
    }
  }

  // Get IP for rate limiting
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  // Rate limit: check across both submission tables
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count: priceSubCount } = await supabaseAdmin
    .from("price_submissions")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("submitted_at", oneHourAgo);

  const { count: pubSubCount } = await supabaseAdmin
    .from("pub_submissions")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("submitted_at", oneHourAgo);

  const totalRecent = (priceSubCount ?? 0) + (pubSubCount ?? 0);

  if (totalRecent >= MAX_SUBMISSIONS_PER_HOUR) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait a while before submitting again." },
      { status: 429 }
    );
  }

  const resolvedPubId = pubId || null;
  let pubSubmissionId: string | null = null;

  // If new pub, create a pub_submission
  if (newPub && !pubId) {
    const { data: pubSub, error: pubSubErr } = await supabaseAdmin
      .from("pub_submissions")
      .insert([
        {
          name: newPub.name.trim(),
          address: newPub.address.trim(),
          postcode: newPub.postcode.trim().toUpperCase(),
          borough: newPub.borough?.trim() || null,
          neighbourhood: newPub.neighbourhood?.trim() || null,
          lat: newPub.lat ? parseFloat(newPub.lat) : null,
          lng: newPub.lng ? parseFloat(newPub.lng) : null,
          notes: `Submitted with ${prices.length} price(s)`,
          status: "pending",
          ip,
        },
      ])
      .select("id")
      .single();

    if (pubSubErr) {
      return NextResponse.json({ error: pubSubErr.message }, { status: 500 });
    }
    pubSubmissionId = pubSub.id;
  }

  // For each price, check if it's a correction (existing price for same pub + brand)
  const insertRows = [];

  for (const p of prices) {
    const brandTrimmed = p.brand.trim();
    const pricePence = Math.round(p.price * 100);
    const beerType = inferBeerType(brandTrimmed);

    let isCorrection = false;
    let existingPriceId: string | null = null;
    let existingPricePence: number | null = null;

    // Only check for corrections if we have an existing pub
    if (resolvedPubId) {
      const { data: existing } = await supabaseAdmin
        .from("prices")
        .select("id, price_pence")
        .eq("pub_id", resolvedPubId)
        .ilike("brand", brandTrimmed)
        .limit(1)
        .single();

      if (existing) {
        isCorrection = true;
        existingPriceId = existing.id;
        existingPricePence = existing.price_pence;
      }
    }

    insertRows.push({
      pub_id: resolvedPubId,
      pub_submission_id: pubSubmissionId,
      brand: brandTrimmed,
      type: beerType,
      price_pence: pricePence,
      is_correction: isCorrection,
      existing_price_id: existingPriceId,
      existing_price_pence: existingPricePence,
      status: "pending",
      ip,
    });
  }

  const { error: insertErr } = await supabaseAdmin
    .from("price_submissions")
    .insert(insertRows);

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

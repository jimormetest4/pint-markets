import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const MAX_SUBMISSIONS_PER_HOUR = 3;

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Honeypot check — hidden "website" field should be empty
  if (body.website) {
    // Silently reject but return success to not tip off bots
    return NextResponse.json({ success: true });
  }

  const { name, address, postcode, borough, neighbourhood, lat, lng, notes } =
    body;

  if (!name || !address || !postcode) {
    return NextResponse.json(
      { error: "Pub name, address, and postcode are required." },
      { status: 400 }
    );
  }

  // Get IP for rate limiting
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  // Rate limit: 3 submissions per IP per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count, error: countErr } = await supabaseAdmin
    .from("pub_submissions")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("submitted_at", oneHourAgo);

  if (countErr) {
    // Table might not exist
    if (
      countErr.message.includes("does not exist") ||
      countErr.message.includes("Could not find") ||
      countErr.code === "42P01"
    ) {
      return NextResponse.json(
        { error: "Submissions are not yet enabled. Please try again later." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: countErr.message }, { status: 500 });
  }

  if ((count ?? 0) >= MAX_SUBMISSIONS_PER_HOUR) {
    return NextResponse.json(
      {
        error:
          "Too many submissions. Please wait a while before submitting again.",
      },
      { status: 429 }
    );
  }

  // Insert submission
  const { error: insertErr } = await supabaseAdmin
    .from("pub_submissions")
    .insert([
      {
        name: name.trim(),
        address: address.trim(),
        postcode: postcode.trim().toUpperCase(),
        borough: borough?.trim() || null,
        neighbourhood: neighbourhood?.trim() || null,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        notes: notes?.trim() || null,
        status: "pending",
        ip,
      },
    ]);

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface CsvRow {
  pub_name: string;
  brand: string;
  type: string;
  price: string;
}

export async function POST(req: NextRequest) {
  const { rows } = (await req.json()) as { rows: CsvRow[] };

  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];
  let pubsCreated = 0;
  let pricesAdded = 0;
  let rowsSkipped = 0;
  const errors: string[] = [];

  // Cache pub lookups to avoid repeated queries
  const pubCache = new Map<string, string>(); // name (lowercase) → id

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const { pub_name, brand, type, price } = row;

    // Validate
    const priceNum = parseFloat(price);
    if (!pub_name || !brand || !type || isNaN(priceNum) || priceNum <= 0) {
      rowsSkipped++;
      errors.push(`Row ${i + 1}: invalid data (${pub_name || "no name"}, ${brand || "no brand"}, ${price || "no price"})`);
      continue;
    }

    const pricePence = Math.round(priceNum * 100);
    const nameKey = pub_name.trim().toLowerCase();

    // Find or create pub
    let pubId = pubCache.get(nameKey);

    if (!pubId) {
      // Look up existing pub
      const { data: existing } = await supabaseAdmin
        .from("pubs")
        .select("id")
        .ilike("name", pub_name.trim())
        .limit(1);

      if (existing && existing.length > 0) {
        pubId = existing[0].id;
      } else {
        // Create new pub
        const { data: newPub, error: pubErr } = await supabaseAdmin
          .from("pubs")
          .insert([{ name: pub_name.trim() }])
          .select("id")
          .single();

        if (pubErr || !newPub) {
          rowsSkipped++;
          errors.push(`Row ${i + 1}: failed to create pub "${pub_name}"`);
          continue;
        }
        pubId = newPub.id;
        pubsCreated++;
      }
      pubCache.set(nameKey, pubId);
    }

    // Insert price
    const { error: priceErr } = await supabaseAdmin
      .from("prices")
      .insert([
        {
          pub_id: pubId,
          brand: brand.trim(),
          type: type.trim(),
          price_pence: pricePence,
          date_recorded: today,
        },
      ]);

    if (priceErr) {
      rowsSkipped++;
      errors.push(`Row ${i + 1}: failed to insert price — ${priceErr.message}`);
    } else {
      pricesAdded++;
    }
  }

  return NextResponse.json({
    success: true,
    pubs_created: pubsCreated,
    prices_added: pricesAdded,
    rows_skipped: rowsSkipped,
    errors: errors.slice(0, 20), // cap error list
  });
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST() {
  const today = new Date().toISOString().split("T")[0];

  // Check if snapshot already exists for today
  const { data: existing } = await supabaseAdmin
    .from("price_snapshots")
    .select("id")
    .eq("snapshot_date", today)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: `Snapshot already exists for ${today}. Delete existing snapshots first to re-run.` },
      { status: 409 }
    );
  }

  // Fetch all current prices
  const { data: prices, error: fetchError } = await supabaseAdmin
    .from("prices")
    .select("pub_id, brand, price_pence");

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!prices || prices.length === 0) {
    return NextResponse.json({ error: "No prices to snapshot" }, { status: 400 });
  }

  // Insert into price_snapshots
  const rows = prices.map((p) => ({
    pub_id: p.pub_id,
    brand: p.brand,
    price_pence: p.price_pence,
    snapshot_date: today,
  }));

  const { error: insertError } = await supabaseAdmin
    .from("price_snapshots")
    .insert(rows);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: rows.length, date: today });
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  // Latest 10 pubs with their cheapest pint price
  const { data: latestPrices } = await supabaseAdmin
    .from("prices")
    .select("price_pence, brand, type, date_recorded, pub_id, pubs(name, neighbourhood, borough, postcode)")
    .order("date_recorded", { ascending: false })
    .limit(50);

  // Deduplicate to 10 unique pubs, keeping cheapest per pub
  const pubMap = new Map<
    string,
    { pub_name: string; neighbourhood: string; brand: string; type: string; price_pence: number; date_recorded: string }
  >();
  for (const row of latestPrices ?? []) {
    const pub = row.pubs as unknown as { name: string; neighbourhood: string | null; borough: string | null; postcode: string | null } | null;
    if (!pub) continue;
    const existing = pubMap.get(row.pub_id);
    if (!existing || row.price_pence < existing.price_pence) {
      pubMap.set(row.pub_id, {
        pub_name: pub.name,
        neighbourhood: pub.neighbourhood || pub.borough || pub.postcode || "",
        brand: row.brand,
        type: row.type,
        price_pence: row.price_pence,
        date_recorded: row.date_recorded,
      });
    }
    if (pubMap.size >= 10) break;
  }
  const latest = Array.from(pubMap.values());

  // Cheapest pint overall
  const { data: cheapestRow } = await supabaseAdmin
    .from("prices")
    .select("price_pence, brand, type, pubs(name, neighbourhood, borough, postcode)")
    .order("price_pence", { ascending: true })
    .limit(1)
    .maybeSingle();

  const cheapestPub = cheapestRow?.pubs as unknown as { name: string; neighbourhood: string | null; borough: string | null; postcode: string | null } | null;
  const cheapest = cheapestRow && cheapestPub
    ? {
        pub_name: cheapestPub.name,
        neighbourhood: cheapestPub.neighbourhood || cheapestPub.borough || cheapestPub.postcode || "",
        brand: cheapestRow.brand,
        type: cheapestRow.type,
        price_pence: cheapestRow.price_pence,
      }
    : null;

  // Stats
  const { count: totalPubs } = await supabaseAdmin
    .from("pubs")
    .select("*", { count: "exact", head: true });

  const { count: totalPrices } = await supabaseAdmin
    .from("prices")
    .select("*", { count: "exact", head: true });

  // Average price
  const { data: allPrices } = await supabaseAdmin
    .from("prices")
    .select("price_pence");
  const avgPence =
    allPrices && allPrices.length > 0
      ? Math.round(allPrices.reduce((s, r) => s + r.price_pence, 0) / allPrices.length)
      : 0;

  // Last update date
  const { data: lastRow } = await supabaseAdmin
    .from("prices")
    .select("date_recorded")
    .order("date_recorded", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    latest,
    cheapest,
    stats: {
      totalPubs: totalPubs ?? 0,
      totalPrices: totalPrices ?? 0,
      avgPricePence: avgPence,
      lastUpdate: lastRow?.date_recorded ?? null,
    },
  });
}

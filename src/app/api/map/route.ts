import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  // All prices joined with pub location data
  const { data: rawPrices, error } = await supabaseAdmin
    .from("prices")
    .select(
      "pub_id, brand, type, price_pence, pubs(name, address, postcode, borough, latitude, longitude)"
    )
    .order("price_pence", { ascending: true })
    .limit(2000);

  if (error) {
    return NextResponse.json({ markers: [], boroughs: [], error: error.message }, { status: 500 });
  }

  interface PubAgg {
    name: string;
    address: string;
    postcode: string;
    borough: string;
    lat: number;
    lng: number;
    cheapest_brand: string;
    cheapest_type: string;
    cheapest_pence: number;
  }

  // Aggregate cheapest per pub
  const pubMap = new Map<string, PubAgg>();
  for (const row of rawPrices ?? []) {
    const pub = row.pubs as unknown as {
      name: string;
      address: string;
      postcode: string;
      borough: string;
      latitude: number;
      longitude: number;
    } | null;
    if (!pub || !pub.latitude || !pub.longitude) continue;

    if (!pubMap.has(row.pub_id)) {
      pubMap.set(row.pub_id, {
        name: pub.name,
        address: pub.address,
        postcode: pub.postcode,
        borough: pub.borough,
        lat: pub.latitude,
        lng: pub.longitude,
        cheapest_brand: row.brand,
        cheapest_type: row.type,
        cheapest_pence: row.price_pence,
      });
    }
  }

  const markers = Array.from(pubMap.values());

  // Compute price thresholds for colour coding
  const prices = markers.map((m) => m.cheapest_pence).sort((a, b) => a - b);
  const t1 = prices.length > 0 ? prices[Math.floor(prices.length / 3)] : 0;
  const t2 = prices.length > 0 ? prices[Math.floor((prices.length * 2) / 3)] : 0;

  // Borough averages
  const boroughMap = new Map<string, { total: number; count: number }>();
  for (const m of markers) {
    if (!m.borough) continue;
    const entry = boroughMap.get(m.borough) ?? { total: 0, count: 0 };
    entry.total += m.cheapest_pence;
    entry.count++;
    boroughMap.set(m.borough, entry);
  }

  const boroughs = Array.from(boroughMap.entries()).map(([name, e]) => ({
    name,
    avg_pence: Math.round(e.total / e.count),
    count: e.count,
  }));

  return NextResponse.json({
    markers,
    thresholds: { cheap: t1, mid: t2 },
    boroughs,
  }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

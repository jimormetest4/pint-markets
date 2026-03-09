import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface PubJoin {
  name: string;
  neighbourhood: string | null;
  borough: string | null;
  postcode: string | null;
}

interface PriceWithPub {
  price_pence: number;
  brand: string;
  type: string;
  pub_id: string;
  pubs: PubJoin | null;
}

interface Spotlight {
  title: string;
  subtitle: string | null;
  mode: "cheapest" | "priciest";
  pub_name: string;
  neighbourhood: string;
  brand: string;
  type: string;
  price_pence: number;
}

function toSpotlight(
  title: string,
  subtitle: string | null,
  mode: "cheapest" | "priciest",
  row: PriceWithPub
): Spotlight {
  const pub = row.pubs;
  return {
    title,
    subtitle,
    mode,
    pub_name: pub?.name ?? "Unknown",
    neighbourhood: pub?.neighbourhood || pub?.borough || pub?.postcode || "",
    brand: row.brand,
    type: row.type,
    price_pence: row.price_pence,
  };
}

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
    const pub = row.pubs as unknown as PubJoin | null;
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

  // Fetch all prices for spotlight computation
  const { data: allPriceRows } = await supabaseAdmin
    .from("prices")
    .select("price_pence, brand, type, pub_id, pubs(name, neighbourhood, borough, postcode)")
    .order("price_pence", { ascending: true });

  const rows = (allPriceRows ?? []) as unknown as PriceWithPub[];

  // Build spotlights — include all valid dimension entries for variety
  const spotlights: Spotlight[] = [];

  // Helper: group rows by a key, return entries where cheapest != priciest pub
  function groupBy(
    keyFn: (r: PriceWithPub) => string
  ): Map<string, { cheapest: PriceWithPub; priciest: PriceWithPub }> {
    const map = new Map<string, { cheapest: PriceWithPub; priciest: PriceWithPub }>();
    for (const r of rows) {
      const key = keyFn(r).trim();
      if (!key) continue;
      const entry = map.get(key);
      if (!entry) {
        map.set(key, { cheapest: r, priciest: r });
      } else {
        if (r.price_pence < entry.cheapest.price_pence) entry.cheapest = r;
        if (r.price_pence > entry.priciest.price_pence) entry.priciest = r;
      }
    }
    return map;
  }

  if (rows.length > 0) {
    // Overall cheapest & priciest (always first two)
    spotlights.push(toSpotlight("CHEAPEST PINT", null, "cheapest", rows[0]));
    spotlights.push(toSpotlight("PRICIEST PINT", null, "priciest", rows[rows.length - 1]));

    // By borough — all boroughs with distinct cheapest/priciest pubs
    const byBorough = groupBy((r) => r.pubs?.borough ?? "");
    const boroughPairs: Spotlight[] = [];
    for (const [name, data] of byBorough) {
      if (data.cheapest.pub_id === data.priciest.pub_id) continue;
      boroughPairs.push(toSpotlight("CHEAPEST IN", name.toUpperCase(), "cheapest", data.cheapest));
      boroughPairs.push(toSpotlight("PRICIEST IN", name.toUpperCase(), "priciest", data.priciest));
    }
    spotlights.push(...boroughPairs);

    // By beer type — all types with distinct cheapest/priciest pubs
    const byType = groupBy((r) => r.type ?? "");
    const typePairs: Spotlight[] = [];
    for (const [name, data] of byType) {
      if (data.cheapest.pub_id === data.priciest.pub_id) continue;
      typePairs.push(toSpotlight("CHEAPEST", name.toUpperCase(), "cheapest", data.cheapest));
      typePairs.push(toSpotlight("PRICIEST", name.toUpperCase(), "priciest", data.priciest));
    }
    spotlights.push(...typePairs);

    // By area (neighbourhood) — all areas with distinct cheapest/priciest pubs
    const byArea = groupBy((r) => r.pubs?.neighbourhood ?? "");
    const areaPairs: Spotlight[] = [];
    for (const [name, data] of byArea) {
      if (data.cheapest.pub_id === data.priciest.pub_id) continue;
      areaPairs.push(toSpotlight("CHEAPEST IN", name.toUpperCase(), "cheapest", data.cheapest));
      areaPairs.push(toSpotlight("PRICIEST IN", name.toUpperCase(), "priciest", data.priciest));
    }
    spotlights.push(...areaPairs);
  }

  // Cheapest for backward compat
  const cheapest = spotlights.length > 0
    ? {
        pub_name: spotlights[0].pub_name,
        neighbourhood: spotlights[0].neighbourhood,
        brand: spotlights[0].brand,
        type: spotlights[0].type,
        price_pence: spotlights[0].price_pence,
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
  const avgPence =
    rows.length > 0
      ? Math.round(rows.reduce((s, r) => s + r.price_pence, 0) / rows.length)
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
    spotlights,
    stats: {
      totalPubs: totalPubs ?? 0,
      totalPrices: totalPrices ?? 0,
      avgPricePence: avgPence,
      lastUpdate: lastRow?.date_recorded ?? null,
    },
  });
}

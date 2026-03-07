import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface PriceRow {
  pub_id: string;
  brand: string;
  type: string;
  price_pence: number;
  pubs: { name: string; postcode: string; borough: string; neighbourhood: string } | null;
}

export async function GET(req: NextRequest) {
  const view = req.nextUrl.searchParams.get("view") ?? "cheapest_pubs";

  // Fetch all prices with pub info — single query for all views
  const { data: rawData, error } = await supabaseAdmin
    .from("prices")
    .select("pub_id, brand, type, price_pence, pubs(name, postcode, borough, neighbourhood)")
    .order("price_pence", { ascending: true })
    .limit(2000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (rawData ?? []) as unknown as PriceRow[];
  const headers = { "Cache-Control": "no-store, max-age=0" };

  if (view === "cheapest_pubs") {
    return NextResponse.json({ data: buildCheapestPubs(rows) }, { headers });
  }
  if (view === "by_brand") {
    return NextResponse.json({ data: buildByBrand(rows) }, { headers });
  }
  if (view === "by_borough") {
    return NextResponse.json({ data: buildByBorough(rows) }, { headers });
  }
  if (view === "price_spread") {
    return NextResponse.json({ data: buildPriceSpread(rows) }, { headers });
  }

  return NextResponse.json({ data: buildCheapestPubs(rows) }, { headers });
}

function buildCheapestPubs(rows: PriceRow[]) {
  // Cheapest price per pub, top 20
  const pubMap = new Map<string, {
    pub_name: string;
    area: string;
    brand: string;
    price_pence: number;
  }>();

  for (const r of rows) {
    if (!r.pubs) continue;
    if (!pubMap.has(r.pub_id)) {
      pubMap.set(r.pub_id, {
        pub_name: r.pubs.name,
        area: r.pubs.neighbourhood || r.pubs.borough || r.pubs.postcode || "",
        brand: r.brand,
        price_pence: r.price_pence,
      });
    }
  }

  return Array.from(pubMap.values())
    .sort((a, b) => a.price_pence - b.price_pence)
    .slice(0, 20);
}

function buildByBrand(rows: PriceRow[]) {
  const brandMap = new Map<string, {
    prices: number[];
    cheapestPub: string;
    cheapestPrice: number;
    pubs: Set<string>;
  }>();

  for (const r of rows) {
    if (!r.pubs) continue;
    let entry = brandMap.get(r.brand);
    if (!entry) {
      entry = { prices: [], cheapestPub: r.pubs.name, cheapestPrice: r.price_pence, pubs: new Set() };
      brandMap.set(r.brand, entry);
    }
    entry.prices.push(r.price_pence);
    entry.pubs.add(r.pub_id);
    if (r.price_pence < entry.cheapestPrice) {
      entry.cheapestPrice = r.price_pence;
      entry.cheapestPub = r.pubs.name;
    }
  }

  return Array.from(brandMap.entries())
    .map(([brand, e]) => ({
      brand,
      avg_pence: Math.round(e.prices.reduce((s, p) => s + p, 0) / e.prices.length),
      cheapest_pence: e.cheapestPrice,
      cheapest_pub: e.cheapestPub,
      num_pubs: e.pubs.size,
    }))
    .sort((a, b) => a.avg_pence - b.avg_pence);
}

function buildByBorough(rows: PriceRow[]) {
  const boroughMap = new Map<string, {
    prices: number[];
    cheapestPub: string;
    cheapestPrice: number;
  }>();

  for (const r of rows) {
    if (!r.pubs || !r.pubs.borough) continue;
    let entry = boroughMap.get(r.pubs.borough);
    if (!entry) {
      entry = { prices: [], cheapestPub: r.pubs.name, cheapestPrice: r.price_pence };
      boroughMap.set(r.pubs.borough, entry);
    }
    entry.prices.push(r.price_pence);
    if (r.price_pence < entry.cheapestPrice) {
      entry.cheapestPrice = r.price_pence;
      entry.cheapestPub = r.pubs.name;
    }
  }

  return Array.from(boroughMap.entries())
    .map(([borough, e]) => ({
      borough,
      avg_pence: Math.round(e.prices.reduce((s, p) => s + p, 0) / e.prices.length),
      cheapest_pence: e.cheapestPrice,
      cheapest_pub: e.cheapestPub,
      num_prices: e.prices.length,
    }))
    .sort((a, b) => a.avg_pence - b.avg_pence);
}

function buildPriceSpread(rows: PriceRow[]) {
  const brandMap = new Map<string, { min: number; max: number; count: number }>();

  for (const r of rows) {
    let entry = brandMap.get(r.brand);
    if (!entry) {
      entry = { min: r.price_pence, max: r.price_pence, count: 0 };
      brandMap.set(r.brand, entry);
    }
    entry.min = Math.min(entry.min, r.price_pence);
    entry.max = Math.max(entry.max, r.price_pence);
    entry.count++;
  }

  const allEntries = Array.from(brandMap.entries()).map(([brand, e]) => ({
    brand,
    min_pence: e.min,
    max_pence: e.max,
    spread_pence: e.max - e.min,
    count: e.count,
  }));

  // Global min/max for bar scaling
  const globalMin = allEntries.length > 0 ? Math.min(...allEntries.map((e) => e.min_pence)) : 0;
  const globalMax = allEntries.length > 0 ? Math.max(...allEntries.map((e) => e.max_pence)) : 1;

  return {
    brands: allEntries.sort((a, b) => a.min_pence - b.min_pence),
    globalMin,
    globalMax,
  };
}

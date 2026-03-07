import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const query = params.get("q")?.trim().toLowerCase() ?? "";
  const beerType = params.get("beerType") ?? "all";
  const maxPrice = params.get("maxPrice") ?? "all";
  const sort = params.get("sort") ?? "price_asc";

  // Fetch all prices with pub info
  const { data: allPrices, error } = await supabaseAdmin
    .from("prices")
    .select(
      "id, brand, type, price_pence, date_recorded, pub_id, pubs(name, postcode, borough, neighbourhood)"
    )
    .order("price_pence", { ascending: sort !== "price_desc" })
    .limit(2000);

  if (error) {
    return NextResponse.json({ results: [], error: error.message }, { status: 500 });
  }

  // Apply filters
  const filtered = (allPrices ?? []).filter((row) => {
    const pub = row.pubs as unknown as {
      name: string;
      postcode: string | null;
      borough: string | null;
      neighbourhood: string | null;
    } | null;
    if (!pub) return false;

    // Beer type filter
    if (beerType !== "all" && row.type.toLowerCase() !== beerType.toLowerCase()) {
      return false;
    }

    // Max price filter
    if (maxPrice !== "all") {
      const maxPence = Math.round(parseFloat(maxPrice) * 100);
      if (row.price_pence > maxPence) return false;
    }

    // Text query filter (pub name, postcode, borough, neighbourhood)
    if (query) {
      const match =
        pub.name.toLowerCase().includes(query) ||
        (pub.postcode?.toLowerCase().includes(query) ?? false) ||
        (pub.borough?.toLowerCase().includes(query) ?? false) ||
        (pub.neighbourhood?.toLowerCase().includes(query) ?? false);
      if (!match) return false;
    }

    return true;
  });

  // Deduplicate — keep cheapest per pub
  const pubMap = new Map<
    string,
    {
      pub_name: string;
      postcode: string;
      borough: string;
      neighbourhood: string;
      brand: string;
      type: string;
      price_pence: number;
      date_recorded: string;
    }
  >();

  for (const row of filtered) {
    const pub = row.pubs as unknown as {
      name: string;
      postcode: string | null;
      borough: string | null;
      neighbourhood: string | null;
    };
    const existing = pubMap.get(row.pub_id);
    if (!existing || row.price_pence < existing.price_pence) {
      pubMap.set(row.pub_id, {
        pub_name: pub.name,
        postcode: pub.postcode ?? "",
        borough: pub.borough ?? "",
        neighbourhood: pub.neighbourhood ?? "",
        brand: row.brand,
        type: row.type,
        price_pence: row.price_pence,
        date_recorded: row.date_recorded,
      });
    }
  }

  let results = Array.from(pubMap.values());

  // Re-sort after deduplication
  if (sort === "price_desc") {
    results.sort((a, b) => b.price_pence - a.price_pence);
  } else if (sort === "name") {
    results.sort((a, b) => a.pub_name.localeCompare(b.pub_name));
  } else {
    results.sort((a, b) => a.price_pence - b.price_pence);
  }

  return NextResponse.json({ results }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

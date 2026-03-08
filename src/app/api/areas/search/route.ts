import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ areas: [] });
  }

  const [{ data: boroughs, error: bErr }, { data: neighbourhoods, error: nErr }] =
    await Promise.all([
      supabaseAdmin
        .from("pubs")
        .select("borough")
        .ilike("borough", `%${q}%`)
        .not("borough", "is", null),
      supabaseAdmin
        .from("pubs")
        .select("neighbourhood")
        .ilike("neighbourhood", `%${q}%`)
        .not("neighbourhood", "is", null),
    ]);

  if (bErr || nErr) {
    return NextResponse.json(
      { error: (bErr || nErr)!.message },
      { status: 500 }
    );
  }

  const seen = new Set<string>();
  const areas: { name: string; type: "borough" | "neighbourhood" }[] = [];

  for (const row of boroughs ?? []) {
    if (row.borough && !seen.has(row.borough.toLowerCase())) {
      seen.add(row.borough.toLowerCase());
      areas.push({ name: row.borough, type: "borough" });
    }
  }

  for (const row of neighbourhoods ?? []) {
    if (row.neighbourhood && !seen.has(row.neighbourhood.toLowerCase())) {
      seen.add(row.neighbourhood.toLowerCase());
      areas.push({ name: row.neighbourhood, type: "neighbourhood" });
    }
  }

  areas.sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ areas: areas.slice(0, 10) });
}

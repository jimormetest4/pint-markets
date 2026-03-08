import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const pubId = req.nextUrl.searchParams.get("id");
  if (!pubId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { data: pub, error: pubError } = await supabaseAdmin
    .from("pubs")
    .select("id, name, address, postcode, borough, neighbourhood, latitude, longitude")
    .eq("id", pubId)
    .single();

  if (pubError || !pub) {
    return NextResponse.json({ error: "Pub not found" }, { status: 404 });
  }

  const { data: prices, error: pricesError } = await supabaseAdmin
    .from("prices")
    .select("id, brand, type, price_pence, date_recorded")
    .eq("pub_id", pubId)
    .order("price_pence", { ascending: true });

  if (pricesError) {
    return NextResponse.json({ error: pricesError.message }, { status: 500 });
  }

  return NextResponse.json({ pub, prices: prices ?? [] });
}

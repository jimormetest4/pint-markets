import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const pubId = req.nextUrl.searchParams.get("pub_id");

  if (!pubId) {
    return NextResponse.json({ error: "pub_id is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("prices")
    .select("id, brand, type, price_pence, date_recorded")
    .eq("pub_id", pubId)
    .order("brand", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ prices: data });
}

export async function POST(req: NextRequest) {
  const { pub_id, brand, type, price_pence } = await req.json();

  if (!pub_id || !brand || !type || !price_pence) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("prices")
    .insert([
      {
        pub_id,
        brand,
        type,
        price_pence: Math.round(Number(price_pence)),
        date_recorded: new Date().toISOString().split("T")[0],
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, price: data });
}

export async function PUT(req: NextRequest) {
  const { id, price_pence } = await req.json();

  if (!id || price_pence == null) {
    return NextResponse.json({ error: "id and price_pence are required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("prices")
    .update({ price_pence: Math.round(Number(price_pence)) })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("prices")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

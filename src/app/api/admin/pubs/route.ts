import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("pubs")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ pubs: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, address, postcode, borough, neighbourhood, latitude, longitude } = body;

  if (!name) {
    return NextResponse.json({ error: "Pub name is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("pubs")
    .insert([
      {
        name,
        address: address || null,
        postcode: postcode || null,
        borough: borough || null,
        neighbourhood: neighbourhood || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, pub: data });
}

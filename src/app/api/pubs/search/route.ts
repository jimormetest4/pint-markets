import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ pubs: [] });
  }

  const { data, error } = await supabaseAdmin
    .from("pubs")
    .select("id, name, borough, postcode")
    .ilike("name", `%${q}%`)
    .order("name")
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pubs: data });
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("prices")
    .select("brand")
    .order("brand");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get unique brands
  const brands = [...new Set((data ?? []).map((d) => d.brand))];

  return NextResponse.json({ brands });
}

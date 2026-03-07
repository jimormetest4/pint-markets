import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("pub_submissions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    // Table might not exist
    if (error.message.includes("does not exist") || error.message.includes("Could not find") || error.code === "42P01") {
      return NextResponse.json({ submissions: [], tableMissing: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions: data ?? [] });
}

export async function PUT(req: NextRequest) {
  const { id, action } = await req.json();

  if (!id || !action) {
    return NextResponse.json({ error: "id and action are required" }, { status: 400 });
  }

  if (action === "approve") {
    // Fetch the submission
    const { data: sub, error: fetchErr } = await supabaseAdmin
      .from("pub_submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !sub) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Create a pub from the submission
    const { error: insertErr } = await supabaseAdmin
      .from("pubs")
      .insert([
        {
          name: sub.pub_name || sub.name,
          address: sub.address || null,
          postcode: sub.postcode || null,
          borough: sub.borough || null,
        },
      ]);

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // Mark as approved
    const { error: updateErr } = await supabaseAdmin
      .from("pub_submissions")
      .update({ status: "approved" })
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, action: "approved" });
  }

  if (action === "reject") {
    const { error } = await supabaseAdmin
      .from("pub_submissions")
      .update({ status: "rejected" })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, action: "rejected" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("price_submissions")
    .select("*")
    .eq("status", "pending")
    .order("submitted_at", { ascending: false });

  if (error) {
    // Table might not exist yet
    if (
      error.message.includes("does not exist") ||
      error.code === "42P01"
    ) {
      return NextResponse.json({ submissions: [], tableMissing: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich with pub names
  const pubIds = Array.from(new Set((data ?? []).map((s) => s.pub_id).filter(Boolean)));
  let pubMap: Record<string, string> = {};

  if (pubIds.length > 0) {
    const { data: pubs } = await supabaseAdmin
      .from("pubs")
      .select("id, name")
      .in("id", pubIds);

    if (pubs) {
      pubMap = Object.fromEntries(pubs.map((p) => [p.id, p.name]));
    }
  }

  const enriched = (data ?? []).map((s) => ({
    ...s,
    pub_name: s.pub_id ? pubMap[s.pub_id] || "Unknown Pub" : "New Pub (pending)",
  }));

  return NextResponse.json({ submissions: enriched });
}

export async function PUT(req: NextRequest) {
  const { id, action } = await req.json();

  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "id and action (approve/reject) are required" },
      { status: 400 }
    );
  }

  // Get the submission
  const { data: sub, error: fetchErr } = await supabaseAdmin
    .from("price_submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !sub) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (action === "reject") {
    const { error: rejectErr } = await supabaseAdmin
      .from("price_submissions")
      .update({ status: "rejected" })
      .eq("id", id);

    if (rejectErr) {
      return NextResponse.json({ error: "Reject failed: " + rejectErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  // Approve: insert or update price
  if (sub.is_correction && sub.existing_price_id) {
    // Update existing price
    const { error: updateErr } = await supabaseAdmin
      .from("prices")
      .update({
        price_pence: sub.price_pence,
        date_recorded: new Date().toISOString().split("T")[0],
      })
      .eq("id", sub.existing_price_id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }
  } else if (sub.pub_id) {
    // Insert new price for existing pub
    const { error: insertErr } = await supabaseAdmin
      .from("prices")
      .insert([
        {
          pub_id: sub.pub_id,
          brand: sub.brand,
          type: sub.type,
          price_pence: sub.price_pence,
          date_recorded: new Date().toISOString().split("T")[0],
        },
      ]);

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }
  }

  // Mark as approved
  const { error: statusErr } = await supabaseAdmin
    .from("price_submissions")
    .update({ status: "approved" })
    .eq("id", id);

  if (statusErr) {
    return NextResponse.json({ error: "Status update failed: " + statusErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

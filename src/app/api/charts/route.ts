import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  // Two queries cover all four charts
  const [snapshotsRes, pricesRes] = await Promise.all([
    supabaseAdmin
      .from("price_snapshots")
      .select("snapshot_date, price_pence")
      .order("snapshot_date", { ascending: true }),
    supabaseAdmin
      .from("prices")
      .select("price_pence, brand, pubs(borough)"),
  ]);

  const snapshots = snapshotsRes.data ?? [];
  const prices = pricesRes.data ?? [];

  // 1. Average Price Over Time — group snapshots by month
  const monthMap = new Map<string, { total: number; count: number }>();
  for (const s of snapshots) {
    const month = s.snapshot_date.slice(0, 7); // YYYY-MM
    const entry = monthMap.get(month) ?? { total: 0, count: 0 };
    entry.total += s.price_pence;
    entry.count++;
    monthMap.set(month, entry);
  }
  const priceOverTime = Array.from(monthMap.entries()).map(([month, e]) => ({
    month,
    avg_pence: Math.round(e.total / e.count),
  }));

  // 2. Price Distribution — 50p brackets
  const bracketCounts = new Map<number, number>();
  for (const p of prices) {
    const pounds = p.price_pence / 100;
    const lowerPence = Math.floor(pounds * 2) * 50;
    bracketCounts.set(lowerPence, (bracketCounts.get(lowerPence) ?? 0) + 1);
  }
  const sortedKeys = Array.from(bracketCounts.keys()).sort((a, b) => a - b);
  const distribution = sortedKeys.map((lp) => {
    const lower = lp / 100;
    const upper = lower + 0.5;
    return {
      bracket: `£${lower.toFixed(2)}-${upper.toFixed(2)}`,
      count: bracketCounts.get(lp)!,
    };
  });

  // 3. Borough Comparison
  const boroughMap = new Map<string, { total: number; count: number }>();
  for (const r of prices) {
    const pub = r.pubs as unknown as { borough: string } | null;
    if (!pub?.borough) continue;
    const entry = boroughMap.get(pub.borough) ?? { total: 0, count: 0 };
    entry.total += r.price_pence;
    entry.count++;
    boroughMap.set(pub.borough, entry);
  }
  const boroughComparison = Array.from(boroughMap.entries())
    .map(([borough, e]) => ({
      borough,
      avg_pence: Math.round(e.total / e.count),
    }))
    .sort((a, b) => a.avg_pence - b.avg_pence);

  // 4. Brand Comparison
  const brandMap = new Map<string, { total: number; count: number }>();
  for (const r of prices) {
    const entry = brandMap.get(r.brand) ?? { total: 0, count: 0 };
    entry.total += r.price_pence;
    entry.count++;
    brandMap.set(r.brand, entry);
  }
  const brandComparison = Array.from(brandMap.entries())
    .map(([brand, e]) => ({
      brand,
      avg_pence: Math.round(e.total / e.count),
    }))
    .sort((a, b) => a.avg_pence - b.avg_pence);

  return NextResponse.json({
    priceOverTime,
    distribution,
    boroughComparison,
    brandComparison,
  });
}

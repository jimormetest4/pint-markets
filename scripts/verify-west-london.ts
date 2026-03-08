import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rsltfqxkzsrlxwejlygu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbHRmcXhrenNybHh3ZWpseWd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjg3NzM4MywiZXhwIjoyMDg4NDUzMzgzfQ.sYARDlHMoIpbHO87qkZYYf8I-I_1cE6HlNbt6WcVzv4";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function main() {
  const neighbourhoods = [
    "Fulham",
    "Hammersmith",
    "Shepherd's Bush",
    "Brook Green",
    "Chiswick",
    "Putney",
    "Earl's Court",
    "Chelsea",
  ];

  const { data: pubs } = await supabase
    .from("pubs")
    .select("id, name, neighbourhood, borough")
    .in("neighbourhood", neighbourhoods);

  if (!pubs) {
    console.log("No pubs found");
    return;
  }

  const areas: Record<string, string[]> = {};
  pubs.forEach((p) => {
    const a = p.neighbourhood || "Unknown";
    if (!areas[a]) areas[a] = [];
    areas[a].push(p.name);
  });

  console.log("=== West London Pubs by Area ===");
  for (const [area, names] of Object.entries(areas)) {
    console.log(`\n${area} (${names.length} pubs):`);
    names.forEach((n) => console.log(`  - ${n}`));
  }

  // Count total prices for these pubs
  const pubIds = pubs.map((p) => p.id);
  const { count } = await supabase
    .from("prices")
    .select("id", { count: "exact", head: true })
    .in("pub_id", pubIds);
  console.log(`\nTotal prices for West London pubs: ${count}`);

  // Total pubs in DB
  const { count: totalPubs } = await supabase
    .from("pubs")
    .select("id", { count: "exact", head: true });
  console.log(`Total pubs in database: ${totalPubs}`);

  // Price range summary
  const { data: priceStats } = await supabase
    .from("prices")
    .select("price_pence")
    .in("pub_id", pubIds)
    .order("price_pence");

  if (priceStats && priceStats.length > 0) {
    const prices = priceStats.map((p) => p.price_pence);
    const min = prices[0];
    const max = prices[prices.length - 1];
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    console.log(
      `\nPrice range: £${(min / 100).toFixed(2)} - £${(max / 100).toFixed(2)}`
    );
    console.log(`Average: £${(avg / 100).toFixed(2)}`);
  }
}

main().catch(console.error);

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// ── Load env from .env.local ────────────────────────────────────────
const envPath = resolve(__dirname, "../../.env.local");
const envFile = readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

// ── Parse CSV ───────────────────────────────────────────────────────
const csvArg = process.argv[2];
const csvPath = resolve(__dirname, csvArg ? `../../${csvArg}` : "../../seed-data.csv");
const csvText = readFileSync(csvPath, "utf-8");
const lines = csvText.split("\n").filter((l) => l.trim());
const headers = lines[0].split(",").map((h) => h.trim());
const rows = lines.slice(1).map((line) => {
  const vals = line.split(",").map((v) => v.trim());
  const row: Record<string, string> = {};
  headers.forEach((h, i) => (row[h] = vals[i] ?? ""));
  return row;
});

console.log(`Parsed ${rows.length} rows from seed-data.csv`);
console.log(`Columns: ${headers.join(", ")}`);

// ── Beer type mapping ───────────────────────────────────────────────
// CSV "pint_type" = beer brand name, "brand" = pub chain.
// DB "brand" = beer name, "type" = Lager|Ale|Stout|IPA|Cider|Bitter|Other
const BEER_TYPE_MAP: Record<string, string> = {
  "bud light": "Lager",
  carling: "Lager",
  carlsberg: "Lager",
  guinness: "Stout",
  corona: "Lager",
  "stella artois": "Lager",
  amstel: "Lager",
  peroni: "Lager",
  pravha: "Lager",
  staropramen: "Lager",
  fosters: "Lager",
  kronenbourg: "Lager",
  madri: "Lager",
  estrella: "Lager",
  asahi: "Lager",
  "london pride": "Bitter",
  doombar: "Bitter",
  "timothy taylor landlord": "Bitter",
  "young's original": "Bitter",
  "greene king ipa": "IPA",
  "neck oil": "IPA",
  "hazy jane": "IPA",
  hophead: "Ale",
  "cask ale": "Ale",
  "harvey's old ale": "Ale",
  "triple ale": "Ale",
  "lost lager": "Lager",
  "camden hells": "Lager",
};

function inferBeerType(beerName: string): string {
  const key = beerName.toLowerCase();
  if (BEER_TYPE_MAP[key]) return BEER_TYPE_MAP[key];
  if (key.includes("ipa")) return "IPA";
  if (key.includes("lager")) return "Lager";
  if (key.includes("ale")) return "Ale";
  if (key.includes("stout")) return "Stout";
  if (key.includes("cider")) return "Cider";
  if (key.includes("bitter")) return "Bitter";
  return "Other";
}

// ── Geocoding via Nominatim ──────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function geocode(
  pubName: string,
  postcode: string
): Promise<{ lat: number; lon: number } | null> {
  const query = `${pubName}, ${postcode}, London, UK`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "PintMarkets-Seed/1.0" },
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    // Retry with just postcode if pub name didn't match
    const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(postcode + ", London, UK")}&format=json&limit=1`;
    await sleep(1000);
    const res2 = await fetch(fallbackUrl, {
      headers: { "User-Agent": "PintMarkets-Seed/1.0" },
    });
    const data2 = await res2.json();
    if (data2 && data2.length > 0) {
      return { lat: parseFloat(data2[0].lat), lon: parseFloat(data2[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

// ── Seed ────────────────────────────────────────────────────────────
async function seed() {
  const pubCache = new Map<string, string>(); // name (lowercase) → id
  const geocodedPubs = new Set<string>(); // track pubs we've already geocoded
  let pubsCreated = 0;
  let pricesAdded = 0;
  let geocoded = 0;
  let geocodeFailed = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const pubName = row.pub_name;
    const postcode = row.postcode;
    // CSV "brand" = pub chain, "pint_type" = beer name
    const beerName = row.pint_type || row.type || "";
    const beerType = inferBeerType(beerName);
    const priceRaw = row.price || row.price_gbp || "";
    const date = row.date || new Date().toISOString().split("T")[0];

    // Parse price — strip £ sign
    const priceNum = parseFloat(priceRaw.replace("£", ""));
    if (!pubName || !beerName || isNaN(priceNum) || priceNum <= 0) {
      errors.push(`Row ${i + 1}: skipped — invalid data (${pubName}, ${beerName}, ${priceRaw})`);
      continue;
    }

    const pricePence = Math.round(priceNum * 100);
    const nameKey = pubName.toLowerCase();

    // Find or create pub
    let pubId = pubCache.get(nameKey);

    if (!pubId) {
      const { data: existing } = await supabase
        .from("pubs")
        .select("id")
        .ilike("name", pubName)
        .limit(1);

      if (existing && existing.length > 0) {
        pubId = existing[0].id;
      } else {
        const { data: newPub, error: pubErr } = await supabase
          .from("pubs")
          .insert([{ name: pubName, postcode: postcode || null }])
          .select("id")
          .single();

        if (pubErr || !newPub) {
          errors.push(`Row ${i + 1}: failed to create pub "${pubName}" — ${pubErr?.message}`);
          continue;
        }
        pubId = newPub.id;
        pubsCreated++;
        console.log(`  + Created pub: ${pubName}`);
      }
      if (pubId) pubCache.set(nameKey, pubId);
    }

    // Geocode pub if not already done
    if (pubId && !geocodedPubs.has(pubId) && postcode) {
      geocodedPubs.add(pubId);
      // Check if pub already has coordinates
      const { data: pubRow } = await supabase
        .from("pubs")
        .select("latitude, longitude")
        .eq("id", pubId)
        .single();

      if (!pubRow?.latitude || !pubRow?.longitude) {
        await sleep(1000); // Nominatim rate limit: 1 req/sec
        const coords = await geocode(pubName, postcode);
        if (coords) {
          await supabase
            .from("pubs")
            .update({ latitude: coords.lat, longitude: coords.lon })
            .eq("id", pubId);
          geocoded++;
          console.log(`  📍 Geocoded: ${pubName} → ${coords.lat}, ${coords.lon}`);
        } else {
          geocodeFailed++;
          console.log(`  ⚠ Geocode failed: ${pubName} (${postcode})`);
        }
      }
    }

    // Insert price
    const { error: priceErr } = await supabase.from("prices").insert([
      {
        pub_id: pubId,
        brand: beerName,
        type: beerType,
        price_pence: pricePence,
        date_recorded: date,
      },
    ]);

    if (priceErr) {
      errors.push(`Row ${i + 1}: failed to insert price — ${priceErr.message}`);
    } else {
      pricesAdded++;
    }
  }

  console.log("\n── Results ──");
  console.log(`Pubs created:  ${pubsCreated}`);
  console.log(`Prices added:  ${pricesAdded}`);
  console.log(`Geocoded:      ${geocoded}`);
  console.log(`Geocode fail:  ${geocodeFailed}`);
  console.log(`Errors:        ${errors.length}`);
  if (errors.length > 0) {
    console.log("\nErrors:");
    errors.slice(0, 20).forEach((e) => console.log(`  ${e}`));
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

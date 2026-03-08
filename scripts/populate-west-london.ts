import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rsltfqxkzsrlxwejlygu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbHRmcXhrenNybHh3ZWpseWd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjg3NzM4MywiZXhwIjoyMDg4NDUzMzgzfQ.sYARDlHMoIpbHO87qkZYYf8I-I_1cE6HlNbt6WcVzv4";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// ─── Pub Data ─────────────────────────────────────────────────────────

interface PubEntry {
  name: string;
  address: string;
  postcode: string;
  borough: string;
  neighbourhood: string;
  latitude: number;
  longitude: number;
}

interface PriceRange {
  low: number;
  mid: number;
  high: number;
}

interface AreaPricing {
  [brand: string]: PriceRange;
}

const WEST_LONDON_PUBS: PubEntry[] = [
  // ── Fulham (SW6) ──────────────────────────────────────────────────
  {
    name: "The White Horse",
    address: "1-3 Parsons Green",
    postcode: "SW6 4UL",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Fulham",
    latitude: 51.47435,
    longitude: -0.20041,
  },
  {
    name: "The Harwood Arms",
    address: "27 Walham Grove",
    postcode: "SW6 1QR",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Fulham",
    latitude: 51.4829,
    longitude: -0.19646,
  },
  {
    name: "The Mitre",
    address: "81 Dawes Road",
    postcode: "SW6 7DU",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Fulham",
    latitude: 51.4798,
    longitude: -0.1987,
  },
  {
    name: "The Durell Arms",
    address: "704 Fulham Road",
    postcode: "SW6 5SA",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Fulham",
    latitude: 51.4773,
    longitude: -0.2027,
  },
  {
    name: "Brook House",
    address: "65 New Kings Road",
    postcode: "SW6 4SG",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Fulham",
    latitude: 51.4747,
    longitude: -0.193,
  },
  {
    name: "The Rose",
    address: "1 Harwood Terrace",
    postcode: "SW6 2AF",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Fulham",
    latitude: 51.4775,
    longitude: -0.1833,
  },
  {
    name: "The Golden Lion",
    address: "57 Fulham High Street",
    postcode: "SW6 3JJ",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Fulham",
    latitude: 51.4717,
    longitude: -0.2061,
  },
  {
    name: "The Cock Tavern",
    address: "360 North End Road",
    postcode: "SW6 1LY",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Fulham",
    latitude: 51.481,
    longitude: -0.1968,
  },
  {
    name: "The Atlas",
    address: "16 Seagrave Road",
    postcode: "SW6 1RX",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Fulham",
    latitude: 51.4841,
    longitude: -0.1955,
  },

  // ── Hammersmith (W6) ──────────────────────────────────────────────
  {
    name: "The Dove",
    address: "19 Upper Mall",
    postcode: "W6 9TA",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Hammersmith",
    latitude: 51.4905,
    longitude: -0.2348,
  },
  {
    name: "The Old Ship",
    address: "25 Upper Mall",
    postcode: "W6 9TD",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Hammersmith",
    latitude: 51.4906,
    longitude: -0.2343,
  },
  {
    name: "The Blue Anchor",
    address: "13 Lower Mall",
    postcode: "W6 9DJ",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Hammersmith",
    latitude: 51.4903,
    longitude: -0.2313,
  },
  {
    name: "The Dartmouth Castle",
    address: "26 Glenthorne Road",
    postcode: "W6 0LS",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Hammersmith",
    latitude: 51.4925,
    longitude: -0.2282,
  },
  {
    name: "The Andover Arms",
    address: "57 Aldensley Road",
    postcode: "W6 0DL",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Hammersmith",
    latitude: 51.4938,
    longitude: -0.2325,
  },
  {
    name: "The Hammersmith Ram",
    address: "81 King Street",
    postcode: "W6 9HW",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Hammersmith",
    latitude: 51.492,
    longitude: -0.227,
  },

  // ── Shepherd's Bush / Brook Green (W12/W6) ────────────────────────
  {
    name: "Princess Victoria",
    address: "217 Uxbridge Road",
    postcode: "W12 9DH",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Shepherd's Bush",
    latitude: 51.50643,
    longitude: -0.24082,
  },
  {
    name: "The Eagle",
    address: "215 Askew Road",
    postcode: "W12 9AZ",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Shepherd's Bush",
    latitude: 51.50065,
    longitude: -0.23941,
  },
  {
    name: "The Anglesea Arms",
    address: "35 Wingate Road",
    postcode: "W6 0UR",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Brook Green",
    latitude: 51.4953,
    longitude: -0.23,
  },
  {
    name: "The Sindercombe Social",
    address: "2 Goldhawk Road",
    postcode: "W12 8QD",
    borough: "Hammersmith and Fulham",
    neighbourhood: "Shepherd's Bush",
    latitude: 51.5022,
    longitude: -0.2258,
  },

  // ── Chiswick (W4) ─────────────────────────────────────────────────
  {
    name: "The Roebuck",
    address: "122 Chiswick High Road",
    postcode: "W4 1PU",
    borough: "Hounslow",
    neighbourhood: "Chiswick",
    latitude: 51.493,
    longitude: -0.259,
  },
  {
    name: "The Old Pack Horse",
    address: "434 Chiswick High Road",
    postcode: "W4 5TF",
    borough: "Hounslow",
    neighbourhood: "Chiswick",
    latitude: 51.4928,
    longitude: -0.2707,
  },
  {
    name: "The George IV",
    address: "185 Chiswick High Road",
    postcode: "W4 2DR",
    borough: "Hounslow",
    neighbourhood: "Chiswick",
    latitude: 51.4931,
    longitude: -0.2614,
  },
  {
    name: "The Bollo House",
    address: "13 Bollo Lane",
    postcode: "W4 5LR",
    borough: "Hounslow",
    neighbourhood: "Chiswick",
    latitude: 51.4946,
    longitude: -0.268,
  },
  {
    name: "The Bell & Crown",
    address: "11-13 Thames Road, Strand-on-the-Green",
    postcode: "W4 3PL",
    borough: "Hounslow",
    neighbourhood: "Chiswick",
    latitude: 51.4868,
    longitude: -0.2813,
  },

  // ── Putney (SW15) ─────────────────────────────────────────────────
  {
    name: "The Duke's Head",
    address: "8 Lower Richmond Road",
    postcode: "SW15 1JN",
    borough: "Wandsworth",
    neighbourhood: "Putney",
    latitude: 51.4673,
    longitude: -0.21707,
  },
  {
    name: "The Half Moon",
    address: "93 Lower Richmond Road",
    postcode: "SW15 1EU",
    borough: "Wandsworth",
    neighbourhood: "Putney",
    latitude: 51.4666,
    longitude: -0.2195,
  },
  {
    name: "The Spotted Horse",
    address: "122 Putney High Street",
    postcode: "SW15 1RG",
    borough: "Wandsworth",
    neighbourhood: "Putney",
    latitude: 51.4645,
    longitude: -0.2164,
  },
  {
    name: "The Bricklayer's Arms",
    address: "32 Waterman Street",
    postcode: "SW15 1DD",
    borough: "Wandsworth",
    neighbourhood: "Putney",
    latitude: 51.4661,
    longitude: -0.2153,
  },
  {
    name: "The Spencer Arms",
    address: "237 Lower Richmond Road",
    postcode: "SW15 1HJ",
    borough: "Wandsworth",
    neighbourhood: "Putney",
    latitude: 51.4647,
    longitude: -0.2283,
  },

  // ── Earl's Court / West Kensington (SW5) ──────────────────────────
  {
    name: "The Drayton Arms",
    address: "153 Old Brompton Road",
    postcode: "SW5 0LJ",
    borough: "Kensington and Chelsea",
    neighbourhood: "Earl's Court",
    latitude: 51.4888,
    longitude: -0.1868,
  },
  {
    name: "The Blackbird",
    address: "209 Earl's Court Road",
    postcode: "SW5 9AN",
    borough: "Kensington and Chelsea",
    neighbourhood: "Earl's Court",
    latitude: 51.4906,
    longitude: -0.1934,
  },
  {
    name: "The Pembroke",
    address: "261 Old Brompton Road",
    postcode: "SW5 9JA",
    borough: "Kensington and Chelsea",
    neighbourhood: "Earl's Court",
    latitude: 51.48891,
    longitude: -0.19146,
  },

  // ── Chelsea (SW3/SW10) ────────────────────────────────────────────
  {
    name: "The Cadogan Arms",
    address: "298 King's Road",
    postcode: "SW3 5UG",
    borough: "Kensington and Chelsea",
    neighbourhood: "Chelsea",
    latitude: 51.485,
    longitude: -0.1735,
  },
  {
    name: "The Cross Keys",
    address: "1 Lawrence Street",
    postcode: "SW3 5NB",
    borough: "Kensington and Chelsea",
    neighbourhood: "Chelsea",
    latitude: 51.4845,
    longitude: -0.168,
  },
  {
    name: "The Fox & Pheasant",
    address: "1 Billing Road",
    postcode: "SW10 9UJ",
    borough: "Kensington and Chelsea",
    neighbourhood: "Chelsea",
    latitude: 51.4802,
    longitude: -0.1815,
  },
  {
    name: "The Hollywood Arms",
    address: "45 Hollywood Road",
    postcode: "SW10 9HX",
    borough: "Kensington and Chelsea",
    neighbourhood: "Chelsea",
    latitude: 51.4845,
    longitude: -0.1826,
  },
];

// ─── Pricing Data ─────────────────────────────────────────────────────

const AREA_PRICING: Record<string, AreaPricing> = {
  Fulham: {
    Guinness: { low: 600, mid: 640, high: 680 },
    "Stella Artois": { low: 580, mid: 610, high: 650 },
    Pravha: { low: 575, mid: 600, high: 640 },
    "Camden Hells": { low: 660, mid: 700, high: 730 },
    "Neck Oil": { low: 690, mid: 725, high: 750 },
    Peroni: { low: 660, mid: 700, high: 730 },
    "San Miguel": { low: 590, mid: 620, high: 660 },
    "London Pride": { low: 540, mid: 575, high: 610 },
  },
  Hammersmith: {
    Guinness: { low: 585, mid: 620, high: 660 },
    "Stella Artois": { low: 570, mid: 600, high: 640 },
    Pravha: { low: 565, mid: 595, high: 630 },
    "Camden Hells": { low: 640, mid: 680, high: 715 },
    "Neck Oil": { low: 670, mid: 710, high: 740 },
    Peroni: { low: 640, mid: 680, high: 720 },
    "San Miguel": { low: 580, mid: 610, high: 650 },
    "London Pride": { low: 530, mid: 560, high: 600 },
  },
  "Shepherd's Bush": {
    Guinness: { low: 560, mid: 595, high: 640 },
    "Stella Artois": { low: 545, mid: 575, high: 620 },
    Pravha: { low: 540, mid: 570, high: 610 },
    "Camden Hells": { low: 610, mid: 650, high: 690 },
    "Neck Oil": { low: 640, mid: 680, high: 720 },
    Peroni: { low: 620, mid: 655, high: 700 },
    "San Miguel": { low: 555, mid: 585, high: 630 },
    "London Pride": { low: 505, mid: 540, high: 580 },
  },
  "Brook Green": {
    Guinness: { low: 575, mid: 610, high: 650 },
    "Stella Artois": { low: 560, mid: 590, high: 630 },
    Pravha: { low: 555, mid: 585, high: 620 },
    "Camden Hells": { low: 630, mid: 670, high: 705 },
    "Neck Oil": { low: 660, mid: 700, high: 730 },
    Peroni: { low: 635, mid: 670, high: 710 },
    "San Miguel": { low: 570, mid: 600, high: 640 },
    "London Pride": { low: 520, mid: 555, high: 590 },
  },
  Chiswick: {
    Guinness: { low: 570, mid: 605, high: 650 },
    "Stella Artois": { low: 555, mid: 585, high: 630 },
    Pravha: { low: 550, mid: 580, high: 620 },
    "Camden Hells": { low: 625, mid: 665, high: 700 },
    "Neck Oil": { low: 650, mid: 690, high: 730 },
    Peroni: { low: 630, mid: 665, high: 710 },
    "San Miguel": { low: 565, mid: 600, high: 640 },
    "London Pride": { low: 515, mid: 550, high: 590 },
  },
  Putney: {
    Guinness: { low: 580, mid: 615, high: 655 },
    "Stella Artois": { low: 565, mid: 595, high: 635 },
    Pravha: { low: 555, mid: 590, high: 625 },
    "Camden Hells": { low: 635, mid: 670, high: 710 },
    "Neck Oil": { low: 660, mid: 700, high: 735 },
    Peroni: { low: 640, mid: 675, high: 715 },
    "San Miguel": { low: 575, mid: 605, high: 645 },
    "London Pride": { low: 525, mid: 560, high: 595 },
  },
  "Earl's Court": {
    Guinness: { low: 630, mid: 660, high: 700 },
    "Stella Artois": { low: 600, mid: 630, high: 670 },
    Pravha: { low: 590, mid: 620, high: 660 },
    "Camden Hells": { low: 680, mid: 710, high: 740 },
    "Neck Oil": { low: 700, mid: 730, high: 760 },
    Peroni: { low: 670, mid: 710, high: 750 },
    "San Miguel": { low: 610, mid: 640, high: 680 },
    "London Pride": { low: 560, mid: 590, high: 630 },
  },
  Chelsea: {
    Guinness: { low: 650, mid: 680, high: 720 },
    "Stella Artois": { low: 620, mid: 650, high: 690 },
    Pravha: { low: 620, mid: 650, high: 680 },
    "Camden Hells": { low: 700, mid: 730, high: 760 },
    "Neck Oil": { low: 720, mid: 755, high: 790 },
    Peroni: { low: 700, mid: 740, high: 780 },
    "San Miguel": { low: 630, mid: 660, high: 700 },
    "London Pride": { low: 580, mid: 610, high: 650 },
  },
};

// Brand → beer type mapping (matching existing DB constraint)
const BRAND_TYPE: Record<string, string> = {
  Guinness: "Stout",
  "Stella Artois": "Lager",
  Pravha: "Lager",
  "Camden Hells": "Lager",
  "Neck Oil": "IPA",
  Peroni: "Lager",
  "San Miguel": "Lager",
  "London Pride": "Bitter",
};

// Each pub gets 3-5 brands. Use a seeded selection based on pub name hash.
function selectBrandsForPub(pubName: string): string[] {
  const allBrands = [
    "Guinness",
    "Stella Artois",
    "Pravha",
    "Camden Hells",
    "Neck Oil",
    "Peroni",
    "San Miguel",
    "London Pride",
  ];

  // Simple hash to get deterministic but varied selection
  let hash = 0;
  for (let i = 0; i < pubName.length; i++) {
    hash = (hash * 31 + pubName.charCodeAt(i)) & 0x7fffffff;
  }

  // Every pub gets Guinness (it's basically universal)
  const brands = ["Guinness"];

  // Shuffle remaining brands using hash
  const remaining = allBrands.filter((b) => b !== "Guinness");
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = ((hash >> (i % 8)) + i) % (i + 1);
    [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
  }

  // Pick 2-4 more brands (3-5 total)
  const extraCount = 2 + (hash % 3); // 2, 3, or 4 extra
  for (let i = 0; i < extraCount && i < remaining.length; i++) {
    brands.push(remaining[i]);
  }

  return brands;
}

function pickPrice(range: PriceRange, pubName: string, brand: string): number {
  // Deterministic but varied price within range
  let hash = 0;
  const seed = pubName + brand;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 37 + seed.charCodeAt(i)) & 0x7fffffff;
  }

  const spread = range.high - range.low;
  const offset = hash % (spread + 1);
  // Round to nearest 5p
  return Math.round((range.low + offset) / 5) * 5;
}

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
  const today = new Date().toISOString().split("T")[0];

  console.log("=== West London Pub Population Script ===\n");

  // Check existing pubs to avoid duplicates
  const { data: existingPubs, error: fetchError } = await supabase
    .from("pubs")
    .select("id, name")
    .order("name");

  if (fetchError) {
    console.error("Failed to fetch existing pubs:", fetchError.message);
    process.exit(1);
  }

  const existingNames = new Set(
    (existingPubs || []).map((p: { name: string }) => p.name.toLowerCase())
  );
  console.log(`Found ${existingPubs?.length || 0} existing pubs in database\n`);

  let pubsCreated = 0;
  let pubsSkipped = 0;
  let pricesAdded = 0;

  for (const pub of WEST_LONDON_PUBS) {
    let pubId: string;

    // Check for duplicate
    if (existingNames.has(pub.name.toLowerCase())) {
      // Find the existing pub ID so we can still add prices
      const { data: found } = await supabase
        .from("pubs")
        .select("id")
        .ilike("name", pub.name)
        .single();

      if (!found) {
        console.log(`  SKIP (exists, not found): ${pub.name}`);
        pubsSkipped++;
        continue;
      }

      // Check if it already has prices
      const { data: existingPrices } = await supabase
        .from("prices")
        .select("id")
        .eq("pub_id", found.id)
        .limit(1);

      if (existingPrices && existingPrices.length > 0) {
        console.log(`  SKIP (exists with prices): ${pub.name}`);
        pubsSkipped++;
        continue;
      }

      pubId = found.id;
      console.log(`  ~ ${pub.name} (exists, adding prices) → ${pubId}`);
    } else {
      // Insert pub
      const { data: newPub, error: pubError } = await supabase
        .from("pubs")
        .insert([
          {
            name: pub.name,
            address: pub.address,
            postcode: pub.postcode,
            borough: pub.borough,
            neighbourhood: pub.neighbourhood,
            latitude: pub.latitude,
            longitude: pub.longitude,
          },
        ])
        .select("id")
        .single();

      if (pubError || !newPub) {
        console.error(`  ERROR creating ${pub.name}: ${pubError?.message}`);
        continue;
      }

      pubId = newPub.id;
      console.log(
        `  + ${pub.name} (${pub.neighbourhood}, ${pub.postcode}) → ${pubId}`
      );
      pubsCreated++;
    }

    // Get area pricing
    const areaPricing = AREA_PRICING[pub.neighbourhood];
    if (!areaPricing) {
      console.log(`    WARNING: No pricing data for area "${pub.neighbourhood}"`);
      continue;
    }

    // Select and insert prices for this pub
    const brands = selectBrandsForPub(pub.name);
    for (const brand of brands) {
      const priceRange = areaPricing[brand];
      if (!priceRange) continue;

      const pricePence = pickPrice(priceRange, pub.name, brand);

      const beerType = BRAND_TYPE[brand] || "Lager";
      const { error: priceError } = await supabase.from("prices").insert([
        {
          pub_id: pubId,
          brand,
          type: beerType,
          price_pence: pricePence,
          date_recorded: today,
        },
      ]);

      if (priceError) {
        console.error(
          `    ERROR adding price for ${brand}: ${priceError.message}`
        );
      } else {
        console.log(
          `    £${(pricePence / 100).toFixed(2)} - ${brand}`
        );
        pricesAdded++;
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Pubs created: ${pubsCreated}`);
  console.log(`Pubs skipped (duplicates): ${pubsSkipped}`);
  console.log(`Prices added: ${pricesAdded}`);
}

main().catch(console.error);

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rsltfqxkzsrlxwejlygu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbHRmcXhrenNybHh3ZWpseWd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjg3NzM4MywiZXhwIjoyMDg4NDUzMzgzfQ.sYARDlHMoIpbHO87qkZYYf8I-I_1cE6HlNbt6WcVzv4";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// London postcode district → borough mapping
const POSTCODE_TO_BOROUGH: Record<string, string> = {
  // EC - City of London & fringes
  EC1: "Islington", EC1A: "City of London", EC1M: "Islington", EC1N: "Camden",
  EC1R: "Islington", EC1V: "Islington", EC1Y: "Islington",
  EC2: "City of London", EC2A: "Hackney", EC2M: "City of London",
  EC2N: "City of London", EC2R: "City of London", EC2V: "City of London",
  EC2Y: "City of London",
  EC3: "City of London", EC3A: "City of London", EC3M: "City of London",
  EC3N: "Tower Hamlets", EC3R: "City of London", EC3V: "City of London",
  EC4: "City of London", EC4A: "City of London", EC4M: "City of London",
  EC4N: "City of London", EC4R: "City of London", EC4V: "City of London",
  EC4Y: "City of London",

  // WC - Westminster & Camden
  WC1: "Camden", WC1A: "Camden", WC1B: "Camden", WC1E: "Camden",
  WC1H: "Camden", WC1N: "Camden", WC1R: "Camden", WC1V: "Camden",
  WC1X: "Islington",
  WC2: "Westminster", WC2A: "Camden", WC2B: "Westminster",
  WC2E: "Westminster", WC2H: "Westminster", WC2N: "Westminster",
  WC2R: "Westminster",

  // W - West London
  W1: "Westminster", W2: "Westminster", W3: "Ealing",
  W4: "Hounslow", W5: "Ealing", W6: "Hammersmith and Fulham",
  W7: "Ealing", W8: "Kensington and Chelsea",
  W9: "Westminster", W10: "Kensington and Chelsea",
  W11: "Kensington and Chelsea", W12: "Hammersmith and Fulham",
  W13: "Ealing", W14: "Hammersmith and Fulham",

  // SW - South West London
  SW1: "Westminster", SW2: "Lambeth", SW3: "Kensington and Chelsea",
  SW4: "Lambeth", SW5: "Kensington and Chelsea",
  SW6: "Hammersmith and Fulham", SW7: "Kensington and Chelsea",
  SW8: "Lambeth", SW9: "Lambeth", SW10: "Kensington and Chelsea",
  SW11: "Wandsworth", SW12: "Lambeth", SW13: "Richmond upon Thames",
  SW14: "Richmond upon Thames", SW15: "Wandsworth",
  SW16: "Lambeth", SW17: "Wandsworth", SW18: "Wandsworth",
  SW19: "Merton", SW20: "Merton",

  // SE - South East London
  SE1: "Southwark", SE2: "Greenwich", SE3: "Greenwich",
  SE4: "Lewisham", SE5: "Southwark", SE6: "Lewisham",
  SE7: "Greenwich", SE8: "Lewisham", SE9: "Greenwich",
  SE10: "Greenwich", SE11: "Lambeth", SE12: "Lewisham",
  SE13: "Lewisham", SE14: "Lewisham", SE15: "Southwark",
  SE16: "Southwark", SE17: "Southwark", SE18: "Greenwich",
  SE19: "Croydon", SE20: "Bromley", SE21: "Southwark",
  SE22: "Southwark", SE23: "Lewisham", SE24: "Lambeth",
  SE25: "Croydon", SE26: "Lewisham", SE27: "Lambeth",
  SE28: "Greenwich",

  // N - North London
  N1: "Islington", N2: "Barnet", N3: "Barnet",
  N4: "Haringey", N5: "Islington", N6: "Haringey",
  N7: "Islington", N8: "Haringey", N9: "Enfield",
  N10: "Haringey", N11: "Barnet", N12: "Barnet",
  N13: "Enfield", N14: "Enfield", N15: "Haringey",
  N16: "Hackney", N17: "Haringey", N18: "Enfield",
  N19: "Islington", N20: "Barnet", N21: "Enfield",
  N22: "Haringey",

  // NW - North West London
  NW1: "Camden", NW2: "Brent", NW3: "Camden",
  NW4: "Barnet", NW5: "Camden", NW6: "Camden",
  NW7: "Barnet", NW8: "Westminster", NW9: "Brent",
  NW10: "Brent", NW11: "Barnet",

  // E - East London
  E1: "Tower Hamlets", E2: "Tower Hamlets", E3: "Tower Hamlets",
  E4: "Waltham Forest", E5: "Hackney", E6: "Newham",
  E7: "Newham", E8: "Hackney", E9: "Hackney",
  E10: "Waltham Forest", E11: "Waltham Forest", E12: "Newham",
  E13: "Newham", E14: "Tower Hamlets", E15: "Newham",
  E16: "Newham", E17: "Waltham Forest", E18: "Redbridge",
  E20: "Newham",

  // BR - Bromley
  BR1: "Bromley", BR2: "Bromley", BR3: "Bromley",
  BR4: "Bromley", BR5: "Bromley", BR6: "Bromley", BR7: "Bromley",

  // CR - Croydon
  CR0: "Croydon", CR2: "Croydon", CR4: "Merton",
  CR5: "Croydon", CR7: "Croydon", CR8: "Croydon",

  // DA - Dartford/Bexley
  DA1: "Bexley", DA5: "Bexley", DA6: "Bexley",
  DA7: "Bexley", DA8: "Bexley", DA14: "Bexley",
  DA15: "Bexley", DA16: "Bexley", DA17: "Bexley", DA18: "Bexley",

  // EN - Enfield
  EN1: "Enfield", EN2: "Enfield", EN3: "Enfield",
  EN4: "Barnet", EN5: "Barnet",

  // HA - Harrow
  HA0: "Brent", HA1: "Harrow", HA2: "Harrow",
  HA3: "Harrow", HA4: "Hillingdon", HA5: "Harrow",
  HA6: "Hillingdon", HA7: "Harrow", HA8: "Harrow",
  HA9: "Brent",

  // IG - Ilford/Redbridge
  IG1: "Redbridge", IG2: "Redbridge", IG3: "Redbridge",
  IG4: "Redbridge", IG5: "Redbridge", IG6: "Redbridge",
  IG7: "Redbridge", IG8: "Redbridge", IG11: "Barking and Dagenham",

  // KT - Kingston
  KT1: "Kingston upon Thames", KT2: "Kingston upon Thames",
  KT3: "Kingston upon Thames", KT4: "Sutton",
  KT5: "Kingston upon Thames", KT6: "Kingston upon Thames",
  KT9: "Kingston upon Thames",

  // RM - Romford/Havering
  RM1: "Havering", RM2: "Havering", RM3: "Havering",
  RM5: "Havering", RM6: "Barking and Dagenham",
  RM7: "Havering", RM8: "Barking and Dagenham",
  RM9: "Barking and Dagenham", RM10: "Barking and Dagenham",
  RM11: "Havering", RM12: "Havering", RM13: "Havering",
  RM14: "Havering",

  // SM - Sutton
  SM1: "Sutton", SM2: "Sutton", SM3: "Sutton",
  SM4: "Merton", SM5: "Sutton", SM6: "Sutton",

  // TW - Twickenham/Hounslow/Richmond
  TW1: "Richmond upon Thames", TW2: "Richmond upon Thames",
  TW3: "Hounslow", TW4: "Hounslow", TW5: "Hounslow",
  TW7: "Hounslow", TW8: "Hounslow",
  TW9: "Richmond upon Thames", TW10: "Richmond upon Thames",
  TW11: "Richmond upon Thames", TW12: "Richmond upon Thames",
  TW13: "Hounslow", TW14: "Hounslow",

  // UB - Uxbridge/Hillingdon/Ealing
  UB1: "Ealing", UB2: "Ealing", UB3: "Hillingdon",
  UB4: "Hillingdon", UB5: "Hillingdon", UB6: "Ealing",
  UB7: "Hillingdon", UB8: "Hillingdon", UB9: "Hillingdon",
  UB10: "Hillingdon",
};

function postcodeToBoroughLookup(postcode: string): string | null {
  const clean = postcode.replace(/\s+/g, "").toUpperCase();

  // Try full district first (e.g., EC2A), then area+district number (e.g., EC2), then area+first digit (e.g., E1)
  // Extract outward code (everything before the space, or first part)
  const outward = clean.replace(/\d[A-Z]{2}$/, ""); // Remove inward code

  if (POSTCODE_TO_BOROUGH[outward]) return POSTCODE_TO_BOROUGH[outward];

  // Try without trailing letter (e.g., EC2A → EC2)
  const numericOnly = outward.replace(/[A-Z]+$/, "");
  if (POSTCODE_TO_BOROUGH[numericOnly]) return POSTCODE_TO_BOROUGH[numericOnly];

  // Try area + first digit
  const match = clean.match(/^([A-Z]+)(\d)/);
  if (match) {
    const areaDigit = match[1] + match[2];
    if (POSTCODE_TO_BOROUGH[areaDigit]) return POSTCODE_TO_BOROUGH[areaDigit];
  }

  return null;
}

async function main() {
  // Fetch all pubs
  const { data: pubs, error } = await supabase
    .from("pubs")
    .select("id, name, postcode, borough")
    .order("name");

  if (error) {
    console.error("Failed to fetch pubs:", error.message);
    process.exit(1);
  }

  console.log(`Found ${pubs.length} pubs total`);

  const needsUpdate = pubs.filter(p => !p.borough && p.postcode);
  console.log(`${needsUpdate.length} pubs need borough populated`);

  let updated = 0;
  let skipped = 0;

  for (const pub of needsUpdate) {
    const borough = postcodeToBoroughLookup(pub.postcode);
    if (!borough) {
      console.log(`  SKIP: ${pub.name} (${pub.postcode}) — no borough mapping`);
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("pubs")
      .update({ borough })
      .eq("id", pub.id);

    if (updateError) {
      console.error(`  ERROR updating ${pub.name}: ${updateError.message}`);
      skipped++;
    } else {
      console.log(`  OK: ${pub.name} (${pub.postcode}) → ${borough}`);
      updated++;
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
}

main();

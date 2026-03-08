// Shared beer brand → type mapping used by seed scripts and submission APIs

export const BEER_TYPE_MAP: Record<string, string> = {
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
  heineken: "Lager",
  "san miguel": "Lager",
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
  "house lager": "Lager",
  "john smiths": "Other",
  "birra moretti": "Lager",
};

export function inferBeerType(beerName: string): string {
  const key = beerName.toLowerCase().trim();
  if (BEER_TYPE_MAP[key]) return BEER_TYPE_MAP[key];
  if (key.includes("ipa")) return "IPA";
  if (key.includes("lager")) return "Lager";
  if (key.includes("ale")) return "Ale";
  if (key.includes("stout")) return "Stout";
  if (key.includes("cider")) return "Cider";
  if (key.includes("bitter")) return "Bitter";
  return "Other";
}

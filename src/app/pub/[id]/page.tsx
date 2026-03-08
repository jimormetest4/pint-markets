import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
import PubPageClient from "./PubPageClient";

export const revalidate = 3600;

interface PubData {
  id: string;
  name: string;
  address: string;
  postcode: string;
  borough: string;
  neighbourhood: string;
  latitude: number;
  longitude: number;
}

interface PriceData {
  id: string;
  brand: string;
  type: string;
  price_pence: number;
  date_recorded: string;
}

async function getPubData(id: string) {
  const { data: pub } = await supabaseAdmin
    .from("pubs")
    .select("id, name, address, postcode, borough, neighbourhood, latitude, longitude")
    .eq("id", id)
    .single();

  if (!pub) return null;

  const { data: prices } = await supabaseAdmin
    .from("prices")
    .select("id, brand, type, price_pence, date_recorded")
    .eq("pub_id", id)
    .order("price_pence", { ascending: true });

  return { pub: pub as PubData, prices: (prices ?? []) as PriceData[] };
}

function penceToPounds(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getPubData(id);
  if (!data) return { title: "Pub Not Found" };

  const { pub, prices } = data;
  const cheapest = prices.length > 0 ? prices[0] : null;
  const priceStr = cheapest
    ? ` — cheapest pint ${penceToPounds(cheapest.price_pence)} (${cheapest.brand})`
    : "";

  const title = `${pub.name} Pint Prices`;
  const description = `Pint prices at ${pub.name}, ${pub.borough}${priceStr}. ${prices.length} beers tracked.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Pint Markets`,
      description,
      type: "website",
    },
  };
}

export default async function PubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPubData(id);
  if (!data) notFound();

  const { pub, prices } = data;
  const cheapest = prices.length > 0 ? prices[0] : null;

  // JSON-LD structured data for this pub
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    name: pub.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: pub.address,
      postalCode: pub.postcode,
      addressLocality: pub.neighbourhood || pub.borough,
      addressRegion: "London",
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: pub.latitude,
      longitude: pub.longitude,
    },
    ...(cheapest && {
      priceRange: penceToPounds(cheapest.price_pence),
    }),
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://pint-markets.vercel.app"}/pub/${pub.id}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PubPageClient pub={pub} prices={prices} />
    </>
  );
}

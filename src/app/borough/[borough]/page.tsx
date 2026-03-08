import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
import BoroughPageClient from "./BoroughPageClient";

export const revalidate = 3600;

interface PubWithPrice {
  id: string;
  name: string;
  address: string;
  postcode: string;
  neighbourhood: string;
  cheapest_brand: string;
  cheapest_pence: number;
  price_count: number;
}

function penceToPounds(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

async function getBoroughData(boroughSlug: string) {
  const borough = decodeURIComponent(boroughSlug);

  // Get all pubs in this borough
  const { data: pubs } = await supabaseAdmin
    .from("pubs")
    .select("id, name, address, postcode, neighbourhood")
    .ilike("borough", borough);

  if (!pubs || pubs.length === 0) return null;

  // Get prices for all pubs in borough
  const pubIds = pubs.map((p) => p.id);
  const { data: prices } = await supabaseAdmin
    .from("prices")
    .select("pub_id, brand, price_pence")
    .in("pub_id", pubIds)
    .order("price_pence", { ascending: true });

  // Aggregate cheapest per pub
  const pubPriceMap = new Map<
    string,
    { brand: string; pence: number; count: number }
  >();
  for (const p of prices ?? []) {
    const existing = pubPriceMap.get(p.pub_id);
    if (!existing) {
      pubPriceMap.set(p.pub_id, {
        brand: p.brand,
        pence: p.price_pence,
        count: 1,
      });
    } else {
      existing.count++;
    }
  }

  const pubsWithPrices: PubWithPrice[] = pubs
    .map((pub) => {
      const priceInfo = pubPriceMap.get(pub.id);
      return {
        id: pub.id,
        name: pub.name,
        address: pub.address,
        postcode: pub.postcode,
        neighbourhood: pub.neighbourhood ?? "",
        cheapest_brand: priceInfo?.brand ?? "",
        cheapest_pence: priceInfo?.pence ?? 0,
        price_count: priceInfo?.count ?? 0,
      };
    })
    .sort((a, b) => (a.cheapest_pence || 9999) - (b.cheapest_pence || 9999));

  const allPrices = (prices ?? []).map((p) => p.price_pence);
  const avgPence =
    allPrices.length > 0
      ? Math.round(allPrices.reduce((s, p) => s + p, 0) / allPrices.length)
      : 0;

  // Use the actual borough name casing from the DB
  const actualBorough = pubs[0].neighbourhood
    ? borough
    : borough;

  return {
    borough: actualBorough,
    pubs: pubsWithPrices,
    avgPence,
    totalPrices: allPrices.length,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ borough: string }>;
}): Promise<Metadata> {
  const { borough } = await params;
  const data = await getBoroughData(borough);
  if (!data) return { title: "Borough Not Found" };

  const cheapest =
    data.pubs.length > 0 && data.pubs[0].cheapest_pence > 0
      ? data.pubs[0]
      : null;
  const priceStr = cheapest
    ? ` Cheapest pint ${penceToPounds(cheapest.cheapest_pence)} at ${cheapest.name}.`
    : "";

  const title = `Pint Prices in ${data.borough}`;
  const description = `${data.pubs.length} pubs tracked in ${data.borough}, London.${priceStr} Average pint price ${penceToPounds(data.avgPence)}.`;

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

export default async function BoroughPage({
  params,
}: {
  params: Promise<{ borough: string }>;
}) {
  const { borough } = await params;
  const data = await getBoroughData(borough);
  if (!data) notFound();

  // JSON-LD for the borough page
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://pint-markets.vercel.app";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Pubs in ${data.borough}`,
    description: `Pint prices at pubs in ${data.borough}, London`,
    numberOfItems: data.pubs.length,
    itemListElement: data.pubs.slice(0, 20).map((pub, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "BarOrPub",
        name: pub.name,
        address: {
          "@type": "PostalAddress",
          postalCode: pub.postcode,
          addressLocality: data.borough,
          addressRegion: "London",
          addressCountry: "GB",
        },
        url: `${siteUrl}/pub/${pub.id}`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BoroughPageClient
        borough={data.borough}
        pubs={data.pubs}
        avgPence={data.avgPence}
        totalPrices={data.totalPrices}
      />
    </>
  );
}

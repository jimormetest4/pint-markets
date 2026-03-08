import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 3600;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pint-markets.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/map`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/charts`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/submit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic pub pages
  const { data: pubs } = await supabaseAdmin
    .from("pubs")
    .select("id, borough");

  const pubPages: MetadataRoute.Sitemap = (pubs ?? []).map((pub) => ({
    url: `${SITE_URL}/pub/${pub.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic borough pages (deduplicated)
  const boroughs = Array.from(new Set((pubs ?? []).map((p) => p.borough).filter(Boolean)));
  const boroughPages: MetadataRoute.Sitemap = boroughs.map((borough) => ({
    url: `${SITE_URL}/borough/${encodeURIComponent(borough)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...boroughPages, ...pubPages];
}

import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pint-markets.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pint Markets — London's Pint Price Tracker",
    template: "%s | Pint Markets",
  },
  description:
    "Find the cheapest pint in London — live prices, heatmaps, and leaderboards. A retro Ceefax-style teletext service tracking real pub prices across the capital.",
  keywords: [
    "London pubs",
    "cheap pints London",
    "pint prices",
    "pub price tracker",
    "beer prices London",
    "Ceefax",
    "teletext",
  ],
  authors: [{ name: "Pint Markets" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE_URL,
    siteName: "Pint Markets",
    title: "Pint Markets — London's Pint Price Tracker",
    description:
      "Find the cheapest pint in London — live prices, heatmaps, and leaderboards.",
    images: [
      {
        url: "/og-image",
        width: 1200,
        height: 630,
        alt: "Pint Markets — London's Pint Price Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pint Markets — London's Pint Price Tracker",
    description:
      "Find the cheapest pint in London — live prices, heatmaps, and leaderboards.",
    images: ["/og-image"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Pint Markets",
      url: SITE_URL,
      description:
        "Find the cheapest pint in London — live prices, heatmaps, and leaderboards.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      name: "Pint Markets",
      url: SITE_URL,
      logo: `${SITE_URL}/og-image`,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}

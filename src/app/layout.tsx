import type { Metadata } from "next";
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
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

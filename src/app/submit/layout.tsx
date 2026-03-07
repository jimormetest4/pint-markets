import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Pint Price",
  description:
    "Submit a pint price to help track London pub prices. Crowd-sourced data for the capital's beer drinkers.",
  openGraph: {
    title: "Submit a Pint Price | Pint Markets",
    description:
      "Submit a pint price to help track London pub prices. Crowd-sourced data for the capital's beer drinkers.",
  },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

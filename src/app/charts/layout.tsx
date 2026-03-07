import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Charts",
  description:
    "London pint price charts — trends over time, price distribution, borough and brand comparisons.",
  openGraph: {
    title: "Charts | Pint Markets",
    description:
      "London pint price charts — trends over time, price distribution, borough and brand comparisons.",
  },
};

export default function ChartsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

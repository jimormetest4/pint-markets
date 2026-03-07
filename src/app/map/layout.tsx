import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pub Map",
  description:
    "Interactive heatmap of London pint prices. View pub locations and borough averages across the capital.",
  openGraph: {
    title: "Pub Map | Pint Markets",
    description:
      "Interactive heatmap of London pint prices. View pub locations and borough averages across the capital.",
  },
};

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

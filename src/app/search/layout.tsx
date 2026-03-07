import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Pubs",
  description:
    "Search London pubs by name, postcode, borough, or brand. Find the cheapest pint near you.",
  openGraph: {
    title: "Search Pubs | Pint Markets",
    description:
      "Search London pubs by name, postcode, borough, or brand. Find the cheapest pint near you.",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

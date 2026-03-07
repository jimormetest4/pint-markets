import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "London's cheapest and most expensive pints ranked. See which pubs top the leaderboard.",
  openGraph: {
    title: "Leaderboard | Pint Markets",
    description:
      "London's cheapest and most expensive pints ranked. See which pubs top the leaderboard.",
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

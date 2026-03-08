"use client";

import CeefaxLayout from "@/components/CeefaxLayout";
import Link from "next/link";

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

function trunc(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "\u2026" : s;
}

export default function BoroughPageClient({
  borough,
  pubs,
  avgPence,
  totalPrices,
}: {
  borough: string;
  pubs: PubWithPrice[];
  avgPence: number;
  totalPrices: number;
}) {
  return (
    <CeefaxLayout pageNumber="P.600">
      {/* Breadcrumb */}
      <nav className="text-xs md:text-sm mb-2">
        <Link href="/" className="text-ceefax-cyan hover:text-ceefax-yellow">
          HOME
        </Link>
        <span className="text-ceefax-white mx-1">&gt;</span>
        <span className="text-ceefax-yellow">{borough.toUpperCase()}</span>
      </nav>

      <h1 className="text-ceefax-yellow mb-1" style={{ fontSize: "2em" }}>
        ░░ {borough.toUpperCase()} ░░
      </h1>

      {/* Stats */}
      <div className="flex gap-4 mb-3">
        <div className="border-2 border-ceefax-cyan px-3 py-1">
          <p className="text-ceefax-cyan text-xs">PUBS</p>
          <p className="text-ceefax-cyan text-xl md:text-2xl font-bold">
            {pubs.length}
          </p>
        </div>
        <div className="border-2 border-ceefax-yellow px-3 py-1">
          <p className="text-ceefax-yellow text-xs">AVG PINT</p>
          <p className="text-ceefax-yellow text-xl md:text-2xl font-bold">
            {penceToPounds(avgPence)}
          </p>
        </div>
        <div className="border-2 border-ceefax-magenta px-3 py-1">
          <p className="text-ceefax-magenta text-xs">PRICES</p>
          <p className="text-ceefax-magenta text-xl md:text-2xl font-bold">
            {totalPrices}
          </p>
        </div>
      </div>

      <div className="h-px bg-ceefax-yellow mb-2" />

      <h2 className="text-ceefax-cyan mb-1" style={{ fontSize: "1.5em" }}>
        PUBS IN {borough.toUpperCase()}
      </h2>

      {/* Table header */}
      <div className="bg-ceefax-cyan text-black font-bold flex text-xs md:text-lg px-1">
        <span className="w-7 shrink-0">#</span>
        <span className="flex-1 min-w-0">PUB</span>
        <span className="w-20 md:w-28 text-right shrink-0">AREA</span>
        <span className="w-16 md:w-24 text-right shrink-0">BRAND</span>
        <span className="w-14 md:w-16 text-right shrink-0">PRICE</span>
      </div>
      <div className="h-px bg-ceefax-cyan" />

      {pubs.map((pub, i) => {
        const isFirst = i === 0 && pub.cheapest_pence > 0;
        const isLast =
          i === pubs.length - 1 &&
          pubs.length > 1 &&
          pub.cheapest_pence > 0;
        const priceColor = isFirst
          ? "text-ceefax-green"
          : isLast
            ? "text-ceefax-red"
            : "text-ceefax-white";

        return (
          <div key={pub.id}>
            <div className="flex text-xs md:text-lg px-1 py-px">
              <span className="w-7 shrink-0 text-ceefax-yellow">{i + 1}</span>
              <Link
                href={`/pub/${pub.id}`}
                className="flex-1 min-w-0 text-ceefax-white truncate hover:text-ceefax-yellow"
              >
                {trunc(pub.name, 22)}
              </Link>
              <span className="w-20 md:w-28 text-right shrink-0 text-ceefax-cyan truncate">
                {trunc(pub.neighbourhood || pub.postcode, 14)}
              </span>
              <span className="w-16 md:w-24 text-right shrink-0 text-ceefax-magenta truncate">
                {trunc(pub.cheapest_brand, 12)}
              </span>
              <span
                className={`w-14 md:w-16 text-right shrink-0 font-bold ${priceColor}`}
              >
                {pub.cheapest_pence > 0
                  ? penceToPounds(pub.cheapest_pence)
                  : "—"}
              </span>
            </div>
            {i < pubs.length - 1 && <div className="h-px bg-ceefax-blue" />}
          </div>
        );
      })}
      <div className="h-px bg-ceefax-cyan mt-px" />

      {/* Links */}
      <div className="mt-4 flex gap-3 flex-wrap">
        <Link
          href="/search"
          className="bg-ceefax-red text-ceefax-white px-3 py-1 text-sm md:text-lg font-bold hover:brightness-110"
        >
          SEARCH PUBS
        </Link>
        <Link
          href="/leaderboard"
          className="bg-ceefax-green text-black px-3 py-1 text-sm md:text-lg font-bold hover:brightness-110"
        >
          LEADERBOARD
        </Link>
      </div>

      <p className="text-ceefax-magenta mt-4">
        A Teletext service from PINT MARKETS LTD
      </p>
    </CeefaxLayout>
  );
}

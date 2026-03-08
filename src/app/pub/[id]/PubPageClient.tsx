"use client";

import CeefaxLayout from "@/components/CeefaxLayout";
import Link from "next/link";

interface PubData {
  id: string;
  name: string;
  address: string;
  postcode: string;
  borough: string;
  neighbourhood: string;
  latitude: number;
  longitude: number;
}

interface PriceData {
  id: string;
  brand: string;
  type: string;
  price_pence: number;
  date_recorded: string;
}

function penceToPounds(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export default function PubPageClient({
  pub,
  prices,
}: {
  pub: PubData;
  prices: PriceData[];
}) {
  const cheapest = prices.length > 0 ? prices[0] : null;
  const mostExpensive = prices.length > 0 ? prices[prices.length - 1] : null;

  return (
    <CeefaxLayout pageNumber="P.500">
      {/* Breadcrumb */}
      <nav className="text-xs md:text-sm mb-2">
        <Link href="/" className="text-ceefax-cyan hover:text-ceefax-yellow">
          HOME
        </Link>
        <span className="text-ceefax-white mx-1">&gt;</span>
        {pub.borough && (
          <>
            <Link
              href={`/borough/${encodeURIComponent(pub.borough)}`}
              className="text-ceefax-cyan hover:text-ceefax-yellow"
            >
              {pub.borough.toUpperCase()}
            </Link>
            <span className="text-ceefax-white mx-1">&gt;</span>
          </>
        )}
        <span className="text-ceefax-yellow">{pub.name.toUpperCase()}</span>
      </nav>

      {/* Pub name */}
      <h1 className="text-ceefax-yellow mb-1" style={{ fontSize: "2em" }}>
        ░░ {pub.name.toUpperCase()} ░░
      </h1>

      {/* Location info */}
      <div className="mb-3">
        <p className="text-ceefax-white">{pub.address}</p>
        <p className="text-ceefax-cyan">
          {pub.postcode}
          {pub.neighbourhood && ` — ${pub.neighbourhood}`}
          {pub.borough && ` — ${pub.borough}`}
        </p>
      </div>

      {/* Quick stats */}
      {cheapest && mostExpensive && (
        <div className="flex gap-4 mb-3">
          <div className="border-2 border-ceefax-green px-3 py-1">
            <p className="text-ceefax-green text-xs">CHEAPEST</p>
            <p className="text-ceefax-green text-xl md:text-2xl font-bold">
              {penceToPounds(cheapest.price_pence)}
            </p>
            <p className="text-ceefax-white text-xs">{cheapest.brand}</p>
          </div>
          {prices.length > 1 && (
            <div className="border-2 border-ceefax-red px-3 py-1">
              <p className="text-ceefax-red text-xs">MOST EXPENSIVE</p>
              <p className="text-ceefax-red text-xl md:text-2xl font-bold">
                {penceToPounds(mostExpensive.price_pence)}
              </p>
              <p className="text-ceefax-white text-xs">
                {mostExpensive.brand}
              </p>
            </div>
          )}
          <div className="border-2 border-ceefax-cyan px-3 py-1">
            <p className="text-ceefax-cyan text-xs">BEERS</p>
            <p className="text-ceefax-cyan text-xl md:text-2xl font-bold">
              {prices.length}
            </p>
          </div>
        </div>
      )}

      <div className="h-px bg-ceefax-yellow mb-2" />

      {/* All prices */}
      <h2 className="text-ceefax-cyan mb-1" style={{ fontSize: "1.5em" }}>
        ALL PRICES
      </h2>

      {prices.length === 0 ? (
        <p className="text-ceefax-white py-4">No prices recorded yet.</p>
      ) : (
        <div>
          {/* Header */}
          <div className="bg-ceefax-cyan text-black font-bold flex text-xs md:text-lg px-1">
            <span className="w-7 shrink-0">#</span>
            <span className="flex-1 min-w-0">BRAND</span>
            <span className="w-20 md:w-24 text-right shrink-0">TYPE</span>
            <span className="w-16 md:w-20 text-right shrink-0">PRICE</span>
          </div>
          <div className="h-px bg-ceefax-cyan" />

          {prices.map((price, i) => {
            const isFirst = i === 0;
            const isLast = i === prices.length - 1 && prices.length > 1;
            const priceColor = isFirst
              ? "text-ceefax-green"
              : isLast
                ? "text-ceefax-red"
                : "text-ceefax-white";

            return (
              <div key={price.id}>
                <div className="flex text-xs md:text-lg px-1 py-px">
                  <span className="w-7 shrink-0 text-ceefax-yellow">
                    {i + 1}
                  </span>
                  <span className="flex-1 min-w-0 text-ceefax-magenta truncate">
                    {price.brand}
                  </span>
                  <span className="w-20 md:w-24 text-right shrink-0 text-ceefax-white">
                    {price.type}
                  </span>
                  <span
                    className={`w-16 md:w-20 text-right shrink-0 font-bold ${priceColor}`}
                  >
                    {penceToPounds(price.price_pence)}
                  </span>
                </div>
                {i < prices.length - 1 && (
                  <div className="h-px bg-ceefax-blue" />
                )}
              </div>
            );
          })}
          <div className="h-px bg-ceefax-cyan mt-px" />
        </div>
      )}

      {/* Links */}
      <div className="mt-4 flex gap-3 flex-wrap">
        <Link
          href="/search"
          className="bg-ceefax-red text-ceefax-white px-3 py-1 text-sm md:text-lg font-bold hover:brightness-110"
        >
          SEARCH PUBS
        </Link>
        <Link
          href="/map"
          className="bg-ceefax-yellow text-black px-3 py-1 text-sm md:text-lg font-bold hover:brightness-110"
        >
          VIEW MAP
        </Link>
      </div>

      <p className="text-ceefax-magenta mt-4">
        A Teletext service from PINT MARKETS LTD
      </p>
    </CeefaxLayout>
  );
}

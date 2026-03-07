"use client";

import CeefaxLayout from "@/components/CeefaxLayout";
import { useEffect, useState } from "react";

interface PriceRow {
  pub_name: string;
  neighbourhood: string;
  brand: string;
  type: string;
  price_pence: number;
  date_recorded: string;
}

interface HomeData {
  latest: PriceRow[];
  cheapest: {
    pub_name: string;
    neighbourhood: string;
    brand: string;
    type: string;
    price_pence: number;
  } | null;
  stats: {
    totalPubs: number;
    totalPrices: number;
    avgPricePence: number;
    lastUpdate: string | null;
  };
}

interface LiveDataProps {
  data: HomeData;
}

function penceToPounds(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

function truncate(str: string | null | undefined, max: number): string {
  if (!str) return "";
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

export default function Home() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/home")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <CeefaxLayout pageNumber="P.100">
      {/* Welcome block */}
      <div className="mb-4">
        <h1 className="text-ceefax-yellow text-2xl sm:text-3xl md:text-4xl">
          PINT MARKETS
        </h1>
        <p className="text-ceefax-cyan text-base sm:text-xl md:text-2xl">
          London&apos;s pint price tracker — find the cheapest pint near you
        </p>
      </div>

      <div className="text-ceefax-yellow overflow-hidden whitespace-nowrap">
        ════════════════════════════════════════════════
      </div>

      {loading ? (
        <div className="py-8 text-ceefax-cyan text-2xl animate-pulse">
          ░░░ LOADING DATA... ░░░
        </div>
      ) : !data || (data.stats.totalPubs === 0 && data.latest.length === 0) ? (
        <EmptyState />
      ) : (
        <LiveData data={data} />
      )}
    </CeefaxLayout>
  );
}

function EmptyState() {
  return (
    <div className="py-4 space-y-6">
      <div>
        <h2 className="text-ceefax-cyan mb-2 text-xl sm:text-2xl md:text-3xl">
          ░░ LATEST PRICES ░░
        </h2>
        <p className="text-ceefax-white">No price data available yet.</p>
        <p className="text-ceefax-yellow mt-1">
          Awaiting first submissions...
        </p>
      </div>

      <div className="text-ceefax-yellow overflow-hidden whitespace-nowrap">
        ════════════════════════════════════════════════
      </div>

      <div>
        <h2 className="text-ceefax-yellow mb-2 text-xl sm:text-2xl md:text-3xl">
          ░░ TODAY&apos;S CHEAPEST ░░
        </h2>
        <div className="border border-ceefax-green p-3">
          <p className="text-ceefax-green">
            No prices recorded yet — be the first to submit!
          </p>
        </div>
      </div>

      <div className="text-ceefax-yellow overflow-hidden whitespace-nowrap">
        ════════════════════════════════════════════════
      </div>

      <div>
        <h2 className="text-ceefax-cyan mb-2 text-xl sm:text-2xl md:text-3xl">
          ░░ STATS ░░
        </h2>
        <div className="space-y-1">
          <p>
            <span className="text-ceefax-white">Pubs tracked:</span>{" "}
            <span className="text-ceefax-yellow">0</span>
          </p>
          <p>
            <span className="text-ceefax-white">Prices recorded:</span>{" "}
            <span className="text-ceefax-yellow">0</span>
          </p>
          <p>
            <span className="text-ceefax-white">Avg London pint:</span>{" "}
            <span className="text-ceefax-yellow">—</span>
          </p>
          <p>
            <span className="text-ceefax-white">Last update:</span>{" "}
            <span className="text-ceefax-yellow">—</span>
          </p>
        </div>
      </div>

      <div className="text-ceefax-magenta mt-4">
        A Teletext service from PINT MARKETS LTD
      </div>
    </div>
  );
}

function LiveData({ data }: LiveDataProps) {
  return (
    <div className="py-2 space-y-4">
      {/* LATEST PRICES TABLE */}
      <div>
        <h2 className="text-ceefax-cyan mb-2 text-xl sm:text-2xl md:text-3xl">
          ░░ LATEST PRICES ░░
        </h2>

        <div className="overflow-x-auto">
          <div className="min-w-[480px]">
            {/* Table header */}
            <div className="bg-ceefax-cyan text-black font-bold flex text-sm md:text-lg px-1">
              <span className="w-8 shrink-0">#</span>
              <span className="flex-1 min-w-0">PUB</span>
              <span className="w-28 md:w-32 text-right shrink-0">AREA</span>
              <span className="w-24 md:w-28 text-right shrink-0">BRAND</span>
              <span className="w-16 text-right shrink-0">PRICE</span>
            </div>

            {/* Separator */}
            <div className="h-px bg-ceefax-cyan" />

            {/* Data rows */}
            {data.latest.map((row, i) => {
              const isFirst = i === 0;
              const isLast = i === data.latest.length - 1;
              const priceColor = isFirst
                ? "text-ceefax-green"
                : isLast && data.latest.length > 1
                  ? "text-ceefax-red"
                  : "text-ceefax-white";

              return (
                <div key={i}>
                  <div
                    className={`flex text-sm md:text-lg px-1 py-px ${priceColor}`}
                  >
                    <span className="w-8 shrink-0 text-ceefax-yellow">
                      {i + 1}.
                    </span>
                    <span className="flex-1 min-w-0 text-ceefax-white truncate">
                      {truncate(row.pub_name, 22)}
                    </span>
                    <span className="w-28 md:w-32 text-right shrink-0 text-ceefax-cyan truncate">
                      {truncate(row.neighbourhood, 16)}
                    </span>
                    <span className="w-24 md:w-28 text-right shrink-0 text-ceefax-magenta truncate">
                      {truncate(row.brand, 14)}
                    </span>
                    <span className={`w-16 text-right shrink-0 ${priceColor}`}>
                      {penceToPounds(row.price_pence)}
                    </span>
                  </div>
                  {i < data.latest.length - 1 && (
                    <div className="h-px bg-ceefax-blue" />
                  )}
                </div>
              );
            })}

            <div className="h-px bg-ceefax-cyan mt-px" />
          </div>
        </div>
      </div>

      <div className="text-ceefax-yellow overflow-hidden whitespace-nowrap">
        ════════════════════════════════════════════════
      </div>

      {/* TODAY'S CHEAPEST */}
      <div>
        <h2 className="text-ceefax-yellow mb-2 text-xl sm:text-2xl md:text-3xl">
          ░░ TODAY&apos;S CHEAPEST ░░
        </h2>

        {data.cheapest ? (
          <div className="border-2 border-ceefax-green p-3">
            <p className="text-ceefax-green text-xl sm:text-2xl md:text-3xl font-bold">
              {penceToPounds(data.cheapest.price_pence)}
            </p>
            <p className="text-ceefax-white text-lg sm:text-xl mt-1">
              {data.cheapest.pub_name}
            </p>
            <p className="text-ceefax-cyan">
              {data.cheapest.brand} — {data.cheapest.type}
            </p>
            <p className="text-ceefax-magenta text-sm mt-1">
              {data.cheapest.neighbourhood}
            </p>
          </div>
        ) : (
          <div className="border border-ceefax-green p-3">
            <p className="text-ceefax-green">
              No prices recorded yet — be the first to submit!
            </p>
          </div>
        )}
      </div>

      <div className="text-ceefax-yellow overflow-hidden whitespace-nowrap">
        ════════════════════════════════════════════════
      </div>

      {/* STATS */}
      <div>
        <h2 className="text-ceefax-cyan mb-2 text-xl sm:text-2xl md:text-3xl">
          ░░ STATS ░░
        </h2>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <p className="text-ceefax-white">Pubs tracked:</p>
          <p className="text-ceefax-yellow text-right">
            {data.stats.totalPubs}
          </p>

          <p className="text-ceefax-white">Prices recorded:</p>
          <p className="text-ceefax-yellow text-right">
            {data.stats.totalPrices}
          </p>

          <p className="text-ceefax-white">Avg London pint:</p>
          <p className="text-ceefax-yellow text-right">
            {data.stats.avgPricePence > 0
              ? penceToPounds(data.stats.avgPricePence)
              : "—"}
          </p>

          <p className="text-ceefax-white">Last update:</p>
          <p className="text-ceefax-yellow text-right">
            {data.stats.lastUpdate ?? "—"}
          </p>
        </div>
      </div>

      <div className="text-ceefax-yellow mt-2 overflow-hidden whitespace-nowrap">
        ════════════════════════════════════════════════
      </div>

      <p className="text-ceefax-magenta">
        A Teletext service from PINT MARKETS LTD
      </p>
    </div>
  );
}

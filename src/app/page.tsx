"use client";

import CeefaxLayout from "@/components/CeefaxLayout";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface PriceRow {
  pub_name: string;
  neighbourhood: string;
  brand: string;
  type: string;
  price_pence: number;
  date_recorded: string;
}

interface Spotlight {
  title: string;
  subtitle: string | null;
  mode: "cheapest" | "priciest";
  pub_name: string;
  neighbourhood: string;
  brand: string;
  type: string;
  price_pence: number;
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
  spotlights: Spotlight[];
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

      {/* SUBMIT CTA */}
      <div className="text-center py-2">
        <Link
          href="/submit"
          className="inline-block bg-ceefax-green text-black font-bold px-6 py-2 text-base sm:text-lg md:text-xl tracking-wide hover:brightness-110 transition-none"
        >
          ▶ SUBMIT A PINT PRICE ◀
        </Link>
        <p className="text-ceefax-cyan text-sm mt-1">
          Help us track London&apos;s pint prices
        </p>
      </div>

      <div className="text-ceefax-yellow overflow-hidden whitespace-nowrap">
        ════════════════════════════════════════════════
      </div>

      <div className="text-center py-2">
        <a
          href="https://buymeacoffee.com/jimorme"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-ceefax-yellow text-black font-bold px-6 py-2 text-base sm:text-lg md:text-xl tracking-wide hover:brightness-110 transition-none"
        >
          ▶ BUY ME A PINT ◀
        </a>
      </div>

      <div className="text-ceefax-yellow overflow-hidden whitespace-nowrap">
        ════════════════════════════════════════════════
      </div>

      <div className="text-ceefax-magenta mt-4">
        A Teletext service from PINT MARKETS LTD
      </div>
    </div>
  );
}

const ROTATION_INTERVAL = 6000;

// Shuffle array in place (Fisher-Yates)
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function RotatingStatsPanel({
  spotlights,
  cheapest,
}: {
  spotlights: Spotlight[];
  cheapest: HomeData["cheapest"];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<"visible" | "scanline-out" | "scanline-in">("visible");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build strictly alternating cheapest/priciest sequence on mount
  const [items] = useState(() => {
    if (spotlights.length <= 1) return spotlights;
    const cheapPool = shuffle(spotlights.filter((s) => s.mode === "cheapest"));
    const pricePool = shuffle(spotlights.filter((s) => s.mode === "priciest"));
    const result: Spotlight[] = [];
    const maxLen = Math.max(cheapPool.length, pricePool.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < cheapPool.length) result.push(cheapPool[i]);
      if (i < pricePool.length) result.push(pricePool[i]);
    }
    return result;
  });

  const advance = useCallback(() => {
    if (items.length <= 1) return;
    setPhase("scanline-out");
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
      setPhase("scanline-in");
      setTimeout(() => setPhase("visible"), 210);
    }, 210);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    timerRef.current = setInterval(advance, ROTATION_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [advance, items.length]);

  // Fallback for no spotlights
  if (items.length === 0) {
    if (!cheapest) {
      return (
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
      );
    }
    // Static fallback with cheapest data
    return (
      <div>
        <h2 className="text-ceefax-yellow mb-2 text-xl sm:text-2xl md:text-3xl">
          ░░ TODAY&apos;S CHEAPEST ░░
        </h2>
        <div className="border-2 border-ceefax-green p-3 flex items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-ceefax-green text-xl sm:text-2xl md:text-3xl font-bold">
              {penceToPounds(cheapest.price_pence)}
            </p>
            <p className="text-ceefax-white text-lg sm:text-xl mt-1">
              {cheapest.pub_name}
            </p>
            <p className="text-ceefax-cyan">
              {cheapest.brand} — {cheapest.type}
            </p>
            <p className="text-ceefax-magenta text-sm mt-1">
              {cheapest.neighbourhood}
            </p>
          </div>
          <div className="shrink-0 w-28 h-28 sm:w-28 sm:h-28 md:w-32 md:h-32 border-2 border-ceefax-green">
            <Image
              src="/ceefax-presenter.jpeg"
              alt="Ceefax presenter"
              width={128}
              height={128}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>
      </div>
    );
  }

  const current = items[activeIndex];
  const isCheapest = current.mode === "cheapest";
  const borderColor = isCheapest ? "border-ceefax-green" : "border-ceefax-red";
  const priceColor = isCheapest ? "text-ceefax-green" : "text-ceefax-red";
  const imageSrc = isCheapest ? "/ceefax-presenter.jpeg" : "/gazzer.png";
  const imageAlt = isCheapest ? "Ceefax presenter" : "Gazzer";

  const heading = current.subtitle
    ? `░░ ${current.title} ${current.subtitle} ░░`
    : `░░ ${current.title} ░░`;

  const headingColor = isCheapest ? "text-ceefax-yellow" : "text-ceefax-red";

  return (
    <div>
      <h2
        className={`${headingColor} mb-2 text-xl sm:text-2xl md:text-3xl transition-none`}
      >
        {heading}
      </h2>

      <div className={`border-2 ${borderColor} p-3 relative overflow-hidden`}>
        {/* Scanline overlay for transition */}
        {phase !== "visible" && (
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: "black",
              animation: phase === "scanline-out"
                ? "ceefax-wipe-down 210ms linear forwards"
                : "ceefax-wipe-up 210ms linear forwards",
            }}
          />
        )}

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p className={`${priceColor} text-xl sm:text-2xl md:text-3xl font-bold`}>
              {penceToPounds(current.price_pence)}
            </p>
            <p className="text-ceefax-white text-lg sm:text-xl mt-1">
              {current.pub_name}
            </p>
            <p className="text-ceefax-cyan">
              {current.brand} — {current.type}
            </p>
            <p className="text-ceefax-magenta text-sm mt-1">
              {current.neighbourhood}
            </p>
          </div>
          <div className={`shrink-0 w-28 h-28 sm:w-28 sm:h-28 md:w-32 md:h-32 border-2 ${borderColor}`}>
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={128}
              height={128}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>
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
          <div>
            {/* Table header */}
            <div className="bg-ceefax-cyan text-black font-bold flex text-sm md:text-lg px-1">
              <span className="w-7 shrink-0">#</span>
              <span className="flex-1 min-w-0">PUB</span>
              <span className="w-20 md:w-32 text-right shrink-0">AREA</span>
              <span className="w-20 md:w-28 text-right shrink-0">BRAND</span>
              <span className="w-14 md:w-16 text-right shrink-0">PRICE</span>
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
                    <span className="w-7 shrink-0 text-ceefax-yellow">
                      {i + 1}.
                    </span>
                    <span className="flex-1 min-w-0 text-ceefax-white truncate">
                      {truncate(row.pub_name, 22)}
                    </span>
                    <span className="w-20 md:w-32 text-right shrink-0 text-ceefax-cyan truncate">
                      {truncate(row.neighbourhood, 16)}
                    </span>
                    <span className="w-20 md:w-28 text-right shrink-0 text-ceefax-magenta truncate">
                      {truncate(row.brand, 14)}
                    </span>
                    <span className={`w-14 md:w-16 text-right shrink-0 ${priceColor}`}>
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

      {/* ROTATING STATS PANEL */}
      <RotatingStatsPanel spotlights={data.spotlights} cheapest={data.cheapest} />

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

      {/* SUBMIT CTA */}
      <div className="text-center py-2">
        <Link
          href="/submit"
          className="inline-block bg-ceefax-green text-black font-bold px-6 py-2 text-base sm:text-lg md:text-xl tracking-wide hover:brightness-110 transition-none"
        >
          ▶ SUBMIT A PINT PRICE ◀
        </Link>
        <p className="text-ceefax-cyan text-sm mt-1">
          Help us track London&apos;s pint prices
        </p>
      </div>

      <div className="text-ceefax-yellow mt-2 overflow-hidden whitespace-nowrap">
        ════════════════════════════════════════════════
      </div>

      <div className="text-center py-2">
        <a
          href="https://buymeacoffee.com/jimorme"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-ceefax-yellow text-black font-bold px-6 py-2 text-base sm:text-lg md:text-xl tracking-wide hover:brightness-110 transition-none"
        >
          ▶ BUY ME A PINT ◀
        </a>
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

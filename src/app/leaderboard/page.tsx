"use client";

import CeefaxLayout from "@/components/CeefaxLayout";
import { useCallback, useEffect, useState } from "react";

/* ─── shared helpers ─── */

function penceToPounds(p: number) {
  return `£${(p / 100).toFixed(2)}`;
}
function trunc(s: string | undefined | null, n: number) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

/* ─── tab definitions ─── */

const TABS = [
  { id: "cheapest_pubs", label: "PUBS", color: "bg-ceefax-red", text: "text-ceefax-white" },
  { id: "by_brand", label: "BRAND", color: "bg-ceefax-green", text: "text-black" },
  { id: "by_borough", label: "BOROUGH", color: "bg-ceefax-yellow", text: "text-black" },
  { id: "price_spread", label: "SPREAD", color: "bg-ceefax-cyan", text: "text-black" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ─── page ─── */

export default function LeaderboardPage() {
  const [tab, setTab] = useState<TabId>("cheapest_pubs");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback((view: TabId) => {
    fetch(`/api/leaderboard?view=${view}`)
      .then((r) => r.json())
      .then((d) => { setData(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Fetch on mount
  useEffect(() => { fetchData(tab); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function switchTab(id: TabId) {
    setData(null);
    setLoading(true);
    setTab(id);
    fetchData(id);
  }

  return (
    <CeefaxLayout pageNumber="P.300">
      <h1 className="text-ceefax-yellow mb-2" style={{ fontSize: "2em" }}>
        ░░ LEADERBOARD ░░
      </h1>

      {/* Sub-nav tabs */}
      <div className="grid grid-cols-4 mb-3">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`${t.color} ${t.text} py-1 text-sm md:text-lg font-bold tracking-wide transition-none ${active ? "brightness-125 underline underline-offset-4" : "brightness-75"}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="h-px bg-ceefax-yellow mb-2" />

      {loading ? (
        <div className="py-8 text-ceefax-cyan text-2xl animate-pulse">
          ░░░ LOADING... ░░░
        </div>
      ) : !data || (Array.isArray(data) && data.length === 0) || (data.brands && data.brands.length === 0) ? (
        <div className="py-8 text-center">
          <p className="text-ceefax-yellow text-2xl animate-pulse" style={{ fontSize: "2em" }}>
            NO DATA FOUND
          </p>
        </div>
      ) : (
        <>
          {tab === "cheapest_pubs" && <CheapestPubs rows={data} />}
          {tab === "by_brand" && <ByBrand rows={data} />}
          {tab === "by_borough" && <ByBorough rows={data} />}
          {tab === "price_spread" && <PriceSpread data={data} />}
        </>
      )}

      <p className="text-ceefax-magenta mt-4">
        A Teletext service from PINT MARKETS LTD
      </p>
    </CeefaxLayout>
  );
}

/* ═══════════════════════════════════════════
   VIEW 1 — CHEAPEST PUBS (Top 20)
   ═══════════════════════════════════════════ */

interface CheapestPubRow {
  pub_name: string;
  area: string;
  brand: string;
  price_pence: number;
}

function CheapestPubs({ rows }: { rows: CheapestPubRow[] }) {
  return (
    <div>
      <h2 className="text-ceefax-cyan mb-1" style={{ fontSize: "1.5em" }}>
        TOP 20 CHEAPEST PUBS
      </h2>

      {/* Header */}
      <div className="bg-ceefax-cyan text-black font-bold flex text-xs md:text-lg px-1">
        <span className="w-7 shrink-0">#</span>
        <span className="flex-1 min-w-0">PUB</span>
        <span className="w-24 md:w-32 text-right shrink-0">AREA</span>
        <span className="w-20 md:w-28 text-right shrink-0">BRAND</span>
        <span className="w-14 md:w-16 text-right shrink-0">PRICE</span>
      </div>
      <div className="h-px bg-ceefax-cyan" />

      {rows.map((r, i) => {
        const medal = i === 0 ? "text-ceefax-yellow" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-400" : null;
        const isLast = i === rows.length - 1;
        const priceColor = medal ?? (isLast ? "text-ceefax-red" : "text-ceefax-white");

        return (
          <div key={i}>
            <div className="flex text-xs md:text-lg px-1 py-px">
              <span className={`w-7 shrink-0 font-bold ${medal ?? "text-ceefax-yellow"}`}>
                {i + 1}
              </span>
              <span className="flex-1 min-w-0 text-ceefax-white truncate">
                {trunc(r.pub_name, 22)}
              </span>
              <span className="w-24 md:w-32 text-right shrink-0 text-ceefax-cyan truncate">
                {trunc(r.area, 14)}
              </span>
              <span className="w-20 md:w-28 text-right shrink-0 text-ceefax-magenta truncate">
                {trunc(r.brand, 12)}
              </span>
              <span className={`w-14 md:w-16 text-right shrink-0 font-bold ${priceColor}`}>
                {penceToPounds(r.price_pence)}
              </span>
            </div>
            {i < rows.length - 1 && <div className="h-px bg-ceefax-blue" />}
          </div>
        );
      })}
      <div className="h-px bg-ceefax-cyan mt-px" />
    </div>
  );
}

/* ═══════════════════════════════════════════
   VIEW 2 — CHEAPEST BY BRAND
   ═══════════════════════════════════════════ */

interface BrandRow {
  brand: string;
  avg_pence: number;
  cheapest_pence: number;
  cheapest_pub: string;
  num_pubs: number;
}

function ByBrand({ rows }: { rows: BrandRow[] }) {
  const minAvg = rows.length > 0 ? rows[0].avg_pence : 0;
  const maxAvg = rows.length > 0 ? rows[rows.length - 1].avg_pence : 0;

  return (
    <div>
      <h2 className="text-ceefax-cyan mb-1" style={{ fontSize: "1.5em" }}>
        CHEAPEST BY BRAND
      </h2>

      <div className="bg-ceefax-cyan text-black font-bold flex text-xs md:text-lg px-1">
        <span className="flex-1 min-w-0">BRAND</span>
        <span className="w-14 md:w-16 text-right shrink-0">AVG</span>
        <span className="w-14 md:w-16 text-right shrink-0">BEST</span>
        <span className="hidden md:block w-32 text-right shrink-0">CHEAPEST AT</span>
        <span className="w-10 text-right shrink-0">PUBS</span>
      </div>
      <div className="h-px bg-ceefax-cyan" />

      {rows.map((r, i) => {
        const avgColor =
          r.avg_pence === minAvg ? "text-ceefax-green" : r.avg_pence === maxAvg ? "text-ceefax-red" : "text-ceefax-white";
        return (
          <div key={r.brand}>
            <div className="flex text-xs md:text-lg px-1 py-px">
              <span className="flex-1 min-w-0 text-ceefax-yellow truncate">
                {trunc(r.brand, 18)}
              </span>
              <span className={`w-14 md:w-16 text-right shrink-0 font-bold ${avgColor}`}>
                {penceToPounds(r.avg_pence)}
              </span>
              <span className="w-14 md:w-16 text-right shrink-0 text-ceefax-green font-bold">
                {penceToPounds(r.cheapest_pence)}
              </span>
              <span className="hidden md:block w-32 text-right shrink-0 text-ceefax-cyan truncate">
                {trunc(r.cheapest_pub, 16)}
              </span>
              <span className="w-10 text-right shrink-0 text-ceefax-magenta">
                {r.num_pubs}
              </span>
            </div>
            {i < rows.length - 1 && <div className="h-px bg-ceefax-blue" />}
          </div>
        );
      })}
      <div className="h-px bg-ceefax-cyan mt-px" />
    </div>
  );
}

/* ═══════════════════════════════════════════
   VIEW 3 — CHEAPEST BY BOROUGH
   ═══════════════════════════════════════════ */

interface BoroughRow {
  borough: string;
  avg_pence: number;
  cheapest_pence: number;
  cheapest_pub: string;
  num_prices: number;
}

function ByBorough({ rows }: { rows: BoroughRow[] }) {
  const minAvg = rows.length > 0 ? rows[0].avg_pence : 0;
  const maxAvg = rows.length > 0 ? rows[rows.length - 1].avg_pence : 0;

  return (
    <div>
      <h2 className="text-ceefax-cyan mb-1" style={{ fontSize: "1.5em" }}>
        CHEAPEST BY BOROUGH
      </h2>

      <div className="bg-ceefax-cyan text-black font-bold flex text-xs md:text-lg px-1">
        <span className="w-7 shrink-0">#</span>
        <span className="flex-1 min-w-0">BOROUGH</span>
        <span className="w-14 md:w-16 text-right shrink-0">AVG</span>
        <span className="w-14 md:w-16 text-right shrink-0">BEST</span>
        <span className="hidden md:block w-32 text-right shrink-0">CHEAPEST PUB</span>
      </div>
      <div className="h-px bg-ceefax-cyan" />

      {rows.map((r, i) => {
        const avgColor =
          r.avg_pence === minAvg ? "text-ceefax-green" : r.avg_pence === maxAvg ? "text-ceefax-red" : "text-ceefax-white";
        return (
          <div key={r.borough}>
            <div className="flex text-xs md:text-lg px-1 py-px">
              <span className={`w-7 shrink-0 font-bold ${i < 3 ? "text-ceefax-yellow" : "text-ceefax-white"}`}>
                {i + 1}
              </span>
              <span className="flex-1 min-w-0 text-ceefax-white truncate">
                {trunc(r.borough, 20)}
              </span>
              <span className={`w-14 md:w-16 text-right shrink-0 font-bold ${avgColor}`}>
                {penceToPounds(r.avg_pence)}
              </span>
              <span className="w-14 md:w-16 text-right shrink-0 text-ceefax-green font-bold">
                {penceToPounds(r.cheapest_pence)}
              </span>
              <span className="hidden md:block w-32 text-right shrink-0 text-ceefax-cyan truncate">
                {trunc(r.cheapest_pub, 16)}
              </span>
            </div>
            {i < rows.length - 1 && <div className="h-px bg-ceefax-blue" />}
          </div>
        );
      })}
      <div className="h-px bg-ceefax-cyan mt-px" />
    </div>
  );
}

/* ═══════════════════════════════════════════
   VIEW 4 — PRICE SPREAD
   ═══════════════════════════════════════════ */

interface SpreadBrand {
  brand: string;
  min_pence: number;
  max_pence: number;
  spread_pence: number;
  count: number;
}

interface SpreadData {
  brands: SpreadBrand[];
  globalMin: number;
  globalMax: number;
}

// Block chars for the Ceefax-style bar
const BAR_EMPTY = "░";
const BAR_FILL = "█";

function PriceSpread({ data }: { data: SpreadData }) {
  const { brands, globalMin, globalMax } = data;
  const range = globalMax - globalMin || 1;
  const BAR_WIDTH = 24; // character-width of the bar area

  return (
    <div>
      <h2 className="text-ceefax-cyan mb-1" style={{ fontSize: "1.5em" }}>
        PRICE SPREAD BY BRAND
      </h2>

      <p className="text-ceefax-white text-xs md:text-base mb-2">
        <span className="text-ceefax-green">{penceToPounds(globalMin)}</span>
        {" "}
        <span className="text-ceefax-white">{"─".repeat(BAR_WIDTH)}</span>
        {" "}
        <span className="text-ceefax-red">{penceToPounds(globalMax)}</span>
      </p>

      <div className="h-px bg-ceefax-cyan mb-1" />

      {brands.map((b, i) => {
        // Calculate bar positions
        const startFrac = (b.min_pence - globalMin) / range;
        const endFrac = (b.max_pence - globalMin) / range;
        const startPos = Math.round(startFrac * BAR_WIDTH);
        const endPos = Math.max(startPos + 1, Math.round(endFrac * BAR_WIDTH));

        // Build the bar string
        let bar = "";
        for (let c = 0; c < BAR_WIDTH; c++) {
          if (c >= startPos && c < endPos) {
            bar += BAR_FILL;
          } else {
            bar += BAR_EMPTY;
          }
        }

        const spreadColor =
          i === 0 ? "text-ceefax-green" : i === brands.length - 1 ? "text-ceefax-red" : "text-ceefax-cyan";

        return (
          <div key={b.brand}>
            <div className="flex text-xs md:text-base px-1 py-px items-baseline gap-1">
              <span className="w-24 md:w-32 shrink-0 text-ceefax-yellow truncate">
                {trunc(b.brand, 14)}
              </span>
              <span className={`font-mono tracking-tighter ${spreadColor}`}>
                {bar}
              </span>
              <span className="shrink-0 text-ceefax-green text-xs">
                {penceToPounds(b.min_pence)}
              </span>
              <span className="shrink-0 text-ceefax-white text-xs">-</span>
              <span className="shrink-0 text-ceefax-red text-xs">
                {penceToPounds(b.max_pence)}
              </span>
            </div>
            {i < brands.length - 1 && <div className="h-px bg-ceefax-blue" />}
          </div>
        );
      })}
      <div className="h-px bg-ceefax-cyan mt-px" />
    </div>
  );
}

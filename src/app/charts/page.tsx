"use client";

import CeefaxLayout from "@/components/CeefaxLayout";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

/* ─── types ─── */

interface TimePoint {
  month: string;
  avg_pence: number;
}

interface DistBucket {
  bracket: string;
  count: number;
}

interface BoroughAvg {
  borough: string;
  avg_pence: number;
}

interface BrandAvg {
  brand: string;
  avg_pence: number;
}

interface ChartsData {
  priceOverTime: TimePoint[];
  distribution: DistBucket[];
  boroughComparison: BoroughAvg[];
  brandComparison: BrandAvg[];
}

/* ─── helpers ─── */

function penceToPounds(p: number) {
  return `£${(p / 100).toFixed(2)}`;
}

const TICK = {
  fill: "#ffff00",
  fontFamily: '"VT323", monospace',
  fontSize: 14,
};

const TOOLTIP_CONTENT = {
  background: "#000",
  border: "2px solid #00ffff",
  fontFamily: '"VT323", monospace',
  fontSize: 16,
  borderRadius: 0,
};

/* ─── tabs ─── */

const TABS = [
  { id: "time", label: "TIME", color: "bg-ceefax-cyan", text: "text-black" },
  { id: "distribution", label: "DISTRIB", color: "bg-ceefax-green", text: "text-black" },
  { id: "borough", label: "BOROUGH", color: "bg-ceefax-yellow", text: "text-black" },
  { id: "brand", label: "BRAND", color: "bg-ceefax-magenta", text: "text-black" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ─── page ─── */

export default function ChartsPage() {
  const [tab, setTab] = useState<TabId>("time");
  const [data, setData] = useState<ChartsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/charts")
      .then((r) => r.json())
      .then((d: ChartsData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const isEmpty =
    !data ||
    (data.priceOverTime.length === 0 &&
      data.distribution.length === 0 &&
      data.boroughComparison.length === 0 &&
      data.brandComparison.length === 0);

  return (
    <CeefaxLayout pageNumber="P.500">
      <h1 className="text-ceefax-yellow mb-2" style={{ fontSize: "2em" }}>
        ░░ CHARTS ░░
      </h1>

      {/* Tab nav */}
      <div className="grid grid-cols-4 mb-3">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
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
      ) : isEmpty ? (
        <div className="py-8 text-center">
          <p
            className="text-ceefax-yellow text-2xl animate-pulse"
            style={{ fontSize: "2em" }}
          >
            NO DATA FOUND
          </p>
          <p className="text-ceefax-white mt-2">
            Charts will appear once price data is submitted
          </p>
        </div>
      ) : mounted ? (
        <>
          {tab === "time" && <PriceOverTimeChart data={data!.priceOverTime} />}
          {tab === "distribution" && (
            <DistributionChart data={data!.distribution} />
          )}
          {tab === "borough" && (
            <BoroughChart data={data!.boroughComparison} />
          )}
          {tab === "brand" && <BrandChart data={data!.brandComparison} />}
        </>
      ) : null}

      <p className="text-ceefax-magenta mt-4">
        A Teletext service from PINT MARKETS LTD
      </p>
    </CeefaxLayout>
  );
}

/* ═══════════════════════════════════════════
   CHART 1 — AVERAGE PRICE OVER TIME
   ═══════════════════════════════════════════ */

interface PriceOverTimeProps {
  data: TimePoint[];
}

function PriceOverTimeChart({ data }: PriceOverTimeProps) {
  if (data.length === 0) {
    return <NoChartData label="No snapshot data available yet" />;
  }

  return (
    <div>
      <h2 className="text-ceefax-cyan mb-2" style={{ fontSize: "1.5em" }}>
        AVERAGE PRICE OVER TIME
      </h2>
      <div className="border-2 border-ceefax-cyan p-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#00ffff"
              opacity={0.2}
            />
            <XAxis
              dataKey="month"
              tick={TICK}
              axisLine={{ stroke: "#00ffff" }}
              tickLine={{ stroke: "#00ffff" }}
            />
            <YAxis
              tick={TICK}
              axisLine={{ stroke: "#00ffff" }}
              tickLine={{ stroke: "#00ffff" }}
              tickFormatter={(v: number) => penceToPounds(v)}
            />
            <Tooltip
              contentStyle={TOOLTIP_CONTENT}
              labelStyle={{ color: "#ffff00" }}
              itemStyle={{ color: "#00ffff" }}
              formatter={(v: number) => [penceToPounds(v), "AVG PRICE"]}
            />
            <Line
              type="monotone"
              dataKey="avg_pence"
              stroke="#00ffff"
              strokeWidth={2}
              dot={{ fill: "#00ffff", r: 4 }}
              activeDot={{ fill: "#ffff00", r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CHART 2 — PRICE DISTRIBUTION
   ═══════════════════════════════════════════ */

interface DistributionProps {
  data: DistBucket[];
}

function shortenBracket(label: string) {
  // "£2.00-2.50" → "2.00-2.50"
  return label.replace(/£/g, "");
}

function DistributionChart({ data }: DistributionProps) {
  if (data.length === 0) {
    return <NoChartData label="No price data available yet" />;
  }

  return (
    <div>
      <h2 className="text-ceefax-cyan mb-2" style={{ fontSize: "1.5em" }}>
        PRICE DISTRIBUTION
      </h2>
      <div className="border-2 border-ceefax-cyan p-2">
        <ResponsiveContainer width="100%" height={340}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#00ffff"
              opacity={0.2}
            />
            <XAxis
              dataKey="bracket"
              tick={{ ...TICK, fontSize: 10 }}
              axisLine={{ stroke: "#00ffff" }}
              tickLine={{ stroke: "#00ffff" }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tickFormatter={shortenBracket}
            />
            <YAxis
              tick={TICK}
              axisLine={{ stroke: "#00ffff" }}
              tickLine={{ stroke: "#00ffff" }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={TOOLTIP_CONTENT}
              labelStyle={{ color: "#ffff00" }}
              itemStyle={{ color: "#00ff00" }}
              formatter={(v: number) => [`${v}`, "PUBS"]}
            />
            <Bar dataKey="count" fill="#00ff00" radius={0} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CHART 3 — BOROUGH COMPARISON (horizontal)
   ═══════════════════════════════════════════ */

interface BoroughChartProps {
  data: BoroughAvg[];
}

function BoroughChart({ data }: BoroughChartProps) {
  if (data.length === 0) {
    return <NoChartData label="No borough data available yet" />;
  }

  const chartHeight = Math.max(300, data.length * 32);

  return (
    <div>
      <h2 className="text-ceefax-cyan mb-2" style={{ fontSize: "1.5em" }}>
        BOROUGH COMPARISON
      </h2>
      <div className="border-2 border-ceefax-cyan p-2">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#00ffff"
              opacity={0.2}
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={TICK}
              axisLine={{ stroke: "#00ffff" }}
              tickLine={{ stroke: "#00ffff" }}
              tickFormatter={(v: number) => penceToPounds(v)}
            />
            <YAxis
              type="category"
              dataKey="borough"
              tick={{ ...TICK, fontSize: 12 }}
              axisLine={{ stroke: "#00ffff" }}
              tickLine={{ stroke: "#00ffff" }}
              width={120}
            />
            <Tooltip
              contentStyle={TOOLTIP_CONTENT}
              labelStyle={{ color: "#ffff00" }}
              itemStyle={{ color: "#00ffff" }}
              formatter={(v: number) => [penceToPounds(v), "AVG PRICE"]}
            />
            <Bar dataKey="avg_pence" radius={0}>
              {data.map((entry, index) => {
                const frac =
                  data.length > 1 ? index / (data.length - 1) : 0;
                let color = "#ffff00";
                if (frac < 0.33) color = "#00ff00";
                else if (frac > 0.66) color = "#ff0000";
                return <Cell key={entry.borough} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <PriceLegend />
    </div>
  );
}

/* ═══════════════════════════════════════════
   CHART 4 — BRAND PRICE COMPARISON
   ═══════════════════════════════════════════ */

interface BrandChartProps {
  data: BrandAvg[];
}

function truncBrand(name: string, max: number) {
  return name.length > max ? name.slice(0, max - 1) + "…" : name;
}

function BrandChart({ data }: BrandChartProps) {
  if (data.length === 0) {
    return <NoChartData label="No brand data available yet" />;
  }

  // Dynamic height: more brands = taller chart
  const chartHeight = Math.max(350, 300 + data.length * 4);

  return (
    <div>
      <h2 className="text-ceefax-cyan mb-2" style={{ fontSize: "1.5em" }}>
        BRAND PRICE COMPARISON
      </h2>
      <div className="border-2 border-ceefax-cyan p-2">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#00ffff"
              opacity={0.2}
            />
            <XAxis
              dataKey="brand"
              tick={{ ...TICK, fontSize: 11 }}
              axisLine={{ stroke: "#00ffff" }}
              tickLine={{ stroke: "#00ffff" }}
              angle={-55}
              textAnchor="end"
              height={110}
              interval={0}
              tickFormatter={(v: string) => truncBrand(v, 14)}
            />
            <YAxis
              tick={TICK}
              axisLine={{ stroke: "#00ffff" }}
              tickLine={{ stroke: "#00ffff" }}
              tickFormatter={(v: number) => penceToPounds(v)}
            />
            <Tooltip
              contentStyle={TOOLTIP_CONTENT}
              labelStyle={{ color: "#ffff00" }}
              itemStyle={{ color: "#00ffff" }}
              formatter={(v: number) => [penceToPounds(v), "AVG PRICE"]}
            />
            <Bar dataKey="avg_pence" radius={0}>
              {data.map((entry, index) => {
                const frac =
                  data.length > 1 ? index / (data.length - 1) : 0;
                let color = "#ffff00";
                if (frac < 0.33) color = "#00ff00";
                else if (frac > 0.66) color = "#ff0000";
                return <Cell key={entry.brand} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <PriceLegend />
    </div>
  );
}

/* ─── shared components ─── */

interface NoChartDataProps {
  label: string;
}

function NoChartData({ label }: NoChartDataProps) {
  return (
    <div className="py-8 text-center border-2 border-ceefax-cyan">
      <p className="text-ceefax-yellow text-xl animate-pulse">{label}</p>
    </div>
  );
}

function PriceLegend() {
  return (
    <div className="flex gap-4 mt-2 text-sm">
      <span className="flex items-center gap-1">
        <span className="inline-block w-3 h-3 bg-ceefax-green" /> CHEAP
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-3 h-3 bg-ceefax-yellow" /> MID
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-3 h-3 bg-ceefax-red" /> EXPENSIVE
      </span>
    </div>
  );
}

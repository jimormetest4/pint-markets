"use client";

import CeefaxLayout from "@/components/CeefaxLayout";
import { useCallback, useEffect, useState } from "react";

interface SearchResult {
  pub_name: string;
  postcode: string;
  borough: string;
  neighbourhood: string;
  brand: string;
  type: string;
  price_pence: number;
  date_recorded: string;
}

function penceToPounds(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

const BEER_TYPES = ["All", "Lager", "Ale", "Stout", "IPA", "Cider"] as const;
const MAX_PRICES = ["All", "3", "4", "5", "6", "7"] as const;
const SORT_OPTIONS = [
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
  { value: "name", label: "Name A-Z" },
] as const;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [beerType, setBeerType] = useState("all");
  const [maxPrice, setMaxPrice] = useState("all");
  const [sort, setSort] = useState("price_asc");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(() => {
    setLoading(true);
    setSearched(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (beerType !== "all") params.set("beerType", beerType);
    if (maxPrice !== "all") params.set("maxPrice", maxPrice);
    params.set("sort", sort);

    fetch(`/api/search?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setResults(d.results ?? []);
        setLoading(false);
      })
      .catch(() => {
        setResults([]);
        setLoading(false);
      });
  }, [query, beerType, maxPrice, sort]);

  // Search on mount to show all results
  useEffect(() => {
    doSearch();
  }, [doSearch]);

  return (
    <CeefaxLayout pageNumber="P.200">
      {/* Title */}
      <h1 className="text-ceefax-yellow mb-3" style={{ fontSize: "2em" }}>
        ░░ SEARCH ░░
      </h1>

      {/* Search input */}
      <div className="mb-3">
        <label className="text-ceefax-cyan text-sm block mb-1">
          POSTCODE / BOROUGH / AREA:
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch()}
          placeholder="e.g. SE1, Soho, Camden..."
          className="w-full md:w-96 bg-black border-2 border-ceefax-cyan text-ceefax-green px-2 py-1 text-lg font-teletext placeholder:text-ceefax-green/40 focus:outline-none focus:border-ceefax-yellow"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-3 items-end">
        {/* Beer type */}
        <div>
          <label className="text-ceefax-cyan text-sm block mb-1">TYPE:</label>
          <select
            value={beerType}
            onChange={(e) => setBeerType(e.target.value)}
            className="bg-black border-2 border-ceefax-cyan text-ceefax-green px-2 py-1 text-lg font-teletext focus:outline-none focus:border-ceefax-yellow"
          >
            {BEER_TYPES.map((t) => (
              <option key={t} value={t.toLowerCase()}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Max price */}
        <div>
          <label className="text-ceefax-cyan text-sm block mb-1">
            MAX PRICE:
          </label>
          <select
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="bg-black border-2 border-ceefax-cyan text-ceefax-green px-2 py-1 text-lg font-teletext focus:outline-none focus:border-ceefax-yellow"
          >
            {MAX_PRICES.map((p) => (
              <option key={p} value={p.toLowerCase()}>
                {p === "All" ? "All" : `£${p}`}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="text-ceefax-cyan text-sm block mb-1">SORT:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-black border-2 border-ceefax-cyan text-ceefax-green px-2 py-1 text-lg font-teletext focus:outline-none focus:border-ceefax-yellow"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search button */}
        <button
          onClick={doSearch}
          className="bg-ceefax-yellow text-black px-4 py-1 text-lg font-teletext font-bold hover:bg-ceefax-cyan transition-none"
        >
          FIND
        </button>
      </div>

      <div className="h-px bg-ceefax-yellow mb-3" />

      {/* Results */}
      {loading ? (
        <div className="py-8 text-ceefax-cyan text-2xl animate-pulse">
          ░░░ SEARCHING... ░░░
        </div>
      ) : searched && results.length === 0 ? (
        <NoResults />
      ) : results.length > 0 ? (
        <ResultsTable results={results} />
      ) : null}

      <p className="text-ceefax-magenta mt-4">
        A Teletext service from PINT MARKETS LTD
      </p>
    </CeefaxLayout>
  );
}

function NoResults() {
  return (
    <div className="py-8 text-center">
      <p
        className="text-ceefax-yellow text-2xl md:text-3xl animate-pulse"
        style={{ fontSize: "2em" }}
      >
        NO DATA FOUND
      </p>
      <p className="text-ceefax-white mt-2">
        Try a different search or broaden your filters.
      </p>
    </div>
  );
}

interface ResultsTableProps {
  results: SearchResult[];
}

function ResultsTable({ results }: ResultsTableProps) {
  // Find min/max for highlighting
  const minPrice = Math.min(...results.map((r) => r.price_pence));
  const maxPrice = Math.max(...results.map((r) => r.price_pence));

  return (
    <div>
      <p className="text-ceefax-white mb-2">
        {results.length} result{results.length !== 1 ? "s" : ""} found
      </p>

      {/* Table header */}
      <div className="bg-ceefax-cyan text-black font-bold flex text-xs md:text-lg px-1">
        <span className="w-7 shrink-0">#</span>
        <span className="flex-1 min-w-0">PUB</span>
        <span className="hidden md:block w-28 text-right shrink-0">AREA</span>
        <span className="w-20 md:w-24 text-right shrink-0">BRAND</span>
        <span className="hidden md:block w-20 text-right shrink-0">TYPE</span>
        <span className="w-14 md:w-16 text-right shrink-0">PRICE</span>
      </div>

      <div className="h-px bg-ceefax-cyan" />

      {/* Rows */}
      <div className="max-h-[50vh] overflow-y-auto">
        {results.map((row, i) => {
          const isCheapest =
            row.price_pence === minPrice && minPrice !== maxPrice;
          const isMostExpensive =
            row.price_pence === maxPrice && minPrice !== maxPrice;
          const priceColor = isCheapest
            ? "text-ceefax-green"
            : isMostExpensive
              ? "text-ceefax-red"
              : "text-ceefax-white";

          return (
            <div key={i}>
              <div className="flex text-xs md:text-lg px-1 py-px">
                <span className="w-7 shrink-0 text-ceefax-yellow">
                  {i + 1}
                </span>
                <span className="flex-1 min-w-0 text-ceefax-white truncate">
                  {truncate(row.pub_name, 20)}
                </span>
                <span className="hidden md:block w-28 text-right shrink-0 text-ceefax-cyan truncate">
                  {truncate(row.neighbourhood || row.borough || row.postcode, 14)}
                </span>
                <span className="w-20 md:w-24 text-right shrink-0 text-ceefax-magenta truncate">
                  {truncate(row.brand, 10)}
                </span>
                <span className="hidden md:block w-20 text-right shrink-0 text-ceefax-white truncate">
                  {truncate(row.type, 10)}
                </span>
                <span className={`w-14 md:w-16 text-right shrink-0 font-bold ${priceColor}`}>
                  {penceToPounds(row.price_pence)}
                </span>
              </div>
              {i < results.length - 1 && (
                <div className="h-px bg-ceefax-blue" />
              )}
            </div>
          );
        })}
      </div>

      <div className="h-px bg-ceefax-cyan mt-px" />
    </div>
  );
}

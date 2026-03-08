"use client";

import CeefaxLayout from "@/components/CeefaxLayout";
import { useCallback, useEffect, useRef, useState } from "react";

interface SearchResult {
  pub_id: string;
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
  const [pubName, setPubName] = useState("");
  const [area, setArea] = useState("");
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
    if (pubName) params.set("pubName", pubName);
    if (area) params.set("area", area);
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
  }, [pubName, area, beerType, maxPrice, sort]);

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

      {/* Search inputs */}
      <div className="flex flex-col md:flex-row gap-3 mb-3">
        <div className="flex-1">
          <label className="text-ceefax-cyan text-sm block mb-1">
            PUB NAME:
          </label>
          <input
            type="text"
            value={pubName}
            onChange={(e) => setPubName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="e.g. Red Lion, Crown..."
            className="w-full bg-black border-2 border-ceefax-cyan text-ceefax-green px-2 py-1 text-lg font-teletext placeholder:text-ceefax-green/40 focus:outline-none focus:border-ceefax-yellow"
          />
        </div>
        <div className="flex-1">
          <label className="text-ceefax-cyan text-sm block mb-1">
            AREA / BOROUGH / POSTCODE:
          </label>
          <input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="e.g. Lambeth, Soho, SE1..."
            className="w-full bg-black border-2 border-ceefax-cyan text-ceefax-green px-2 py-1 text-lg font-teletext placeholder:text-ceefax-green/40 focus:outline-none focus:border-ceefax-yellow"
          />
        </div>
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
  const minPrice = Math.min(...results.map((r) => r.price_pence));
  const maxPriceVal = Math.max(...results.map((r) => r.price_pence));

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  return (
    <div>
      <p className="text-ceefax-white mb-2">
        {results.length} result{results.length !== 1 ? "s" : ""} found
        <span className="text-ceefax-cyan text-xs md:text-sm ml-2">
          — tap price to update
        </span>
      </p>

      <div className="overflow-x-auto -mx-2 px-2">
        <div className="min-w-[520px]">
          {/* Table header */}
          <div className="bg-ceefax-cyan text-black font-bold flex text-xs md:text-lg px-1">
            <span className="w-7 shrink-0">#</span>
            <span className="flex-1 min-w-0">PUB</span>
            <span className="w-24 text-right shrink-0">AREA</span>
            <span className="w-24 text-right shrink-0">BRAND</span>
            <span className="w-16 text-right shrink-0">TYPE</span>
            <span className="w-16 text-right shrink-0">PRICE</span>
          </div>

          <div className="h-px bg-ceefax-cyan" />

          {/* Rows */}
          <div className="max-h-[50vh] overflow-y-auto">
            {results.map((row, i) => {
              const isCheapest =
                row.price_pence === minPrice && minPrice !== maxPriceVal;
              const isMostExpensive =
                row.price_pence === maxPriceVal && minPrice !== maxPriceVal;
              const priceColor = isCheapest
                ? "text-ceefax-green"
                : isMostExpensive
                  ? "text-ceefax-red"
                  : "text-ceefax-white";

              return (
                <div key={i} className="relative">
                  <div className="flex text-xs md:text-lg px-1 py-px">
                    <span className="w-7 shrink-0 text-ceefax-yellow">
                      {i + 1}
                    </span>
                    <span className="flex-1 min-w-0 text-ceefax-white truncate">
                      {truncate(row.pub_name, 20)}
                    </span>
                    <span className="w-24 text-right shrink-0 text-ceefax-cyan truncate">
                      {truncate(row.neighbourhood || row.borough || row.postcode, 14)}
                    </span>
                    <span className="w-24 text-right shrink-0 text-ceefax-magenta truncate">
                      {truncate(row.brand, 10)}
                    </span>
                    <span className="w-16 text-right shrink-0 text-ceefax-white truncate">
                      {truncate(row.type, 10)}
                    </span>
                    <span
                      className={`w-16 text-right shrink-0 font-bold ${priceColor} cursor-pointer hover:underline`}
                      onClick={() => setEditingIndex(editingIndex === i ? null : i)}
                    >
                      {penceToPounds(row.price_pence)}
                    </span>
                  </div>

                  {editingIndex === i && (
                    <PriceUpdatePopover
                      row={row}
                      onClose={() => setEditingIndex(null)}
                    />
                  )}

                  {i < results.length - 1 && (
                    <div className="h-px bg-ceefax-blue" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="h-px bg-ceefax-cyan mt-px" />
        </div>
      </div>
    </div>
  );
}

interface PriceUpdatePopoverProps {
  row: SearchResult;
  onClose: () => void;
}

function PriceUpdatePopover({ row, onClose }: PriceUpdatePopoverProps) {
  const [newPrice, setNewPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async () => {
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0 || priceNum > 20) return;

    const newPence = Math.round(priceNum * 100);
    if (newPence === row.price_pence) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/submit-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pubId: row.pub_id,
          prices: [{ brand: row.brand, price: priceNum }],
        }),
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(onClose, 1500);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "success") {
    return (
      <div
        ref={popoverRef}
        className="border-2 border-ceefax-green bg-black p-3 my-1 mx-1"
      >
        <p className="text-ceefax-green font-bold text-lg animate-pulse">
          SUBMITTED FOR REVIEW
        </p>
      </div>
    );
  }

  return (
    <div
      ref={popoverRef}
      className="border-2 border-ceefax-cyan bg-black p-3 my-1 mx-1"
    >
      <p className="text-ceefax-yellow font-bold text-sm md:text-lg mb-1">
        UPDATE PRICE
      </p>
      <p className="text-ceefax-white text-xs md:text-sm mb-2">
        {row.pub_name} — {row.brand}
      </p>
      <p className="text-ceefax-cyan text-xs md:text-sm mb-2">
        Current: {penceToPounds(row.price_pence)}
      </p>

      <div className="flex items-center gap-2">
        <span className="text-ceefax-white text-lg">£</span>
        <input
          ref={inputRef}
          type="number"
          step="0.01"
          min="0.50"
          max="20"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="0.00"
          className="w-24 bg-black border-2 border-ceefax-green text-ceefax-green px-2 py-1 text-lg font-teletext placeholder:text-ceefax-green/40 focus:outline-none focus:border-ceefax-yellow"
        />
        <button
          onClick={handleSubmit}
          disabled={submitting || !newPrice}
          className="bg-ceefax-green text-black px-3 py-1 text-sm md:text-lg font-teletext font-bold hover:bg-ceefax-yellow transition-none disabled:opacity-50"
        >
          {submitting ? "..." : "OK"}
        </button>
        <button
          onClick={onClose}
          className="bg-ceefax-red text-black px-3 py-1 text-sm md:text-lg font-teletext font-bold hover:bg-ceefax-yellow transition-none"
        >
          X
        </button>
      </div>

      {status === "error" && (
        <p className="text-ceefax-red text-xs mt-1">
          FAILED — TRY AGAIN
        </p>
      )}
    </div>
  );
}

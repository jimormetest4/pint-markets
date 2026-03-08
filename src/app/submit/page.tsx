"use client";

import CeefaxLayout from "@/components/CeefaxLayout";
import { useState, useEffect, useRef, useCallback } from "react";

const INPUT =
  "w-full bg-black border-2 border-ceefax-cyan text-ceefax-green px-2 py-1 font-teletext placeholder:text-ceefax-green/40 focus:outline-none focus:border-ceefax-yellow";
const SELECT =
  "w-full bg-black border-2 border-ceefax-cyan text-ceefax-green px-2 py-1 font-teletext focus:outline-none focus:border-ceefax-yellow";
const LABEL = "text-ceefax-cyan text-sm block mb-1";
const BTN =
  "bg-ceefax-yellow text-black px-4 py-1 font-bold font-teletext hover:bg-ceefax-cyan transition-none";

interface PubResult {
  id: string;
  name: string;
  borough: string | null;
  postcode: string | null;
}

interface PriceRow {
  brand: string;
  customBrand: string;
  price: string;
}

function emptyRow(): PriceRow {
  return { brand: "", customBrand: "", price: "" };
}

export default function SubmitPage() {
  // Pub selection
  const [pubQuery, setPubQuery] = useState("");
  const [pubResults, setPubResults] = useState<PubResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPub, setSelectedPub] = useState<PubResult | null>(null);
  const [isNewPub, setIsNewPub] = useState(false);
  const [searching, setSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // New pub fields
  const [newPubName, setNewPubName] = useState("");
  const [newPubAddress, setNewPubAddress] = useState("");
  const [newPubPostcode, setNewPubPostcode] = useState("");
  const [newPubBorough, setNewPubBorough] = useState("");
  const [newPubNeighbourhood, setNewPubNeighbourhood] = useState("");

  // Beer prices
  const [rows, setRows] = useState<PriceRow[]>([emptyRow()]);
  const [brands, setBrands] = useState<string[]>([]);

  // Form state
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Fetch known brands on mount
  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((d) => setBrands(d.brands ?? []))
      .catch(() => {});
  }, []);

  // Debounced pub search
  const searchTimeout = useRef<NodeJS.Timeout>();

  const searchPubs = useCallback((query: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.length < 2) {
      setPubResults([]);
      setShowDropdown(false);
      return;
    }

    setSearching(true);
    searchTimeout.current = setTimeout(() => {
      fetch(`/api/pubs/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((d) => {
          setPubResults(d.pubs ?? []);
          setShowDropdown(true);
          setSearching(false);
        })
        .catch(() => setSearching(false));
    }, 300);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectPub(pub: PubResult) {
    setSelectedPub(pub);
    setIsNewPub(false);
    setShowDropdown(false);
    setPubQuery("");
  }

  function selectNewPub() {
    setSelectedPub(null);
    setIsNewPub(true);
    setShowDropdown(false);
    setNewPubName(pubQuery);
    setPubQuery("");
  }

  function clearPub() {
    setSelectedPub(null);
    setIsNewPub(false);
    setPubQuery("");
    setNewPubName("");
    setNewPubAddress("");
    setNewPubPostcode("");
    setNewPubBorough("");
    setNewPubNeighbourhood("");
  }

  function updateRow(index: number, field: keyof PriceRow, value: string) {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "brand" && value !== "__other__") {
        updated[index].customBrand = "";
      }
      return updated;
    });
  }

  function addRow() {
    if (rows.length < 10) {
      setRows((prev) => [...prev, emptyRow()]);
    }
  }

  function removeRow(index: number) {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((_, i) => i !== index));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const priceData = rows
      .filter((r) => {
        const brand = r.brand === "__other__" ? r.customBrand : r.brand;
        return brand.trim() && r.price;
      })
      .map((r) => ({
        brand: r.brand === "__other__" ? r.customBrand.trim() : r.brand,
        price: parseFloat(r.price),
      }));

    if (priceData.length === 0) {
      setError("Please add at least one beer with a price.");
      setSubmitting(false);
      return;
    }

    const payload: Record<string, unknown> = {
      prices: priceData,
      website,
    };

    if (selectedPub) {
      payload.pubId = selectedPub.id;
    } else if (isNewPub) {
      if (!newPubName.trim() || !newPubAddress.trim() || !newPubPostcode.trim()) {
        setError("New pub requires name, address, and postcode.");
        setSubmitting(false);
        return;
      }
      payload.newPub = {
        name: newPubName.trim(),
        address: newPubAddress.trim(),
        postcode: newPubPostcode.trim(),
        borough: newPubBorough.trim() || undefined,
        neighbourhood: newPubNeighbourhood.trim() || undefined,
      };
    } else {
      setError("Please select a pub or add a new one.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/submit-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    }

    setSubmitting(false);
  }

  function resetForm() {
    clearPub();
    setRows([emptyRow()]);
    setSuccess(false);
    setError("");
  }

  return (
    <CeefaxLayout pageNumber="P.600">
      <h1 className="text-ceefax-yellow mb-3" style={{ fontSize: "2em" }}>
        ░░ SUBMIT PRICES ░░
      </h1>

      <p className="text-ceefax-white mb-4">
        In a pub? Submit the pint prices you can see and help keep London&apos;s
        beer data up to date.
      </p>

      {success ? (
        <div className="py-8">
          <p
            className="text-ceefax-green text-2xl mb-2"
            style={{ fontSize: "1.5em" }}
          >
            ✓ SUBMISSION RECEIVED
          </p>
          <p className="text-ceefax-white">
            Thanks! We&apos;ll review your prices and update the database.
          </p>
          <button onClick={resetForm} className={`${BTN} mt-4`}>
            SUBMIT MORE PRICES
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
          {/* Honeypot */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {/* ─── PUB SELECTION ─── */}
          <div>
            <label className={LABEL}>PUB *</label>

            {selectedPub ? (
              <div className="flex items-center gap-2 bg-black border-2 border-ceefax-green px-2 py-1">
                <span className="text-ceefax-green font-teletext flex-1">
                  {selectedPub.name}
                  {selectedPub.borough && (
                    <span className="text-ceefax-cyan ml-2 text-sm">
                      ({selectedPub.borough})
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={clearPub}
                  className="text-ceefax-red font-bold font-teletext hover:text-ceefax-yellow"
                >
                  X
                </button>
              </div>
            ) : isNewPub ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-black border-2 border-ceefax-yellow px-2 py-1">
                  <span className="text-ceefax-yellow font-teletext flex-1">
                    NEW PUB
                  </span>
                  <button
                    type="button"
                    onClick={clearPub}
                    className="text-ceefax-red font-bold font-teletext hover:text-ceefax-yellow"
                  >
                    X
                  </button>
                </div>

                <div>
                  <label className={LABEL}>PUB NAME *</label>
                  <input
                    type="text"
                    value={newPubName}
                    onChange={(e) => setNewPubName(e.target.value)}
                    placeholder="e.g. The Red Lion"
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={LABEL}>ADDRESS *</label>
                  <input
                    type="text"
                    value={newPubAddress}
                    onChange={(e) => setNewPubAddress(e.target.value)}
                    placeholder="e.g. 1 High Street, London"
                    className={INPUT}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={LABEL}>POSTCODE *</label>
                    <input
                      type="text"
                      value={newPubPostcode}
                      onChange={(e) => setNewPubPostcode(e.target.value)}
                      placeholder="e.g. SW6 1AA"
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>BOROUGH</label>
                    <input
                      type="text"
                      value={newPubBorough}
                      onChange={(e) => setNewPubBorough(e.target.value)}
                      placeholder="e.g. H&F"
                      className={INPUT}
                    />
                  </div>
                </div>
                <div>
                  <label className={LABEL}>NEIGHBOURHOOD</label>
                  <input
                    type="text"
                    value={newPubNeighbourhood}
                    onChange={(e) => setNewPubNeighbourhood(e.target.value)}
                    placeholder="e.g. Fulham"
                    className={INPUT}
                  />
                </div>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <input
                  type="text"
                  value={pubQuery}
                  onChange={(e) => {
                    setPubQuery(e.target.value);
                    searchPubs(e.target.value);
                  }}
                  onFocus={() => {
                    if (pubResults.length > 0 || pubQuery.length >= 2) {
                      setShowDropdown(true);
                    }
                  }}
                  placeholder="Search for your pub..."
                  className={INPUT}
                />
                {searching && (
                  <span className="absolute right-2 top-1.5 text-ceefax-cyan text-sm animate-pulse">
                    ░░░
                  </span>
                )}

                {showDropdown && (
                  <div className="absolute z-50 w-full bg-black border-2 border-ceefax-cyan mt-0 max-h-60 overflow-y-auto">
                    {pubResults.map((pub) => (
                      <button
                        key={pub.id}
                        type="button"
                        onClick={() => selectPub(pub)}
                        className="w-full text-left px-2 py-1 font-teletext text-ceefax-green hover:bg-ceefax-cyan hover:text-black border-b border-ceefax-blue/30"
                      >
                        {pub.name}
                        {pub.borough && (
                          <span className="text-ceefax-magenta ml-2 text-sm">
                            {pub.borough}
                          </span>
                        )}
                        {pub.postcode && (
                          <span className="text-ceefax-cyan ml-1 text-sm">
                            {pub.postcode}
                          </span>
                        )}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={selectNewPub}
                      className="w-full text-left px-2 py-1 font-teletext text-ceefax-yellow hover:bg-ceefax-yellow hover:text-black font-bold"
                    >
                      + OTHER — ADD NEW PUB
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── BEER PRICES ─── */}
          <div>
            <label className={LABEL}>BEER PRICES *</label>

            <div className="space-y-2">
              {rows.map((row, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    {i === 0 && (
                      <span className="text-ceefax-magenta text-xs block mb-0.5">
                        BEER
                      </span>
                    )}
                    <select
                      value={row.brand}
                      onChange={(e) => updateRow(i, "brand", e.target.value)}
                      className={SELECT}
                    >
                      <option value="">-- Select beer --</option>
                      {brands.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                      <option value="__other__">Other...</option>
                    </select>
                    {row.brand === "__other__" && (
                      <input
                        type="text"
                        value={row.customBrand}
                        onChange={(e) =>
                          updateRow(i, "customBrand", e.target.value)
                        }
                        placeholder="Beer name"
                        className={`${INPUT} mt-1`}
                      />
                    )}
                  </div>

                  <div className="w-24">
                    {i === 0 && (
                      <span className="text-ceefax-magenta text-xs block mb-0.5">
                        PRICE
                      </span>
                    )}
                    <div className="relative">
                      <span className="absolute left-2 top-1 text-ceefax-green font-teletext">
                        £
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="20"
                        value={row.price}
                        onChange={(e) => updateRow(i, "price", e.target.value)}
                        placeholder="5.50"
                        className={`${INPUT} pl-6`}
                      />
                    </div>
                  </div>

                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="text-ceefax-red font-bold font-teletext px-2 py-1 hover:text-ceefax-yellow mb-0.5"
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
            </div>

            {rows.length < 10 && (
              <button
                type="button"
                onClick={addRow}
                className="mt-2 text-ceefax-yellow font-teletext font-bold text-sm hover:text-ceefax-cyan"
              >
                + ADD ANOTHER BEER
              </button>
            )}
          </div>

          {/* ─── ERROR + SUBMIT ─── */}
          {error && <p className="text-ceefax-red font-bold">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className={`${BTN} text-lg px-6 py-1.5 disabled:opacity-50`}
          >
            {submitting ? "SUBMITTING..." : "SUBMIT PRICES"}
          </button>
        </form>
      )}

      <p className="text-ceefax-magenta mt-6">
        A Teletext service from PINT MARKETS LTD
      </p>
    </CeefaxLayout>
  );
}

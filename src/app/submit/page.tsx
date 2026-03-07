"use client";

import CeefaxLayout from "@/components/CeefaxLayout";
import { useState } from "react";

const INPUT =
  "w-full bg-black border-2 border-ceefax-cyan text-ceefax-green px-2 py-1 font-teletext placeholder:text-ceefax-green/40 focus:outline-none focus:border-ceefax-yellow";
const LABEL = "text-ceefax-cyan text-sm block mb-1";

export default function SubmitPage() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [borough, setBorough] = useState("");
  const [neighbourhood, setNeighbourhood] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          postcode,
          borough,
          neighbourhood,
          lat,
          lng,
          notes,
          website, // honeypot
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }

      // Clear form and show success
      setName("");
      setAddress("");
      setPostcode("");
      setBorough("");
      setNeighbourhood("");
      setLat("");
      setLng("");
      setNotes("");
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    }

    setSubmitting(false);
  }

  return (
    <CeefaxLayout pageNumber="P.600">
      <h1 className="text-ceefax-yellow mb-3" style={{ fontSize: "2em" }}>
        ░░ SUBMIT A PUB ░░
      </h1>

      <p className="text-ceefax-white mb-4">
        Know a pub with great (or terrible) pint prices? Submit it here and
        we&apos;ll add it to the map.
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
            Thanks! We&apos;ll review this pub and add it if everything looks
            correct.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-4 bg-ceefax-yellow text-black px-4 py-1 font-bold font-teletext hover:bg-ceefax-cyan transition-none"
          >
            SUBMIT ANOTHER
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-xl space-y-3">
          {/* Honeypot — hidden from real users */}
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

          <div>
            <label className={LABEL}>PUB NAME *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. The Red Lion"
              className={INPUT}
            />
          </div>

          <div>
            <label className={LABEL}>ADDRESS *</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="e.g. 1 High Street, London"
              className={INPUT}
            />
          </div>

          <div>
            <label className={LABEL}>POSTCODE *</label>
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              required
              placeholder="e.g. SE1 7TP"
              className={INPUT + " w-40"}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>BOROUGH</label>
              <input
                type="text"
                value={borough}
                onChange={(e) => setBorough(e.target.value)}
                placeholder="e.g. Southwark"
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>NEIGHBOURHOOD</label>
              <input
                type="text"
                value={neighbourhood}
                onChange={(e) => setNeighbourhood(e.target.value)}
                placeholder="e.g. Bermondsey"
                className={INPUT}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>LATITUDE</label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="e.g. 51.5074"
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>LONGITUDE</label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="e.g. -0.1278"
                className={INPUT}
              />
            </div>
          </div>

          <p className="text-ceefax-yellow text-sm">
            Tip: Right-click a location on Google Maps to copy the coordinates.
          </p>

          <div>
            <label className={LABEL}>OPTIONAL NOTE</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything we should know about this pub?"
              rows={3}
              className={INPUT + " resize-none"}
            />
          </div>

          {error && (
            <p className="text-ceefax-red font-bold">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-ceefax-yellow text-black px-6 py-1.5 text-lg font-bold font-teletext hover:bg-ceefax-cyan transition-none disabled:opacity-50"
          >
            {submitting ? "SUBMITTING..." : "SUBMIT PUB"}
          </button>
        </form>
      )}

      <p className="text-ceefax-magenta mt-6">
        A Teletext service from PINT MARKETS LTD
      </p>
    </CeefaxLayout>
  );
}

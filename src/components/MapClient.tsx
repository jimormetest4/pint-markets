"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

/* ─── types ─── */

interface Marker {
  name: string;
  address: string;
  postcode: string;
  borough: string;
  lat: number;
  lng: number;
  cheapest_brand: string;
  cheapest_type: string;
  cheapest_pence: number;
}

interface BoroughAvg {
  name: string;
  avg_pence: number;
  count: number;
}

interface MapData {
  markers: Marker[];
  thresholds: { cheap: number; mid: number };
  boroughs: BoroughAvg[];
}

/* ─── helpers ─── */

function penceToPounds(p: number) {
  return `£${(p / 100).toFixed(2)}`;
}

function markerColor(price: number, t: { cheap: number; mid: number }) {
  if (t.cheap === 0 && t.mid === 0) return "#00ff00";
  if (price <= t.cheap) return "#00ff00"; // green
  if (price <= t.mid) return "#ffff00"; // yellow
  return "#ff0000"; // red
}

/* ─── fit bounds helper ─── */

function FitBounds({ markers }: { markers: Marker[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    const bounds = markers.map((m) => [m.lat, m.lng] as [number, number]);
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [markers, map]);
  return null;
}

/* ─── component ─── */

export default function MapClient() {
  const [data, setData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBoroughs, setShowBoroughs] = useState(false);

  useEffect(() => {
    fetch("/api/map")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-8 text-ceefax-cyan text-2xl animate-pulse">
        ░░░ LOADING MAP... ░░░
      </div>
    );
  }

  if (!data || data.markers.length === 0) {
    return (
      <div>
        {/* Empty map */}
        <div className="border-2 border-ceefax-cyan" style={{ height: "55vh" }}>
          <MapContainer
            center={[51.505, -0.09]}
            zoom={12}
            style={{ height: "100%", width: "100%", background: "#000" }}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          </MapContainer>
        </div>
        <p className="text-ceefax-yellow mt-2 animate-pulse text-center text-xl">
          NO PUB DATA — markers will appear once prices are submitted
        </p>
      </div>
    );
  }

  const { markers, thresholds, boroughs } = data;

  // Borough avg table sorted by avg price
  const sortedBoroughs = [...boroughs].sort((a, b) => a.avg_pence - b.avg_pence);
  const minBoroughAvg = sortedBoroughs.length > 0 ? sortedBoroughs[0].avg_pence : 0;
  const maxBoroughAvg = sortedBoroughs.length > 0 ? sortedBoroughs[sortedBoroughs.length - 1].avg_pence : 0;

  return (
    <div>
      {/* Toggle */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setShowBoroughs(false)}
          className={`px-3 py-1 text-sm font-bold font-teletext transition-none ${!showBoroughs ? "bg-ceefax-cyan text-black" : "bg-black text-ceefax-cyan border border-ceefax-cyan"}`}
        >
          PUB MARKERS
        </button>
        <button
          onClick={() => setShowBoroughs(true)}
          className={`px-3 py-1 text-sm font-bold font-teletext transition-none ${showBoroughs ? "bg-ceefax-yellow text-black" : "bg-black text-ceefax-yellow border border-ceefax-yellow"}`}
        >
          BOROUGH VIEW
        </button>
      </div>

      {/* Map */}
      <div className="border-2 border-ceefax-cyan" style={{ height: "55vh" }}>
        <MapContainer
          center={[51.505, -0.09]}
          zoom={12}
          style={{ height: "100%", width: "100%", background: "#000" }}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <FitBounds markers={markers} />

          {markers.map((m, i) => (
            <CircleMarker
              key={i}
              center={[m.lat, m.lng]}
              radius={7}
              pathOptions={{
                color: markerColor(m.cheapest_pence, thresholds),
                fillColor: markerColor(m.cheapest_pence, thresholds),
                fillOpacity: 0.85,
                weight: 1,
              }}
            >
              <Popup>
                <div
                  className="font-teletext"
                  style={{
                    background: "#000",
                    color: "#fff",
                    padding: "8px",
                    minWidth: "180px",
                    border: "2px solid #00ffff",
                  }}
                >
                  <p style={{ color: "#ffff00", fontSize: "16px", fontWeight: "bold", margin: "0 0 4px" }}>
                    {m.name}
                  </p>
                  <p style={{ color: "#ffffff", fontSize: "13px", margin: "0 0 2px" }}>
                    {m.address}
                  </p>
                  <p style={{ color: "#00ffff", fontSize: "13px", margin: "0 0 2px" }}>
                    {m.postcode}
                  </p>
                  <div style={{ borderTop: "1px solid #00ffff", margin: "4px 0", paddingTop: "4px" }}>
                    <p style={{ color: "#00ff00", fontSize: "18px", fontWeight: "bold", margin: "0" }}>
                      {penceToPounds(m.cheapest_pence)}
                    </p>
                    <p style={{ color: "#ff00ff", fontSize: "13px", margin: "0" }}>
                      {m.cheapest_brand} — {m.cheapest_type}
                    </p>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-ceefax-green" /> CHEAP
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-ceefax-yellow" /> MID
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-ceefax-red" /> EXPENSIVE
        </span>
        {thresholds.cheap > 0 && (
          <span className="text-ceefax-white">
            (&lt;{penceToPounds(thresholds.cheap)} / &lt;{penceToPounds(thresholds.mid)} / {penceToPounds(thresholds.mid)}+)
          </span>
        )}
      </div>

      {/* Borough overlay table */}
      {showBoroughs && sortedBoroughs.length > 0 && (
        <div className="mt-3">
          <h2 className="text-ceefax-yellow mb-1 text-lg sm:text-xl md:text-2xl">
            BOROUGH AVERAGES
          </h2>
          <div className="overflow-x-auto">
            <div className="min-w-[420px]">
              <div className="bg-ceefax-cyan text-black font-bold flex text-xs md:text-lg px-1">
                <span className="w-7 shrink-0">#</span>
                <span className="flex-1 min-w-0">BOROUGH</span>
                <span className="w-14 text-right shrink-0">AVG</span>
                <span className="w-10 text-right shrink-0">PUBS</span>
                <span className="w-20 md:w-40 text-right shrink-0">BAR</span>
              </div>
              <div className="h-px bg-ceefax-cyan" />

              {sortedBoroughs.map((b, i) => {
                const range = maxBoroughAvg - minBoroughAvg || 1;
                const frac = (b.avg_pence - minBoroughAvg) / range;
                const barLen = Math.max(1, Math.round(frac * 10));
                const barMax = 10;
                const barColor =
                  i === 0
                    ? "text-ceefax-green"
                    : i === sortedBoroughs.length - 1
                      ? "text-ceefax-red"
                      : "text-ceefax-yellow";

                return (
                  <div key={b.name}>
                    <div className="flex text-xs md:text-lg px-1 py-px">
                      <span className="w-7 shrink-0 text-ceefax-yellow">{i + 1}</span>
                      <span className="flex-1 min-w-0 text-ceefax-white truncate">{b.name}</span>
                      <span className={`w-14 text-right shrink-0 font-bold ${barColor}`}>
                        {penceToPounds(b.avg_pence)}
                      </span>
                      <span className="w-10 text-right shrink-0 text-ceefax-magenta">{b.count}</span>
                      <span className={`w-20 md:w-40 text-right shrink-0 ${barColor}`}>
                        {"█".repeat(barLen)}{"░".repeat(Math.max(0, barMax - barLen))}
                      </span>
                    </div>
                    {i < sortedBoroughs.length - 1 && <div className="h-px bg-ceefax-blue" />}
                  </div>
                );
              })}
              <div className="h-px bg-ceefax-cyan mt-px" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

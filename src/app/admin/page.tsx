"use client";

import CeefaxLayout from "@/components/CeefaxLayout";
import { useCallback, useEffect, useState } from "react";

/* ─── types ─── */

interface Pub {
  id: string;
  name: string;
}

interface Price {
  id: string;
  brand: string;
  type: string;
  price_pence: number;
  date_recorded: string;
}

interface Submission {
  id: string;
  pub_name?: string;
  name?: string;
  address?: string;
  borough?: string;
  created_at: string;
}

interface PriceSubmission {
  id: string;
  pub_id: string | null;
  pub_name: string;
  brand: string;
  type: string;
  price_pence: number;
  is_correction: boolean;
  existing_price_pence: number | null;
  submitted_at: string;
}

/* ─── helpers ─── */

function penceToPounds(p: number) {
  return `£${(p / 100).toFixed(2)}`;
}

const INPUT =
  "w-full bg-black border-2 border-ceefax-cyan text-ceefax-green px-2 py-1 text-lg font-teletext placeholder:text-ceefax-green/40 focus:outline-none focus:border-ceefax-yellow";
const SELECT =
  "w-full bg-black border-2 border-ceefax-cyan text-ceefax-green px-2 py-1 text-lg font-teletext focus:outline-none focus:border-ceefax-yellow";
const BTN =
  "bg-ceefax-yellow text-black px-4 py-1 text-lg font-teletext font-bold hover:bg-ceefax-cyan transition-none";
const LABEL = "text-ceefax-cyan text-sm block mb-1";

/* ─── tabs ─── */

const TABS = [
  { id: "add_pub", label: "ADD PUB", color: "bg-ceefax-red", text: "text-ceefax-white" },
  { id: "prices", label: "PRICES", color: "bg-ceefax-green", text: "text-black" },
  { id: "snapshot", label: "SNAPSHOT", color: "bg-ceefax-yellow", text: "text-black" },
  { id: "csv", label: "CSV", color: "bg-ceefax-cyan", text: "text-black" },
  { id: "submissions", label: "REVIEWS", color: "bg-ceefax-magenta", text: "text-ceefax-white" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("admin_authed") === "true") {
        setAuthed(true);
      }
      setChecked(true);
    }
  }, []);

  if (!checked) return null;

  return (
    <CeefaxLayout pageNumber="P.900">
      <h1 className="text-ceefax-yellow mb-2" style={{ fontSize: "2em" }}>
        ░░ ADMIN ░░
      </h1>

      {!authed ? (
        <LoginForm onSuccess={() => setAuthed(true)} />
      ) : (
        <AdminDashboard />
      )}

      <p className="text-ceefax-magenta mt-4">
        A Teletext service from PINT MARKETS LTD
      </p>
    </CeefaxLayout>
  );
}

/* ═══════════════════════════════════════════
   LOGIN FORM
   ═══════════════════════════════════════════ */

interface LoginFormProps {
  onSuccess: () => void;
}

function LoginForm({ onSuccess }: LoginFormProps) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_authed", "true");
      onSuccess();
    } else {
      setErr("ACCESS DENIED — INCORRECT PASSWORD");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm">
      <label className={LABEL}>ENTER ADMIN PASSWORD:</label>
      <input
        type="password"
        value={pw}
        onChange={(e) => { setPw(e.target.value); setErr(""); }}
        className={INPUT}
        autoFocus
      />
      <button type="submit" className={`${BTN} mt-2`}>
        LOGIN
      </button>
      {err && (
        <p className="text-ceefax-red mt-2 animate-pulse">{err}</p>
      )}
    </form>
  );
}

/* ═══════════════════════════════════════════
   ADMIN DASHBOARD (tabbed)
   ═══════════════════════════════════════════ */

function AdminDashboard() {
  const [tab, setTab] = useState<TabId>("add_pub");

  return (
    <div>
      {/* Tab nav */}
      <div className="grid grid-cols-5 mb-3">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`${t.color} ${t.text} py-1 text-xs md:text-lg font-bold tracking-wide transition-none ${active ? "brightness-125 underline underline-offset-4" : "brightness-75"}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="h-px bg-ceefax-yellow mb-3" />

      {tab === "add_pub" && <AddPubSection />}
      {tab === "prices" && <PricesSection />}
      {tab === "snapshot" && <SnapshotSection />}
      {tab === "csv" && <CsvSection />}
      {tab === "submissions" && <SubmissionsSection />}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 1 — ADD A PUB
   ═══════════════════════════════════════════ */

function AddPubSection() {
  const [form, setForm] = useState({
    name: "", address: "", postcode: "", borough: "",
    neighbourhood: "", latitude: "", longitude: "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setErr("");

    const res = await fetch("/api/admin/pubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (data.success) {
      setMsg(`PUB ADDED: ${form.name}`);
      setForm({ name: "", address: "", postcode: "", borough: "", neighbourhood: "", latitude: "", longitude: "" });
    } else {
      setErr(data.error || "Failed to add pub");
    }
    setSaving(false);
  }

  const fields = [
    { key: "name", label: "PUB NAME *", placeholder: "e.g. The Red Lion" },
    { key: "address", label: "ADDRESS", placeholder: "e.g. 123 High Street" },
    { key: "postcode", label: "POSTCODE", placeholder: "e.g. SE1 7TP" },
    { key: "borough", label: "BOROUGH", placeholder: "e.g. Southwark" },
    { key: "neighbourhood", label: "NEIGHBOURHOOD", placeholder: "e.g. Bermondsey" },
    { key: "latitude", label: "LATITUDE", placeholder: "e.g. 51.5074" },
    { key: "longitude", label: "LONGITUDE", placeholder: "e.g. -0.1278" },
  ];

  return (
    <div>
      <h2 className="text-ceefax-cyan mb-2" style={{ fontSize: "1.5em" }}>
        ADD A PUB
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
        {fields.map((f) => (
          <div key={f.key}>
            <label className={LABEL}>{f.label}</label>
            <input
              type="text"
              value={form[f.key as keyof typeof form]}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              className={INPUT}
            />
          </div>
        ))}
        <div className="md:col-span-2">
          <p className="text-ceefax-white text-xs mb-2">
            Tip: Right-click a location on Google Maps to copy the coordinates.
          </p>
          <button type="submit" disabled={saving || !form.name} className={`${BTN} disabled:opacity-50`}>
            {saving ? "SAVING..." : "ADD PUB"}
          </button>
        </div>
      </form>
      {msg && <p className="text-ceefax-green mt-2">{msg}</p>}
      {err && <p className="text-ceefax-red mt-2">{err}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 2 — ADD / UPDATE PRICES
   ═══════════════════════════════════════════ */

function PricesSection() {
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [selectedPub, setSelectedPub] = useState("");
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // New price form
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("pint");
  const [pricePounds, setPricePounds] = useState("");

  // Editing state
  const [editId, setEditId] = useState<string | null>(null);
  const [editPence, setEditPence] = useState("");

  // Fetch pubs list
  useEffect(() => {
    fetch("/api/admin/pubs")
      .then((r) => r.json())
      .then((d) => setPubs(d.pubs ?? []))
      .catch(() => {});
  }, []);

  // Fetch prices when pub changes
  const fetchPrices = useCallback((pubId: string) => {
    if (!pubId) { setPrices([]); return; }
    setLoading(true);
    fetch(`/api/admin/prices?pub_id=${pubId}`)
      .then((r) => r.json())
      .then((d) => { setPrices(d.prices ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPrices(selectedPub);
  }, [selectedPub, fetchPrices]);

  async function addPrice(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");
    const pence = Math.round(parseFloat(pricePounds) * 100);
    if (!brand || !pricePounds || isNaN(pence)) { setErr("Fill all fields"); return; }

    const res = await fetch("/api/admin/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pub_id: selectedPub, brand, type, price_pence: pence }),
    });
    const data = await res.json();
    if (data.success) {
      setMsg("PRICE ADDED");
      setBrand("");
      setPricePounds("");
      fetchPrices(selectedPub);
    } else {
      setErr(data.error || "Failed");
    }
  }

  async function updatePrice(id: string) {
    const pence = Math.round(parseFloat(editPence) * 100);
    if (isNaN(pence)) return;
    await fetch("/api/admin/prices", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, price_pence: pence }),
    });
    setEditId(null);
    fetchPrices(selectedPub);
  }

  async function deletePrice(id: string) {
    await fetch("/api/admin/prices", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchPrices(selectedPub);
  }

  return (
    <div>
      <h2 className="text-ceefax-cyan mb-2" style={{ fontSize: "1.5em" }}>
        MANAGE PRICES
      </h2>

      {/* Pub selector */}
      <div className="mb-3 max-w-md">
        <label className={LABEL}>SELECT PUB:</label>
        <select value={selectedPub} onChange={(e) => setSelectedPub(e.target.value)} className={SELECT}>
          <option value="">-- Choose a pub --</option>
          {pubs.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {selectedPub && (
        <>
          {/* Existing prices table */}
          {loading ? (
            <p className="text-ceefax-cyan animate-pulse">░░░ LOADING... ░░░</p>
          ) : prices.length === 0 ? (
            <p className="text-ceefax-yellow mb-3">No prices recorded for this pub yet.</p>
          ) : (
            <div className="mb-3">
              <div className="bg-ceefax-cyan text-black font-bold flex text-xs md:text-lg px-1">
                <span className="flex-1">BRAND</span>
                <span className="w-16 text-right">TYPE</span>
                <span className="w-16 text-right">PRICE</span>
                <span className="w-28 text-right">ACTIONS</span>
              </div>
              <div className="h-px bg-ceefax-cyan" />
              {prices.map((p) => (
                <div key={p.id}>
                  <div className="flex text-xs md:text-lg px-1 py-px items-center">
                    <span className="flex-1 text-ceefax-white">{p.brand}</span>
                    <span className="w-16 text-right text-ceefax-magenta">{p.type}</span>
                    <span className="w-16 text-right text-ceefax-green font-bold">
                      {editId === p.id ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editPence}
                          onChange={(e) => setEditPence(e.target.value)}
                          className="w-14 bg-black border border-ceefax-yellow text-ceefax-green text-right px-1"
                        />
                      ) : (
                        penceToPounds(p.price_pence)
                      )}
                    </span>
                    <span className="w-28 text-right flex justify-end gap-1">
                      {editId === p.id ? (
                        <>
                          <button onClick={() => updatePrice(p.id)} className="bg-ceefax-green text-black px-2 text-xs font-bold">SAVE</button>
                          <button onClick={() => setEditId(null)} className="bg-ceefax-white text-black px-2 text-xs font-bold">X</button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditId(p.id); setEditPence((p.price_pence / 100).toFixed(2)); }}
                            className="bg-ceefax-cyan text-black px-2 text-xs font-bold"
                          >
                            EDIT
                          </button>
                          <button onClick={() => deletePrice(p.id)} className="bg-ceefax-red text-black px-2 text-xs font-bold">DEL</button>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="h-px bg-ceefax-blue" />
                </div>
              ))}
              <div className="h-px bg-ceefax-cyan" />
            </div>
          )}

          {/* Add price form */}
          <form onSubmit={addPrice} className="flex flex-wrap gap-2 items-end max-w-2xl">
            <div>
              <label className={LABEL}>BRAND</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Guinness" className={`${INPUT} w-40`} />
            </div>
            <div>
              <label className={LABEL}>TYPE</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={`${SELECT} w-28`}>
                <option value="pint">pint</option>
                <option value="half">half</option>
                <option value="bottle">bottle</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>PRICE (£)</label>
              <input type="number" step="0.01" value={pricePounds} onChange={(e) => setPricePounds(e.target.value)} placeholder="5.50" className={`${INPUT} w-24`} />
            </div>
            <button type="submit" className={BTN}>ADD</button>
          </form>
          {msg && <p className="text-ceefax-green mt-2">{msg}</p>}
          {err && <p className="text-ceefax-red mt-2">{err}</p>}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 3 — TRIGGER WEEKLY SNAPSHOT
   ═══════════════════════════════════════════ */

function SnapshotSection() {
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [running, setRunning] = useState(false);

  async function triggerSnapshot() {
    setRunning(true);
    setMsg("");
    setErr("");

    const res = await fetch("/api/admin/snapshot", { method: "POST" });
    const data = await res.json();

    if (data.success) {
      setMsg(`SNAPSHOT COMPLETE — ${data.count} prices recorded for ${data.date}`);
    } else {
      setErr(data.error || "Snapshot failed");
    }
    setRunning(false);
    setConfirm(false);
  }

  return (
    <div>
      <h2 className="text-ceefax-cyan mb-2" style={{ fontSize: "1.5em" }}>
        WEEKLY SNAPSHOT
      </h2>
      <p className="text-ceefax-white mb-3">
        Copies all current prices into the price_snapshots table for historical tracking.
      </p>

      {!confirm ? (
        <button onClick={() => setConfirm(true)} className={BTN}>
          CREATE WEEKLY SNAPSHOT
        </button>
      ) : (
        <div className="flex gap-2 items-center">
          <span className="text-ceefax-yellow">ARE YOU SURE?</span>
          <button onClick={triggerSnapshot} disabled={running} className="bg-ceefax-green text-black px-4 py-1 font-bold font-teletext">
            {running ? "RUNNING..." : "YES"}
          </button>
          <button onClick={() => setConfirm(false)} className="bg-ceefax-red text-black px-4 py-1 font-bold font-teletext">
            NO
          </button>
        </div>
      )}

      <p className="text-ceefax-yellow text-xs mt-3">
        Run this weekly before updating prices so historical data is preserved.
      </p>
      {msg && <p className="text-ceefax-green mt-2">{msg}</p>}
      {err && <p className="text-ceefax-red mt-2">{err}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 4 — BULK CSV UPLOAD
   ═══════════════════════════════════════════ */

interface CsvRow {
  pub_name: string;
  brand: string;
  type: string;
  price: string;
}

interface CsvResult {
  pubs_created: number;
  prices_added: number;
  rows_skipped: number;
  errors: string[];
}

function CsvSection() {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseErr, setParseErr] = useState("");
  const [result, setResult] = useState<CsvResult | null>(null);
  const [uploading, setUploading] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseErr("");
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

      if (lines.length < 2) {
        setParseErr("CSV must have a header row and at least one data row");
        return;
      }

      // Validate header
      const header = lines[0].toLowerCase().replace(/\s/g, "");
      if (!header.includes("pub_name") || !header.includes("brand")) {
        setParseErr("Expected CSV header: pub_name,brand,type,price");
        return;
      }

      const parsed: CsvRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",").map((s) => s.trim());
        if (parts.length >= 4) {
          parsed.push({
            pub_name: parts[0],
            brand: parts[1],
            type: parts[2],
            price: parts[3],
          });
        }
      }
      setRows(parsed);
    };
    reader.readAsText(file);
  }

  async function upload() {
    setUploading(true);
    setResult(null);

    const res = await fetch("/api/admin/csv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    const data = await res.json();
    setResult(data);
    setUploading(false);
  }

  return (
    <div>
      <h2 className="text-ceefax-cyan mb-2" style={{ fontSize: "1.5em" }}>
        BULK CSV UPLOAD
      </h2>
      <p className="text-ceefax-white text-sm mb-2">
        Expected format: <span className="text-ceefax-yellow">pub_name,brand,type,price</span>
      </p>

      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
        className="block mb-2 text-ceefax-green font-teletext file:bg-ceefax-cyan file:text-black file:border-0 file:px-3 file:py-1 file:font-bold file:font-teletext file:mr-2"
      />

      {parseErr && <p className="text-ceefax-red mb-2">{parseErr}</p>}

      {rows.length > 0 && (
        <div className="mb-3">
          <p className="text-ceefax-yellow mb-1">
            {fileName}: {rows.length} rows parsed
          </p>
          {/* Preview first 5 rows */}
          <div className="bg-ceefax-cyan text-black font-bold flex text-xs px-1">
            <span className="flex-1">PUB</span>
            <span className="w-24 text-right">BRAND</span>
            <span className="w-16 text-right">TYPE</span>
            <span className="w-14 text-right">PRICE</span>
          </div>
          <div className="h-px bg-ceefax-cyan" />
          {rows.slice(0, 5).map((r, i) => (
            <div key={i}>
              <div className="flex text-xs px-1 py-px">
                <span className="flex-1 text-ceefax-white">{r.pub_name}</span>
                <span className="w-24 text-right text-ceefax-magenta">{r.brand}</span>
                <span className="w-16 text-right text-ceefax-cyan">{r.type}</span>
                <span className="w-14 text-right text-ceefax-green">£{r.price}</span>
              </div>
              <div className="h-px bg-ceefax-blue" />
            </div>
          ))}
          {rows.length > 5 && (
            <p className="text-ceefax-white text-xs px-1">...and {rows.length - 5} more rows</p>
          )}
          <div className="h-px bg-ceefax-cyan" />

          <button onClick={upload} disabled={uploading} className={`${BTN} mt-2 disabled:opacity-50`}>
            {uploading ? "UPLOADING..." : "UPLOAD CSV"}
          </button>
        </div>
      )}

      {result && (
        <div className="border-2 border-ceefax-yellow p-3 mt-2">
          <h3 className="text-ceefax-yellow mb-1" style={{ fontSize: "1.2em" }}>UPLOAD COMPLETE</h3>
          <p className="text-ceefax-green">Pubs created: {result.pubs_created}</p>
          <p className="text-ceefax-cyan">Prices added: {result.prices_added}</p>
          <p className="text-ceefax-red">Rows skipped: {result.rows_skipped}</p>
          {result.errors.length > 0 && (
            <div className="mt-1">
              <p className="text-ceefax-red text-xs">Errors:</p>
              {result.errors.map((e, i) => (
                <p key={i} className="text-ceefax-red text-xs">{e}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 5 — REVIEW PUB SUBMISSIONS
   ═══════════════════════════════════════════ */

function SubmissionsSection() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchSubs = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/submissions")
      .then((r) => r.json())
      .then((d) => {
        setSubs(d.submissions ?? []);
        setTableMissing(d.tableMissing ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  async function handleAction(id: string, action: "approve" | "reject") {
    const res = await fetch("/api/admin/submissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const data = await res.json();
    if (data.success) {
      setMsg(`Submission ${action === "approve" ? "APPROVED" : "REJECTED"}`);
      setSubs((prev) => prev.filter((s) => s.id !== id));
    }
  }

  return (
    <div>
      <h2 className="text-ceefax-cyan mb-2" style={{ fontSize: "1.5em" }}>
        REVIEW SUBMISSIONS
      </h2>

      {loading ? (
        <p className="text-ceefax-cyan animate-pulse">░░░ LOADING... ░░░</p>
      ) : tableMissing ? (
        <p className="text-ceefax-yellow">
          pub_submissions table not found. Create it in Supabase to enable this feature.
        </p>
      ) : subs.length === 0 ? (
        <p className="text-ceefax-yellow">No pending submissions.</p>
      ) : (
        <div>
          <div className="bg-ceefax-cyan text-black font-bold flex text-xs md:text-lg px-1">
            <span className="flex-1">PUB NAME</span>
            <span className="w-32 hidden md:block">ADDRESS</span>
            <span className="w-24 text-right">BOROUGH</span>
            <span className="w-24 text-right">DATE</span>
            <span className="w-28 text-right">ACTIONS</span>
          </div>
          <div className="h-px bg-ceefax-cyan" />
          {subs.map((s) => (
            <div key={s.id}>
              <div className="flex text-xs md:text-lg px-1 py-px items-center">
                <span className="flex-1 text-ceefax-white">{s.pub_name || s.name}</span>
                <span className="w-32 hidden md:block text-ceefax-white truncate">{s.address || "—"}</span>
                <span className="w-24 text-right text-ceefax-cyan">{s.borough || "—"}</span>
                <span className="w-24 text-right text-ceefax-magenta">
                  {s.created_at ? new Date(s.created_at).toLocaleDateString("en-GB") : "—"}
                </span>
                <span className="w-28 text-right flex justify-end gap-1">
                  <button
                    onClick={() => handleAction(s.id, "approve")}
                    className="bg-ceefax-green text-black px-2 text-xs font-bold"
                  >
                    APPROVE
                  </button>
                  <button
                    onClick={() => handleAction(s.id, "reject")}
                    className="bg-ceefax-red text-black px-2 text-xs font-bold"
                  >
                    REJECT
                  </button>
                </span>
              </div>
              <div className="h-px bg-ceefax-blue" />
            </div>
          ))}
          <div className="h-px bg-ceefax-cyan" />
        </div>
      )}
      {msg && <p className="text-ceefax-green mt-2">{msg}</p>}

      {/* Price Submissions */}
      <div className="h-px bg-ceefax-yellow my-4" />
      <PriceSubmissionsSection />
    </div>
  );
}

/* ─── PRICE SUBMISSIONS SUB-SECTION ─── */

function PriceSubmissionsSection() {
  const [subs, setSubs] = useState<PriceSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const fetchSubs = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/price-submissions")
      .then((r) => r.json())
      .then((d) => {
        setSubs(d.submissions ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  async function handleAction(id: string, action: "approve" | "reject") {
    const res = await fetch("/api/admin/price-submissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const data = await res.json();
    if (data.success) {
      setMsg(`Price ${action === "approve" ? "APPROVED" : "REJECTED"}`);
      setSubs((prev) => prev.filter((s) => s.id !== id));
      setTimeout(() => setMsg(""), 3000);
    }
  }

  return (
    <div>
      <h2 className="text-ceefax-cyan mb-2" style={{ fontSize: "1.5em" }}>
        PRICE SUBMISSIONS
      </h2>

      {loading ? (
        <p className="text-ceefax-cyan animate-pulse">░░░ LOADING... ░░░</p>
      ) : subs.length === 0 ? (
        <p className="text-ceefax-yellow">No pending price submissions.</p>
      ) : (
        <div>
          <div className="bg-ceefax-cyan text-black font-bold flex text-xs md:text-lg px-1">
            <span className="flex-1">PUB</span>
            <span className="w-28">BRAND</span>
            <span className="w-16 text-right">PRICE</span>
            <span className="w-16 text-right hidden md:block">TYPE</span>
            <span className="w-28 text-right">ACTIONS</span>
          </div>
          <div className="h-px bg-ceefax-cyan" />
          {subs.map((s) => (
            <div key={s.id}>
              <div className="flex text-xs md:text-lg px-1 py-px items-center">
                <span className="flex-1 text-ceefax-white truncate">{s.pub_name}</span>
                <span className="w-28 text-ceefax-magenta">{s.brand}</span>
                <span className="w-16 text-right text-ceefax-green font-bold">
                  {s.is_correction ? (
                    <span>
                      <span className="text-ceefax-red line-through">
                        {penceToPounds(s.existing_price_pence ?? 0)}
                      </span>
                      {" "}
                      {penceToPounds(s.price_pence)}
                    </span>
                  ) : (
                    penceToPounds(s.price_pence)
                  )}
                </span>
                <span className="w-16 text-right text-ceefax-cyan hidden md:block">{s.type}</span>
                <span className="w-28 text-right flex justify-end gap-1 items-center">
                  {s.is_correction && (
                    <span className="bg-ceefax-yellow text-black px-1 text-xs font-bold mr-1">
                      FIX
                    </span>
                  )}
                  <button
                    onClick={() => handleAction(s.id, "approve")}
                    className="bg-ceefax-green text-black px-2 text-xs font-bold"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => handleAction(s.id, "reject")}
                    className="bg-ceefax-red text-black px-2 text-xs font-bold"
                  >
                    NO
                  </button>
                </span>
              </div>
              <div className="h-px bg-ceefax-blue" />
            </div>
          ))}
          <div className="h-px bg-ceefax-cyan" />
        </div>
      )}
      {msg && <p className="text-ceefax-green mt-2">{msg}</p>}
    </div>
  );
}

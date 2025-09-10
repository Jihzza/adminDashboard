// src/pages/CalendarPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import UsersFilterBar from "../components/UsersFilterBar.jsx";
import { byKey } from "../lib/ventures.js";
import EmptyState from "../components/EmptyState.jsx";

import {
  fetchApptsMonthAll,
  fetchApptsMonthDagalow,
  fetchApptsMonthPerspectiv,
} from "../lib/api.js";

// --- date helpers ---
const pad = (n) => String(n).padStart(2, "0");
const ymdLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Build a 6x7 grid (42 days) starting on SUNDAY
function buildMonthGridSundayStart(year, month1) {
  const first = new Date(year, month1 - 1, 1);
  const weekdaySun0 = first.getDay(); // Sun=0..Sat=6
  const start = new Date(year, month1 - 1, 1 - weekdaySun0);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function addMinutes(date, minutes) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + Number(minutes || 0));
  return d;
}

const fmtMonth = (y, m1) =>
  new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(y, m1 - 1, 1));
const fmtDayHeader = (d) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(d);
const fmtTime = (d) =>
  new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(d);

/**
 * CalendarPage
 */
export default function CalendarPage() {
  const now = new Date();
  const [searchParams] = useSearchParams();

  // UI state
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // 'all'|'perspectiv'|'galow'|'daniel-cluckins'
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1..12
  const [selectedYmd, setSelectedYmd] = useState(null);   // string YYYY-MM-DD | null

  // Data
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [appts, setAppts] = useState([]);

  // Initialize filter from ?source=
  useEffect(() => {
    const src = (searchParams.get("source") || "").toLowerCase();
    if (src === "perspectiv") setFilter("perspectiv");
    if (src === "dagalow") setFilter("daniel-cluckins");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load month data whenever (year, month, filter) changes
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const fn =
          filter === "perspectiv" ? fetchApptsMonthPerspectiv :
            filter === "daniel-cluckins" ? fetchApptsMonthDagalow :
              fetchApptsMonthAll;
        const rows = await fn(year, month);
        if (!live) return;
        setAppts(Array.isArray(rows) ? rows : []);
      } catch (e) {
        setErr(e.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [year, month, filter]);

  // Build grid + grouping
  const grid = useMemo(() => buildMonthGridSundayStart(year, month), [year, month]);
  const fmtMonShort = (d) =>
    new Intl.DateTimeFormat(undefined, { month: "short" }).format(d);
  // Group into local YYYY-MM-DD
  const grouped = useMemo(() => {
    const map = new Map();
    for (const row of appts) {
      const start = new Date(row.appointment_start);
      const key = ymdLocal(start);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    }
    // sort inside each day by start time ascending
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.appointment_start) - new Date(b.appointment_start));
    }
    return map;
  }, [appts]);

  // Filter by search
  const matchesQuery = (row) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return [row.contact_name, row.contact_email, row.contact_phone]
      .filter(Boolean)
      .some(v => String(v).toLowerCase().includes(s));
  };

  // Derive display lists
  const selectedList = useMemo(() => {
    if (!selectedYmd) return [];
    return (grouped.get(selectedYmd) || []).filter(matchesQuery);
  }, [selectedYmd, grouped, q]);

  // If nothing selected: all services across the month, grouped by day, most upcoming day first
  const allDaysSortedAsc = useMemo(() => {
    const keys = Array.from(grouped.keys()).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    return keys.map(k => ({ key: k, items: (grouped.get(k) || []).filter(matchesQuery) }))
      .filter(group => group.items.length > 0);
  }, [grouped, q]);

  // Navigation
  function prevMonth() {
    let y = year, m = month - 1;
    if (m === 0) { m = 12; y -= 1; }
    setYear(y); setMonth(m);
  }
  function nextMonth() {
    let y = year, m = month + 1;
    if (m === 13) { m = 1; y += 1; }
    setYear(y); setMonth(m);
  }

  // Day button classes
  const dayBtn = (d) => {
    const inMonth = d.getMonth() === (month - 1);
    const ymd = ymdLocal(d);
    const isSelected = selectedYmd === ymd;
    const has = grouped.has(ymd);
    return [
      "aspect-square rounded-full grid place-items-center",
      inMonth ? "text-white" : "text-white/30",
      isSelected ? "bg-white/20" : has ? "hover:bg-white/10" : "",
    ].join(" ");
  };

  // toggle select
  function selectDay(d) {
    const k = ymdLocal(d);
    setSelectedYmd((curr) => (curr === k ? null : k));
  }

  // Render one entry
  const Row = ({ r }) => {
    const start = new Date(r.appointment_start);
    const end = addMinutes(start, r.duration_minutes || 0);

    const title = r.contact_name
      ? `Consultation with ${r.contact_name}`
      : "Consultation";

    const ventureKey = r.__source === "Perspectiv" ? "perspectiv" : "daniel-cluckins";

    const venture = byKey[ventureKey];

    // Get the appropriate color for the vertical bar based on venture
    const getBarColor = () => {
      if (r.__source === "Perspectiv") return "#33CCFF";
      if (r.__source === "DAGAlow") return "#eedebe";
      return "#BFA200"; // daniel-cluckins default
    };

    return (
      <li className="relative pl-5 py-3">
        {/* left vertical bar */}
        <span 
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full" 
          style={{ backgroundColor: getBarColor() }}
        />
        <div className="flex items-center gap-4">
          <time className="w-14 shrink-0 text-white/70 text-xs leading-6">{fmtTime(start)}</time>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white">{title}</p>
            <div className="mt-1 flex items-center gap-2 text-sm text-white/70">
              {venture?.banner && (
                <img
                  src={venture.banner}
                  alt={venture.name}
                  className="h-4 w-auto object-contain"  /* small, no border */
                  loading="lazy"
                />
              )}
              <span>{fmtTime(start)} – {fmtTime(end)}</span>
            </div>

          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-gray-100">
      {/* Title */}
      <div className="mx-auto max-w-5xl px-4 pt-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center">Calendar</h1>

        {/* Search */}
        <div className="mt-6 flex justify-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name..."
            className="w-full sm:w-[640px] rounded-xl border border-white/20 bg-white/10
                       placeholder:text-white/50 text-white px-4 py-2 outline-none
                       focus:ring-2 focus:ring-white/30"
          />
        </div>

        {/* Filter rail (same as Users page) */}
        <UsersFilterBar value={filter} onChange={setFilter} />
      </div>

      {/* Calendar grid */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex items-center justify-between max-w-sm mx-auto mb-2">
          <button onClick={prevMonth} className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10">‹</button>
          <h2 className="text-lg font-semibold">{fmtMonth(year, month)}</h2>
          <button onClick={nextMonth} className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10">›</button>
        </div>

        {/* Weekday header (Sun..Sat) */}
        <div className="grid grid-cols-7 text-xs text-white/50 max-w-sm mx-auto mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-1 text-center">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-y-1 max-w-sm mx-auto">
          {grid.map((d, i) => {
            const inMonth = d.getMonth() === (month - 1);
            const ymd = ymdLocal(d);
            const isSelected = selectedYmd === ymd;
            const has = grouped.has(ymd);

            return (
              <button
                key={i}
                onClick={() => selectDay(d)}
                className={[
                  "relative aspect-square rounded-full flex flex-col items-center justify-center",
                  inMonth ? "text-white" : "text-white/40",    // grey out other months
                  isSelected ? "bg-white/20" : has ? "hover:bg-white/10" : "",
                ].join(" ")}
              >
                {/* Month label for prev/next month days */}
                {!inMonth && (
                  <span className="absolute top-1 text-[10px] uppercase tracking-wide text-white/60 pointer-events-none">
                    {fmtMonShort(d)}
                  </span>
                )}

                {/* Day number */}
                <span className="text-sm leading-none">{d.getDate()}</span>

                {/* dot if day has events */}
                {has && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/80" />}
              </button>
            );
          })}
        </div>


        {/* List */}
        <section className="mt-4">
          {loading && <p className="text-white/70">Loading…</p>}
          {err && <p className="text-red-400">{err}</p>}

          {!loading && !err && selectedYmd && selectedList.length === 0 && (
            <EmptyState title="No services on this day." />
          )}

          {!loading && !err && selectedYmd && selectedList.length > 0 && (
            <>
              <h3 className="text-xl font-semibold mb-3">{fmtDayHeader(new Date(selectedYmd))}</h3>
              <ul className="divide-y divide-white/10">
                {selectedList.map((r) => (
                  <Row key={`${r.__source}-${r.id}`} r={r} />
                ))}
              </ul>
            </>
          )}

          {!loading && !err && !selectedYmd && allDaysSortedAsc.length === 0 && (
            <EmptyState title="No services scheduled this month." />
          )}

          {!loading && !err && !selectedYmd && allDaysSortedAsc.length > 0 && (
            <div className="space-y-8">
              {allDaysSortedAsc.map(({ key, items }) => (
                <div key={key}>
                  <h3 className="text-xl font-semibold mb-3">{fmtDayHeader(new Date(key))}</h3>
                  <ul className="divide-y divide-white/10">
                    {items.map((r) => (
                      <Row key={`${r.__source}-${r.id}`} r={r} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* space for fixed bottom nav */}
      <div className="h-24" />
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import EmptyState from "../components/EmptyState.jsx";
import BackHomeButton from "../components/BackHomeButton.jsx";

import {
  fetchApptsMonthAll,
  fetchApptsMonthDagalow,
  fetchApptsMonthPerspectiv,
} from "../lib/api.js";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "dagalow", label: "DaGalow" },
  { key: "perspectiv", label: "Perspectiv" },
];

const pad = (n) => String(n).padStart(2, "0");

// Build a 6x7 (42-day) grid starting Monday
function buildMonthGrid(year, month1Based) {
  const first = new Date(year, month1Based - 1, 1);
  // JS: Sun=0..Sat=6  -> we want Mon=0..Sun=6
  const weekdayMon0 = (first.getDay() + 6) % 7;
  const start = new Date(year, month1Based - 1, 1 - weekdayMon0); // go back to Monday
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function ymdLocal(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1..12
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [appts, setAppts] = useState([]);
  const [selected, setSelected] = useState(new Date());

  // Load month data when month or filter changes
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const api =
          filter === "dagalow" ? fetchApptsMonthDagalow :
            filter === "perspectiv" ? fetchApptsMonthPerspectiv :
              fetchApptsMonthAll;
        const rows = await api(year, month);
        if (!live) return;
        setAppts(rows ?? []);
      } catch (e) {
        setErr(e.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [year, month, filter]);

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const monthName = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));

  // Group appointments by local YYYY-MM-DD
  const grouped = useMemo(() => {
    const map = new Map();
    for (const row of appts) {
      const d = new Date(row.appointment_start); // ISO -> Date -> local tz
      const key = ymdLocal(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    }
    // sort each day by time
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.appointment_start) - new Date(b.appointment_start));
    }
    return map;
  }, [appts]);

  const selectedKey = ymdLocal(selected);
  const dayList = grouped.get(selectedKey) ?? [];

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

  const counts = useMemo(() => ({
    all: undefined, dagalow: undefined, perspectiv: undefined
  }), []);

  const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  return (
    <div className="min-h-screen bg-app text-app">
      <Header left={<BackHomeButton />} right={<ThemeToggle />} />

      <div className="mx-auto max-w-6xl px-4 pb-4 flex flex-wrap gap-2 mt-2">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={[
              "px-3 py-1.5 rounded-lg border transition",
              filter === f.key
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white hover:bg-gray-100 border-gray-300"
            ].join(" ")}
          >
            {f.label}
            {counts[f.key] != null && (
              <span className="ml-2 text-xs text-gray-500">{counts[f.key]}</span>
            )}
          </button>
        ))}
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-24">
        {/* Month header */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="px-2 py-1 rounded-lg border bg-white hover:bg-gray-100">←</button>
          <h2 className="text-lg font-semibold">{monthName}</h2>
          <button onClick={nextMonth} className="px-2 py-1 rounded-lg border bg-white hover:bg-gray-100">→</button>
        </div>

        {/* Weekday labels (Mon..Sun) */}
        <div className="grid grid-cols-7 text-xs text-gray-500 mb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
            <div key={d} className="px-2 py-1 text-center">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {grid.map((d, idx) => {
            const inMonth = d.getMonth() === (month - 1);
            const ymd = ymdLocal(d);
            const hasAppts = grouped.has(ymd);
            const selectedDay = isSameDay(d, selected);
            return (
              <button
                key={idx}
                onClick={() => setSelected(d)}
                className={[
                  "aspect-square rounded-xl border flex flex-col items-center justify-center",
                  inMonth ? "surface" : "bg-app text-muted",
                  selectedDay ? "ring-2 ring-brand border-base" : "border-base hover:bg-[color-mix(in_oklab,var(--surface)_85%,var(--bg))]"
                ].join(" ")}
              >
                <span className="text-sm">{d.getDate()}</span>
                {hasAppts && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-900"></span>}
              </button>
            );
          })}
        </div>

        {/* Day details */}
        <section className="mt-6">
          <h3 className="text-base font-semibold">
            {new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(selected)}
          </h3>

          {loading && <p className="text-gray-500 mt-3">Loading…</p>}
          {err && <p className="text-red-600 mt-3">{err}</p>}

          {!loading && !err && dayList.length === 0 && (
            <EmptyState title="No consultations on this day." />
          )}

          {!loading && !err && dayList.length > 0 && (
            <ul className="mt-4 space-y-3">
              {dayList.map((a) => {
                const dt = new Date(a.appointment_start);
                const time = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(dt);
                const duration = `${a.duration_minutes} min`;
                const src = a.__source || (a.source || "");
                return (
                  <li key={`${src}-${a.id}`} className="surface border border-base rounded-2xl p-4 shadow-sm">

                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full border">{src}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-50">{a.status || "—"}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-900">
                          {time} · {duration}
                        </p>
                        <p className="text-sm text-gray-600">
                          {a.contact_name || "—"} {a.contact_email ? `· ${a.contact_email}` : ""} {a.contact_phone ? `· ${a.contact_phone}` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">User</p>
                        <p className="text-xs break-all">{a.user_id || "—"}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

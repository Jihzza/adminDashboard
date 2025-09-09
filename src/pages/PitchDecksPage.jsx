import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header.jsx";
import EmptyState from "../components/EmptyState.jsx";
import BackHomeButton from "../components/BackHomeButton.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { fetchPitchRequests } from "../lib/api.js";

export default function PitchDecksPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await fetchPitchRequests();
        if (!live) return;
        setRows(data ?? []);
      } catch (e) {
        setErr(e.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    })();
    return () => { live = false; };
  }, []);

  const list = useMemo(() => {
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter(r =>
      [r.project, r.name, r.email, r.phone, r.status]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(s))
    );
  }, [q, rows]);

  return (
    <div className="min-h-screen bg-app text-app">
      <Header
        right={
          <div className="flex items-center gap-2">
            <BackHomeButton />
            <ThemeToggle />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search project, name, email, phone, status…"
              className="w-72 rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
        }
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <p className="text-xs text-gray-500 mb-3">
          Source: DaGalow (Perspectiv has no pitch deck requests yet).
        </p>

        {loading && <p className="animate-pulse text-gray-500">Loading pitch deck requests…</p>}
        {err && <p className="text-red-600">{err}</p>}
        {!loading && !err && list.length === 0 && (
          <EmptyState title="No pitch deck requests found." />
        )}

        {!loading && !err && list.length > 0 && (
          <ul className="space-y-3">
            {list.map((r) => (
              <li key={`${r.__source}-${r.id}`} className="surface border border-base rounded-2xl p-4 shadow-sm">                <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full border">DaGalow</span>
                    <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-50">{r.status || "—"}</span>
                    {r.project && <span className="text-xs px-2 py-0.5 rounded-full border bg-white">{r.project}</span>}
                  </div>
                  <p className="mt-1 text-sm text-gray-900">
                    {r.name || "—"} {r.email ? `· ${r.email}` : ""} {r.phone ? `· ${r.phone}` : ""}
                  </p>
                  {r.notification_type && (
                    <p className="text-xs text-gray-500 mt-1">Notification: {r.notification_type}</p>
                  )}
                  {r.file_url && (
                    <p className="text-xs text-gray-500 mt-1 break-all">File: {r.file_url}</p>
                  )}
                </div>
                <time className="text-xs text-gray-500 shrink-0">
                  {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                </time>
              </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

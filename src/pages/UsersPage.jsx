// src/pages/UsersPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import EmptyState from "../components/EmptyState.jsx";
import UsersFilterBar from "../components/UsersFilterBar.jsx";
import VentureBadge from "../components/VentureBadge.jsx";

import { fetchAllUsers } from "../lib/api.js";

// maps server __source -> our venture key for badges
const ventureKeyFromSource = (src) =>
  (src === "Perspectiv" && "perspectiv") ||
  (src === "DaGalow" && "daniel-cluckins") ||
  null;

export default function UsersPage() {
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [users, setUsers] = useState([]);

  // UI state
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // 'all'|'perspectiv'|'galow'|'daniel-cluckins'

  // Initialize filter from ?source=perspectiv|dagalow
  useEffect(() => {
    const src = (searchParams.get("source") || "").toLowerCase();
    if (src === "perspectiv") setFilter("perspectiv");
    if (src === "dagalow") setFilter("daniel-cluckins");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load all users once (server already returns __source)
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const all = await fetchAllUsers();
        if (!live) return;
        setUsers(Array.isArray(all) ? all : []);
      } catch (e) {
        setErr(e.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    })();
    return () => { live = false; };
  }, []);

  const prs = useMemo(() => users.filter(u => u.__source === "Perspectiv"), [users]);
  const ddg = useMemo(() => users.filter(u => u.__source === "DaGalow"), [users]);

  const list = useMemo(() => {
    let base =
      filter === "perspectiv" ? prs :
      filter === "daniel-cluckins" ? ddg :
      filter === "galow" ? [] : users;

    if (!q.trim()) return base;
    const s = q.toLowerCase();
    return base.filter(u =>
      [u.full_name, u.username, u.email, u.phone]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(s))
    );
  }, [filter, q, users, prs, ddg]);

  return (
    <div className="min-h-screen bg-[#0B1220] text-gray-100">
      {/* Title */}
      <div className="mx-auto max-w-5xl px-4 pt-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center">Users</h1>

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

        {/* Side-scroll banner buttons (All / Perspectiv / Galow / Daniel Cluckins) */}
        <UsersFilterBar value={filter} onChange={setFilter} />
      </div>

      {/* List */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        {loading && <p className="text-white/70">Loading users…</p>}
        {err && <p className="text-red-400">{err}</p>}
        {!loading && !err && list.length === 0 && (
          <EmptyState title="No users found." />
        )}

        {!loading && !err && list.length > 0 && (
          <ul className="space-y-3">
            {list.map((u) => {
              const sourceSlug = u.__source === "DaGalow" ? "dagalow" : "perspectiv";
              const ventureKey = ventureKeyFromSource(u.__source);
              const avatar = u.avatar_url || `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(u.username || u.id)}`;
              const displayName = u.full_name || "—";
              const username = u.username || "unknown";

              return (
                <li key={`${u.__source}-${u.id}`} className="rounded-2xl border border-white/15 bg-white/[0.06]">
                  <Link
                    to={`/u/${sourceSlug}/${u.id}`}
                    className="flex items-center gap-3 p-3"
                  >
                    <img src={avatar} alt="" className="w-10 h-10 rounded-full object-cover bg-white/10" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{displayName}</p>
                      <p className="text-sm text-white/60 truncate">@{username}</p>
                    </div>

                    {/* venture banner chip (matches the filter buttons) */}
                    {ventureKey && <VentureBadge ventureKey={ventureKey} className="ml-2" />}

                    <ChevronRight className="w-5 h-5 text-white/60 ml-2" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* keep space for your fixed BottomNav */}
      <div className="h-24" />
    </div>
  );
}

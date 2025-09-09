import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header.jsx";
import FilterBar from "../components/FilterBar.jsx";
import UserCard from "../components/UserCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import { Search, X, Loader2 } from "lucide-react";
import {
  fetchAllUsers,
  fetchDagalowUsers,
  fetchPerspectivUsers
} from "../lib/api.js";

export default function UsersPage() {
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [allUsers, setAll] = useState([]);
  const [ddgUsers, setDDG] = useState([]);
  const [prsUsers, setPRS] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const [all, ddg, prs] = await Promise.all([
          fetchAllUsers(),
          fetchDagalowUsers(),
          fetchPerspectivUsers()
        ]);
        if (!live) return;
        setAll(all ?? []);
        setDDG(ddg ?? []);
        setPRS(prs ?? []);
      } catch (e) {
        setErr(e.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    })();
    return () => { live = false; };
  }, []);

  const counts = useMemo(() => ({
    all: allUsers.length,
    dagalow: ddgUsers.length,
    perspectiv: prsUsers.length
  }), [allUsers, ddgUsers, prsUsers]);

  const list = useMemo(() => {
    const base =
      filter === "dagalow" ? ddgUsers :
        filter === "perspectiv" ? prsUsers :
          allUsers;

    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(u =>
      [u.full_name, u.username, u.email]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    );
  }, [filter, query, allUsers, ddgUsers, prsUsers]);

  const clearSearch = () => setQuery("");

  return (
    <div className="h-full bg-app flex flex-col">
      <Header
        right={
          <div className="relative">
            <div className="relative flex items-center gap-2">
              <ThemeToggle />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users..."
                className="w-80 pl-10 pr-10 py-2.5 input text-sm"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        }
      />
      <FilterBar active={filter} counts={counts} onChange={setFilter} />

      <main className="flex-1 overflow-y-auto mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{counts.all}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">DaGalow Users</p>
                <p className="text-3xl font-bold text-blue-600">{counts.dagalow}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Perspectiv Users</p>
                <p className="text-3xl font-bold text-purple-600">{counts.perspectiv}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-3 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading users...</span>
              </div>
            </div>
            <LoadingSkeleton count={6} />
          </div>
        )}

        {/* Error State */}
        {err && (
          <div className="card p-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-xs">!</span>
              </div>
              <span>{err}</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !err && list.length === 0 && (
          <EmptyState
            title="No users found"
            subtitle={query ? "Try adjusting your search terms" : "Try a different filter"}
          />
        )}

        {/* Users Grid */}
        {!loading && !err && list.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {query ? `Search results (${list.length})` : `All Users (${list.length})`}
              </h2>
              {query && (
                <button
                  onClick={clearSearch}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear search
                </button>
              )}
            </div>

            <ul className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {list.map((u, index) => (
                <UserCard
                  key={`${u.__source}-${u.id}`}
                  user={u}
                  style={{ animationDelay: `${index * 50}ms` }}
                />
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header.jsx";
import EmptyState from "../components/EmptyState.jsx";
import BackHomeButton from "../components/BackHomeButton.jsx";
import FilterBar from "../components/FilterBar.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import { Search, X, Star, Quote, Calendar } from "lucide-react";

import {
  fetchTestimonialsAll,
  fetchTestimonialsDaGalow,
  fetchTestimonialsPerspectiv,
} from "../lib/api.js";

const FILTERS = [
  { key: "all", label: "All Reviews", icon: Star, color: "gray" },
  { key: "dagalow", label: "DaGalow", icon: Star, color: "blue" },
  { key: "perspectiv", label: "Perspectiv", icon: Star, color: "purple" },
];

export default function TestimonialsPage() {
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [all, setAll] = useState([]);
  const [ddg, setDDG] = useState([]);
  const [prs, setPRS] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const [a, b, c] = await Promise.all([
          fetchTestimonialsAll(),
          fetchTestimonialsDaGalow(),
          fetchTestimonialsPerspectiv(),
        ]);
        if (!live) return;
        setAll(a ?? []);
        setDDG(b ?? []);
        setPRS(c ?? []);
      } catch (e) {
        setErr(e.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    })();
    return () => { live = false; };
  }, []);

  const list = useMemo(() => {
    const base =
      filter === "dagalow" ? ddg :
        filter === "perspectiv" ? prs :
          all;
    if (!q.trim()) return base;
    const s = q.toLowerCase();
    return base.filter(t =>
      [t.name, t.content]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(s))
    );
  }, [filter, q, all, ddg, prs]);

  const counts = useMemo(() => ({
    all: all.length,
    dagalow: ddg.length,
    perspectiv: prs.length,
  }), [all, ddg, prs]);

  const clearSearch = () => setQ("");

  return (
    <div className="h-full bg-app flex flex-col">
      <Header
        left={<BackHomeButton showArrow />}
        title="Testimonials"
        right={
          <div className="relative flex items-center gap-2">
            <ThemeToggle />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search testimonials..."
              className="w-80 pl-10 pr-10 py-2.5 input text-sm"
            />
            {q && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
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
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{counts.all}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">DaGalow Reviews</p>
                <p className="text-3xl font-bold text-blue-600">{counts.dagalow}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Perspectiv Reviews</p>
                <p className="text-3xl font-bold text-purple-600">{counts.perspectiv}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                <span>Loading testimonials...</span>
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
            title="No testimonials found"
            subtitle={q ? "Try adjusting your search terms" : "Approve or add new testimonials to see them here"}
            icon="search"
          />
        )}

        {/* Testimonials Grid */}
        {!loading && !err && list.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {q ? `Search results (${list.length})` : `Testimonials (${list.length})`}
              </h2>
              {q && (
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
              {list.map((t, index) => (
                <li key={`${t.__source}-${t.id}`} className="card p-6 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={t.image_url || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(t.name || "User")}`}
                        alt={t.name || "User"}
                        className="w-14 h-14 rounded-2xl object-cover bg-gradient-to-br from-gray-100 to-gray-200 ring-2 ring-white shadow-sm"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center">
                        <Star className="w-2 h-2 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">{t.name || "Anonymous"}</h3>
                        </div>

                        <span className="text-xs px-3 py-1 rounded-full border bg-gray-100 text-gray-800 font-medium flex-shrink-0 ml-2">
                          {t.__source}
                        </span>
                      </div>

                      <div className="relative">
                        <Quote className="absolute -top-2 -left-2 w-6 h-6 text-yellow-200" />
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words pl-4">
                          {t.content || "No content provided"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>Posted {t.created_at ? new Date(t.created_at).toLocaleDateString() : "Unknown date"}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

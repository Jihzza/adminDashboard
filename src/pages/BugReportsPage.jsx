import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header.jsx";
import EmptyState from "../components/EmptyState.jsx";
import BackHomeButton from "../components/BackHomeButton.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import FilterBar from "../components/FilterBar.jsx";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import { Search, X, Bug, AlertTriangle, CheckCircle, Clock } from "lucide-react";

import {
  fetchBugsAll,
  fetchBugsDaGalow,
  fetchBugsPerspectiv
} from "../lib/api.js";

const FILTERS = [
  { key: "all", label: "All Bugs", icon: Bug, color: "gray" },
  { key: "dagalow", label: "DaGalow", icon: Bug, color: "blue" },
  { key: "perspectiv", label: "Perspectiv", icon: Bug, color: "purple" }
];

export default function BugReportsPage() {
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
          fetchBugsAll(),
          fetchBugsDaGalow(),
          fetchBugsPerspectiv()
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
    return base.filter(r =>
      [r.name, r.email, r.description, r.status]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(s))
    );
  }, [filter, q, all, ddg, prs]);

  const counts = useMemo(() => ({
    all: all.length,
    dagalow: ddg.length,
    perspectiv: prs.length
  }), [all, ddg, prs]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bug className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'closed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const clearSearch = () => setQ("");

  return (
    <div className="h-full bg-app flex flex-col">
      <Header
        left={<BackHomeButton showArrow />}
        title="Bug Reports"
        right={
          <div className="relative flex items-center gap-2">
            <ThemeToggle />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search bug reports..."
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
                <p className="text-sm font-medium text-gray-600">Total Bugs</p>
                <p className="text-3xl font-bold text-gray-900">{counts.all}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <Bug className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">DaGalow Bugs</p>
                <p className="text-3xl font-bold text-blue-600">{counts.dagalow}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Bug className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Perspectiv Bugs</p>
                <p className="text-3xl font-bold text-purple-600">{counts.perspectiv}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Bug className="w-6 h-6 text-purple-600" />
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
                <span>Loading bug reports...</span>
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
            title="No bug reports found" 
            subtitle={q ? "Try adjusting your search terms" : "Try a different filter"}
            icon="alert"
          />
        )}

        {/* Bug Reports List */}
        {!loading && !err && list.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {q ? `Search results (${list.length})` : `Bug Reports (${list.length})`}
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
            
            <ul className="space-y-4">
              {list.map((r, index) => (
                <li key={`${r.__source}-${r.id}`} className="card p-6 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      {getStatusIcon(r.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">{r.name || "Anonymous"}</h3>
                          <p className="text-sm text-gray-600 truncate">{r.email || "No email provided"}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getStatusColor(r.status)}`}>
                            {r.status || "Unknown"}
                          </span>
                          <span className="text-xs px-3 py-1 rounded-full border bg-gray-100 text-gray-800">
                            {r.__source}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                        {r.description || "No description provided"}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>Reported {r.created_at ? new Date(r.created_at).toLocaleString() : "Unknown date"}</span>
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

// src/components/UsersFilterBar.jsx
import { useMemo } from "react";
import { VENTURES } from "../lib/ventures.js";

/**
 * Props:
 * - value: 'all' | venture.key
 * - onChange: (key) => void
 * - className?: string
 *
 * Requires:
 * - venture banners imported in src/lib/ventures.js (e.g., import banner from '../assets/...svg')
 * - .no-scrollbar utility in styles.css (optional):
 *     .no-scrollbar::-webkit-scrollbar { display:none }
 *     .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none }
 */
export default function UsersFilterBar({ value, onChange, className = "" }) {
  const items = useMemo(
    () => [
      { key: "all", name: "All", banner: null },
      ...VENTURES.map(v => ({ key: v.key, name: v.name, banner: v.banner })),
    ],
    []
  );

  return (
    <div
      className={[
        "mt-4 -mx-4 px-4 overflow-x-auto no-scrollbar",
        className,
      ].join(" ")}
      role="toolbar"
      aria-label="Filter users by venture"
    >
      <div className="flex gap-3 w-max pb-2">
        {items.map((item) => {
          const active = value === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              aria-pressed={active}
              className={[
                "shrink-0 overflow-hidden",
                "rounded-xl border-2 h-auto w-auto px-3 py-2",
                active
                  ? "border-white"
                  : "border-white/50 hover:border-white",
              ].join(" ")}
            >
              {item.banner ? (
                <img
                  src={item.banner}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white text-xs">
                  All
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

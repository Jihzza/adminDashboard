import { Users, Building, Users2 } from "lucide-react";

const FILTERS = [
  { key: "all", label: "All Users", icon: Users, color: "gray" },
  { key: "dagalow", label: "DaGalow", icon: Building, color: "blue" },
  { key: "perspectiv", label: "Perspectiv", icon: Users2, color: "purple" }
];

export default function FilterBar({ active, counts, onChange }) {
  const getFilterStyles = (filter, isActive) => {
    const baseStyles = "group relative flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all duration-200 border focus-visible:outline-none focus-visible:ring-2 ring-brand";

    if (isActive) {
      switch (filter.color) {
        case 'blue':
          return `${baseStyles} bg-blue-900/30 text-blue-400 border-blue-700 shadow-lg shadow-blue-500/25`;
        case 'purple':
          return `${baseStyles} surface text-app border-base ring-1 ring-inset ring-brand shadow-sm`;
        default:
          return `${baseStyles} surface text-app border-base ring-1 ring-inset ring-brand shadow-sm`;
      }
    }

    return `${baseStyles} bg-app text-muted border-base hover:bg-[color-mix(in_oklab,var(--surface)_85%,var(--bg))] hover:text-app`;
  };

  const getCountStyles = (filter, isActive) => {
    if (isActive) {
      return "bg-gray-800/50 text-gray-200";
    }
    return "bg-gray-300 text-gray-600 group-hover:bg-gray-400 group-hover:text-gray-700";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-wrap gap-3" role="tablist" aria-label="Filter users">
        {FILTERS.map(filter => {
          const Icon = filter.icon;
          const isActive = active === filter.key;

          return (
            <button
              key={filter.key}
              onClick={() => onChange(filter.key)}
              className={getFilterStyles(filter, isActive)}
              role="tab"
              aria-selected={isActive}
              aria-pressed={isActive}            >
              <Icon className="w-4 h-4" />
              <span>{filter.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getCountStyles(filter, isActive)}`}>
                {counts[filter.key] ?? 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

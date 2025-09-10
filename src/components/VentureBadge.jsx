import { byKey } from "../lib/ventures.js";

export default function VentureBadge({ ventureKey, className = "" }) {
  const v = byKey[ventureKey];
  if (!v) return null;
  return (
    <span
      className={[
        "rounded-xl overflow-hidden border-2 border-white/50 px-3 py-2",
        "h-auto w-auto",
        className,
      ].join(" ")}
    >
      <img
        src={v.banner}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </span>
  );
}

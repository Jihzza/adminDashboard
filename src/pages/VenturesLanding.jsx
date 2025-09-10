import { useMemo, useState } from "react";
import { VENTURES } from "../lib/ventures.js";
import VentureTile from "../components/VentureTile.jsx";

export default function VenturesLanding() {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    if (!q.trim()) return VENTURES;
    const s = q.toLowerCase();
    return VENTURES.filter(v => v.name.toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="min-h-screen bg-[#0B1220] text-gray-100">
      <div className="mx-auto max-w-4xl px-4 pt-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center">Cluckins Ventures</h1>

        <div className="mt-6 flex justify-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name..."
            className="w-full sm:w-[620px] rounded-xl border border-white/20 bg-white/10 placeholder:text-white/50 text-white px-4 py-2 outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>

        <div className="mt-10 grid grid-cols-3 gap-6">
          {list.map(v => <VentureTile key={v.key} venture={v} />)}
        </div>
      </div>

      {/* leave space for your fixed BottomNav */}
      <div className="h-24" />
    </div>
  );
}

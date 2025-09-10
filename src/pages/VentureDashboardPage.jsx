import { Link, useParams } from "react-router-dom";
import { getVenture } from "../lib/ventures.js";
import BackHomeButton from "../components/BackHomeButton.jsx";

function DashLink({ to, label, subtitle }) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition p-4 block"
    >
      <p className="font-medium">{label}</p>
      {subtitle && <p className="text-sm text-white/60 mt-1">{subtitle}</p>}
    </Link>
  );
}

export default function VentureDashboardPage() {
  const { venture: slug } = useParams();
  const venture = getVenture(slug);

  if (!venture) {
    return (
      <div className="min-h-screen bg-[#0B1220] text-gray-100 p-6">
        <p className="text-red-300">Unknown venture.</p>
        <Link to="/" className="underline">Go back</Link>
      </div>
    );
  }

  const sourceParam = venture.source ? `?source=${venture.source}` : "";

  return (
    <div className="min-h-screen bg-[#0B1220] text-gray-100">
      <header className="sticky top-0 bg-[#0B1220]/80 backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={venture.logo} alt="" className="w-9 h-9 rounded-xl object-contain" />
            <h2 className="text-xl font-semibold">{venture.name}</h2>
          </div>
          <BackHomeButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {!venture.hasDb ? (
          <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4">
            <p className="text-yellow-200">This venture doesn’t have a connected database yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DashLink to={`/users${sourceParam}`} label="Users" subtitle="View and search users" />
            <DashLink to={`/bugs${sourceParam}`} label="Bug Reports" subtitle="Track and triage" />
            <DashLink to={`/testimonials${sourceParam}`} label="Testimonials" subtitle="Approved only" />
            <DashLink to={`/calendar${sourceParam}`} label="Calendar" subtitle="Consultations by day" />
            {/* Pitch Decks exist only on DaGalow/Daniel-Cluckins */}
            {venture.source === "dagalow" && (
              <DashLink to="/pitchdecks" label="Pitch Deck Requests" subtitle="DaGalow only" />
            )}
          </div>
        )}
      </main>

      <div className="h-24" />
    </div>
  );
}

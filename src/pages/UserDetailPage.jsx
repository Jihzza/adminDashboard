import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { fetchUser, fetchUserServices } from "../lib/api.js";

const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "—");
const EUR = (n) =>
  typeof n === "number"
    ? new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)
    : "—";

// pricing model (DaGalow)
const CONSULT_EUR_PER_HOUR = 90;
const COACHING_PRICES = { basic: 40, standard: 90, premium: 230 }; // €/month

export default function UserDetailPage() {
  const { source, id } = useParams(); // /u/:source/:id
  const [user, setUser] = useState(null);
  const [svc, setSvc] = useState({ appointments: [], subscriptions: [], pitch_requests: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const [u, s] = await Promise.all([fetchUser(source, id), fetchUserServices(source, id)]);
        if (!live) return;
        setUser(u);
        setSvc(s || { appointments: [], subscriptions: [], pitch_requests: [] });
      } catch (e) {
        setErr(e.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [source, id]);

  // --- Finances / Active services calculations (client-side) ---
  const now = Date.now();

  const consultations = useMemo(() => {
    if (!Array.isArray(svc.appointments)) return [];
    return svc.appointments.map(a => {
      const hours = (a.duration_minutes ?? 0) / 60;
      const amount = hours * CONSULT_EUR_PER_HOUR;
      const upcoming = a.appointment_start ? new Date(a.appointment_start).getTime() > now : false;
      return { ...a, hours, amount, upcoming };
    });
  }, [svc.appointments]);

  const coachingActive = useMemo(() => {
    const subs = Array.isArray(svc.subscriptions) ? svc.subscriptions : [];
    return subs.filter(s => (s.status || "").toLowerCase() === "active");
  }, [svc.subscriptions]);

  const pitchRequests = useMemo(
    () => (Array.isArray(svc.pitch_requests) ? svc.pitch_requests : []),
    [svc.pitch_requests]
  );

  const financeTotals = useMemo(() => {
    const consultationsTotal = consultations.reduce((sum, a) => sum + (a.amount || 0), 0);
    const coachingMonthly = coachingActive.reduce(
      (sum, s) => sum + (COACHING_PRICES[(s.plan_id || "").toLowerCase()] || 0),
      0
    );
    const pitchdecksTotal = 0; // free
    const grandTotalBooked = consultationsTotal + pitchdecksTotal;
    return { consultationsTotal, coachingMonthly, pitchdecksTotal, grandTotalBooked };
  }, [consultations, coachingActive]);

  const activeConsultations = useMemo(
    () => consultations.filter(a => a.upcoming && (a.status || "").toLowerCase() === "confirmed"),
    [consultations]
  );

  const isDaGalow = String(source).toLowerCase() === "dagalow";

  return (
    <div className="min-h-full bg-app text-app">
      <Header
        right={
          <Link to="/" className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-100">
            ← Back
          </Link>
        }
      />

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {loading && <p className="text-gray-500">Loading…</p>}
        {err && <p className="text-red-600">{err}</p>}
        {!loading && !err && !user && <EmptyState title="User not found." />}

        {user && (
          <>
            {/* Box 1: Core details */}
            <section className="surface border border-base rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar_url || `https://api.dicebear.com/9.x/identicon/svg?seed=${user.username || user.id}`}
                  alt=""
                  className="size-16 rounded-full object-cover bg-gray-100"
                />
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold truncate">{user.full_name || "—"}</h2>
                  <p className="text-sm text-gray-600 truncate">@{user.username || "unknown"}</p>
                </div>
              </div>
              <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><dt className="text-xs uppercase text-gray-500">Email</dt><dd className="text-sm">{user.email || "—"}</dd></div>
                <div><dt className="text-xs uppercase text-gray-500">Phone</dt><dd className="text-sm">{user.phone || "—"}</dd></div>
                <div><dt className="text-xs uppercase text-gray-500">Created at</dt><dd className="text-sm">{fmtDate(user.created_at)}</dd></div>
              </dl>
            </section>

            {/* Box 2: Finances */}
            <section className="surface border border-base rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-semibold mb-4">Finances</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border bg-gray-50">
                  <p className="text-xs uppercase text-gray-500">Consultations (lifetime booked)</p>
                  <p className="text-xl font-bold">{EUR(financeTotals.consultationsTotal)}</p>
                </div>
                <div className="p-4 rounded-xl border bg-gray-50">
                  <p className="text-xs uppercase text-gray-500">Coaching (current monthly)</p>
                  <p className="text-xl font-bold">{EUR(financeTotals.coachingMonthly)}</p>
                </div>
                <div className="p-4 rounded-xl border bg-gray-50">
                  <p className="text-xs uppercase text-gray-500">Pitch decks (free)</p>
                  <p className="text-xl font-bold">{EUR(financeTotals.pitchdecksTotal)}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Consultations</h4>
                  {consultations.length === 0 ? (
                    <p className="text-sm text-gray-500">No consultations.</p>
                  ) : (
                    <ul className="space-y-2">
                      {consultations.map(c => (
                        <li key={c.id} className="text-sm flex items-center justify-between border rounded-lg px-3 py-2">
                          <span>{Math.round(c.hours * 60)} min · {c.status || "—"}</span>
                          <span className="tabular-nums">{EUR(c.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Coaching subscriptions</h4>
                  {svc.subscriptions.length === 0 ? (
                    <p className="text-sm text-gray-500">No subscriptions.</p>
                  ) : (
                    <ul className="space-y-2">
                      {svc.subscriptions.map(s => {
                        const plan = (s.plan_id || "").toLowerCase();
                        const price = COACHING_PRICES[plan];
                        return (
                          <li key={s.id} className="text-sm flex items-center justify-between border rounded-lg px-3 py-2">
                            <span className="capitalize">{plan || "—"} · {s.status || "—"}</span>
                            <span className="tabular-nums">{price ? EUR(price) + "/mo" : "—"}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Pitch deck requests</h4>
                  {pitchRequests.length === 0 ? (
                    <p className="text-sm text-gray-500">No pitch deck requests.</p>
                  ) : (
                    <ul className="space-y-2">
                      {pitchRequests.map(p => (
                        <li key={p.id} className="text-sm flex items-center justify-between border rounded-lg px-3 py-2">
                          <span>{p.project || "—"} · {p.status || "—"}</span>
                          <time className="text-xs text-gray-500">{fmtDate(p.created_at)}</time>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {!isDaGalow && (
                <p className="text-xs text-gray-500 mt-4">
                  Services are only available on DaGalow for now; Perspectiv is under construction.
                </p>
              )}
            </section>

            {/* Box 3: Active services */}
            <section className="surface border border-base rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-semibold mb-4">Active services</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Upcoming consultations</h4>
                  {activeConsultations.length === 0 ? (
                    <p className="text-sm text-gray-500">None scheduled.</p>
                  ) : (
                    <ul className="space-y-2">
                      {activeConsultations.map(c => (
                        <li key={c.id} className="text-sm flex items-center justify-between border rounded-lg px-3 py-2">
                          <span>{Math.round(c.hours * 60)} min · {c.status || "—"}</span>
                          <time className="text-xs text-gray-500">{fmtDate(c.appointment_start)}</time>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Coaching</h4>
                  {coachingActive.length === 0 ? (
                    <p className="text-sm text-gray-500">No active plan.</p>
                  ) : (
                    <ul className="space-y-2">
                      {coachingActive.map(s => {
                        const plan = (s.plan_id || "").toLowerCase();
                        const price = COACHING_PRICES[plan];
                        return (
                          <li key={s.id} className="text-sm flex items-center justify-between border rounded-lg px-3 py-2">
                            <span className="capitalize">{plan}</span>
                            <span className="tabular-nums">{price ? EUR(price) + "/mo" : "—"}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Pitch decks</h4>
                  {pitchRequests.length === 0 ? (
                    <p className="text-sm text-gray-500">No requests.</p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {pitchRequests.length} request{pitchRequests.length > 1 ? "s" : ""} (free).
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Box 4: User Report (solo section) */}
            <section id="user-report" className="surface border border-base rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-semibold mb-2">User Report</h3>
              {user.user_report ? (
                <div className="rounded-xl border bg-gray-50 p-4">
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {user.user_report}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No report on file.</p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

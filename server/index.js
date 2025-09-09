// server/index.js
import "dotenv/config";                 // loads .env into process.env
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

// ---- ENV ----
const {
  SUPABASE_DDG_URL,
  SUPABASE_DDG_SERVICE_ROLE,
  SUPABASE_PERS_URL,
  SUPABASE_PERS_SERVICE_ROLE,
  PORT = 4000,
} = process.env;

// ---- Supabase clients (server-side, service_role) ----
const makeClient = (url, key) => {
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { "X-Client-Info": "admin-dashboard/1.0" } },
  });
};

const dagalow = makeClient(SUPABASE_DDG_URL, SUPABASE_DDG_SERVICE_ROLE);
const perspectiv = makeClient(SUPABASE_PERS_URL, SUPABASE_PERS_SERVICE_ROLE);

// ---- utils ----
const notConfigured = (name) => ({
  error: `${name} Supabase is not configured on this server.`,
});

const mapRows = (rows, source) => (rows ?? []).map((r) => ({ ...r, __source: source }));

const pickClient = (source) => {
  const s = String(source || "").toLowerCase();
  if (s === "dagalow") return dagalow;
  if (s === "perspectiv") return perspectiv;
  return null;
};

const PROFILES_SELECT = "*"; // safest across projects

const handle = (res, { data, error }, transform = (x) => x) => {
  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
  return res.json(transform(data ?? []));
};

// ---- routes: users lists ----
app.get("/api/dagalow/users", async (_req, res) => {
  if (!dagalow) return res.status(501).json(notConfigured("DaGalow"));
  const result = await dagalow.from("profiles").select(PROFILES_SELECT).limit(1000);
  return handle(res, result, (d) => mapRows(d, "DaGalow"));
});

app.get("/api/perspectiv/users", async (_req, res) => {
  if (!perspectiv) return res.status(501).json(notConfigured("Perspectiv"));
  const result = await perspectiv.from("profiles").select(PROFILES_SELECT).limit(1000);
  return handle(res, result, (d) => mapRows(d, "Perspectiv"));
});

app.get("/api/all-users", async (_req, res) => {
  const [ddgRes, prsRes] = await Promise.all([
    dagalow
      ? dagalow.from("profiles").select(PROFILES_SELECT).limit(1000)
      : Promise.resolve({ data: [], error: null }),
    perspectiv
      ? perspectiv.from("profiles").select(PROFILES_SELECT).limit(1000)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (ddgRes.error) {
    console.error(ddgRes.error);
    return res.status(500).json({ error: ddgRes.error.message });
  }
  if (prsRes.error) {
    console.error(prsRes.error);
    return res.status(500).json({ error: prsRes.error.message });
  }

  return res.json([
    ...(dagalow ? mapRows(ddgRes.data ?? [], "DaGalow") : []),
    ...(perspectiv ? mapRows(prsRes.data ?? [], "Perspectiv") : []),
  ]);
});

// ---- route: single user ----
app.get("/api/:source/users/:id", async (req, res) => {
  const { source, id } = req.params;
  const client = pickClient(source);
  if (!client) {
    if (String(source).toLowerCase() === "perspectiv") {
      return res.status(501).json(notConfigured("Perspectiv"));
    }
    return res.status(400).json({ error: "Unknown source" });
  }

  const result = await client.from("profiles").select("*").eq("id", id).maybeSingle();
  if (result.error) {
    console.error(result.error);
    return res.status(500).json({ error: result.error.message });
  }
  if (!result.data) return res.status(404).json({ error: "Not found" });
  return res.json({ ...result.data, __source: source });
});

// ---- route: services aggregator (DaGalow only) ----
app.get("/api/:source/users/:id/services", async (req, res) => {
  const { source, id } = req.params;
  const s = String(source).toLowerCase();
  const client = pickClient(source);

  if (s !== "dagalow" || !client) {
    // Perspectiv (or unconfigured): return empty sets + note
    return res.json({
      appointments: [],
      subscriptions: [],
      pitch_requests: [],
      note: "Services are available only on DaGalow for now.",
    });
  }

  try {
    const [appts, subs, pitches] = await Promise.all([
      client.from("appointments").select("*").eq("user_id", id).limit(1000),
      client.from("subscriptions").select("*").eq("user_id", id).limit(1000),
      client.from("pitch_requests").select("*").eq("user_id", id).limit(1000),
    ]);

    if (appts.error) throw appts.error;
    if (subs.error) throw subs.error;
    if (pitches.error) throw pitches.error;

    return res.json({
      appointments: appts.data ?? [],
      subscriptions: subs.data ?? [],
      pitch_requests: pitches.data ?? [],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

// ---- health ----
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ---- start ----
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

// ---- bug reports ----
const BUGS_SELECT = "*";

app.get("/api/dagalow/bugs", async (_req, res) => {
  if (!dagalow) return res.status(501).json(notConfigured("DaGalow"));
  const result = await dagalow
    .from("bug_reports")
    .select(BUGS_SELECT)
    .order("created_at", { ascending: false })
    .limit(1000);
  return handle(res, result, (d) => mapRows(d, "DaGalow"));
});

app.get("/api/perspectiv/bugs", async (_req, res) => {
  if (!perspectiv) return res.status(501).json(notConfigured("Perspectiv"));
  const result = await perspectiv
    .from("bug_reports")
    .select(BUGS_SELECT)
    .order("created_at", { ascending: false })
    .limit(1000);
  return handle(res, result, (d) => mapRows(d, "Perspectiv"));
});

app.get("/api/bugs", async (_req, res) => {
  const [ddg, prs] = await Promise.all([
    dagalow
      ? dagalow.from("bug_reports").select(BUGS_SELECT).order("created_at", { ascending: false }).limit(1000)
      : Promise.resolve({ data: [], error: null }),
    perspectiv
      ? perspectiv.from("bug_reports").select(BUGS_SELECT).order("created_at", { ascending: false }).limit(1000)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (ddg.error) { console.error(ddg.error); return res.status(500).json({ error: ddg.error.message }); }
  if (prs.error) { console.error(prs.error); return res.status(500).json({ error: prs.error.message }); }

  return res.json([
    ...(ddg.data ? mapRows(ddg.data, "DaGalow") : []),
    ...(prs.data ? mapRows(prs.data, "Perspectiv") : []),
  ]);
});

// Create a new bug report on DaGalow
app.post("/api/dagalow/bugs", async (req, res) => {
  if (!dagalow) return res.status(501).json({ error: "DaGalow Supabase not configured." });

  const { user_id, name, email, description, status } = req.body || {};
  if (!user_id || !name || !email || !description) {
    return res.status(400).json({ error: "user_id, name, email, description are required." });
  }

  // default status is "New" if none supplied
  const row = {
    user_id,
    name,
    email,
    description,
    status: status || "New",
    // created_at can be omitted if your DB default is now()
  };

  const { data, error } = await dagalow
    .from("bug_reports")
    .insert(row)
    .select(); // return inserted row(s)

  if (error) {
    console.error("[POST /api/dagalow/bugs]", error);
    return res.status(500).json({ error: error.message });
  }

  // return the single inserted row
  return res.status(201).json({ ...(data?.[0] || {}), __source: "DaGalow" });
});

// ---- testimonials (approved only) ----
const TM_SELECT = "*";

app.get("/api/dagalow/testimonials", async (_req, res) => {
  if (!dagalow) return res.status(501).json(notConfigured("DaGalow"));
  const result = await dagalow
    .from("testimonials")
    .select(TM_SELECT)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(1000);
  return handle(res, result, (d) => mapRows(d, "DaGalow"));
});

app.get("/api/perspectiv/testimonials", async (_req, res) => {
  if (!perspectiv) return res.status(501).json(notConfigured("Perspectiv"));
  const result = await perspectiv
    .from("testimonials")
    .select(TM_SELECT)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(1000);
  return handle(res, result, (d) => mapRows(d, "Perspectiv"));
});

app.get("/api/testimonials", async (_req, res) => {
  const [ddg, prs] = await Promise.all([
    dagalow
      ? dagalow.from("testimonials").select(TM_SELECT).eq("is_approved", true).order("created_at", { ascending: false }).limit(1000)
      : Promise.resolve({ data: [], error: null }),
    perspectiv
      ? perspectiv.from("testimonials").select(TM_SELECT).eq("is_approved", true).order("created_at", { ascending: false }).limit(1000)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (ddg.error) { console.error(ddg.error); return res.status(500).json({ error: ddg.error.message }); }
  if (prs.error) { console.error(prs.error); return res.status(500).json({ error: prs.error.message }); }

  return res.json([
    ...(ddg.data ? mapRows(ddg.data, "DaGalow") : []),
    ...(prs.data ? mapRows(prs.data, "Perspectiv") : []),
  ]);
});

// ---- Appointments by month ----
// helper to build ISO UTC month range like 2025-09-01T00:00:00.000Z
const monthBounds = (year, month1Based) => {
  const y = Number(year), m0 = Number(month1Based) - 1; // 0-based month
  const from = new Date(Date.UTC(y, m0, 1, 0, 0, 0, 0));
  const to   = new Date(Date.UTC(y, m0 + 1, 1, 0, 0, 0, 0));
  return { from: from.toISOString(), to: to.toISOString() };
};

// generic fetcher
async function fetchMonth(client, fromISO, toISO) {
  return client
    .from("appointments")
    .select("*")
    .gte("appointment_start", fromISO)
    .lt("appointment_start", toISO)
    .order("appointment_start", { ascending: true })
    .limit(1000);
}

// GET /api/:source/appointments/month?year=2025&month=9
app.get("/api/:source/appointments/month", async (req, res) => {
  const { source } = req.params;
  const { year, month } = req.query;
  const client = pickClient(source);
  if (!client) return res.status(400).json({ error: "Unknown source" });
  const { from, to } = monthBounds(year, month);
  const { data, error } = await fetchMonth(client, from, to);
  if (error) return res.status(500).json({ error: error.message });
  return res.json(mapRows(data ?? [], source === "dagalow" ? "DaGalow" : "Perspectiv"));
});

// GET /api/appointments/month?year=2025&month=9  (merged)
app.get("/api/appointments/month", async (req, res) => {
  const { year, month } = req.query;
  const { from, to } = monthBounds(year, month);
  const [ddg, prs] = await Promise.all([
    dagalow ? fetchMonth(dagalow, from, to) : Promise.resolve({ data: [], error: null }),
    perspectiv ? fetchMonth(perspectiv, from, to) : Promise.resolve({ data: [], error: null }),
  ]);
  if (ddg.error) return res.status(500).json({ error: ddg.error.message });
  if (prs.error) return res.status(500).json({ error: prs.error.message });
  return res.json([
    ...(ddg.data ? mapRows(ddg.data, "DaGalow") : []),
    ...(prs.data ? mapRows(prs.data, "Perspectiv") : []),
  ]);
});

// ---- pitch deck requests (DaGalow only) ----
const PITCH_SELECT = "*";

// DaGalow-only endpoint
app.get("/api/dagalow/pitch-requests", async (_req, res) => {
  if (!dagalow) return res.status(501).json(notConfigured("DaGalow"));
  const result = await dagalow
    .from("pitch_requests")
    .select(PITCH_SELECT)
    .order("created_at", { ascending: false })
    .limit(1000);
  return handle(res, result, (d) => mapRows(d, "DaGalow"));
});

// Convenience alias that currently returns just DaGalow
app.get("/api/pitch-requests", async (_req, res) => {
  if (!dagalow) return res.json([]); // Perspectiv has none
  const result = await dagalow
    .from("pitch_requests")
    .select(PITCH_SELECT)
    .order("created_at", { ascending: false })
    .limit(1000);
  return handle(res, result, (d) => mapRows(d, "DaGalow"));
});

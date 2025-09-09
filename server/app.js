// server/app.js
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

export function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const {
    SUPABASE_DDG_URL,
    SUPABASE_DDG_SERVICE_ROLE,
    SUPABASE_PERS_URL,
    SUPABASE_PERS_SERVICE_ROLE,
  } = process.env;

  const makeClient = (url, key) =>
    url && key
      ? createClient(url, key, {
          auth: { autoRefreshToken: false, persistSession: false },
          global: { headers: { "X-Client-Info": "admin-dashboard/1.0" } },
        })
      : null;

  const dagalow = makeClient(SUPABASE_DDG_URL, SUPABASE_DDG_SERVICE_ROLE);
  const perspectiv = makeClient(SUPABASE_PERS_URL, SUPABASE_PERS_SERVICE_ROLE);

  const notConfigured = (name) => ({ error: `${name} Supabase is not configured.` });
  const mapRows = (rows, source) => (rows ?? []).map((r) => ({ ...r, __source: source }));
  const pickClient = (source) => {
    const s = String(source || "").toLowerCase();
    if (s === "dagalow") return dagalow;
    if (s === "perspectiv") return perspectiv;
    return null;
  };
  const handle = (res, { data, error }, transform = (x) => x) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
    return res.json(transform(data ?? []));
  };

  // ---------- USERS ----------
  const PROFILES_SELECT = "*";
  app.get("/api/dagalow/users", async (_req, res) => {
    if (!dagalow) return res.status(501).json(notConfigured("DaGalow"));
    const r = await dagalow.from("profiles").select(PROFILES_SELECT).limit(1000);
    return handle(res, r, (d) => mapRows(d, "DaGalow"));
  });
  app.get("/api/perspectiv/users", async (_req, res) => {
    if (!perspectiv) return res.status(501).json(notConfigured("Perspectiv"));
    const r = await perspectiv.from("profiles").select(PROFILES_SELECT).limit(1000);
    return handle(res, r, (d) => mapRows(d, "Perspectiv"));
  });
  app.get("/api/all-users", async (_req, res) => {
    const [ddg, prs] = await Promise.all([
      dagalow
        ? dagalow.from("profiles").select(PROFILES_SELECT).limit(1000)
        : Promise.resolve({ data: [], error: null }),
      perspectiv
        ? perspectiv.from("profiles").select(PROFILES_SELECT).limit(1000)
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (ddg.error) return res.status(500).json({ error: ddg.error.message });
    if (prs.error) return res.status(500).json({ error: prs.error.message });
    return res.json([
      ...(dagalow ? mapRows(ddg.data ?? [], "DaGalow") : []),
      ...(perspectiv ? mapRows(prs.data ?? [], "Perspectiv") : []),
    ]);
  });
  app.get("/api/:source/users/:id", async (req, res) => {
    const { source, id } = req.params;
    const client = pickClient(source);
    if (!client) return res.status(400).json({ error: "Unknown source" });
    const r = await client.from("profiles").select("*").eq("id", id).maybeSingle();
    if (r.error) return res.status(500).json({ error: r.error.message });
    if (!r.data) return res.status(404).json({ error: "Not found" });
    return res.json({ ...r.data, __source: source });
  });

  // ---------- SERVICES / AGGREGATORS ----------
  app.get("/api/:source/users/:id/services", async (req, res) => {
    const { source, id } = req.params;
    const s = String(source).toLowerCase();
    const client = pickClient(source);
    if (s !== "dagalow" || !client) {
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
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  });

  // ---------- BUGS ----------
  app.get("/api/dagalow/bugs", async (_req, res) => {
    if (!dagalow) return res.status(501).json(notConfigured("DaGalow"));
    const r = await dagalow.from("bug_reports").select("*").order("created_at", { ascending: false }).limit(1000);
    return handle(res, r, (d) => mapRows(d, "DaGalow"));
  });
  app.get("/api/perspectiv/bugs", async (_req, res) => {
    if (!perspectiv) return res.status(501).json(notConfigured("Perspectiv"));
    const r = await perspectiv.from("bug_reports").select("*").order("created_at", { ascending: false }).limit(1000);
    return handle(res, r, (d) => mapRows(d, "Perspectiv"));
  });
  app.get("/api/bugs", async (_req, res) => {
    const [ddg, prs] = await Promise.all([
      dagalow ? dagalow.from("bug_reports").select("*").order("created_at", { ascending: false }).limit(1000)
              : Promise.resolve({ data: [], error: null }),
      perspectiv ? perspectiv.from("bug_reports").select("*").order("created_at", { ascending: false }).limit(1000)
                 : Promise.resolve({ data: [], error: null }),
    ]);
    if (ddg.error) return res.status(500).json({ error: ddg.error.message });
    if (prs.error) return res.status(500).json({ error: prs.error.message });
    return res.json([
      ...(ddg.data ? mapRows(ddg.data, "DaGalow") : []),
      ...(prs.data ? mapRows(prs.data, "Perspectiv") : []),
    ]);
  });
  app.post("/api/dagalow/bugs", async (req, res) => {
    if (!dagalow) return res.status(501).json(notConfigured("DaGalow"));
    const { user_id, name, email, description, status } = req.body || {};
    if (!user_id || !name || !email || !description)
      return res.status(400).json({ error: "user_id, name, email, description are required." });
    const { data, error } = await dagalow
      .from("bug_reports").insert({ user_id, name, email, description, status: status || "New" }).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ ...(data?.[0] || {}), __source: "DaGalow" });
  });

  // ---------- TESTIMONIALS ----------
  app.get("/api/dagalow/testimonials", async (_req, res) => {
    if (!dagalow) return res.status(501).json(notConfigured("DaGalow"));
    const r = await dagalow.from("testimonials").select("*").eq("is_approved", true)
      .order("created_at", { ascending: false }).limit(1000);
    return handle(res, r, (d) => mapRows(d, "DaGalow"));
  });
  app.get("/api/perspectiv/testimonials", async (_req, res) => {
    if (!perspectiv) return res.status(501).json(notConfigured("Perspectiv"));
    const r = await perspectiv.from("testimonials").select("*").eq("is_approved", true)
      .order("created_at", { ascending: false }).limit(1000);
    return handle(res, r, (d) => mapRows(d, "Perspectiv"));
  });
  app.get("/api/testimonials", async (_req, res) => {
    const [ddg, prs] = await Promise.all([
      dagalow ? dagalow.from("testimonials").select("*").eq("is_approved", true)
                .order("created_at", { ascending: false }).limit(1000)
              : Promise.resolve({ data: [], error: null }),
      perspectiv ? perspectiv.from("testimonials").select("*").eq("is_approved", true)
                .order("created_at", { ascending: false }).limit(1000)
                 : Promise.resolve({ data: [], error: null }),
    ]);
    if (ddg.error) return res.status(500).json({ error: ddg.error.message });
    if (prs.error) return res.status(500).json({ error: prs.error.message });
    return res.json([
      ...(ddg.data ? mapRows(ddg.data, "DaGalow") : []),
      ...(prs.data ? mapRows(prs.data, "Perspectiv") : []),
    ]);
  });

  // ---------- PITCH REQUESTS ----------
  app.get("/api/dagalow/pitch-requests", async (_req, res) => {
    if (!dagalow) return res.status(501).json(notConfigured("DaGalow"));
    const r = await dagalow.from("pitch_requests").select("*")
      .order("created_at", { ascending: false }).limit(1000);
    return handle(res, r, (d) => mapRows(d, "DaGalow"));
  });
  app.get("/api/pitch-requests", async (_req, res) => {
    if (!dagalow) return res.json([]);
    const r = await dagalow.from("pitch_requests").select("*")
      .order("created_at", { ascending: false }).limit(1000);
    return handle(res, r, (d) => mapRows(d, "DaGalow"));
  });

  // ---------- CALENDAR / APPOINTMENTS ----------
  const monthBounds = (year, month1Based) => {
    const y = Number(year), m0 = Number(month1Based) - 1;
    const from = new Date(Date.UTC(y, m0, 1, 0, 0, 0, 0));
    const to   = new Date(Date.UTC(y, m0 + 1, 1, 0, 0, 0, 0));
    return { from: from.toISOString(), to: to.toISOString() };
  };
  const fetchMonth = (client, fromISO, toISO) =>
    client.from("appointments").select("*")
      .gte("appointment_start", fromISO).lt("appointment_start", toISO)
      .order("appointment_start", { ascending: true }).limit(1000);

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

  // Health
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  return app;
}

// @ts-nocheck
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-62b0d326/health", (c) => {
  return c.json({ status: "ok" });
});

// --- StarWash API ---

app.get("/make-server-62b0d326/api/data", async (c) => {
  const [motos, workers, services, workshops, expenses] = await Promise.all([
    kv.get("starwash_motos"),
    kv.get("starwash_workers"),
    kv.get("starwash_services"),
    kv.get("starwash_workshops"),
    kv.get("starwash_expenses")
  ]);
  
  return c.json({
    motos: motos || [],
    workers: workers || [],
    services: services || [],
    workshops: workshops || [],
    expenses: expenses || []
  });
});

app.post("/make-server-62b0d326/api/sync", async (c) => {
  const { type, data } = await c.req.json();
  
  if (!['motos', 'workers', 'services', 'workshops', 'expenses'].includes(type)) {
    return c.json({ error: "Invalid type" }, 400);
  }
  
  await kv.set(`starwash_${type}`, data);
  return c.json({ success: true });
});

Deno.serve(app.fetch);
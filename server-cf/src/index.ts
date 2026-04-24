/**
 * MatBil Code API — Cloudflare Workers sürümü
 *
 * Express + SQLite referans uygulamasının Hono + D1 portu.
 * Daha ucuz, daha hızlı, küresel CDN üzerinde.
 *
 * Deploy:
 *   1. wrangler login
 *   2. wrangler d1 create matbil_codes   → çıktıdaki UUID'yi wrangler.toml'a yaz
 *   3. npm run db:prod:migrate
 *   4. wrangler secret put ADMIN_TOKEN    (güçlü random değer)
 *   5. npm run deploy
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';

type Bindings = {
  DB: D1Database;
  ADMIN_TOKEN: string;
  ALLOWED_ORIGIN: string;
  MAX_DEVICES_PER_CODE: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ─── Middleware ───
app.use('*', secureHeaders());
app.use('*', async (c, next) => {
  const origin = c.env.ALLOWED_ORIGIN || '*';
  return cors({ origin, allowMethods: ['POST', 'GET', 'OPTIONS'] })(c, next);
});

// Basit IP rate limiter (in-memory, worker instance başına)
// Prod'da Cloudflare Rate Limiting API daha dayanıklı — wrangler.toml'da etkinleştirilebilir
const rateBuckets = new Map<string, { count: number; ts: number }>();
const rateLimit = (limit: number, windowMs: number) => async (c: any, next: any) => {
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const b = rateBuckets.get(ip);
  if (!b || now - b.ts > windowMs) {
    rateBuckets.set(ip, { count: 1, ts: now });
  } else {
    b.count++;
    if (b.count > limit) return c.json({ ok: false, reason: 'rate-limit' }, 429);
  }
  // Periyodik temizlik
  if (rateBuckets.size > 10000) {
    for (const [k, v] of rateBuckets) if (now - v.ts > windowMs) rateBuckets.delete(k);
  }
  return next();
};

// ─── Health ───
app.get('/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }));

// ─── POST /redeem ───
const CODE_PATTERN = /^MTB-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

app.post('/redeem', rateLimit(10, 60_000), async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { code, deviceId } = body;
  if (!code || !deviceId) return c.json({ ok: false, reason: 'format' }, 400);
  if (!CODE_PATTERN.test(code)) return c.json({ ok: false, reason: 'format' }, 400);

  const codeRow = await c.env.DB.prepare('SELECT * FROM codes WHERE code = ?').bind(code).first();
  if (!codeRow) return c.json({ ok: false, reason: 'invalid' }, 404);

  const existing = await c.env.DB.prepare(
    'SELECT 1 FROM redemptions WHERE code = ? AND device_id = ?'
  ).bind(code, deviceId).first();
  if (existing) return c.json({ ok: true, reason: 'already-redeemed' });

  const countRow = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM redemptions WHERE code = ?'
  ).bind(code).first<{ count: number }>();
  const maxDevices = (codeRow as any).max_devices as number;
  if (countRow && countRow.count >= maxDevices) {
    return c.json({ ok: false, reason: 'used' }, 409);
  }

  const ip = c.req.header('cf-connecting-ip') || null;
  const ua = c.req.header('user-agent') || null;
  await c.env.DB.prepare(
    'INSERT INTO redemptions (code, device_id, redeemed_at, ip, user_agent) VALUES (?, ?, ?, ?, ?)'
  ).bind(code, deviceId, new Date().toISOString(), ip, ua).run();

  return c.json({ ok: true, reason: 'new-redemption' });
});

// ─── Admin middleware ───
const requireAdmin = async (c: any, next: any) => {
  const token = c.req.header('x-admin-token');
  if (!token || token !== c.env.ADMIN_TOKEN) {
    return c.json({ error: 'unauthorized' }, 401);
  }
  return next();
};

// ─── POST /admin/codes ───
app.post('/admin/codes', rateLimit(30, 60_000), requireAdmin, async (c) => {
  const { count = 100, batch = 'default', maxDevices } = await c.req.json().catch(() => ({}));
  const max = maxDevices ?? parseInt(c.env.MAX_DEVICES_PER_CODE || '3', 10);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const gen = () => `MTB-${seg()}-${seg()}-${seg()}`;
  const created: string[] = [];
  const now = new Date().toISOString();
  let attempts = 0;
  while (created.length < count && attempts < count * 3) {
    const code = gen();
    const res = await c.env.DB.prepare(
      'INSERT OR IGNORE INTO codes (code, created_at, max_devices, batch) VALUES (?, ?, ?, ?)'
    ).bind(code, now, max, batch).run();
    if (res.success && res.meta.changes > 0) created.push(code);
    attempts++;
  }
  return c.json({ ok: true, created: created.length, codes: created });
});

// ─── GET /admin/stats ───
app.get('/admin/stats', rateLimit(30, 60_000), requireAdmin, async (c) => {
  const t = await c.env.DB.prepare('SELECT COUNT(*) as c FROM codes').first<{ c: number }>();
  const r = await c.env.DB.prepare('SELECT COUNT(*) as c FROM redemptions').first<{ c: number }>();
  const u = await c.env.DB.prepare('SELECT COUNT(DISTINCT code) as c FROM redemptions').first<{ c: number }>();
  const recent = await c.env.DB.prepare(
    'SELECT code, device_id, redeemed_at FROM redemptions ORDER BY redeemed_at DESC LIMIT 20'
  ).all();
  return c.json({
    totalCodes: t?.c ?? 0,
    usedCodes: u?.c ?? 0,
    totalRedemptions: r?.c ?? 0,
    unusedCodes: (t?.c ?? 0) - (u?.c ?? 0),
    recentRedemptions: recent.results,
  });
});

export default app;

/**
 * MatBil - Kitap Kodu Doğrulama API (Referans Uygulama)
 *
 * Bu dosya, Play Store öncesi backend örneğidir. Üç endpoint sağlar:
 *   POST /redeem      - Kod doğrulama + cihaz ilişkilendirme
 *   POST /admin/codes - Yeni kod havuzu oluşturma (admin)
 *   GET  /admin/stats - Kod kullanım istatistikleri (admin)
 *
 * Kurulum:
 *   cd server
 *   npm init -y
 *   npm install express better-sqlite3 cors helmet morgan dotenv
 *   node code-api.js
 *
 * Production için tavsiye:
 *   - Cloudflare Workers + D1 (sunucusuz, ucuz, hızlı)
 *   - Supabase Edge Functions + Postgres
 *   - Fly.io / Railway + PostgreSQL
 *
 * Güvenlik notları:
 *   - ADMIN_TOKEN env değişkeni ile yetkilendirme
 *   - Rate limiting eklenmeli (100 istek/dk/IP)
 *   - HTTPS zorunlu (Play Store gereksinimi)
 *   - CORS: sadece uygulama origin'ine izin ver
 */

const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const db = new Database(process.env.DB_PATH || './matbil-codes.db');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change-me';
const MAX_DEVICES_PER_CODE = parseInt(process.env.MAX_DEVICES_PER_CODE || '3', 10);
const PORT = parseInt(process.env.PORT || '3001', 10);

// ───── Veritabanı ─────
db.exec(`
  CREATE TABLE IF NOT EXISTS codes (
    code TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    max_devices INTEGER NOT NULL DEFAULT 3,
    batch TEXT,
    notes TEXT
  );
  CREATE TABLE IF NOT EXISTS redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    device_id TEXT NOT NULL,
    redeemed_at TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    UNIQUE(code, device_id),
    FOREIGN KEY (code) REFERENCES codes(code)
  );
  CREATE INDEX IF NOT EXISTS idx_redemptions_code ON redemptions(code);
`);

// ───── Middleware ─────
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '10kb' }));
app.use(morgan('tiny'));

// ───── Rate Limiters ─────
// /redeem: IP başına dakikada 10 istek (brute force koruması)
const redeemLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.REDEEM_RATE_LIMIT || '10', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, reason: 'rate-limit' },
});
// /admin/*: IP başına dakikada 30 istek (admin panel)
const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.ADMIN_RATE_LIMIT || '30', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'rate-limit' },
});

// ───── POST /redeem ─────
app.post('/redeem', redeemLimiter, (req, res) => {
  const { code, deviceId } = req.body || {};
  if (!code || !deviceId) {
    return res.status(400).json({ ok: false, reason: 'format' });
  }
  const CODE_PATTERN = /^MTB-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (!CODE_PATTERN.test(code)) {
    return res.status(400).json({ ok: false, reason: 'format' });
  }

  const row = db.prepare('SELECT * FROM codes WHERE code = ?').get(code);
  if (!row) {
    return res.status(404).json({ ok: false, reason: 'invalid' });
  }

  // Bu cihaz zaten kullanmış mı?
  const existing = db.prepare('SELECT 1 FROM redemptions WHERE code = ? AND device_id = ?').get(code, deviceId);
  if (existing) {
    return res.json({ ok: true, reason: 'already-redeemed' });
  }

  // Cihaz limiti aşıldı mı?
  const { count } = db.prepare('SELECT COUNT(*) as count FROM redemptions WHERE code = ?').get(code);
  if (count >= row.max_devices) {
    return res.status(409).json({ ok: false, reason: 'used' });
  }

  // Kaydet
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const ua = req.headers['user-agent'] || null;
  db.prepare(`
    INSERT INTO redemptions (code, device_id, redeemed_at, ip, user_agent)
    VALUES (?, ?, ?, ?, ?)
  `).run(code, deviceId, new Date().toISOString(), ip, ua);

  return res.json({ ok: true, reason: 'new-redemption' });
});

// ───── Admin: Kod havuzu oluştur ─────
app.post('/admin/codes', adminLimiter, (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'unauthorized' });
  const { count = 100, batch = 'default', maxDevices = MAX_DEVICES_PER_CODE } = req.body || {};
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // I, O, 0, 1 kaldırıldı (okunabilirlik)
  const generate = () => {
    const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `MTB-${seg()}-${seg()}-${seg()}`;
  };
  const insert = db.prepare('INSERT OR IGNORE INTO codes (code, created_at, max_devices, batch) VALUES (?, ?, ?, ?)');
  const now = new Date().toISOString();
  const created = [];
  let attempts = 0;
  while (created.length < count && attempts < count * 3) {
    const code = generate();
    const result = insert.run(code, now, maxDevices, batch);
    if (result.changes > 0) created.push(code);
    attempts++;
  }
  res.json({ ok: true, created: created.length, codes: created });
});

// ───── Admin: İstatistikler ─────
app.get('/admin/stats', adminLimiter, (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'unauthorized' });
  const totalCodes = db.prepare('SELECT COUNT(*) as c FROM codes').get().c;
  const totalRedemptions = db.prepare('SELECT COUNT(*) as c FROM redemptions').get().c;
  const usedCodes = db.prepare('SELECT COUNT(DISTINCT code) as c FROM redemptions').get().c;
  const recentRedemptions = db.prepare('SELECT code, device_id, redeemed_at FROM redemptions ORDER BY redeemed_at DESC LIMIT 20').all();
  res.json({ totalCodes, usedCodes, totalRedemptions, unusedCodes: totalCodes - usedCodes, recentRedemptions });
});

// ───── Health ─────
app.get('/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`MatBil Code API :${PORT} — Admin token: ${ADMIN_TOKEN === 'change-me' ? '⚠️ default!' : 'custom ✓'}`);
  console.log(`DB: ${process.env.DB_PATH || './matbil-codes.db'}`);
});

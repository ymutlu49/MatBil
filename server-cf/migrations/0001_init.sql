-- MatBil Code API — D1 şema başlangıcı
-- `wrangler d1 migrations apply matbil_codes --remote` ile uygula.

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
CREATE INDEX IF NOT EXISTS idx_redemptions_device ON redemptions(device_id);
CREATE INDEX IF NOT EXISTS idx_codes_batch ON codes(batch);

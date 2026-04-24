/**
 * Veri Şema Versiyonlama + Migration Altyapısı
 *
 * Neden: Uygulama sürümleri arası veri formatı değişirse (örn. progress'e
 * yeni alan eklenirse) eski kullanıcıların verileri bozulmadan taşınsın.
 *
 * Kullanım:
 *   import { runMigrations, CURRENT_SCHEMA_VERSION } from './schemaMigration';
 *   runMigrations(); // App boot'unda çağrılır
 *
 * Yeni migration ekleme:
 *   1. CURRENT_SCHEMA_VERSION'ı artır
 *   2. migrations dizisine yeni fonksiyon ekle ({ from, to, run })
 *   3. Mevcut veri to-version'a dönüşüp matbil_schema_version güncellenir
 */

const SCHEMA_KEY = 'matbil_schema_version';
export const CURRENT_SCHEMA_VERSION = 2;

// Migration tanımları — sıralı, her biri from→to dönüştürür.
// DİKKAT: Sabit sırada, geri döndürülebilir olacak şekilde yazın.
const migrations = [
  {
    from: 0, // Hiç versiyon kaydı yok (eski sürüm)
    to: 1,
    run: () => {
      // v0→v1: matbil_schema_version anahtarını ekle (marker migration)
      // Gerçek veri değişikliği yok — sadece versiyon işareti oluştur.
      // Bu, gelecekteki migration'ların başlangıç noktası.
    },
  },
  {
    from: 1,
    to: 2,
    run: () => {
      // v1→v2: Progress objelerine 'schemaV' alanı ekle (opsiyonel alan migrasyonu örneği)
      // Bozuk veri bulursa sıfırlamaz, eksik alanları default ile doldurur.
      try {
        const keys = Object.keys(localStorage);
        for (const k of keys) {
          if (!k.startsWith('matbil_progress_')) continue;
          const raw = localStorage.getItem(k);
          if (!raw) continue;
          let obj;
          try { obj = JSON.parse(raw); } catch { continue; }
          if (typeof obj !== 'object' || obj === null) continue;
          // Her oyun için eksik alanları tamamla
          let changed = false;
          for (const gameId of Object.keys(obj)) {
            const g = obj[gameId];
            if (typeof g !== 'object' || g === null) continue;
            if (g.attempts === undefined) { g.attempts = 0; changed = true; }
            if (g.stars === undefined) { g.stars = 0; changed = true; }
            if (g.bestScore === undefined) { g.bestScore = 0; changed = true; }
          }
          if (changed) {
            try { localStorage.setItem(k, JSON.stringify(obj)); } catch {}
          }
        }
      } catch {}
    },
  },
];

/**
 * Mevcut şema versiyonunu döndürür (yoksa 0).
 */
export const getCurrentSchemaVersion = () => {
  try {
    const v = parseInt(localStorage.getItem(SCHEMA_KEY) || '0', 10);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  } catch { return 0; }
};

/**
 * Migration'ları sırayla çalıştır — idempotent.
 * Başarılı migration sonrası schema version kaydedilir.
 * Hata olursa önceki versiyonda kalır (veri güvenliği).
 *
 * @returns {{ from: number, to: number, applied: number[] }}
 */
export const runMigrations = () => {
  const start = getCurrentSchemaVersion();
  const applied = [];
  try {
    let current = start;
    for (const m of migrations) {
      if (m.from === current && m.to <= CURRENT_SCHEMA_VERSION) {
        try {
          m.run();
          current = m.to;
          try { localStorage.setItem(SCHEMA_KEY, String(current)); } catch {}
          applied.push(m.to);
        } catch (err) {
          // Migration başarısız — olduğu yerde dur, kullanıcı verisini koru
          console.warn(`[MatBil] Migration ${m.from}→${m.to} failed:`, err);
          break;
        }
      }
    }
    return { from: start, to: current, applied };
  } catch {
    return { from: start, to: start, applied };
  }
};

/**
 * Test/debug için: şema versiyonunu manuel ayarla.
 * Production kodunda çağrılmamalı.
 */
export const __setSchemaVersion = (v) => {
  try { localStorage.setItem(SCHEMA_KEY, String(v)); } catch {}
};

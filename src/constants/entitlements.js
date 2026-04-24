/**
 * MatBil Entitlement Konfigürasyonu
 *
 * Freemium yaklaşım: Ücretsiz tarama + her kategoriden 1 örnek oyun, premium ile 36 oyun tümü.
 *
 * ÖNEMLİ: `PREMIUM_REQUIRED` false iken HİÇBİR kilitleme yapılmaz.
 * Bu, altyapının mevcut davranışı bozmadan eklenmesi için master switch'tir.
 *
 * Aktivasyon sırası:
 *  1. Kod havuzu + UI hazır olana dek false kalmalı (Faz 1-3)
 *  2. Yalnız Faz 4'te true yapılır, mevcut kullanıcılar migration ile grandfather
 */

// Master switch — true olursa freemium aktifleşir
// Faz 4: Aktif. Grandfather koruması ile mevcut kullanıcılar etkilenmez.
export const PREMIUM_REQUIRED = true;

// Ücretsiz katmandaki oyunlar (her kategoriden 1 temsilci)
export const FREE_GAME_IDS = [
  'A1', // Nokta Avcısı - Algısal sanbil (temel)
  'B1', // Tahmin Kavanozları - Tahmin (temel)
  'C1', // Sayı-Sembol Eşleştirme - Sembolik
  'D1', // Şekli Tanıma - Geometri
  'E3', // Toplama Stratejileri - Aritmetik
  'F1', // Sayısal Bellek - Bilişsel
];

// Ücretsiz erişilebilir özellikler (oyun dışı)
export const FREE_FEATURES = {
  bookChapterTitles: true,  // Kitap bölüm başlıkları + childTheory görünür
  bookChapterAcademic: false, // Akademik panel premium
  parentDashboard: true,    // Veli temel görünüm
  teacherDashboard: true,   // Öğretmen temel (sınıf oluşturma vb.)
  reports: false,           // PDF raporları premium
  activityBooklet: false,   // Etkinlik kitapçığı premium
  badges: true,             // Rozetler görünür
};

// Kitap aktivasyon kodu formatı: MTB-XXXX-XXXX-XXXX (16 karakter + tire)
// Şu an için lokal format doğrulaması, Faz 5'te backend havuzu eklenecek
export const CODE_PATTERN = /^MTB-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

// Demo/test kodları — YALNIZCA dev build'de etkin. Production build'de (import.meta.env.PROD)
// otomatik boşaltılır ki aktivasyon backend'siz kimseye ücretsiz premium verilmesin.
const IS_DEV = (() => {
  try { return !import.meta.env?.PROD; } catch { return false; }
})();

export const DEMO_CODES = new Set(
  IS_DEV
    ? ['MTB-DEMO-2025-BOOK', 'MTB-TEST-0000-0001']
    : []
);

// Dev build mi? UI'de uyarı göstermek için dışa aktarılır.
export const IS_DEV_BUILD = IS_DEV;

// Backend API URL'i — .env dosyasında VITE_CODE_API_URL olarak tanımlanmalı
// Tanımlı değilse lokal DEMO_CODES kullanılır (dev modu)
export const CODE_API_URL = (() => {
  try {
    return import.meta.env?.VITE_CODE_API_URL || null;
  } catch {
    return null;
  }
})();

// Cihaz tanımlayıcısı — crypto.getRandomValues ile kriptografik güçte ID
// Backend bu ID'yi takip eder, max cihaz sayısına göre kodu onaylar
export const getOrCreateDeviceId = () => {
  try {
    let id = localStorage.getItem('matbil_device_id');
    if (!id) {
      // Math.random yerine kriptografik rastgele — tahmin edilemez
      const arr = new Uint8Array(16);
      (crypto.getRandomValues ? crypto : globalThis.crypto).getRandomValues(arr);
      const hex = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
      id = `dev_${hex}`;
      localStorage.setItem('matbil_device_id', id);
    }
    return id;
  } catch {
    // Crypto yoksa fallback (çok eski tarayıcı)
    return 'anon_' + Math.random().toString(36).substring(2, 11);
  }
};

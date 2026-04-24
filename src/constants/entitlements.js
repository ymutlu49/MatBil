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

// Demo/test kodları — Backend yoksa (VITE_CODE_API_URL tanımlı değilse) lokal fallback
// Production'da backend havuzuna geçilir. Dev'de bu kodlarla test edilebilir.
export const DEMO_CODES = new Set([
  'MTB-DEMO-2025-BOOK',
  'MTB-TEST-0000-0001',
]);

// Backend API URL'i — .env dosyasında VITE_CODE_API_URL olarak tanımlanmalı
// Tanımlı değilse lokal DEMO_CODES kullanılır (dev modu)
export const CODE_API_URL = (() => {
  try {
    return import.meta.env?.VITE_CODE_API_URL || null;
  } catch {
    return null;
  }
})();

// Cihaz tanımlayıcısı — aynı kodun farklı cihazlarda yeniden kullanımı için
// Backend bu ID'yi takip eder, max cihaz sayısına göre kodu onaylar
export const getOrCreateDeviceId = () => {
  try {
    let id = localStorage.getItem('matbil_device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem('matbil_device_id', id);
    }
    return id;
  } catch {
    return 'anon_' + Math.random().toString(36).substring(2, 11);
  }
};

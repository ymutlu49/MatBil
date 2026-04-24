export const BADGES = [
  // Kategori rozetleri
  { id: 'sanbil_usta', name: 'Sanbil Ustası', emoji: '👁️‍🗨️', desc: 'Sanbil kategorisindeki tüm oyunlarda en az 2 yıldız', cat: 'A', minStars: 2 },
  { id: 'tahmin_samp', name: 'Tahmin Şampiyonu', emoji: '🎲', desc: 'Tahmin kategorisindeki tüm oyunlarda en az 2 yıldız', cat: 'B', minStars: 2 },
  { id: 'sembol_deha', name: 'Sembol Dehası', emoji: '🔢', desc: 'Sembolik İşleme kategorisindeki tüm oyunlarda en az 2 yıldız', cat: 'C', minStars: 2 },
  { id: 'geometri_kasif', name: 'Geometri Kaşifi', emoji: '📐', desc: 'Geometri kategorisindeki tüm oyunlarda en az 1 yıldız', cat: 'D', minStars: 1 },
  { id: 'aritmetik_yildiz', name: 'Aritmetik Yıldızı', emoji: '➕', desc: 'Aritmetik kategorisindeki tüm oyunlarda en az 2 yıldız', cat: 'E', minStars: 2 },
  { id: 'altin_koleksiyoncu', name: 'Altın Koleksiyoncu', emoji: '🏆', desc: 'Tüm oyunlarda en az 3 yıldız', cat: '*', minStars: 3 },
  { id: 'karar_li', name: 'Kararlı Öğrenci', emoji: '💪', desc: 'Toplam 50 deneme yap', cat: 'attempts', minAttempts: 50 },
  { id: 'bilissel_savas', name: 'Bilişsel Savaşçı', emoji: '🧠', desc: 'Bilişsel Beceriler kategorisindeki tüm oyunlarda en az 1 yıldız', cat: 'F', minStars: 1 },
  { id: 'hafta_yildizi', name: 'Hafta Yıldızı', emoji: '🌟', desc: 'Haftada 4+ gün oyna', cat: 'weekly', minDays: 4 },
  { id: 'cesur_kasif', name: 'Cesur Kaşif', emoji: '🗺️', desc: 'Tüm 6 kategoride en az 1 oyun oyna', cat: 'explorer', minCats: 6 },

  // Kitap bölümü rozetleri (Play Store öncesi kitap ilişkiselliği güçlendirme)
  { id: 'kitap_ch1', name: 'Sayı Hissi Kaşifi', emoji: '🧒', desc: 'Bölüm 1: Doğuştan Gelen Matematik - Tüm oyunlarda en az 2 yıldız', cat: 'chapter', chapterNum: 1, minStars: 2 },
  { id: 'kitap_ch2', name: 'ÜKM Öğrencisi', emoji: '🧠', desc: 'Bölüm 2: Üçlü Kodlama Modeli - Tüm oyunlarda en az 2 yıldız', cat: 'chapter', chapterNum: 2, minStars: 2 },
  { id: 'kitap_ch3', name: 'Sembol Uzmanı', emoji: '🔢', desc: 'Bölüm 3: Sembolik Sayı İşleme - Tüm oyunlarda en az 2 yıldız', cat: 'chapter', chapterNum: 3, minStars: 2 },
  { id: 'kitap_ch4', name: 'Sanbil Dedektifi', emoji: '👁️', desc: 'Bölüm 4: Sanbil Becerisi - Tüm oyunlarda en az 2 yıldız', cat: 'chapter', chapterNum: 4, minStars: 2 },
  { id: 'kitap_ch5', name: 'Tahmin Ustası', emoji: '🎯', desc: 'Bölüm 5: Tahmin Becerisi - Tüm oyunlarda en az 2 yıldız', cat: 'chapter', chapterNum: 5, minStars: 2 },
  { id: 'kitap_ch6', name: 'Geometri Gezgini', emoji: '📐', desc: 'Bölüm 6: Geometri Çekirdek Bilgisi - Tüm oyunlarda en az 1 yıldız', cat: 'chapter', chapterNum: 6, minStars: 1 },
  { id: 'kitap_ch7', name: 'Van Hiele Gezgini', emoji: '🔺', desc: 'Bölüm 7: Sezgiden İspata - Tüm oyunlarda en az 1 yıldız', cat: 'chapter', chapterNum: 7, minStars: 1 },
  { id: 'kitap_ch8', name: 'Uzamsal Dedektif', emoji: '🎓', desc: 'Bölüm 8: Pedagojik Uyarlamalar - Tüm oyunlarda en az 1 yıldız', cat: 'chapter', chapterNum: 8, minStars: 1 },
  { id: 'kitap_ch9', name: 'Beyin Savaşçısı', emoji: '⚡', desc: 'Bölüm 9: Bilişsel Beceriler - Tüm oyunlarda en az 1 yıldız', cat: 'chapter', chapterNum: 9, minStars: 1 },

  // Ana kitap rozeti - tüm bölümler
  { id: 'kitap_ustasi', name: 'Kitap Ustası', emoji: '📚', desc: 'Tüm 9 kitap bölümünde ustalaştın!', cat: 'book_master', minChapters: 9 },
  { id: 'kitap_kasifi', name: 'Kitap Kaşifi', emoji: '📖', desc: 'Kitabın en az 3 bölümünü tamamla', cat: 'book_explorer', minChapters: 3 },
];

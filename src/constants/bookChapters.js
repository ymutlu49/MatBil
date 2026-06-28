/**
 * Kitap bölümleri meta verisi.
 *
 * Not: Öğrenciye dönük "Kitap Bölümleri" özelliği uygulamadan kaldırıldı.
 * Bu liste yalnızca eğitmen/veli panelleri (TeacherDashboard, ParentDashboard)
 * ve QR kod sayfası için bölüm referansı/ilerleme analizinde kullanılır.
 */
export const BOOK_CHAPTERS = [
  { num: 1, title: 'Doğuştan Gelen Matematik', subtitle: 'Çekirdek Bilgi Sistemleri ve Sayı Hissinin Temelleri', categories: ['A', 'B', 'E'], emoji: '🧒', color: 'from-rose-400 to-pink-500' },
  { num: 2, title: 'Üçlü Kodlama Modeli', subtitle: 'Matematiksel Bilişin Sinirbilimsel Haritası', categories: ['C'], emoji: '🧠', color: 'from-blue-400 to-indigo-500' },
  { num: 3, title: 'Sembolik Sayı İşleme', subtitle: 'Kuramsal Temeller ve Bilişsel Zorluklar', categories: ['C'], emoji: '🔢', color: 'from-indigo-400 to-purple-500' },
  { num: 4, title: 'Sanbil Becerisi', subtitle: 'Erken Matematiksel Gelişimin İlk Adımı', categories: ['A', 'E'], emoji: '👁️', color: 'from-red-400 to-rose-500' },
  { num: 5, title: 'Kesinlikten Esnekliğe', subtitle: 'Tahmin Becerisi ve Matematiksel Düşünmenin Olgunlaşması', categories: ['B'], emoji: '🎯', color: 'from-amber-400 to-orange-500' },
  { num: 6, title: 'Geometri Çekirdek Bilgisi', subtitle: 'Şekil Algısı ve Uzamsal Bilişin Temelleri', categories: ['D'], emoji: '📐', color: 'from-emerald-400 to-green-500' },
  { num: 7, title: 'Sezgiden İspata Geçiş', subtitle: 'Geometrik Düşüncenin van Hiele Düzeyleri', categories: ['D'], emoji: '🔺', color: 'from-green-400 to-teal-500' },
  { num: 8, title: 'Bilişsel İlkelerden Evrensel Öğrenme Tasarımına', subtitle: 'Geometride Pedagojik Uyarlamalar', categories: ['D', 'F'], emoji: '🎓', color: 'from-teal-400 to-cyan-500' },
];

export default BOOK_CHAPTERS;

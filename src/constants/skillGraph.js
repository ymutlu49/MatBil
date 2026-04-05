export const SKILL_GRAPH = {
  subitizing: { name: 'Sanbil', games: ['A1','A2','A5','A6'], prereqs: [] },
  counting: { name: 'Sayma', games: ['A3','A4'], prereqs: ['subitizing'] },
  magnitude: { name: 'Büyüklük Algısı', games: ['C2','B3'], prereqs: ['subitizing'] },
  symbolRecog: { name: 'Sembol Tanıma', games: ['C1','C5'], prereqs: [] },
  placeValue: { name: 'Basamak Değeri', games: ['C4'], prereqs: ['symbolRecog','counting'] },
  estimation: { name: 'Tahmin', games: ['B1','B2','B4','B5'], prereqs: ['magnitude','subitizing'] },
  addition: { name: 'Toplama', games: ['E1','E2','E3','E5'], prereqs: ['counting','magnitude'] },
  division: { name: 'Bölme/Gruplama', games: ['E4'], prereqs: ['counting','addition'] },
  shapeRecog: { name: 'Şekil Tanıma', games: ['D1','D2'], prereqs: [] },
  spatialRel: { name: 'Uzamsal İlişkiler', games: ['D3','D4','D5','D6'], prereqs: ['shapeRecog'] },
  transcoding: { name: 'Kodlar Arası Çeviri', games: ['C3','C5'], prereqs: ['symbolRecog','magnitude'] },
};

export const CHAPTER_MAP = {
  A: {
    chapters: ['Bölüm 1: Doğuştan Gelen Matematik','Bölüm 4: Sanbil Becerisi'],
    theory: 'Sanbil (subitizing), küçük nesne kümelerini (1-4) tek tek saymadan, tek bakışta ve anında doğru belirleyebilme kapasitesidir. Bu beceri, algısal sanbil (otomatik tanıma) ve kavramsal sanbil (alt gruplara ayırarak işleme) olmak üzere iki türde incelenir.',
    weakMsg: 'Sanbil becerisi geliştirilmeye ihtiyaç duyuyor. Nokta dizileri ve onluk kartlarla düzenli çalışma önerilir. Clements (1999) ve MacDonald-Wilkins (2016) modelindeki aşamalı etkinlikler uygulanmalıdır.',
    strongMsg: 'Sanbil becerisi güçlü gelişim gösteriyor. Kavramsal sanbil aşamasına geçiş için daha büyük kümelerde esnek gruplama etkinlikleri planlanabilir.',
    refs: 'Clements & Sarama (2020); Dehaene (2011); Kaufman ve ark. (1949); MacDonald & Wilkins (2016); Spelke & Kinzler (2007)'
  },
  B: {
    chapters: ['Bölüm 1: Çekirdek Bilgi Sistemleri','Bölüm 5: Tahmin Becerisi'],
    theory: 'Tahmin becerisi, sayı hissinin en güçlü göstergelerinden biridir. İşlemsel, ölçümsel, nicelik ve sayı doğrusu tahmini olmak üzere dört temel türde ele alınır. Yaklaşık Sayı Sistemi (YSS) ile doğrudan bağlantılıdır.',
    weakMsg: 'Tahmin becerisi desteklenmelidir. Günlük yaşamdan somut tahmin etkinlikleri (kavanoz tahmini, mesafe tahmini) ile YSS hassasiyeti güçlendirilebilir. Sayı doğrusu çalışmaları kritik önem taşır.',
    strongMsg: 'Tahmin becerisi iyi düzeyde. Farklı bağlamlarda (ölçümsel, niceliksel) tahmin çalışmalarıyla esneklik artırılabilir.',
    refs: 'Siegler & Booth (2004); Sowder (1992); Andrews ve ark. (2022); Star & Rittle-Johnson (2009)'
  },
  C: {
    chapters: ['Bölüm 2: Üçlü Kodlama Modeli','Bölüm 3: Sembolik Sayı İşleme'],
    theory: 'Dehaene\'nin Üçlü Kodlama Modeli\'ne göre sayılar beyinde üç kodla temsil edilir: analog büyüklük kodu, görsel-Arap kodu ve işitsel-sözel kod. Sembolik sayı işleme, bu kodlar arası geçişi gerektirir.',
    weakMsg: 'Sembolik sayı işleme güçlendirilmelidir. Sayı-çokluk eşleştirme, basamak değeri ve çoklu gösterim etkinlikleri ile kodlar arası bağlantılar desteklenmelidir. Sembole erişim yetersizliği riski değerlendirilmelidir.',
    strongMsg: 'Sembolik sayı işleme becerisi iyi gelişmiş. Daha karmaşık basamak değeri ve sayı karşılaştırma görevleri ile ileri düzey beceriler desteklenebilir.',
    refs: 'Dehaene (1992, 2011); Rousselle & Noël (2007); Geary (2011)'
  },
  D: {
    chapters: ['Bölüm 6: Geometri Çekirdek Bilgisi','Bölüm 7: van Hiele Düzeyleri','Bölüm 8: Geometride Pedagojik Uyarlamalar'],
    theory: 'Geometrik düşünme, van Hiele\'nin beş düzeyinde gelişir: Görselleştirme → Analiz → İlişkilendirme → Formel Çıkarım → Rigor. Şekil algısı ve uzamsal biliş, matematik başarısının güçlü yordaycılarıdır.',
    weakMsg: 'Geometrik düşünme ve uzamsal beceriler desteklenmelidir. Somut manipülatifler (Tangram, pattern blocks), dinamik geometri yazılımları ve zihinsel döndürme etkinlikleri önerilir.',
    strongMsg: 'Geometrik düşünme güçlü. van Hiele analiz düzeyine geçiş için şekil özelliklerinin sistematik keşfi ve sınıflame etkinlikleri planlanabilir.',
    refs: 'van Hiele (1999); Clements & Battista (1992); Spelke ve ark. (2010); Cheng & Mix (2014)'
  },
  E: {
    chapters: ['Bölüm 1: Çekirdek Bilgi Sistemleri','Bölüm 4: Sanbil ve Aritmetik'],
    theory: 'Temel aritmetik beceriler, sanbil ve sayı hissi temeline inşa edilir. Parça-bütün ilişkisi, toplama stratejileri, eşit paylaştırma ve sayı komşuluğu, çekirdek bilgi sistemlerinin sembolik aritmetiğe dönüşümüdür.',
    weakMsg: 'Temel aritmetik işlemler pekiştirilmelidir. Somut-Temsili-Soyut (CRA) çerçevesinde, manipülatif kullanarak parça-bütün ilişkisi ve toplama stratejileri güçlendirilmelidir.',
    strongMsg: 'Aritmetik beceriler sağlam temele oturuyor. İleri düzey problem çözme ve esnek strateji kullanımı ile beceriler genişletilebilir.',
    refs: 'Gelman & Gallistel (1978); Butterworth ve ark. (2011); Geary (2011)'
  }
};

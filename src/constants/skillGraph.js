export const SKILL_GRAPH = {
  subitizing: { name: 'Sanbil', games: ['A1','A2','A5','A7','A8'], prereqs: [] },
  counting: { name: 'Sayma', games: ['A3','A4','E8'], prereqs: ['subitizing'] },
  magnitude: { name: 'Büyüklük Algısı', games: ['C2','B3'], prereqs: ['subitizing'] },
  symbolRecog: { name: 'Sembol Tanıma', games: ['C1','C5'], prereqs: [] },
  placeValue: { name: 'Basamak Değeri', games: ['C4'], prereqs: ['symbolRecog','counting'] },
  estimation: { name: 'Tahmin', games: ['B1','B2','B4','B5'], prereqs: ['magnitude','subitizing'] },
  addition: { name: 'Toplama', games: ['E1','E2','E3','E5','E6'], prereqs: ['counting','magnitude'] },
  subtraction: { name: 'Çıkarma', games: ['E7'], prereqs: ['counting','addition'] },
  multiplication: { name: 'Çarpma', games: ['E9'], prereqs: ['addition','counting'] },
  division: { name: 'Bölme/Gruplama', games: ['E4'], prereqs: ['counting','addition'] },
  shapeRecog: { name: 'Şekil Tanıma', games: ['D1','D2'], prereqs: [] },
  spatialRel: { name: 'Uzamsal İlişkiler', games: ['D3','D4','D5','D6'], prereqs: ['shapeRecog'] },
  transcoding: { name: 'Kodlar Arası Çeviri', games: ['C3','C5'], prereqs: ['symbolRecog','magnitude'] },
  workingMemory: { name: 'Çalışma Belleği', games: ['F1'], prereqs: ['subitizing'] },
  inhibition: { name: 'İnhibisyon/Stroop', games: ['F2'], prereqs: ['magnitude'] },
  cogFlex: { name: 'Bilişsel Esneklik', games: ['F3'], prereqs: ['counting','addition'] },
};

export const CHAPTER_MAP = {
  A: {
    chapters: [
      'Bölüm 1: Doğuştan Gelen Matematik — Çekirdek Bilgi Sistemleri ve Sayı Hissinin Temelleri',
      'Bölüm 4: Sanbil Becerisinin Erken Matematiksel Gelişimdeki Rolü'
    ],
    theory: 'Sanbil (subitizing), küçük nesne kümelerini (1-4) tek tek saymadan, tek bakışta ve anında doğru belirleyebilme kapasitesidir. Algısal sanbil (otomatik tanıma) ve kavramsal sanbil (alt gruplara ayırarak işleme) olmak üzere iki türde incelenir. Tam Sayma Sistemi (TSS) tarafından desteklenen bu beceri, sayı hissinin temel bileşenlerinden biridir ve ileriki aritmetik becerilerin (sayı ayrıştırma, esnek toplama) gelişimi için kritik bir basamak oluşturur.',
    weakMsg: 'Sanbil becerisi geliştirilmeye ihtiyaç duyuyor. Algısal sanbilden kavramsal sanbile geçiş aşamalı olarak desteklenmelidir: (1) Kanonik (zar deseni) dizilimlerle 1-4 arası anlık tanıma, (2) Beşlik ve onluk çerçevelerle yapısal gruplama, (3) Rastgele dizilimlerde alt-grup stratejileri. Clements (1999) ve MacDonald-Wilkins (2016) modelindeki gelişimsel aşamalar takip edilmelidir.',
    strongMsg: 'Sanbil becerisi güçlü gelişim gösteriyor. Kavramsal sanbil aşamasına geçiş için daha büyük kümelerde (5-9) esnek gruplama etkinlikleri planlanabilir. Parça-bütün ilişkisini destekleyen çoklu-modaliteli (görsel + dokunsal) çalışmalar beceriyi pekiştirecektir.',
    refs: 'Clements (1999); Clements & Sarama (2020); Dehaene (2011); Kaufman ve ark. (1949); Kroesbergen ve ark. (2009); MacDonald & Wilkins (2016); Spelke & Kinzler (2007)',
    childTheory: 'Bu oyunlarda bir bakışta kaç tane olduğunu buluyorsun! Saymadan, gözlerinle hızlıca tanımayı öğreniyorsun. Buna "sanbil" deniyor. Mesela zarı atınca üzerindeki noktaları saymadan bilirsin — işte bu!',
    childWeakMsg: 'Noktaları tanıma konusunda biraz daha pratik yapabilirsin. Zar desenleri, parmak sayıları ve beşlik kartlarla oynadıkça daha hızlı tanıyacaksın! Her gün biraz pratik yapmayı dene.',
    childStrongMsg: 'Harika! Noktaları çok hızlı tanıyorsun. Şimdi daha büyük sayıları gruplar halinde tanımayı deneyebilirsin. Mesela 7 noktayı "5+2" olarak görebilir misin?'
  },
  B: {
    chapters: [
      'Bölüm 1: Doğuştan Gelen Matematik — Yaklaşık Sayı Sistemi (YSS)',
      'Bölüm 5: Tahmin Becerisinin Matematik Eğitimindeki Rolü'
    ],
    theory: 'Tahmin becerisi, sayı hissinin en güçlü ve en görünür göstergelerinden biridir. İşlemsel tahmin (yaklaşık aritmetik), ölçümsel tahmin (fiziksel nicelikleri öngörme), nicelik tahmini (nesne kümelerini değerlendirme) ve sayı doğrusu tahmini olmak üzere dört temel türde ele alınır. Yaklaşık Sayı Sistemi (YSS) ile doğrudan bağlantılı olan tahmin becerisi, mekanik yuvarlamadan farklı olarak bağlama duyarlı, esnek ve stratejik bir bilişsel süreçtir.',
    weakMsg: 'Tahmin becerisi desteklenmelidir. YSS hassasiyetini güçlendirmek için: (1) Günlük yaşamdan somut tahmin etkinlikleri (kavanoz tahmini, mesafe tahmini), (2) Sayı doğrusu üzerinde konum tahminleri, (3) Referans noktası stratejileri (yarı, çeyrek), (4) İşlemsel tahmin çalışmaları (yuvarlama + karşılaştırma). Weber oranına duyarlılığı artıracak kademeli zorluk artışı uygulanmalıdır.',
    strongMsg: 'Tahmin becerisi iyi düzeyde. Farklı bağlamlarda (ölçümsel, niceliksel, işlemsel) tahmin çalışmalarıyla esneklik artırılabilir. Tahmin-doğrulama döngüsü ile üst-bilişsel (metakognitif) farkındalık desteklenebilir.',
    refs: 'Booth & Siegler (2006); Halberda ve ark. (2008); Siegler & Booth (2004); Sowder (1992); Andrews ve ark. (2022); Star & Rittle-Johnson (2009)',
    childTheory: 'Bu oyunlarda "yaklaşık olarak kaç tane?" sorusunu yanıtlıyorsun. Tam sayısını bilmene gerek yok — tahmin etmen yeterli! Tahmin etmek beyninizi matematikte daha güçlü yapıyor.',
    childWeakMsg: 'Tahmin yapmak pratikle gelişir. İpucu: önce küçük bir grubu say, sonra büyük grubun kaç katı olduğunu düşün. Her gün etrafındaki şeyleri tahmin etmeyi dene!',
    childStrongMsg: 'Tahminlerin çok iyi! Sayıların büyüklüğünü iyi hissediyorsun. Şimdi daha büyük sayılarla ve farklı ölçülerle (uzunluk, ağırlık) tahmin yapmayı deneyebilirsin.'
  },
  C: {
    chapters: [
      'Bölüm 2: Üçlü Kodlama Modeli ve Çağdaş Öğretim Yaklaşımları',
      'Bölüm 3: Sembolik Sayı İşleme — Kuramsal Temeller ve Bilişsel Zorluklar'
    ],
    theory: 'Dehaene\'nin Üçlü Kodlama Modeli\'ne (ÜKM) göre sayılar beyinde üç farklı kodla temsil edilir: (1) Analog büyüklük kodu — soyut zihinsel sayı doğrusunda miktar temsili (intraparietal sulkus), (2) Görsel-Arap kodu — rakamların görsel tanınması (ventral oksipitotemporal korteks), (3) İşitsel-sözel kod — sayı sözcükleri ve aritmetik gerçeklerin işlenmesi (sol angular girus). Sembolik sayı işleme, bu kodlar arası geçişi (transcoding) gerektirir. Rousselle ve Noël\'in (2007) Sembole Erişim Yetersizliği teorisine göre, diskalkulinin temel sorunu doğuştan gelen sayı hissindeki zayıflık değil, sembolik temsillerle miktar arasındaki köprünün kurulamamasıdır.',
    weakMsg: 'Sembolik sayı işleme güçlendirilmelidir. Sembole erişim yetersizliği riski değerlendirilmelidir. ÜKM çerçevesinde kodlar arası geçiş desteklenmelidir: (1) Somut-Temsili-Soyut (CRA) pedagojik sıralaması, (2) Çoklu gösterim etkinlikleri (rakam ↔ nokta ↔ sözcük ↔ çetele ↔ onluk çerçeve), (3) Basamak değeri ve sayı karşılaştırma görevleri ile sembol-miktar bağlantısının güçlendirilmesi.',
    strongMsg: 'Sembolik sayı işleme becerisi iyi gelişmiş. Kodlar arası geçiş akıcılığı artırılabilir. Daha karmaşık basamak değeri ayrıştırmaları ve Stroop tipi sayısal büyüklük karşılaştırma görevleri ile ileri düzey becerilerin otomatikleşmesi desteklenebilir.',
    refs: 'Dehaene (1992, 2011); Dehaene & Cohen (1995); Rousselle & Noël (2007); Schwenk ve ark. (2017); Geary (2011); Merkley & Ansari (2016)',
    childTheory: 'Sayıları farklı şekillerde gösterebilirsin: rakamla (3), noktayla (•••), sözcükle (üç), parmaklarla veya çubuklarla. Bu oyunlar beyninizin bunlar arasında hızlıca geçiş yapmasını sağlıyor!',
    childWeakMsg: 'Sayıları farklı biçimlerde tanımak biraz zaman alabilir. Bir sayıyı gördüğünde, onu kaç nokta olduğunu düşünerek canlandırmayı dene. Noktalar, parmaklar ve rakamlar arasında bağlantı kurdukça kolaylaşacak!',
    childStrongMsg: 'Süper! Sayıları farklı gösterimlerle kolayca tanıyorsun. Şimdi daha büyük sayıların basamak değerlerini (onluklar, birlikler) keşfedebilirsin.'
  },
  D: {
    chapters: [
      'Bölüm 6: Geometri Çekirdek Bilgisi — Şekil Algısı ve Uzamsal Bilişin Temelleri',
      'Bölüm 7: Sezgiden İspata Geçiş — Geometrik Düşüncenin Van Hiele Düzeyleri',
      'Bölüm 8: Geometride Pedagojik Uyarlamalar — Matematik Öğrenme Güçlüklerinde Müdahale İlkeleri'
    ],
    theory: 'Matematiksel biliş, sayı ve uzay olmak üzere iki temel sütun üzerine kuruludur. Spelke\'nin İki Çekirdek Geometri Sistemi modeline göre, düzen geometrisi (mekânsal navigasyon, sınırlar) ve nesne geometrisi (şekil özellikleri, ilişkiler) doğuştan gelen evrensel sezgilerdir. Van Hiele\'nin beş düzeyinde geometrik düşünme gelişir: Görselleştirme (Düzey 0) → Analiz (Düzey 1) → İlişkilendirme (Düzey 2) → Formel Çıkarım (Düzey 3) → Rigor (Düzey 4). Piaget\'den farklı olarak van Hiele, ilerlemenin yaşa değil öğretime bağlı olduğunu savunur. ATOM teorisine (Walsh, 2003) göre uzay, zaman ve miktar bilişsel olarak ortak bir nöral metrik paylaşır; bu nedenle uzamsal ve sayısal beceriler birbirini destekler.',
    weakMsg: 'Geometrik düşünme ve uzamsal beceriler desteklenmelidir. İntraparietal sulkustaki (IPS) sayı-uzay kesişimi göz önüne alınarak: (1) Somut manipülatifler (Tangram, pattern blocks) ile şekil özelliklerinin keşfi, (2) Zihinsel döndürme ve simetri etkinlikleri ile uzamsal görselleştirme, (3) Van Hiele öğrenme fazları (bilgi → yönlendirilmiş keşif → açıklama → serbest çalışma → bütünleştirme) takip edilmelidir. Dil desteği (geometrik sözcük dağarcığı) her düzeyde kritik önem taşır.',
    strongMsg: 'Geometrik düşünme güçlü. Van Hiele Analiz düzeyine (Düzey 1) geçiş için şekil özelliklerinin sistematik keşfi ve sınıflama etkinlikleri planlanabilir. Şekiller arası ilişkiler (kare-dikdörtgen ilişkisi gibi) ve mantıksal çıkarım becerileri desteklenebilir.',
    refs: 'van Hiele (1999); Clements & Battista (1992); Spelke & Kinzler (2007); Spelke ve ark. (2010); Dehaene ve ark. (2006); Cheng & Mix (2014); Walsh (2003); Mammarella ve ark. (2018)',
    childTheory: 'Şekiller her yerde! Daire, kare, üçgen... Bu oyunlarda şekilleri tanımayı, özelliklerini (kenar, köşe, açı) keşfetmeyi ve simetri gibi kalıpları bulmayı öğreniyorsun.',
    childWeakMsg: 'Şekilleri tanımak pratikle kolaylaşır. İpucu: bir şekli döndürsen veya boyutunu değiştirsen bile aynı şekil kalır! Kenar ve köşe sayısına odaklanmayı dene. Etrafındaki nesnelerde şekil aramak eğlenceli olabilir!',
    childStrongMsg: 'Şekilleri çok iyi tanıyorsun! Şimdi şekiller arasındaki ilişkileri keşfedebilirsin. Mesela "her kare aynı zamanda bir dikdörtgen midir?" gibi sorular düşünmeyi dene.'
  },
  E: {
    chapters: [
      'Bölüm 1: Doğuştan Gelen Matematik — Sayı Hissi Bileşenleri ve İşlemsel Esneklik',
      'Bölüm 4: Sanbil Becerisinin Aritmetik Becerilere Geçişi'
    ],
    theory: 'Temel aritmetik beceriler, sanbil ve sayı hissi temeline inşa edilir. Parça-bütün ilişkisi, toplama stratejileri (onluğa tamamlama, ikiye katlama, parçalara ayırma), eşit paylaştırma ve sayı komşuluğu (ordinalite), çekirdek bilgi sistemlerinin sembolik aritmetiğe dönüşümüdür. İşlemsel esneklik — farklı çözüm yolları arasında etkili seçim yapabilme — güçlü sayı hissinin en önemli göstergesidir. Somut-Temsili-Soyut (CRA) pedagojik çerçevesi, ÜKM\'nin üç kodunu sınıf içi uygulamaya dönüştüren en etkili yaklaşımdır.',
    weakMsg: 'Temel aritmetik işlemler pekiştirilmelidir. CRA çerçevesinde: (1) Somut düzey — manipülatif ve nesnelerle parça-bütün ilişkisi, (2) Temsili düzey — onluk çerçeve, sayı doğrusu ve diyagramlarla görselleştirme, (3) Soyut düzey — sembolik işlem ve esnek strateji kullanımı. Sayı komşulukları ve sıralama (ordinalite) çalışmalarıyla sayı doğrusu temsili güçlendirilmelidir.',
    strongMsg: 'Aritmetik beceriler sağlam temele oturuyor. İleri düzey problem çözme, esnek strateji kullanımı ve çok adımlı işlemlerle beceriler genişletilebilir. Tahmin-doğrulama döngüsüyle sonuç kontrolü alışkanlığı kazandırılabilir.',
    refs: 'Gelman & Gallistel (1978); Baroody (2006); Butterworth ve ark. (2011); Geary (2011); Jordan ve ark. (2010); Lyons ve ark. (2014)',
    childTheory: 'Toplama, çıkarma ve paylaştırma! Bu oyunlarda sayıları parçalara ayırmayı, bir araya getirmeyi ve sayı doğrusu üzerinde yürümeyi öğreniyorsun.',
    childWeakMsg: 'Toplama ve çıkarma yaparken nesnelerle (parmaklar, küpler) denemek işe yarar. Bir sayıyı parçalara ayırmayı dene: mesela 7 = 3 + 4 veya 5 + 2. Her seferinde farklı parçalar bulabilir misin?',
    childStrongMsg: 'Aritmetikte çok iyisin! Şimdi farklı stratejiler deneyebilirsin: onluğa tamamlama, ikiye katlama veya zıplaya zıplaya sayma gibi. Hangisi sana daha kolay geliyor?'
  },
  F: {
    chapters: [
      'Bölüm 9: Bilişsel Beceriler — Çalışma Belleği, İnhibisyon ve Bilişsel Esneklik'
    ],
    theory: 'Matematik performansı yalnızca sayısal becerilere değil, alan-genel bilişsel becerilere de bağlıdır. Çalışma belleği (bilgiyi geçici olarak tutma ve işleme), inhibisyon (alakasız bilgiyi baskılama, Stroop etkisi) ve bilişsel esneklik (görevler arası geçiş yapma) diskalkülide tutarlı biçimde bozulan üç yürütücü işlevdir. Soltanlou ve ark. (2022) yürütücü işlev eğitiminin aritmetik becerileri önemli ölçüde iyileştirdiğini göstermiştir.',
    weakMsg: 'Bilişsel beceriler desteklenmelidir. Çalışma belleği eğitimi (N-geri görevi), inhibisyon eğitimi (Stroop tipi görevler) ve görev değiştirme alıştırmaları ile yürütücü işlevler güçlendirilebilir. Bu beceriler matematik öğreniminin temelini oluşturur.',
    strongMsg: 'Bilişsel beceriler güçlü. Daha karmaşık çok adımlı problemler ve hızlı görev değiştirme alıştırmaları ile ileri düzey bilişsel esneklik desteklenebilir.',
    refs: 'Soltanlou ve ark. (2022); Alagoz & Kucian (2022); Miyake ve ark. (2000); Diamond (2013)',
    childTheory: 'Bu oyunlarda beynini güçlendiriyorsun! Sayıları hatırlama, dikkatini toplama ve kuralları hızlıca değiştirme — bunlar matematikte sana süper güç veriyor!',
    childWeakMsg: 'Beyin egzersizleri pratikle gelişir. Hatırlama oyunlarını yavaş yavaş zorlaştır. Her gün biraz pratik yapmak beynini güçlendirir!',
    childStrongMsg: 'Harika bir beyin gücün var! Sayıları hatırlama ve dikkatini yönlendirmede çok iyisin. Daha zor seviyelere hazırsın!'
  }
};

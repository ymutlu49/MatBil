/**
 * Akademik İçerik Sabitleri
 * Her kategori (A-F) için yapılandırılmış akademik veri.
 * CHAPTER_MAP'i genişletir — ayrıştırılmış referanslar, temel kavramlar,
 * müdahale adımları ve görselleştirme tipi sağlar.
 */

export const ACADEMIC_CONTENT = {
  A: {
    frameworkVisualType: 'subitizing-progression',
    keyConceptsList: [
      { term: 'Algısal Sanbil', definition: 'Küçük kümeleri (1-4) otomatik olarak, bilinçli sayma sürecine gerek kalmadan anlık tanıma kapasitesi.' },
      { term: 'Kavramsal Sanbil', definition: 'Daha büyük kümeleri (5-9) alt gruplara ayırarak hızlı tanıma stratejisi; örneğin 8 noktayı 5+3 olarak algılama.' },
      { term: 'Tam Sayma Sistemi (TSS)', definition: 'Bire-bir eşleme, kararlı sıra, kardinalite ve soyutlama ilkelerini kapsayan sayma yetkinliği çerçevesi.' },
      { term: 'Parça-Bütün İlişkisi', definition: 'Bir sayının farklı parçalara ayrıştırılabilmesi ve parçaların toplamının bütünü vermesi ilkesi.' },
      { term: 'MacDonald-Wilkins Modeli', definition: 'Sanbil gelişiminin altı aşamalı yol haritası: algısal tanıma → kavramsal gruplama → esnek strateji kullanımı.' },
    ],
    interventionSteps: {
      weak: [
        'Kanonik (zar deseni) dizilimlerle 1-4 arası anlık tanıma çalışmaları yapılmalıdır.',
        'Beşlik ve onluk çerçevelerle yapısal gruplama becerileri desteklenmelidir.',
        'Rastgele dizilimlerde alt-grup stratejileri (ör. 7=4+3) öğretilmelidir.',
        'Clements (1999) ve MacDonald-Wilkins (2016) modelindeki gelişimsel aşamalar sırasıyla takip edilmelidir.',
      ],
      strong: [
        'Daha büyük kümelerde (5-9) esnek gruplama etkinlikleri planlanmalıdır.',
        'Parça-bütün ilişkisini destekleyen çoklu-modaliteli (görsel + dokunsal) çalışmalar yapılmalıdır.',
        'Farklı alt-grup stratejilerini karşılaştırma ve en verimli stratejiyi seçme becerisi geliştirilmelidir.',
      ],
    },
    parsedRefs: [
      { authors: 'Clements, D. H.', year: 1999, title: 'Subitizing: What is it? Why teach it?' },
      { authors: 'Clements, D. H. & Sarama, J.', year: 2020, title: 'Learning and Teaching Early Math: The Learning Trajectories Approach' },
      { authors: 'Dehaene, S.', year: 2011, title: 'The Number Sense: How the Mind Creates Mathematics' },
      { authors: 'Kaufman, E. L., Lord, M. W., Reese, T. W. & Volkmann, J.', year: 1949, title: 'The discrimination of visual number' },
      { authors: 'Kroesbergen, E. H., Van Luit, J. E. H., Van Lieshout, E. C. D. M., Van Loosbroek, E. & Van de Rijt, B. A. M.', year: 2009, title: 'Individual differences in early numeracy' },
      { authors: 'MacDonald, B. L. & Wilkins, J. L. M.', year: 2016, title: 'Seven types of subitizing activity' },
      { authors: 'Spelke, E. S. & Kinzler, K. D.', year: 2007, title: 'Core knowledge' },
    ],
  },

  B: {
    frameworkVisualType: 'ans',
    keyConceptsList: [
      { term: 'Yaklaşık Sayı Sistemi (YSS)', definition: 'Doğuştan gelen, kesin sayım gerektirmeden nicelik karşılaştırması yapabilen bilişsel sistem.' },
      { term: 'Weber Oranı', definition: 'İki niceliğin ayırt edilebilirliğini belirleyen oran; oran küçüldükçe ayırt etme zorlaşır (ör. 8:9 > 8:16).' },
      { term: 'Nicelik Tahmini', definition: 'Bir nesne kümesindeki eleman sayısını, tek tek saymadan yaklaşık olarak değerlendirme becerisi.' },
      { term: 'Sayı Doğrusu Tahmini', definition: 'Bir sayının sayı doğrusu üzerindeki oransal konumunu sezgisel olarak belirleyebilme yetisi.' },
      { term: 'Referans Noktası Stratejisi', definition: 'Bilinen değerleri (yarı, çeyrek) kullanarak bilinmeyen nicelikler hakkında daha doğru tahminler yapma tekniği.' },
    ],
    interventionSteps: {
      weak: [
        'Günlük yaşamdan somut tahmin etkinlikleri (kavanoz tahmini, mesafe tahmini) ile başlanmalıdır.',
        'Sayı doğrusu üzerinde konum tahminleri yapılarak zihinsel temsil güçlendirilmelidir.',
        'Referans noktası stratejileri (yarı, çeyrek) sistematik olarak öğretilmelidir.',
        'Weber oranına duyarlılığı artıracak kademeli zorluk artışı uygulanmalıdır.',
      ],
      strong: [
        'Farklı bağlamlarda (ölçümsel, niceliksel, işlemsel) tahmin çalışmalarıyla esneklik artırılmalıdır.',
        'Tahmin-doğrulama döngüsü ile üst-bilişsel (metakognitif) farkındalık desteklenmelidir.',
        'Daha karmaşık nicelik ilişkileri (oran-orantı) tahmin çalışmalarına geçilmelidir.',
      ],
    },
    parsedRefs: [
      { authors: 'Booth, J. L. & Siegler, R. S.', year: 2006, title: 'Developmental and individual differences in pure numerical estimation' },
      { authors: 'Halberda, J., Mazzocco, M. M. M. & Feigenson, L.', year: 2008, title: 'Individual differences in non-verbal number acuity correlate with maths achievement' },
      { authors: 'Siegler, R. S. & Booth, J. L.', year: 2004, title: 'Development of numerical estimation in young children' },
      { authors: 'Sowder, J.', year: 1992, title: 'Estimation and number sense' },
      { authors: 'Andrews, P., Xenofontos, C. & Sayers, J.', year: 2022, title: 'Estimation in the primary mathematics curricula of the European Union' },
      { authors: 'Star, J. R. & Rittle-Johnson, B.', year: 2009, title: 'It pays to compare: An experimental study on computational estimation' },
    ],
  },

  C: {
    frameworkVisualType: 'triplecode',
    keyConceptsList: [
      { term: 'Analog Büyüklük Kodu', definition: 'İntraparietal sulkusta (IPS) yer alan, soyut zihinsel sayı doğrusunda miktarın temsil edildiği nöral kod.' },
      { term: 'Görsel-Arap Kodu', definition: 'Ventral oksipitotemporal kortekste rakamların görsel tanınmasını sağlayan nöral kod (ör. "3" sembolünü tanıma).' },
      { term: 'İşitsel-Sözel Kod', definition: 'Sol angular girusta sayı sözcüklerinin ve aritmetik gerçeklerin işlendiği nöral kod (ör. "üç" sözcüğünü anlama).' },
      { term: 'Kodlar Arası Geçiş (Transcoding)', definition: 'Üç kod arasında dönüşüm yapabilme becerisi; diskalkulide en çok zorlanan süreç.' },
      { term: 'Sembole Erişim Yetersizliği', definition: 'Rousselle ve Noël (2007) teorisine göre diskalkulinin temel sorunu doğuştan sayı hissi eksikliği değil, sembol-miktar köprüsünün kurulamamasıdır.' },
      { term: 'CRA Pedagojisi', definition: 'Somut (concrete) → Temsili (representational) → Soyut (abstract) öğretim sıralaması; ÜKM\'yi sınıf uygulamasına dönüştüren çerçeve.' },
    ],
    interventionSteps: {
      weak: [
        'Somut-Temsili-Soyut (CRA) pedagojik sıralaması takip edilmelidir.',
        'Çoklu gösterim etkinlikleri (rakam ↔ nokta ↔ sözcük ↔ çetele ↔ onluk çerçeve) düzenli yapılmalıdır.',
        'Basamak değeri ve sayı karşılaştırma görevleri ile sembol-miktar bağlantısı güçlendirilmelidir.',
      ],
      strong: [
        'Kodlar arası geçiş akıcılığı hız çalışmalarıyla artırılmalıdır.',
        'Daha karmaşık basamak değeri ayrıştırmaları (yüzlükler, binlikler) çalışılmalıdır.',
        'Stroop tipi sayısal büyüklük karşılaştırma görevleri ile otomatikleşme desteklenmelidir.',
      ],
    },
    parsedRefs: [
      { authors: 'Dehaene, S.', year: 1992, title: 'Varieties of numerical abilities' },
      { authors: 'Dehaene, S.', year: 2011, title: 'The Number Sense: How the Mind Creates Mathematics' },
      { authors: 'Dehaene, S. & Cohen, L.', year: 1995, title: 'Towards an anatomical and functional model of number processing' },
      { authors: 'Rousselle, L. & Noël, M.-P.', year: 2007, title: 'Basic numerical skills in children with mathematics learning disabilities: A comparison of symbolic vs. non-symbolic number magnitude processing' },
      { authors: 'Schwenk, C., Sasanguie, D., Kuhn, J.-T., Kempe, S., Doebler, P. & Landerl, K.', year: 2017, title: 'Non-symbolic magnitude processing in children with mathematical difficulties' },
      { authors: 'Merkley, R. & Ansari, D.', year: 2016, title: 'Why numerical symbols count in the development of mathematical skills' },
    ],
  },

  D: {
    frameworkVisualType: 'vanhiele',
    keyConceptsList: [
      { term: 'Görselleştirme (Düzey 0)', definition: 'Şekillerin bütünsel görünümüne göre tanınması; özellikler bilinçli analiz edilmez.' },
      { term: 'Analiz (Düzey 1)', definition: 'Şekillerin kenar, köşe, açı gibi özellikleriyle tanımlanması; sınıflama yapılabilir.' },
      { term: 'İlişkilendirme (Düzey 2)', definition: 'Şekiller arası mantıksal ilişkilerin kurulması; ör. her kare bir dikdörtgendir çıkarımı.' },
      { term: 'ATOM Teorisi (Walsh, 2003)', definition: 'Uzay, zaman ve miktar bilişinin intraparietal sulkusta (IPS) ortak bir nöral metrik paylaştığı görüşü.' },
      { term: 'Düzen Geometrisi', definition: 'Spelke\'nin çekirdek sistemlerinden biri; mekânsal navigasyon, sınırlar ve büyük ölçekli uzay algısı.' },
      { term: 'Nesne Geometrisi', definition: 'Spelke\'nin çekirdek sistemlerinden biri; şekil özellikleri, nesne ilişkileri ve küçük ölçekli uzay algısı.' },
    ],
    interventionSteps: {
      weak: [
        'Somut manipülatifler (Tangram, pattern blocks) ile şekil özelliklerinin keşfi yapılmalıdır.',
        'Zihinsel döndürme ve simetri etkinlikleri ile uzamsal görselleştirme desteklenmelidir.',
        'Van Hiele öğrenme fazları (bilgi → yönlendirilmiş keşif → açıklama → serbest çalışma → bütünleştirme) takip edilmelidir.',
        'Dil desteği (geometrik sözcük dağarcığı) her düzeyde sağlanmalıdır.',
      ],
      strong: [
        'Şekil özelliklerinin sistematik keşfi ve alt sınıflama etkinlikleri planlanmalıdır.',
        'Şekiller arası ilişkiler (kare-dikdörtgen, eşkenar-ikizkenar üçgen) ile mantıksal çıkarım becerileri desteklenmelidir.',
        'Koordinat düzlemi ve dönüşüm geometrisine (öteleme, yansıma, döndürme) giriş yapılmalıdır.',
      ],
    },
    parsedRefs: [
      { authors: 'van Hiele, P. M.', year: 1999, title: 'Developing geometric thinking through activities that begin with play' },
      { authors: 'Clements, D. H. & Battista, M. T.', year: 1992, title: 'Geometry and spatial reasoning' },
      { authors: 'Spelke, E. S. & Kinzler, K. D.', year: 2007, title: 'Core knowledge' },
      { authors: 'Spelke, E. S., Lee, S. A. & Izard, V.', year: 2010, title: 'Beyond core knowledge: Natural geometry' },
      { authors: 'Dehaene, S., Izard, V., Pica, P. & Spelke, E.', year: 2006, title: 'Core knowledge of geometry in an Amazonian indigene group' },
      { authors: 'Cheng, Y.-L. & Mix, K. S.', year: 2014, title: 'Spatial training improves children\'s mathematics ability' },
      { authors: 'Walsh, V.', year: 2003, title: 'A theory of magnitude: Common cortical metrics of time, space and quantity' },
      { authors: 'Mammarella, I. C., Caviola, S., Giofrè, D. & Szűcs, D.', year: 2018, title: 'The underlying structure of visuospatial working memory in children with mathematical learning disability' },
    ],
  },

  E: {
    frameworkVisualType: 'cra',
    keyConceptsList: [
      { term: 'CRA Pedagojik Çerçevesi', definition: 'Somut (nesne) → Temsili (görsel model) → Soyut (sembol) sıralamasıyla kavram öğretimi; ÜKM\'nin sınıf uygulaması.' },
      { term: 'Parça-Bütün İlişkisi', definition: 'Bir sayının farklı parçalara ayrıştırılabilmesi (ör. 7 = 3+4 = 5+2); toplama ve çıkarmanın kavramsal temeli.' },
      { term: 'İşlemsel Esneklik', definition: 'Farklı çözüm yolları arasında bağlama uygun seçim yapabilme; güçlü sayı hissinin en önemli göstergesi.' },
      { term: 'Ordinalite', definition: 'Sayıların sıralılık özelliği; bir sayının dizideki konumunu anlama (ör. 5\'ten önce 4, sonra 6 gelir).' },
      { term: 'Bedenleşmiş Biliş', definition: 'Fiziksel hareketle matematiği bütünleştirme yaklaşımı; Link ve ark. (2013) sayı doğrusu yürüyüşünün toplama performansını artırdığını gösterdi.' },
    ],
    interventionSteps: {
      weak: [
        'Somut düzeyde manipülatif ve nesnelerle parça-bütün ilişkisi çalışılmalıdır.',
        'Temsili düzeyde onluk çerçeve, sayı doğrusu ve diyagramlarla görselleştirme yapılmalıdır.',
        'Soyut düzeyde sembolik işlem ve esnek strateji kullanımı (onluğa tamamlama, ikiye katlama) desteklenmelidir.',
        'Sayı komşulukları ve sıralama (ordinalite) çalışmalarıyla sayı doğrusu temsili güçlendirilmelidir.',
      ],
      strong: [
        'İleri düzey problem çözme ve çok adımlı işlemlerle beceriler genişletilmelidir.',
        'Tahmin-doğrulama döngüsüyle sonuç kontrolü alışkanlığı kazandırılmalıdır.',
        'Farklı stratejileri karşılaştırma ve en verimli stratejiyi gerekçelendirme çalışmaları yapılmalıdır.',
      ],
    },
    parsedRefs: [
      { authors: 'Gelman, R. & Gallistel, C. R.', year: 1978, title: 'The Child\'s Understanding of Number' },
      { authors: 'Baroody, A. J.', year: 2006, title: 'Why children have difficulties mastering the basic number combinations and how to help them' },
      { authors: 'Butterworth, B., Varma, S. & Laurillard, D.', year: 2011, title: 'Dyscalculia: From brain to education' },
      { authors: 'Geary, D. C.', year: 2011, title: 'Cognitive predictors of achievement growth in mathematics' },
      { authors: 'Jordan, N. C., Glutting, J. & Ramineni, C.', year: 2010, title: 'The importance of number sense to mathematics achievement in first and third grades' },
      { authors: 'Link, T., Moeller, K., Huber, S., Fischer, U. & Nuerk, H.-C.', year: 2013, title: 'Walk the number line: An embodied training of numerical concepts' },
      { authors: 'Lyons, I. M., Price, G. R., Vaessen, A., Blomert, L. & Ansari, D.', year: 2014, title: 'Numerical predictors of arithmetic success in grades 1-6' },
    ],
  },

  F: {
    frameworkVisualType: 'executive',
    keyConceptsList: [
      { term: 'Çalışma Belleği', definition: 'Bilgiyi geçici olarak bellekte tutma ve aynı anda işleme kapasitesi; çok basamaklı işlemler için temel.' },
      { term: 'İnhibisyon', definition: 'Otomatik ancak yanlış tepkileri bastırabilme yetisi; Stroop etkisinde fiziksel büyüklüğü görmezden gelip sayısal değere odaklanma.' },
      { term: 'Bilişsel Esneklik', definition: 'Görevler veya kurallar arası hızlı geçiş yapabilme becerisi; farklı işlem türleri arasında geçiş maliyetini azaltma.' },
      { term: 'Stroop Etkisi', definition: 'Uyumsuz uyaranlarda (büyük puntolu küçük sayı) otomatik tepkinin doğru tepkiyle çakışması olgusu.' },
      { term: 'N-Geri Görevi', definition: 'Çalışma belleği kapasitesini ölçen paradigma; gösterilen uyaranı N adım öncekiyle karşılaştırma gerektirir.' },
    ],
    interventionSteps: {
      weak: [
        'Çalışma belleği eğitimi (N-geri görevi) düzenli ve kademeli zorluk artışıyla yapılmalıdır.',
        'İnhibisyon eğitimi (Stroop tipi görevler) ile otomatik tepkilerin bastırılması çalışılmalıdır.',
        'Görev değiştirme alıştırmaları ile bilişsel esneklik desteklenmelidir.',
      ],
      strong: [
        'Daha karmaşık çok adımlı problemler ile çalışma belleği kapasitesi zorlanmalıdır.',
        'Hızlı görev değiştirme alıştırmaları ile geçiş maliyeti minimize edilmelidir.',
        'Üç yürütücü işlevin birlikte kullanıldığı karmaşık görevlere geçilmelidir.',
      ],
    },
    parsedRefs: [
      { authors: 'Soltanlou, M., Artemenko, C., Dresler, T., Fallgatter, A. J., Ehlis, A.-C. & Nuerk, H.-C.', year: 2022, title: 'Executive function training improves arithmetic' },
      { authors: 'Alagöz, E. & Kucian, K.', year: 2022, title: 'Developmental dyscalculia: A review of causes, risk factors, and interventions' },
      { authors: 'Miyake, A., Friedman, N. P., Emerson, M. J., Witzki, A. H., Howerter, A. & Wager, T. D.', year: 2000, title: 'The unity and diversity of executive functions and their contributions to complex frontal lobe tasks' },
      { authors: 'Diamond, A.', year: 2013, title: 'Executive functions' },
    ],
  },
};

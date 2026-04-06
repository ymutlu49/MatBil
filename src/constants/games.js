import { lazy } from 'react';

// Lazy-loaded game components
const NoktaAvcisi = lazy(() => import('../components/games/category-a/NoktaAvcisi'));
const ParmakSansi = lazy(() => import('../components/games/category-a/ParmakSansi'));
const HafizaOyunu = lazy(() => import('../components/games/category-a/HafizaOyunu'));
const GruplamaUstasi = lazy(() => import('../components/games/category-a/GruplamaUstasi'));
const GunlukSanbil = lazy(() => import('../components/games/category-a/GunlukSanbil'));

const NoktaKarsilastirma = lazy(() => import('../components/games/category-a/NoktaKarsilastirma'));
const SayiAyristirma = lazy(() => import('../components/games/category-a/SayiAyristirma'));

const TahminKavanozlari = lazy(() => import('../components/games/category-b/TahminKavanozlari'));
const SayiDogrusu = lazy(() => import('../components/games/category-b/SayiDogrusu'));
const ReferansNoktasi = lazy(() => import('../components/games/category-b/ReferansNoktasi'));
const OlcmeTahmini = lazy(() => import('../components/games/category-b/OlcmeTahmini'));
const HesaplamaliTahmin = lazy(() => import('../components/games/category-b/HesaplamaliTahmin'));

const SayiSembolEslestirme = lazy(() => import('../components/games/category-c/SayiSembolEslestirme'));
const SayiKarsilastirma = lazy(() => import('../components/games/category-c/SayiKarsilastirma'));
const CokluGosterim = lazy(() => import('../components/games/category-c/CokluGosterim'));
const BasamakDegeri = lazy(() => import('../components/games/category-c/BasamakDegeri'));
const KodCevirici = lazy(() => import('../components/games/category-c/KodCevirici'));

const SekilTanima = lazy(() => import('../components/games/category-d/SekilTanima'));
const ElemanVeOzellikler = lazy(() => import('../components/games/category-d/ElemanVeOzellikler'));
const IliskilerVeCikarim = lazy(() => import('../components/games/category-d/IliskilerVeCikarim'));
const YonVeMesafe = lazy(() => import('../components/games/category-d/YonVeMesafe'));
const ZihinselDondurme = lazy(() => import('../components/games/category-d/ZihinselDondurme'));
const SimetriAynasi = lazy(() => import('../components/games/category-d/SimetriAynasi'));

const KomsuSayilar = lazy(() => import('../components/games/category-e/KomsuSayilar'));
const ParcaButun = lazy(() => import('../components/games/category-e/ParcaButun'));
const ToplamaStratejileri = lazy(() => import('../components/games/category-e/ToplamaStratejileri'));
const BolusmeZamani = lazy(() => import('../components/games/category-e/BolusmeZamani'));
const SayiDogrusuYurume = lazy(() => import('../components/games/category-e/SayiDogrusuYurume'));
const SayiBaglari = lazy(() => import('../components/games/category-e/SayiBaglari'));
const CikarmaStratejileri = lazy(() => import('../components/games/category-e/CikarmaStratejileri'));
const GeriSayma = lazy(() => import('../components/games/category-e/GeriSayma'));
const CarpmaKavrami = lazy(() => import('../components/games/category-e/CarpmaKavrami'));

const SayisalBellek = lazy(() => import('../components/games/category-f/SayisalBellek'));
const SayisalStroop = lazy(() => import('../components/games/category-f/SayisalStroop'));
const GorevDegistirme = lazy(() => import('../components/games/category-f/GorevDegistirme'));

export const GAMES = {
  A1: { comp: NoktaAvcisi, name: 'Nokta Avcısı', emoji: '🎯', cat: 'A', levels: ['⭐ Seviye 1 (1-4, 2sn)','⭐⭐ Seviye 2 (2-5, 1.5sn)','⭐⭐⭐ Seviye 3 (3-7, 1.2sn)','⭐⭐⭐⭐ Seviye 4 (4-9, 1sn)'], instr: 'Ekranda noktalar kısa süreligiğine görünüp kaybolacak. Kaç nokta olduğunu saymadan, bir bakışta bulmaya çalış!' },
  A2: { comp: ParmakSansi, name: 'Kaç Parmak?', emoji: '🖐️', cat: 'A', levels: ['Seviye 1 (1-5)','Seviye 2 (1-7)','Seviye 3 (1-10)','Seviye 4 (1-10 Hızlı)'], instr: 'Ekranda bir veya iki el gösterilecek. Açık parmakların sayısını tek bakışta tanı ve doğru sayıyı seç!' },
  A3: { comp: HafizaOyunu, name: 'Hafıza Oyunu', emoji: '🧠', cat: 'A', levels: ['Kolay (1-4)','Orta (5-9)','Zor (1-9)'], instr: 'Kartları ikişer ikişer çevir. Aynı sayıyı gösteren iki kartı bulursan eşleşir ve açık kalır. Tüm çiftleri bulmaya çalış!' },
  A4: { comp: GruplamaUstasi, name: 'Gruplama Ustası', emoji: '📦', cat: 'A', levels: ['Beşlik (1 kart)','Beşlik (2 kart)','Onluk (1 kart)','Karışık'], instr: 'Beşlik veya onluk çerçeveler gösterilecek. Dolu kutuları sayarak toplamın kaç olduğunu bul!' },
  A5: { comp: GunlukSanbil, name: 'Günlük Sanbil', emoji: '🏠', cat: 'A', levels: ['Seviye 1 (2-5, 3sn)','Seviye 2 (2-6, 2.5sn)','Seviye 3 (2-7, 2sn)','Seviye 4 (2-8, 1.5sn)'], instr: 'Meyve, çiçek veya oyuncak gibi nesneler kısa süreligiğine görünüp kaybolacak. Kaç tane olduğunu saymadan bul!' },
  A7: { comp: NoktaKarsilastirma, name: 'Nokta Karşılaştırma', emoji: '👀', cat: 'A', levels: ['Kolay','Orta','Zor','Uzman'], instr: 'İki nokta kümesinden hangisinde daha çok var? Saymadan, bir bakışta karar ver! Yaklaşık Sayı Sistemi (YSS) hassasiyetini ölçer.' },
  A8: { comp: SayiAyristirma, name: 'Sayı Ayrıştırma', emoji: '🔀', cat: 'A', levels: ['Seviye 1 (5-6)','Seviye 2 (6-8)','Seviye 3 (Gruplama)','Seviye 4 (Strateji)'], instr: 'Noktaları alt gruplara ayır! Kavramsal sanbil becerisini geliştir. Büyük kümeleri küçük parçalara böl.' },
  B1: { comp: TahminKavanozlari, name: 'Tahmin Kavanozları', emoji: '🫙', cat: 'B', levels: ['Seviye 1 (5-15)','Seviye 2 (10-25)','Seviye 3 (15-35)','Seviye 4 (20-50)'], instr: 'Kavanozdaki bilyelere bak ve kaç tane olduğunu tahmin et. Artı/eksi butonlarıyla sayını ayarla ve gönder! Yakın tahminler de puan kazandırır.' },
  B2: { comp: SayiDogrusu, name: 'Sayı Doğrusu', emoji: '📏', cat: 'B', levels: ['Seviye 1 (0-10)','Seviye 2 (0-100)','Seviye 3 (0-1000)'], instr: 'Sayı doğrusu üzerinde bir ok gösterilecek. Okun gösterdiği sayıyı seçenekler arasından bul!' },
  B3: { comp: ReferansNoktasi, name: 'Yakınlık Tahmini', emoji: '🎯', cat: 'B', levels: ['Seviye 1 (0-5-10)','Seviye 2 (0-10-20)','Seviye 3 (0-25-50)','Seviye 4 (0-50-100)'], instr: 'Bir sayı gösterilecek. Bu sayı, verilen iki referans noktasından hangisine daha yakın? Doğru olanı seç!' },
  B4: { comp: OlcmeTahmini, name: 'Ölçme Tahmini', emoji: '📐', cat: 'B', levels: ['Uzunluk Kolay','Uzunluk İleri','Kütle/Hacim Kolay','Kütle/Hacim İleri'], instr: 'Bir referans nesne ve onun ölçüsü gösterilecek. Hedef nesnenin ölçüsünü karşılaştırarak tahmin et!' },
  B5: { comp: HesaplamaliTahmin, name: 'Hesaplamalı Tahmin', emoji: '🧮', cat: 'B', levels: ['Nesne ölçüleri','Yüzde ve kesir','Hız-zaman-oran','Oran-orantı, alan'], instr: 'Günlük hayattan tahmin soruları! Tam hesaplamadan, yaklaşık düşünerek en iyi tahmini seç.' },
  C1: { comp: SayiSembolEslestirme, name: 'Sayı-Sembol Eşleştirme', emoji: '🔗', cat: 'C', levels: ['Seviye 1 (1-5)','Seviye 2 (1-10)','Seviye 3 (1-15)','Seviye 4 (1-20)'], instr: 'Sayıyı farklı temsillerle eşleştir: rakam, nokta, sözcük, çetele, parmak ve onluk çerçeve!' },
  C2: { comp: SayiKarsilastirma, name: 'Büyük-Küçük', emoji: '⚖️', cat: 'C', levels: ['0-10 (Stroop)','0-10 (çoklu temsil)','0-100 (karışık)','0-100 (3 sayı)'], instr: 'Hangisi daha çok? Sayısal Stroop etkisiyle boyutuna aldanma, değere odaklan!' },
  C3: { comp: CokluGosterim, name: 'Çoklu Gösterim', emoji: '🔮', cat: 'C', levels: ['Seviye 1 (1-5)','Seviye 2 (1-10)','Seviye 3 (1-15)','Seviye 4 (1-20)'], instr: 'Bir sayının farklı temsillerini tanı: rakam, sözcük, nokta, çetele, parmak, onluk çerçeve ve nesne!' },
  C5: { comp: KodCevirici, name: 'Kod Çevirici', emoji: '🔄', cat: 'C', levels: ['Nokta↔Rakam (1-5)','Rakam↔Sözcük (1-10)','Üçlü Kod (1-10)','Dörtlü Kod (1-20)'], instr: 'Aynı sayıyı farklı biçimlerde tanı! Nokta↔Rakam↔Sözcük arasında çeviri yap.' },
  C4: { comp: BasamakDegeri, name: 'Basamak Değeri', emoji: '🏛️', cat: 'C', levels: ['Onluklar','Birlikler','Birleştir','Yüzlükler'], instr: 'Bir sayı gösterilecek ve bir basamak sorulacak. O basamaktaki rakamın değerini bul! Onluk, birlik ve yüzlük basamakları öğren.' },
  D1: { comp: SekilTanima, name: '1) Şekli Tanıma', emoji: '🔍', cat: 'D', sub: 'Küçük Uzay', levels: ['Düzey 1a (Temel)','Düzey 1b (Boyut)','Düzey 1c (Konumlanış)','Düzey 1d (Karışık)','Düzey 1e (Tam)'], instr: 'Çeşitli şekiller gösterilecek. İstenen geometrik şekli bul ve üzerine dokun! Renk veya boyut farklı olabilir. Renk veya boyut değişse de şekli tanı.' },
  D2: { comp: ElemanVeOzellikler, name: '2) Eleman ve Özellikler', emoji: '🔎', cat: 'D', sub: 'Küçük Uzay', levels: ['Düzey 2a (Temel)','Düzey 2b (Orta)','Düzey 2c (Tanımlama)','Düzey 2d (Özellik)'], instr: 'Bir şekil gösterilecek ve kenar, köşe veya açı sayısı sorulacak. Doğru cevabı bul!' },
  D3: { comp: IliskilerVeCikarim, name: '3) İlişkiler ve Çıkarım', emoji: '🔗', cat: 'D', sub: 'Küçük Uzay', levels: ['Düzey 3a (Temel)','Düzey 3b (Orta)','Düzey 3c (İleri)','Düzey 3d (Uzman)'], instr: 'Şekiller hakkında ifadeler gösterilecek. Doğru olan tüm ifadeleri seç! Dikkat: birden fazla doğru olabilir.' },
  D4: { comp: YonVeMesafe, name: '4) Yön ve Mesafe', emoji: '🧭', cat: 'D', sub: 'Büyük Uzay', levels: ['Sol/Sağ','Üst/Alt','4 Yön Karışık','Çoklu Nesne'], instr: 'Izgarada iki nesne gösterilecek. Birinin diğerine göre konumunu (sol, sağ, üst, alt) bul!' },
  D5: { comp: ZihinselDondurme, name: '5) Zihinsel Döndürme', emoji: '🔄', cat: 'D', sub: 'Küçük Uzay', levels: ['Kolay (90°)','Orta (aynalı)','Zor (45°)','Uzman'], instr: 'Şekli zihninde döndür! Hedef şeklin döndürülmüş halini bul.' },
  D6: { comp: SimetriAynasi, name: '6) Simetri Aynası', emoji: '🪞', cat: 'D', sub: 'Küçük Uzay', levels: ['3x3 Kolay','3x3 Orta','4x4 Zor','4x4 Uzman'], instr: 'Deseni simetri eksenine göre tamamla!' },
  E1: { comp: KomsuSayilar, name: 'Komşu Sayılar', emoji: '🔢', cat: 'E', levels: ['Seviye 1 (1-10, temel)','Seviye 2 (1-20, iki boşluk)','Seviye 3 (1-50, geri sayma)','Seviye 4 (1-100, ritmik)'], instr: 'Sayı dizisindeki boşlukları doldur! Önceki, sonraki, aradaki ve ritmik sayma.' },
  E2: { comp: ParcaButun, name: 'Parça-Bütün', emoji: '🧩', cat: 'E', levels: ['Seviye 1 (1-5)','Seviye 2 (1-10)','Seviye 3 (1-10 İleri)','Seviye 4 (1-15)'], instr: 'Üçgenin köşelerindeki sayılar arasındaki ilişkiyi bul. İki parçanın toplamı bütüne eşittir.' },
  E3: { comp: ToplamaStratejileri, name: 'Toplama Stratejileri', emoji: '➕', cat: 'E', levels: ['Seviye 1 (1-5)','Seviye 2 (1-9)','Seviye 3 (1-10 Eksik)','Seviye 4 (1-15 Eksik)'], instr: 'Toplama işleminin sonucunu bul! İleri seviyelerde eksik olan sayıyı tamamla.' },
  E4: { comp: BolusmeZamani, name: 'Bölüşme Zamanı', emoji: '🍎', cat: 'E', levels: ['Seviye 1 (2 çocuk)','Seviye 2 (2-3 çocuk)','Seviye 3 (2-4, gruplama)','Seviye 4 (2-5, gruplama)'], instr: 'Nesneleri eşit paylaştır veya gruplara ayır. Doğru sayıyı bul!' },
  E5: { comp: SayiDogrusuYurume, name: 'Sayı Yürüyüşü', emoji: '🚶', cat: 'E', levels: ['Toplama (0-10)','Toplama (0-10)','Karışık (0-15)','Karışık (0-20)'], instr: 'Sayı doğrusu üzerinde yürüyerek toplama/çıkarma yap!' },
  E6: { comp: SayiBaglari, name: 'Sayı Bağları', emoji: '🔗', cat: 'E', levels: ['Seviye 1 (3-5)','Seviye 2 (5-8)','Seviye 3 (6-10)','Seviye 4 (8-15)'], instr: 'Bir sayının parçalarını bul! Hangi iki sayının toplamı bu sayıyı verir? Sayı bağlarını keşfet!' },
  E7: { comp: CikarmaStratejileri, name: 'Çıkarma Stratejileri', emoji: '➖', cat: 'E', levels: ['Basit (1-10)','Onluktan çıkarma','Eksik çıkan','İki basamaklı'], instr: 'Çıkarma işlemlerini farklı stratejilerle çöz! Geriye sayma, onluktan çıkarma ve tamamlama stratejilerini öğren.' },
  E8: { comp: GeriSayma, name: 'Geri Sayma', emoji: '⏪', cat: 'E', levels: ['10\'dan geriye','20\'den geriye','İkişer geriye','Beşer geriye'], instr: 'Geriye doğru say! Eksik sayıyı bul. Geri sayma, çıkarma becerisinin temelidir.' },
  E9: { comp: CarpmaKavrami, name: 'Çarpma Kavramı', emoji: '✖️', cat: 'E', levels: ['Grupları say','Kaç grup?','Tekrarlı toplama','Eksik çarpan'], instr: 'Çarpmayı tekrarlı toplama olarak öğren! Eşit grupları say ve toplamı bul.' },
  F1: { comp: SayisalBellek, name: 'Sayısal Bellek', emoji: '🧠', cat: 'F', levels: ['1-geri (1-5)','1-geri (1-9)','2-geri (1-5)','2-geri (1-9)'], instr: 'Gösterilen sayı, N öncekiyle aynı mı? Çalışma belleğini test et!' },
  F2: { comp: SayisalStroop, name: 'Sayısal Stroop', emoji: '⚡', cat: 'F', levels: ['Kolay (uyumlu)','Orta (karışık)','Zor (uyumsuz ağırlıklı)','Uzman'], instr: 'Hangi sayı daha büyük? Boyutuna aldanma, sayısal değere odaklan!' },
  F3: { comp: GorevDegistirme, name: 'Görev Değiştirme', emoji: '🔀', cat: 'F', levels: ['+1/-1 (yavaş)','±2 (orta)','Karışık (hızlı)','3 işlem (uzman)'], instr: 'Kural değişiyor! Bazen topla, bazen çıkar. Hızlı geçiş yap!' },
};

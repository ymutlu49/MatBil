import { lazy } from 'react';

// Lazy-loaded game components
const NoktaAvcisi = lazy(() => import('../components/games/category-a/NoktaAvcisi'));
const ParmakSansi = lazy(() => import('../components/games/category-a/ParmakSansi'));
const HafizaOyunu = lazy(() => import('../components/games/category-a/HafizaOyunu'));
const GruplamaUstasi = lazy(() => import('../components/games/category-a/GruplamaUstasi'));
const GunlukSanbil = lazy(() => import('../components/games/category-a/GunlukSanbil'));
const ParmakKoprusu = lazy(() => import('../components/games/category-a/ParmakKoprusu'));

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

export const GAMES = {
  A1: { comp: NoktaAvcisi, name: 'Nokta Avc\u0131s\u0131', emoji: '\uD83C\uDFAF', cat: 'A', levels: ['\u2B50 Seviye 1 (1-4, 2sn)','\u2B50\u2B50 Seviye 2 (2-5, 1.5sn)','\u2B50\u2B50\u2B50 Seviye 3 (3-7, 1.2sn)','\u2B50\u2B50\u2B50\u2B50 Seviye 4 (4-9, 1sn)'], instr: 'Ekranda noktalar k\u0131sa s\u00FCreligi\u011Fine g\u00F6r\u00FCn\u00FCp kaybolacak. Ka\u00E7 nokta oldu\u011Funu saymadan, bir bak\u0131\u015Fta bulmaya \u00E7al\u0131\u015F!' },
  A2: { comp: ParmakSansi, name: 'Ka\u00E7 Parmak?', emoji: '\uD83D\uDD90\uFE0F', cat: 'A', levels: ['Seviye 1 (1-5)','Seviye 2 (1-7)','Seviye 3 (1-10)','Seviye 4 (1-10 H\u0131zl\u0131)'], instr: 'Ekranda bir veya iki el g\u00F6sterilecek. A\u00E7\u0131k parmaklar\u0131n say\u0131s\u0131n\u0131 tek bak\u0131\u015Fta tan\u0131 ve do\u011Fru say\u0131y\u0131 se\u00E7!' },
  A3: { comp: HafizaOyunu, name: 'Haf\u0131za Oyunu', emoji: '\uD83E\uDDE0', cat: 'A', levels: ['Kolay (1-4)','Orta (5-9)','Zor (1-9)'], instr: 'Kartlar\u0131 iki\u015Fer iki\u015Fer \u00E7evir. Ayn\u0131 say\u0131y\u0131 g\u00F6steren iki kart\u0131 bulursan e\u015Fle\u015Fir ve a\u00E7\u0131k kal\u0131r. T\u00FCm \u00E7iftleri bulmaya \u00E7al\u0131\u015F!' },
  A4: { comp: GruplamaUstasi, name: 'Gruplama Ustas\u0131', emoji: '\uD83D\uDCE6', cat: 'A', levels: ['Be\u015Flik (1 kart)','Be\u015Flik (2 kart)','Onluk (1 kart)','Kar\u0131\u015F\u0131k'], instr: 'Be\u015Flik veya onluk \u00E7er\u00E7eveler g\u00F6sterilecek. Dolu kutular\u0131 sayarak toplam\u0131n ka\u00E7 oldu\u011Funu bul!' },
  A6: { comp: ParmakKoprusu, name: 'Parmak K\u00F6pr\u00FCs\u00FC', emoji: '\uD83D\uDD90\uFE0F', cat: 'A', levels: ['1-5','2-7','3-9','1-10'], instr: 'Ekrana do\u011Fru say\u0131da parmakla ayn\u0131 anda dokun!' },
  A5: { comp: GunlukSanbil, name: 'G\u00FCnl\u00FCk Sanbil', emoji: '\uD83C\uDFE0', cat: 'A', levels: ['Seviye 1 (2-5, 3sn)','Seviye 2 (2-6, 2.5sn)','Seviye 3 (2-7, 2sn)','Seviye 4 (2-8, 1.5sn)'], instr: 'Meyve, \u00E7i\u00E7ek veya oyuncak gibi nesneler k\u0131sa s\u00FCreligi\u011Fine g\u00F6r\u00FCn\u00FCp kaybolacak. Ka\u00E7 tane oldu\u011Funu saymadan bul!' },
  B1: { comp: TahminKavanozlari, name: 'Tahmin Kavanozlar\u0131', emoji: '\uD83E\uDED9', cat: 'B', levels: ['Seviye 1 (5-15)','Seviye 2 (10-25)','Seviye 3 (15-35)','Seviye 4 (20-50)'], instr: 'Kavanozdaki bilyelere bak ve ka\u00E7 tane oldu\u011Funu tahmin et. Art\u0131/eksi butonlar\u0131yla say\u0131n\u0131 ayarla ve g\u00F6nder! Yak\u0131n tahminler de puan kazand\u0131r\u0131r.' },
  B2: { comp: SayiDogrusu, name: 'Say\u0131 Do\u011Frusu', emoji: '\uD83D\uDCCF', cat: 'B', levels: ['Seviye 1 (0-10)','Seviye 2 (0-100)','Seviye 3 (0-1000)'], instr: 'Say\u0131 do\u011Frusu \u00FCzerinde bir ok g\u00F6sterilecek. Okun g\u00F6sterdi\u011Fi say\u0131y\u0131 se\u00E7enekler aras\u0131ndan bul!' },
  B3: { comp: ReferansNoktasi, name: 'Yak\u0131nl\u0131k Tahmini', emoji: '\uD83C\uDFAF', cat: 'B', levels: ['Seviye 1 (0-5-10)','Seviye 2 (0-10-20)','Seviye 3 (0-25-50)','Seviye 4 (0-50-100)'], instr: 'Bir say\u0131 g\u00F6sterilecek. Bu say\u0131, verilen iki referans noktas\u0131ndan hangisine daha yak\u0131n? Do\u011Fru olan\u0131 se\u00E7!' },
  B4: { comp: OlcmeTahmini, name: '\u00D6l\u00E7me Tahmini', emoji: '\uD83D\uDCD0', cat: 'B', levels: ['Uzunluk Kolay','Uzunluk \u0130leri','K\u00FCtle/Hacim Kolay','K\u00FCtle/Hacim \u0130leri'], instr: 'Bir referans nesne ve onun \u00F6l\u00E7\u00FCs\u00FC g\u00F6sterilecek. Hedef nesnenin \u00F6l\u00E7\u00FCs\u00FCn\u00FC kar\u015F\u0131la\u015Ft\u0131rarak tahmin et!' },
  B5: { comp: HesaplamaliTahmin, name: 'Hesaplamal\u0131 Tahmin', emoji: '\uD83E\uDDEE', cat: 'B', levels: ['2 bsm. toplama','Toplama-\u00E7\u0131karma','3 basamakl\u0131','\u00C7arpma tahmini'], instr: 'Bir i\u015Flem g\u00F6sterilecek. Sonucu tam hesaplamadan, yuvarlayarak en yak\u0131n se\u00E7ene\u011Fi tahmin et!' },
  C1: { comp: SayiSembolEslestirme, name: 'Say\u0131-Sembol E\u015Fle\u015Ftirme', emoji: '\uD83D\uDD17', cat: 'C', levels: ['Seviye 1 (1-5)','Seviye 2 (1-10)','Seviye 3 (1-15)','Seviye 4 (1-20)'], instr: 'Say\u0131y\u0131 farkl\u0131 temsillerle e\u015Fle\u015Ftir: rakam, nokta, s\u00F6zc\u00FCk, \u00E7etele, parmak ve onluk \u00E7er\u00E7eve!' },
  C2: { comp: SayiKarsilastirma, name: 'B\u00FCy\u00FCk-K\u00FC\u00E7\u00FCk', emoji: '\u2696\uFE0F', cat: 'C', levels: ['0-10 (Stroop)','0-10 (\u00E7oklu temsil)','0-100 (kar\u0131\u015F\u0131k)','0-100 (3 say\u0131)'], instr: 'Hangisi daha \u00E7ok? Say\u0131sal Stroop etkisiyle boyutuna aldanma, de\u011Fere odaklan!' },
  C3: { comp: CokluGosterim, name: '\u00C7oklu G\u00F6sterim', emoji: '\uD83D\uDD2E', cat: 'C', levels: ['Seviye 1 (1-5)','Seviye 2 (1-10)','Seviye 3 (1-15)','Seviye 4 (1-20)'], instr: 'Bir say\u0131n\u0131n farkl\u0131 temsillerini tan\u0131: rakam, s\u00F6zc\u00FCk, nokta, \u00E7etele, parmak, onluk \u00E7er\u00E7eve ve nesne!' },
  C5: { comp: KodCevirici, name: 'Kod \u00C7evirici', emoji: '\uD83D\uDD04', cat: 'C', levels: ['Nokta\u2194Rakam (1-5)','Rakam\u2194S\u00F6zc\u00FCk (1-10)','\u00DC\u00E7l\u00FC Kod (1-10)','D\u00F6rtl\u00FC Kod (1-20)'], instr: 'Ayn\u0131 say\u0131y\u0131 farkl\u0131 bi\u00E7imlerde tan\u0131! Nokta\u2194Rakam\u2194S\u00F6zc\u00FCk aras\u0131nda \u00E7eviri yap.' },
  C4: { comp: BasamakDegeri, name: 'Basamak De\u011Feri', emoji: '\uD83C\uDFDB\uFE0F', cat: 'C', levels: ['Onluklar','Birlikler','Birle\u015Ftir','Y\u00FCzl\u00FCkler'], instr: 'Bir say\u0131 g\u00F6sterilecek ve bir basamak sorulacak. O basamaktaki rakam\u0131n de\u011Ferini bul! Onluk, birlik ve y\u00FCzl\u00FCk basamaklar\u0131 \u00F6\u011Fren.' },
  D1: { comp: SekilTanima, name: '1) \u015Eekli Tan\u0131ma', emoji: '\uD83D\uDD0D', cat: 'D', sub: 'K\u00FC\u00E7\u00FCk Uzay', levels: ['D\u00FCzey 1a (Temel)','D\u00FCzey 1b (Boyut)','D\u00FCzey 1c (Konumlan\u0131\u015F)','D\u00FCzey 1d (Kar\u0131\u015F\u0131k)','D\u00FCzey 1e (Tam)'], instr: '\u00C7e\u015Fitli \u015Fekiller g\u00F6sterilecek. \u0130stenen geometrik \u015Fekli bul ve \u00FCzerine dokun! Renk veya boyut farkl\u0131 olabilir. Renk veya boyut de\u011Fi\u015Fse de \u015Fekli tan\u0131.' },
  D2: { comp: ElemanVeOzellikler, name: '2) Eleman ve \u00D6zellikler', emoji: '\uD83D\uDD0E', cat: 'D', sub: 'K\u00FC\u00E7\u00FCk Uzay', levels: ['D\u00FCzey 2a (Temel)','D\u00FCzey 2b (Orta)','D\u00FCzey 2c (Tan\u0131mlama)','D\u00FCzey 2d (\u00D6zellik)'], instr: 'Bir \u015Fekil g\u00F6sterilecek ve kenar, k\u00F6\u015Fe veya a\u00E7\u0131 say\u0131s\u0131 sorulacak. Do\u011Fru cevab\u0131 bul!' },
  D3: { comp: IliskilerVeCikarim, name: '3) \u0130li\u015Fkiler ve \u00C7\u0131kar\u0131m', emoji: '\uD83D\uDD17', cat: 'D', sub: 'K\u00FC\u00E7\u00FCk Uzay', levels: ['D\u00FCzey 3a (Temel)','D\u00FCzey 3b (Orta)','D\u00FCzey 3c (\u0130leri)','D\u00FCzey 3d (Uzman)'], instr: '\u015Eekiller hakk\u0131nda ifadeler g\u00F6sterilecek. Do\u011Fru olan t\u00FCm ifadeleri se\u00E7! Dikkat: birden fazla do\u011Fru olabilir.' },
  D6: { comp: SimetriAynasi, name: '6) Simetri Aynas\u0131', emoji: '\uD83E\uDE9E', cat: 'D', levels: ['3x3 Kolay','3x3 Orta','4x4 Zor','4x4 Uzman'], instr: 'Deseni simetri eksenine g\u00F6re tamamla!' },
  D5: { comp: ZihinselDondurme, name: '5) Zihinsel D\u00F6nd\u00FCrme', emoji: '\uD83D\uDD04', cat: 'D', levels: ['Kolay (90\u00B0)','Orta (aynal\u0131)','Zor (45\u00B0)','Uzman'], instr: '\u015Eekli zihninde d\u00F6nd\u00FCr! Hedef \u015Feklin d\u00F6nd\u00FCr\u00FClm\u00FC\u015F halini bul.' },
  D4: { comp: YonVeMesafe, name: '4) Y\u00F6n ve Mesafe', emoji: '\uD83E\uDDED', cat: 'D', sub: 'B\u00FCy\u00FCk Uzay', levels: ['Sol/Sa\u011F','\u00DCst/Alt','4 Y\u00F6n Kar\u0131\u015F\u0131k','\u00C7oklu Nesne'], instr: 'Izgarada iki nesne g\u00F6sterilecek. Birinin di\u011Ferine g\u00F6re konumunu (sol, sa\u011F, \u00FCst, alt) bul!' },
  E1: { comp: KomsuSayilar, name: 'Kom\u015Fu Say\u0131lar', emoji: '\uD83D\uDD22', cat: 'E', levels: ['Seviye 1 (1-10, temel)','Seviye 2 (1-20, iki bo\u015Fluk)','Seviye 3 (1-50, geri sayma)','Seviye 4 (1-100, atlayarak)'], instr: 'Say\u0131 dizisindeki bo\u015Fluklar\u0131 doldur! \u00D6nceki, sonraki, aradaki ve atlayarak sayma.' },
  E2: { comp: ParcaButun, name: 'Par\u00E7a-B\u00FCt\u00FCn', emoji: '\uD83E\uDDE9', cat: 'E', levels: ['Seviye 1 (1-5)','Seviye 2 (1-10)','Seviye 3 (1-10 \u0130leri)','Seviye 4 (1-15)'], instr: '\u00DC\u00E7genin k\u00F6\u015Felerindeki say\u0131lar aras\u0131ndaki ili\u015Fkiyi bul. \u0130ki par\u00E7an\u0131n toplam\u0131 b\u00FCt\u00FCne e\u015Fittir.' },
  E3: { comp: ToplamaStratejileri, name: 'Toplama Stratejileri', emoji: '\u2795', cat: 'E', levels: ['Seviye 1 (1-5)','Seviye 2 (1-9)','Seviye 3 (1-10 Eksik)','Seviye 4 (1-15 Eksik)'], instr: 'Toplama i\u015Fleminin sonucunu bul! \u0130leri seviyelerde eksik olan say\u0131y\u0131 tamamla.' },
  E5: { comp: SayiDogrusuYurume, name: 'Say\u0131 Y\u00FCr\u00FCy\u00FC\u015F\u00FC', emoji: '\uD83D\uDEB6', cat: 'E', levels: ['Toplama (0-10)','Toplama (0-10)','Kar\u0131\u015F\u0131k (0-15)','Kar\u0131\u015F\u0131k (0-20)'], instr: 'Say\u0131 do\u011Frusu \u00FCzerinde y\u00FCr\u00FCyerek toplama/\u00E7\u0131karma yap!' },
  E4: { comp: BolusmeZamani, name: 'B\u00F6l\u00FC\u015Fme Zaman\u0131', emoji: '\uD83C\uDF4E', cat: 'E', levels: ['Seviye 1 (2 \u00E7ocuk)','Seviye 2 (2-3 \u00E7ocuk)','Seviye 3 (2-4, gruplama)','Seviye 4 (2-5, gruplama)'], instr: 'Nesneleri e\u015Fit payla\u015Ft\u0131r veya gruplara ay\u0131r. Do\u011Fru say\u0131y\u0131 bul!' },
};

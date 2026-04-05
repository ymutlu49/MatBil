export const SKILL_GRAPH = {
  subitizing: { name: 'Sanbil', games: ['A1','A2','A5','A6'], prereqs: [] },
  counting: { name: 'Sayma', games: ['A3','A4'], prereqs: ['subitizing'] },
  magnitude: { name: 'B\u00FCy\u00FCkl\u00FCk Alg\u0131s\u0131', games: ['C2','B3'], prereqs: ['subitizing'] },
  symbolRecog: { name: 'Sembol Tan\u0131ma', games: ['C1','C5'], prereqs: [] },
  placeValue: { name: 'Basamak De\u011Feri', games: ['C4'], prereqs: ['symbolRecog','counting'] },
  estimation: { name: 'Tahmin', games: ['B1','B2','B4','B5'], prereqs: ['magnitude','subitizing'] },
  addition: { name: 'Toplama', games: ['E1','E2','E3','E5'], prereqs: ['counting','magnitude'] },
  division: { name: 'B\u00F6lme/Gruplama', games: ['E4'], prereqs: ['counting','addition'] },
  shapeRecog: { name: '\u015Eekil Tan\u0131ma', games: ['D1','D2'], prereqs: [] },
  spatialRel: { name: 'Uzamsal \u0130li\u015Fkiler', games: ['D3','D4','D5','D6'], prereqs: ['shapeRecog'] },
  transcoding: { name: 'Kodlar Aras\u0131 \u00C7eviri', games: ['C3','C5'], prereqs: ['symbolRecog','magnitude'] },
};

export const CHAPTER_MAP = {
  A: {
    chapters: ['B\u00F6l\u00FCm 1: Do\u011Fu\u015Ftan Gelen Matematik','B\u00F6l\u00FCm 4: Sanbil Becerisi'],
    theory: 'Sanbil (subitizing), k\u00FC\u00E7\u00FCk nesne k\u00FCmelerini (1-4) tek tek saymadan, tek bak\u0131\u015Fta ve an\u0131nda do\u011Fru belirleyebilme kapasitesidir. Bu beceri, alg\u0131sal sanbil (otomatik tan\u0131ma) ve kavramsal sanbil (alt gruplara ay\u0131rarak i\u015Fleme) olmak \u00FCzere iki t\u00FCrde incelenir.',
    weakMsg: 'Sanbil becerisi geli\u015Ftirilmeye ihtiya\u00E7 duyuyor. Nokta dizileri ve onluk kartlarla d\u00FCzenli \u00E7al\u0131\u015Fma \u00F6nerilir. Clements (1999) ve MacDonald-Wilkins (2016) modelindeki a\u015Famal\u0131 etkinlikler uygulanmal\u0131d\u0131r.',
    strongMsg: 'Sanbil becerisi g\u00FC\u00E7l\u00FC geli\u015Fim g\u00F6steriyor. Kavramsal sanbil a\u015Famas\u0131na ge\u00E7i\u015F i\u00E7in daha b\u00FCy\u00FCk k\u00FCmelerde esnek gruplama etkinlikleri planlanabilir.',
    refs: 'Clements & Sarama (2020); Dehaene (2011); Kaufman ve ark. (1949); MacDonald & Wilkins (2016); Spelke & Kinzler (2007)'
  },
  B: {
    chapters: ['B\u00F6l\u00FCm 1: \u00C7ekirdek Bilgi Sistemleri','B\u00F6l\u00FCm 5: Tahmin Becerisi'],
    theory: 'Tahmin becerisi, say\u0131 hissinin en g\u00FC\u00E7l\u00FC g\u00F6stergelerinden biridir. \u0130\u015Flemsel, \u00F6l\u00E7\u00FCmsel, nicelik ve say\u0131 do\u011Frusu tahmini olmak \u00FCzere d\u00F6rt temel t\u00FCrde ele al\u0131n\u0131r. Yakla\u015F\u0131k Say\u0131 Sistemi (YSS) ile do\u011Frudan ba\u011Flant\u0131l\u0131d\u0131r.',
    weakMsg: 'Tahmin becerisi desteklenmelidir. G\u00FCnl\u00FCk ya\u015Famdan somut tahmin etkinlikleri (kavanoz tahmini, mesafe tahmini) ile YSS hassasiyeti g\u00FC\u00E7lendirilebilir. Say\u0131 do\u011Frusu \u00E7al\u0131\u015Fmalar\u0131 kritik \u00F6nem ta\u015F\u0131r.',
    strongMsg: 'Tahmin becerisi iyi d\u00FCzeyde. Farkl\u0131 ba\u011Flamlarda (\u00F6l\u00E7\u00FCmsel, niceliksel) tahmin \u00E7al\u0131\u015Fmalar\u0131yla esneklik art\u0131r\u0131labilir.',
    refs: 'Siegler & Booth (2004); Sowder (1992); Andrews ve ark. (2022); Star & Rittle-Johnson (2009)'
  },
  C: {
    chapters: ['B\u00F6l\u00FCm 2: \u00DC\u00E7l\u00FC Kodlama Modeli','B\u00F6l\u00FCm 3: Sembolik Say\u0131 \u0130\u015Fleme'],
    theory: 'Dehaene\'nin \u00DC\u00E7l\u00FC Kodlama Modeli\'ne g\u00F6re say\u0131lar beyinde \u00FC\u00E7 kodla temsil edilir: analog b\u00FCy\u00FCkl\u00FCk kodu, g\u00F6rsel-Arap kodu ve i\u015Fitsel-s\u00F6zel kod. Sembolik say\u0131 i\u015Fleme, bu kodlar aras\u0131 ge\u00E7i\u015Fi gerektirir.',
    weakMsg: 'Sembolik say\u0131 i\u015Fleme g\u00FC\u00E7lendirilmelidir. Say\u0131-\u00E7okluk e\u015Fle\u015Ftirme, basamak de\u011Feri ve \u00E7oklu g\u00F6sterim etkinlikleri ile kodlar aras\u0131 ba\u011Flant\u0131lar desteklenmelidir. Sembole eri\u015Fim yetersizli\u011Fi riski de\u011Ferlendirilmelidir.',
    strongMsg: 'Sembolik say\u0131 i\u015Fleme becerisi iyi geli\u015Fmi\u015F. Daha karma\u015F\u0131k basamak de\u011Feri ve say\u0131 kar\u015F\u0131la\u015Ft\u0131rma g\u00F6revleri ile ileri d\u00FCzey beceriler desteklenebilir.',
    refs: 'Dehaene (1992, 2011); Rousselle & No\u00EBl (2007); Geary (2011)'
  },
  D: {
    chapters: ['B\u00F6l\u00FCm 6: Geometri \u00C7ekirdek Bilgisi','B\u00F6l\u00FCm 7: van Hiele D\u00FCzeyleri','B\u00F6l\u00FCm 8: Geometride Pedagojik Uyarlamalar'],
    theory: 'Geometrik d\u00FC\u015F\u00FCnme, van Hiele\'nin be\u015F d\u00FCzeyinde geli\u015Fir: G\u00F6rselle\u015Ftirme \u2192 Analiz \u2192 \u0130li\u015Fkilendirme \u2192 Formel \u00C7\u0131kar\u0131m \u2192 Rigor. \u015Eekil alg\u0131s\u0131 ve uzamsal bili\u015F, matematik ba\u015Far\u0131s\u0131n\u0131n g\u00FC\u00E7l\u00FC yordayc\u0131lar\u0131d\u0131r.',
    weakMsg: 'Geometrik d\u00FC\u015F\u00FCnme ve uzamsal beceriler desteklenmelidir. Somut manip\u00FClatifler (Tangram, pattern blocks), dinamik geometri yaz\u0131l\u0131mlar\u0131 ve zihinsel d\u00F6nd\u00FCrme etkinlikleri \u00F6nerilir.',
    strongMsg: 'Geometrik d\u00FC\u015F\u00FCnme g\u00FC\u00E7l\u00FC. van Hiele analiz d\u00FCzeyine ge\u00E7i\u015F i\u00E7in \u015Fekil \u00F6zelliklerinin sistematik ke\u015Ffi ve s\u0131n\u0131flame etkinlikleri planlanabilir.',
    refs: 'van Hiele (1999); Clements & Battista (1992); Spelke ve ark. (2010); Cheng & Mix (2014)'
  },
  E: {
    chapters: ['B\u00F6l\u00FCm 1: \u00C7ekirdek Bilgi Sistemleri','B\u00F6l\u00FCm 4: Sanbil ve Aritmetik'],
    theory: 'Temel aritmetik beceriler, sanbil ve say\u0131 hissi temeline in\u015Fa edilir. Par\u00E7a-b\u00FCt\u00FCn ili\u015Fkisi, toplama stratejileri, e\u015Fit payla\u015Ft\u0131rma ve say\u0131 kom\u015Fulu\u011Fu, \u00E7ekirdek bilgi sistemlerinin sembolik aritmeti\u011Fe d\u00F6n\u00FC\u015F\u00FCm\u00FCd\u00FCr.',
    weakMsg: 'Temel aritmetik i\u015Flemler peki\u015Ftirilmelidir. Somut-Temsili-Soyut (CRA) \u00E7er\u00E7evesinde, manip\u00FClatif kullanarak par\u00E7a-b\u00FCt\u00FCn ili\u015Fkisi ve toplama stratejileri g\u00FC\u00E7lendirilmelidir.',
    strongMsg: 'Aritmetik beceriler sa\u011Flam temele oturuyor. \u0130leri d\u00FCzey problem \u00E7\u00F6zme ve esnek strateji kullan\u0131m\u0131 ile beceriler geni\u015Fletilebilir.',
    refs: 'Gelman & Gallistel (1978); Butterworth ve ark. (2011); Geary (2011)'
  }
};

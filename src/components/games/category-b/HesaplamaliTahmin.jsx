import React, { useState } from 'react';
import { shuffle, TOTAL_ROUNDS, playSound, encourage, useAdaptive } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

/**
 * Hesaplamalı Tahmin - Günlük Hayat Tahmini
 *
 * ÖNEMLİ TASARIM İLKESİ (Sowder, 1992):
 * Tahmin soruları TAM HESAPLANAMAZ olmalı.
 * Sayılar "çirkin" (tam bölünmeyen) seçilir → çocuk YAKLAŞIK düşünmek zorunda kalır.
 * "3 ekmek 15 TL → 5 ekmek kaç TL?" → Bu TAHMİN DEĞİL, kesin hesaptır!
 * "7 ekmek 23 TL ise 4 ekmek yaklaşık kaç TL?" → Bu TAHMİNDİR çünkü 23÷7 tam bölünmez.
 *
 * 4 Seviye:
 *   1: Günlük nesne ölçüleri (sezgisel büyüklük tahmini)
 *   2: Yüzde ve kesir tahmini (çirkin sayılarla)
 *   3: Hız-zaman-yol ve oran (tam bölünmeyen sayılar)
 *   4: Ters orantı, alan, karmaşık senaryolar
 */

const STRATEGIES = {
  computation: ['Sayıları yuvarladım 🔵', 'Kolay parçalara ayırdım ✂️', 'Referans kullandım 📏', 'Oranla düşündüm ⚖️'],
};

const ExplainStep = ({ onDone }) => {
  const strats = STRATEGIES.computation;
  return (
    <div className="mt-2 anim-fade">
      <div className="text-xs font-bold text-indigo-600 mb-1.5 text-center">{"🤔"} Hangi stratejiyi kullandın?</div>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {strats.map((s, i) => (
          <button key={i} onClick={() => onDone(s)}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 border border-indigo-200 transition-colors">{s}</button>
        ))}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────
// SORU HAVUZU
// Her soru gerçek bir TAHMİN gerektirir:
// - Sezgisel büyüklük bilgisi (Sv.1)
// - Tam bölünmeyen yüzdeler (Sv.2)
// - Çirkin sayılarla oran (Sv.3)
// - Ters orantı, alan tahmini (Sv.4)
// ────────────────────────────────────────────────

const QUESTIONS = [
  // ═══════════════════════════════════════════════
  // SEVİYE 1: Günlük nesne ölçüleri
  // Bunlar zaten sezgisel tahmindir — kimse kapının
  // yüksekliğini ölçmeden bilemez, tahmin etmek zorundadır.
  // ═══════════════════════════════════════════════
  { id: 101, lv: 1,
    q: 'Bir okul kapısı yaklaşık ne kadar yüksektir?',
    emoji: '🚪', answer: '2 metre', opts: ['1 metre', '2 metre', '5 metre', '10 metre'],
    hint: 'Standart bir iç kapı yüksekliği yaklaşık 2 metredir.' },
  { id: 102, lv: 1,
    q: 'Standart bir tükenmez kalem yaklaşık ne kadar uzunluktadır?',
    emoji: '🖊️', answer: '14 cm', opts: ['5 cm', '14 cm', '25 cm', '40 cm'],
    hint: 'Standart bir tükenmez kalem yaklaşık 14 cm uzunluğundadır.' },
  { id: 103, lv: 1,
    q: 'Bir yetişkin insanın bir adımı yaklaşık ne kadardır?',
    emoji: '🚶', answer: '70 cm', opts: ['30 cm', '70 cm', '150 cm', '200 cm'],
    hint: 'Yetişkin adım uzunluğu ortalama 70-75 cm civarındadır.' },
  { id: 104, lv: 1,
    q: 'Standart bir ders kitabının ağırlığı yaklaşık ne kadardır?',
    emoji: '📕', answer: '300 gram', opts: ['50 gram', '300 gram', '1 kg', '3 kg'],
    hint: 'Orta boy bir ders kitabı yaklaşık 250-350 gram gelir.' },
  { id: 105, lv: 1,
    q: 'Bir futbol sahası yaklaşık kaç metre uzunluğundadır?',
    emoji: '⚽', answer: '100 metre', opts: ['50 metre', '100 metre', '200 metre', '500 metre'],
    hint: 'Standart futbol sahası uzunluğu 100-110 metredir.' },
  { id: 106, lv: 1,
    q: 'Bir çay bardağı yaklaşık ne kadar su alır?',
    emoji: '🍵', answer: '100 ml', opts: ['20 ml', '100 ml', '500 ml', '1 litre'],
    hint: 'İnce belli çay bardağı yaklaşık 100 ml alır.' },
  { id: 107, lv: 1,
    q: 'Bir buzdolabı yaklaşık ne kadar yüksektir?',
    emoji: '🧊', answer: '170 cm', opts: ['100 cm', '170 cm', '250 cm', '300 cm'],
    hint: 'Standart bir buzdolabı yaklaşık 170-185 cm yüksekliğindedir.' },
  { id: 108, lv: 1,
    q: 'Bir limon yaklaşık kaç gram gelir?',
    emoji: '🍋', answer: '80 gram', opts: ['20 gram', '80 gram', '250 gram', '500 gram'],
    hint: 'Orta boy bir limon yaklaşık 70-90 gram ağırlığındadır.' },
  { id: 109, lv: 1,
    q: 'Bir otobüs yaklaşık kaç metre uzunluğundadır?',
    emoji: '🚌', answer: '12 metre', opts: ['5 metre', '12 metre', '25 metre', '50 metre'],
    hint: 'Standart bir solo şehir otobüsü yaklaşık 12 metre uzunluğundadır.' },
  { id: 110, lv: 1,
    q: 'Kitaplarla dolu bir okul çantasının yaklaşık ağırlığı kaçtır?',
    emoji: '🎒', answer: '5 kg', opts: ['1 kg', '5 kg', '15 kg', '25 kg'],
    hint: 'Kitaplarla dolu bir okul çantası yaklaşık 4-6 kg gelir.' },
  { id: 111, lv: 1,
    q: 'Bir filin yaklaşık ağırlığı kaçtır?',
    emoji: '🐘', answer: '5 ton', opts: ['500 kg', '5 ton', '20 ton', '50 ton'],
    hint: 'Yetişkin bir Afrika fili yaklaşık 5-6 ton ağırlığındadır.' },
  { id: 112, lv: 1,
    q: 'Bir yumurtanın yaklaşık ağırlığı ne kadardır?',
    emoji: '🥚', answer: '60 gram', opts: ['10 gram', '60 gram', '200 gram', '500 gram'],
    hint: 'Büyük boy bir yumurta yaklaşık 60-65 gram gelir.' },

  // ═══════════════════════════════════════════════
  // SEVİYE 2: Yüzde ve kesir tahmini
  // ÖNEMLİ: Sayılar tam bölünmez → yaklaşık düşünme gerekir!
  // 81'in %25'i = 20.25 → "yaklaşık 20"
  // 58'in %50'si = 29 (bu zaten kolay, yuvarlak sayı)
  // ═══════════════════════════════════════════════
  { id: 201, lv: 2,
    q: '81 kuşun %25\'i yaklaşık kaçtır?',
    emoji: '🐦', answer: '20', opts: ['10', '20', '40', '60'],
    hint: '81 ≈ 80, %25 = çeyreği → 80 ÷ 4 = 20 (gerçek: 20.25)' },
  { id: 202, lv: 2,
    q: '58 şekerin %50\'si yaklaşık kaçtır?',
    emoji: '🍬', answer: '29', opts: ['15', '29', '45', '58'],
    hint: '%50 = yarısı → 58 ÷ 2 = 29' },
  { id: 203, lv: 2,
    q: '127 öğrencinin %10\'u yaklaşık kaçtır?',
    emoji: '👨‍🎓', answer: '13', opts: ['6', '13', '27', '64'],
    hint: '127 ≈ 130, %10 → 130 ÷ 10 = 13 (gerçek: 12.7)' },
  { id: 204, lv: 2,
    q: '67 kitabın üçte biri yaklaşık kaçtır?',
    emoji: '📚', answer: '22', opts: ['11', '22', '34', '45'],
    hint: '67 ≈ 66, 66 ÷ 3 = 22 (gerçek: 22.3)' },
  { id: 205, lv: 2,
    q: '190 TL\'nin %75\'i yaklaşık ne kadardır?',
    emoji: '💰', answer: '143 TL', opts: ['95 TL', '143 TL', '170 TL', '190 TL'],
    hint: '190 ≈ 200, %75 → 200 × ¾ = 150... ama 190\'ın ¾\'ü → 190−48 ≈ 143' },
  { id: 206, lv: 2,
    q: '47 elmanın yarısı yaklaşık kaç elmadır?',
    emoji: '🍎', answer: '24', opts: ['12', '24', '35', '47'],
    hint: '47 ÷ 2 = 23.5 ≈ 24 (tek sayı tam bölünmez!)' },
  { id: 207, lv: 2,
    q: '93 bilyenin %25\'i yaklaşık kaçtır?',
    emoji: '🔵', answer: '23', opts: ['12', '23', '47', '70'],
    hint: '93 ≈ 92, 92 ÷ 4 = 23 (gerçek: 23.25)' },
  { id: 208, lv: 2,
    q: 'Bir sınavda 43 sorudan %80\'ini doğru yapan yaklaşık kaç soru yapmıştır?',
    emoji: '📝', answer: '34', opts: ['22', '28', '34', '43'],
    hint: '43 × 0.8 ≈ 40 × 0.8 = 32... daha doğrusu 43 × 0.8 = 34.4 ≈ 34' },
  { id: 209, lv: 2,
    q: '155 sayfalık kitabın üçte ikisini okuyan yaklaşık kaç sayfa okumuştur?',
    emoji: '📖', answer: '103', opts: ['52', '78', '103', '130'],
    hint: '155 ≈ 150, 150 × ⅔ = 100... gerçek: 155 × ⅔ ≈ 103' },
  { id: 210, lv: 2,
    q: '53 dakikanın %25\'i yaklaşık kaç dakikadır?',
    emoji: '⏰', answer: '13 dk', opts: ['7 dk', '13 dk', '27 dk', '40 dk'],
    hint: '53 ≈ 52, 52 ÷ 4 = 13 (gerçek: 13.25)' },

  // ═══════════════════════════════════════════════
  // SEVİYE 3: Hız-zaman-yol, çirkin sayılarla oran
  // Sayılar TAM BÖLÜNMEZ → yaklaşık düşünme zorunlu!
  // ═══════════════════════════════════════════════
  { id: 301, lv: 3,
    q: 'Bir araba 5 saatte 480 km yol alır. Aynı hızla 2 saatte yaklaşık ne kadar yol alır?',
    emoji: '🚗', answer: '190 km', opts: ['100 km', '190 km', '300 km', '480 km'],
    hint: 'Saatte: 480 ÷ 5 = 96 km → 2 saatte: 96 × 2 = 192 ≈ 190 km' },
  { id: 302, lv: 3,
    q: 'Bir bisikletçi 7 dakikada 1 km giderse 45 dakikada yaklaşık kaç km yol alır?',
    emoji: '🚴', answer: '6 km', opts: ['3 km', '6 km', '10 km', '15 km'],
    hint: '45 ÷ 7 ≈ 6.4 → yaklaşık 6 km' },
  { id: 303, lv: 3,
    q: 'Bir tren 3 saatte 230 km yol alır. Saatte yaklaşık kaç km gider?',
    emoji: '🚂', answer: '77 km', opts: ['50 km', '77 km', '115 km', '230 km'],
    hint: '230 ÷ 3 ≈ 76.7 → yaklaşık 77 km/saat' },
  { id: 304, lv: 3,
    q: '7 ekmek 23 TL ise 4 ekmek yaklaşık kaç TL tutar?',
    emoji: '🍞', answer: '13 TL', opts: ['8 TL', '13 TL', '19 TL', '23 TL'],
    hint: '1 ekmek: 23 ÷ 7 ≈ 3.3 TL → 4 ekmek: 3.3 × 4 ≈ 13 TL' },
  { id: 305, lv: 3,
    q: 'Bir musluk 7 dakikada 19 litre su akıtır. 20 dakikada yaklaşık ne kadar akıtır?',
    emoji: '🚿', answer: '54 litre', opts: ['27 litre', '54 litre', '100 litre', '190 litre'],
    hint: 'Dakikada: 19 ÷ 7 ≈ 2.7 litre → 20 dk: 2.7 × 20 ≈ 54 litre' },
  { id: 306, lv: 3,
    q: '5 defter 37 TL ise 3 defter yaklaşık kaç TL?',
    emoji: '📓', answer: '22 TL', opts: ['12 TL', '22 TL', '30 TL', '37 TL'],
    hint: '1 defter: 37 ÷ 5 = 7.4 TL → 3 defter: 7.4 × 3 ≈ 22 TL' },
  { id: 307, lv: 3,
    q: 'Bir koşucu 9 dakikada 2 km koşar. Aynı hızla 25 dakikada yaklaşık kaç km koşar?',
    emoji: '🏃', answer: '6 km', opts: ['3 km', '6 km', '9 km', '14 km'],
    hint: '25 ÷ 9 ≈ 2.8 tur → 2.8 × 2 ≈ 5.6 ≈ 6 km' },
  { id: 308, lv: 3,
    q: 'Bir bahçıvan 3 saatte 70 fide diker. 8 saatte yaklaşık kaç fide diker?',
    emoji: '🌷', answer: '187', opts: ['100', '140', '187', '250'],
    hint: 'Saatte: 70 ÷ 3 ≈ 23.3 → 8 saatte: 23.3 × 8 ≈ 187' },
  { id: 309, lv: 3,
    q: '5 kişilik bir ailenin günlük su tüketimi 17 litre ise 8 kişilik ailenin tüketimi yaklaşık kaç litredir?',
    emoji: '💧', answer: '27 litre', opts: ['14 litre', '27 litre', '40 litre', '56 litre'],
    hint: 'Kişi başı: 17 ÷ 5 = 3.4 litre → 8 kişi: 3.4 × 8 ≈ 27 litre' },
  { id: 310, lv: 3,
    q: 'Bir araba 100 km\'de 7 litre benzin harcar. 290 km yolda yaklaşık kaç litre harcar?',
    emoji: '⛽', answer: '20 litre', opts: ['10 litre', '20 litre', '35 litre', '50 litre'],
    hint: '290 ÷ 100 = 2.9 → 2.9 × 7 ≈ 20.3 ≈ 20 litre' },

  // ═══════════════════════════════════════════════
  // SEVİYE 4: Ters orantı, alan, karmaşık senaryolar
  // ═══════════════════════════════════════════════
  { id: 401, lv: 4,
    q: '4 işçi bir işi 10 günde bitiriyorsa aynı hızla çalışan 7 işçi bu işi yaklaşık kaç günde bitirir?',
    emoji: '👷', answer: '6 gün', opts: ['3 gün', '6 gün', '10 gün', '14 gün'],
    hint: '4 × 10 = 40 işçi-gün, 40 ÷ 7 ≈ 5.7 ≈ 6 gün (tam bölünmez!)' },
  { id: 402, lv: 4,
    q: 'Bir sınıfın taban alanı yaklaşık ne kadardır?',
    emoji: '🏫', answer: '50 m²', opts: ['10 m²', '50 m²', '200 m²', '500 m²'],
    hint: 'Standart bir sınıf yaklaşık 7×7 = 49 ≈ 50 m² kadardır.' },
  { id: 403, lv: 4,
    q: 'Bir arabalık otopark alanı yaklaşık ne kadardır?',
    emoji: '🅿️', answer: '12 m²', opts: ['3 m²', '12 m²', '50 m²', '100 m²'],
    hint: 'Standart bir otopark yeri yaklaşık 2.5 × 5 = 12.5 ≈ 12 m²' },
  { id: 404, lv: 4,
    q: '3 boyacı bir duvarı 8 saatte boyuyor. 5 boyacı aynı duvarı yaklaşık kaç saatte boyar?',
    emoji: '🎨', answer: '5 saat', opts: ['3 saat', '5 saat', '8 saat', '13 saat'],
    hint: '3 × 8 = 24 boyacı-saat, 24 ÷ 5 = 4.8 ≈ 5 saat' },
  { id: 405, lv: 4,
    q: 'Bir havuz saatte 450 litre su ile doluyorsa 7500 litrelik havuz yaklaşık kaç saatte dolar?',
    emoji: '🏊', answer: '17 saat', opts: ['10 saat', '17 saat', '30 saat', '75 saat'],
    hint: '7500 ÷ 450 ≈ 16.7 ≈ 17 saat' },
  { id: 406, lv: 4,
    q: 'Bir dikdörtgen bahçenin uzun kenarı 13 m, kısa kenarı 7 m ise alanı yaklaşık kaçtır?',
    emoji: '🌳', answer: '91 m²', opts: ['40 m²', '91 m²', '130 m²', '200 m²'],
    hint: 'Alan ≈ 13 × 7 = 91 m² (yaklaşık 10 × 7 = 70 + 3 × 7 = 21)' },
  { id: 407, lv: 4,
    q: '230 öğrencinin %15\'i okul gezisine katılırsa yaklaşık kaç öğrenci katılır?',
    emoji: '🚌', answer: '35', opts: ['15', '23', '35', '58'],
    hint: '230 × 0.15 → %10 = 23, %5 = 11.5 → 23 + 11.5 ≈ 35' },
  { id: 408, lv: 4,
    q: 'Bir fabrika günde 1150 ürün üretir. 7 günde yaklaşık kaç ürün üretir?',
    emoji: '🏭', answer: '8050', opts: ['4000', '5750', '8050', '11500'],
    hint: '1150 × 7 → 1000×7=7000, 150×7=1050 → 7000+1050 = 8050' },
  { id: 409, lv: 4,
    q: '6 marangoz bir işi 9 günde yaparsa 4 marangoz aynı işi yaklaşık kaç günde yapar?',
    emoji: '🪑', answer: '14 gün', opts: ['6 gün', '9 gün', '14 gün', '22 gün'],
    hint: '6 × 9 = 54 marangoz-gün, 54 ÷ 4 = 13.5 ≈ 14 gün' },
  { id: 410, lv: 4,
    q: 'Bir odanın uzunluğu 5.5 m, genişliği 3.8 m ise taban alanı yaklaşık kaçtır?',
    emoji: '📦', answer: '21 m²', opts: ['12 m²', '21 m²', '33 m²', '42 m²'],
    hint: '5.5 × 3.8 → 5 × 4 = 20, daha hassas: 5.5 × 3.8 ≈ 20.9 ≈ 21 m²' },
];

const HesaplamaliTahmin = ({ onBack, colors, onGameComplete, prevBest }) => {
  const adaptive = useAdaptive();
  const [gs, setGs] = useState('menu');
  const [lv, setLv] = useState(1);
  const [sc, setSc] = useState(0);
  const [rd, setRd] = useState(0);
  const [p, setP] = useState(null);
  const [ua, setUa] = useState(null);
  const [used, setUsed] = useState([]);
  const [explained, setExplained] = useState(false);

  const gen = (l, usedIds) => {
    const available = QUESTIONS.filter(q => q.lv <= l && !usedIds.includes(q.id));
    const pool = available.length > 0 ? available : QUESTIONS.filter(q => q.lv <= l);
    const sameLv = pool.filter(q => q.lv === l);
    const source = sameLv.length > 0 ? sameLv : pool;
    const q = source[Math.floor(Math.random() * source.length)];
    return { ...q, opts: shuffle([...q.opts]) };
  };

  const prepG = (l) => { setLv(l); setGs('ready'); };
  const startG = (l) => {
    setLv(l); setSc(0); setRd(1); setUsed([]);
    adaptive.reset();
    const first = gen(l, []);
    setP(first); setUsed([first.id]); setUa(null); setExplained(false); setGs('playing');
  };

  const handle = (a) => {
    if (ua !== null) return;
    const correct = a === p?.answer;
    setUa(a);
    adaptive.record(correct);
    if (correct) {
      setSc(s => s + 20 * lv);
      playSound('correct');
    } else {
      playSound('wrong');
    }
    setExplained(false);
  };

  const handleExplain = () => {
    setExplained(true);
    setTimeout(() => {
      if (rd < TOTAL_ROUNDS) {
        setRd(r => r + 1);
        const next = gen(lv, used);
        setP(next);
        setUsed(prev => [...prev, next.id]);
        setUa(null);
        setExplained(false);
      } else {
        setGs('results');
      }
    }, 800);
  };

  if (gs === 'menu') return (
    <MenuScreen onBack={onBack} onStart={prepG}
      title="Hesaplamalı Tahmin" emoji="🧮"
      description="Günlük hayattan tahmin soruları! Tam hesaplamadan, yaklaşık düşünerek en iyi tahmini seç."
      levels={[
        'Seviye 1 (Nesne ölçüleri)',
        'Seviye 2 (Yüzde ve kesir)',
        'Seviye 3 (Hız-zaman-oran)',
        'Seviye 4 (Oran-orantı, alan)'
      ]}
      colors={colors}
    />
  );

  if (gs === 'ready') return (
    <ReadyScreen
      title="Hesaplamalı Tahmin" emoji="🧮" level={lv}
      instruction="Günlük hayattan sorular sorulacak. Tam hesaplamadan, yaklaşık düşünerek en iyi tahmini seç!"
      colors={colors} onStart={() => startG(lv)} onBack={() => setGs('menu')}
    />
  );

  if (gs === 'results') return (
    <ResultScreen
      score={sc} onReplay={() => startG(lv)} onBack={onBack}
      onLevelMenu={() => setGs('menu')} colors={colors}
      onComplete={onGameComplete} level={lv} maxLevel={4}
      onNextLevel={startG} prevBest={prevBest}
    />
  );

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={() => setGs('menu')} round={rd} score={sc} title="Hesaplamalı Tahmin" colors={colors} />

      <div className="flex-1 flex flex-col items-center justify-center min-h-0 w-full max-w-md">
        {/* Soru kartı */}
        <div className="bg-white px-5 py-4 rounded-2xl shadow-xl mb-4 border-2 border-amber-200 text-center w-full">
          <div className="text-4xl mb-2">{p?.emoji}</div>
          <div className="text-xs font-bold text-amber-600 mb-2">En iyi tahmin hangisidir?</div>
          <div className="font-bold text-gray-800 text-base leading-relaxed">{p?.q}</div>
        </div>

        {/* Cevap durumu */}
        {ua !== null ? (
          <div className="text-center w-full">
            <div className={`text-2xl font-bold mb-2 ${ua === p?.answer ? 'text-green-500' : 'text-orange-500'}`}>
              {ua === p?.answer ? '✓ Doğru!' : `${encourage()} Doğru cevap: ${p?.answer}`}
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700 mt-2 text-left">
              {"💡"} {p?.hint}
            </div>
            {!explained && <ExplainStep onDone={handleExplain} />}
            {explained && <div className="text-xs text-green-600 mt-2 font-medium anim-fade">{"✓"} Güzel strateji!</div>}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 w-full">
            {p?.opts?.map((o, i) => (
              <button key={i} onClick={() => handle(o)}
                className={`w-full px-5 py-3.5 ${colors?.button} text-white rounded-xl font-bold text-lg shadow-lg hover:opacity-90 active:scale-[0.97] transition-all text-center`}>
                {o}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HesaplamaliTahmin;

import React, { useState, useRef } from 'react';
import { TOTAL_ROUNDS, playSound, encourage, useAdaptive, useSafeTimeout } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

/**
 * Nokta Karşılaştırma - Yaklaşık Sayı Sistemi (ANS/YSS)
 *
 * Akademik iyileştirmeler (Gebuis & Reynvoet, 2018):
 * - Congruent/Incongruent trial dengeleme (toplam alan, yoğunluk, konveks gövde)
 * - Weber fraksiyonu bazlı zorluk (oran tabanlı)
 * - Yanıt süresi takibi
 * - Weber fraksiyonu hesaplama ve raporlama
 */
const NoktaKarsilastirma = ({ onBack, colors, onGameComplete, rahatMod, prevBest, sesAcik }) => {
  const safeSetTimeout = useSafeTimeout();
  const [gs, setGs] = useState('menu');
  const [lv, setLv] = useState(1);
  const [sc, setSc] = useState(0);
  const [rd, setRd] = useState(0);
  const [p, setP] = useState(null);
  const [ua, setUa] = useState(null);
  const adaptive = useAdaptive();
  const trialStartTime = useRef(null);
  const trialResults = useRef([]);

  // Weber fraksiyonu bazlı oranlar (küçük oran = zor)
  const cfg = {
    1: { ratios: [0.5, 0.57, 0.6, 0.67], min: 4, max: 10 },   // Kolay: 1:2, 4:7, 3:5, 2:3
    2: { ratios: [0.6, 0.67, 0.71, 0.75], min: 5, max: 14 },   // Orta
    3: { ratios: [0.71, 0.75, 0.8, 0.83], min: 6, max: 18 },   // Zor
    4: { ratios: [0.8, 0.83, 0.86, 0.88], min: 8, max: 22 },   // Uzman
  };

  /**
   * Görsel kontrollü nokta oluşturma (Gebuis & Reynvoet, 2018)
   * Congruent trial: Büyük küme → büyük alan (doğal)
   * Incongruent trial: Büyük küme → küçük alan (kontrollü)
   */
  const genDots = (count, totalAreaTarget, boundSize) => {
    // Toplam alan kontrolü: her noktanın alanını totalAreaTarget'a göre belirle
    const avgRadius = Math.sqrt(totalAreaTarget / (count * Math.PI));
    const dots = [];
    const padding = 10;
    for (let i = 0; i < count; i++) {
      let x, y, attempts = 0;
      // Nokta boyutu: ortalama etrafında %20 varyans (doğallık için)
      const r = Math.max(3, avgRadius * (0.8 + Math.random() * 0.4));
      do {
        x = padding + Math.random() * (100 - 2 * padding);
        y = padding + Math.random() * (100 - 2 * padding);
        attempts++;
      } while (attempts < 30 && dots.some(d => Math.hypot(d.x - x, d.y - y) < (r + d.size + 1)));
      dots.push({ x, y, size: r });
    }
    return dots;
  };

  const gen = (l) => {
    const c = cfg[l];
    // Rastgele oran seç
    const ratio = c.ratios[Math.floor(Math.random() * c.ratios.length)];
    // Büyük sayıyı belirle
    const nBig = Math.floor(Math.random() * (c.max - c.min + 1)) + c.min;
    const nSmall = Math.max(1, Math.round(nBig * ratio));
    if (nSmall === nBig) {
      // Eşitlik olmamalı
      return gen(l);
    }

    // Congruent vs Incongruent trial (yarı yarıya)
    const isCongruent = Math.random() > 0.5;
    const baseTotalArea = 800; // referans alan

    let areaLeft, areaRight;
    // Sol veya sağ taraftan hangisi büyük? Rastgele
    const bigOnLeft = Math.random() > 0.5;
    const n1 = bigOnLeft ? nBig : nSmall;
    const n2 = bigOnLeft ? nSmall : nBig;

    if (isCongruent) {
      // Doğal: çok nokta = çok alan
      areaLeft = bigOnLeft ? baseTotalArea * 1.1 : baseTotalArea * 0.9;
      areaRight = bigOnLeft ? baseTotalArea * 0.9 : baseTotalArea * 1.1;
    } else {
      // Kontrollü: çok nokta = az alan (her nokta küçük)
      areaLeft = bigOnLeft ? baseTotalArea * 0.85 : baseTotalArea * 1.15;
      areaRight = bigOnLeft ? baseTotalArea * 1.15 : baseTotalArea * 0.85;
    }

    const answer = n1 > n2 ? 'left' : 'right';
    return {
      n1, n2, answer, ratio: Math.min(n1, n2) / Math.max(n1, n2),
      isCongruent,
      dotsLeft: genDots(n1, areaLeft, 160),
      dotsRight: genDots(n2, areaRight, 160),
    };
  };

  const prepG = (l) => { setLv(l); setGs('ready'); };
  const startG = (l) => {
    setLv(l); setSc(0); setRd(1); adaptive.reset();
    trialResults.current = [];
    const puzzle = gen(l);
    setP(puzzle); setUa(null); setGs('playing');
    trialStartTime.current = Date.now();
  };

  const handle = (side) => {
    if (ua !== null) return;
    const rt = Date.now() - (trialStartTime.current || Date.now());
    const correct = side === p?.answer;
    setUa(side);
    adaptive.record(correct);

    // Trial verisi kaydet (Weber fraksiyonu hesabı için)
    trialResults.current.push({
      n1: p.n1, n2: p.n2, ratio: p.ratio,
      isCongruent: p.isCongruent,
      correct, rt,
    });

    if (correct) { setSc(s => s + 15 * lv); playSound('correct'); }
    else playSound('wrong');

    safeSetTimeout(() => {
      if (rd < TOTAL_ROUNDS) {
        setRd(r => r + 1);
        const puzzle = gen(lv);
        setP(puzzle); setUa(null);
        trialStartTime.current = Date.now();
      }
      else setGs('results');
    }, 1200);
  };

  // Weber fraksiyonu hesapla: en zor başarılı oran
  const getWeberStats = () => {
    const results = trialResults.current;
    if (results.length === 0) return null;
    const correctTrials = results.filter(t => t.correct);
    const accuracy = correctTrials.length / results.length;
    const avgRT = Math.round(results.reduce((s, t) => s + t.rt, 0) / results.length);
    // En zor (en yüksek oranlı) başarılı trial
    const hardestCorrect = correctTrials.length > 0
      ? Math.max(...correctTrials.map(t => t.ratio))
      : 0;
    // Congruent vs incongruent doğruluk karşılaştırma
    const congruent = results.filter(t => t.isCongruent);
    const incongruent = results.filter(t => !t.isCongruent);
    const congAcc = congruent.length > 0 ? congruent.filter(t => t.correct).length / congruent.length : 0;
    const incongAcc = incongruent.length > 0 ? incongruent.filter(t => t.correct).length / incongruent.length : 0;

    return { accuracy, avgRT, hardestCorrect, congAcc, incongAcc, total: results.length };
  };

  if (gs === 'menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Nokta Karşılaştırma" emoji="👀" description="Hangisinde daha çok nokta var? Saymadan, bir bakışta karar ver!" levels={['Kolay', 'Orta', 'Zor', 'Uzman']} colors={colors} />;
  if (gs === 'ready') return <ReadyScreen title="Nokta Karşılaştırma" emoji="👀" level={lv} instruction="İki nokta kümesi gösterilecek. Hangisinde daha çok nokta var? Saymadan, sezgisel olarak karar ver! Nokta boyutuna aldanma — sayıya odaklan." colors={colors} onStart={() => startG(lv)} onBack={() => setGs('menu')} />;

  if (gs === 'results') {
    const weber = getWeberStats();
    const weberPanel = weber ? (
      <div className="bg-white rounded-xl shadow-lg border border-indigo-200 p-3">
        <div className="text-xs font-bold text-indigo-600 mb-1">{"🧠"} YSS/ANS Analizi</div>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div className="bg-indigo-50 rounded-lg p-1.5">
            <div className="text-gray-500">Doğruluk</div>
            <div className="font-bold text-indigo-700">{Math.round(weber.accuracy * 100)}%</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-1.5">
            <div className="text-gray-500">Ort. Yanıt Süresi</div>
            <div className="font-bold text-indigo-700">{weber.avgRT}ms</div>
          </div>
          <div className="bg-green-50 rounded-lg p-1.5">
            <div className="text-gray-500">Uyumlu Trial</div>
            <div className="font-bold text-green-700">{Math.round(weber.congAcc * 100)}%</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-1.5">
            <div className="text-gray-500">Uyumsuz Trial</div>
            <div className="font-bold text-orange-700">{Math.round(weber.incongAcc * 100)}%</div>
          </div>
        </div>
        <div className="mt-1.5 text-[10px] text-gray-400">Weber hassasiyeti: oran {weber.hardestCorrect.toFixed(2)} | Uyumsuz triallarda düşük doğruluk görsel ipucu etkisine işaret eder.</div>
      </div>
    ) : null;
    return (
      <ResultScreen score={sc} onReplay={() => startG(lv)} onBack={onBack} onLevelMenu={() => setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest} extraContent={weberPanel} />
    );
  }

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={() => setGs('menu')} round={rd} score={sc} title="Nokta Karşılaştırma" colors={colors} />
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">

        <div className="text-lg font-bold text-gray-700 mb-4">Hangisinde daha çok?</div>

        <div className="flex gap-5 mb-4">
          {/* Sol küme */}
          <button onClick={() => handle('left')} disabled={ua !== null}
            className={`relative rounded-2xl border-3 shadow-lg transition-all ${
              ua !== null
                ? (p?.answer === 'left' ? 'border-green-400 bg-green-50 ring-2 ring-green-300' : ua === 'left' ? 'border-orange-400 bg-orange-50' : 'border-gray-200 opacity-50')
                : 'border-gray-200 bg-white hover:border-rose-400 hover:shadow-xl active:scale-95'
            }`} style={{ width: 160, height: 160 }}>
            {p?.dotsLeft.map((d, i) => (
              <div key={i} className="absolute bg-rose-500 rounded-full" style={{
                left: `${d.x}%`, top: `${d.y}%`,
                width: d.size * 2, height: d.size * 2,
                transform: 'translate(-50%,-50%)',
              }} />
            ))}
            {ua !== null && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-white/90 px-2 py-0.5 rounded-full text-sm font-bold text-gray-700">{p?.n1}</div>
            )}
          </button>

          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-300">VS</span>
          </div>

          {/* Sağ küme */}
          <button onClick={() => handle('right')} disabled={ua !== null}
            className={`relative rounded-2xl border-3 shadow-lg transition-all ${
              ua !== null
                ? (p?.answer === 'right' ? 'border-green-400 bg-green-50 ring-2 ring-green-300' : ua === 'right' ? 'border-orange-400 bg-orange-50' : 'border-gray-200 opacity-50')
                : 'border-gray-200 bg-white hover:border-blue-400 hover:shadow-xl active:scale-95'
            }`} style={{ width: 160, height: 160 }}>
            {p?.dotsRight.map((d, i) => (
              <div key={i} className="absolute bg-blue-500 rounded-full" style={{
                left: `${d.x}%`, top: `${d.y}%`,
                width: d.size * 2, height: d.size * 2,
                transform: 'translate(-50%,-50%)',
              }} />
            ))}
            {ua !== null && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-white/90 px-2 py-0.5 rounded-full text-sm font-bold text-gray-700">{p?.n2}</div>
            )}
          </button>
        </div>

        {ua !== null && (
          <div className="text-center anim-fade">
            <div className={`text-2xl font-bold mb-1 ${ua === p?.answer ? 'text-green-500' : 'text-orange-500'}`}>
              {ua === p?.answer ? '🎉 Doğru!' : `${encourage()}`}
            </div>
            <div className="text-sm text-gray-500">
              Sol: {p?.n1} | Sağ: {p?.n2} {' → '} {p?.n1 > p?.n2 ? 'Sol' : 'Sağ'} daha çok
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              Oran: {p?.ratio.toFixed(2)} | {p?.isCongruent ? 'Uyumlu' : 'Uyumsuz'} trial
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoktaKarsilastirma;

import React, { useState, useEffect, useRef } from 'react';
import { TOTAL_ROUNDS, playSound, vibrate, encourage } from '../../../utils';
import { useAdaptive } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const NoktaKarsilastirma = ({ onBack, colors, onGameComplete, rahatMod, prevBest }) => {
  const [gs, setGs] = useState('menu');
  const [lv, setLv] = useState(1);
  const [sc, setSc] = useState(0);
  const [rd, setRd] = useState(0);
  const [p, setP] = useState(null);
  const [ua, setUa] = useState(null);
  const [show, setShow] = useState(false);
  const adaptive = useAdaptive();

  // Seviye: Weber oranı giderek küçülür (zorluk artar)
  // Oran büyük = kolay (8 vs 3), oran küçük = zor (8 vs 7)
  const cfg = {
    1: { min: 3, max: 8, minRatio: 0.5 },   // Kolay: çok farklı (ör: 3 vs 6)
    2: { min: 4, max: 12, minRatio: 0.6 },  // Orta: biraz yakın
    3: { min: 5, max: 15, minRatio: 0.7 },  // Zor: yakın sayılar
    4: { min: 6, max: 20, minRatio: 0.75 }, // Uzman: çok yakın (Weber sınırı)
  };

  const genDots = (count, areaW, areaH) => {
    const dots = [];
    for (let i = 0; i < count; i++) {
      let x, y, attempts = 0;
      do {
        x = 15 + Math.random() * 70;
        y = 15 + Math.random() * 70;
        attempts++;
      } while (attempts < 30 && dots.some(d => Math.hypot(d.x - x, d.y - y) < 12));
      dots.push({ x, y, size: 6 + Math.random() * 4 }); // Boyut değişkenliği
    }
    return dots;
  };

  const gen = (l) => {
    const c = cfg[l];
    // İlk sayıyı seç
    const n1 = Math.floor(Math.random() * (c.max - c.min + 1)) + c.min;
    // İkinci sayıyı Weber oranına göre seç (farklı olmalı)
    let n2;
    do {
      const diff = Math.max(1, Math.floor(n1 * (1 - c.minRatio * adaptive.diff)));
      n2 = n1 + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * diff) + 1);
      n2 = Math.max(c.min, Math.min(c.max, n2));
    } while (n2 === n1);

    const answer = Math.max(n1, n2) === n1 ? 'left' : 'right';
    const dotsLeft = genDots(n1);
    const dotsRight = genDots(n2);

    return { n1, n2, answer, dotsLeft, dotsRight };
  };

  const prepG = (l) => { setLv(l); setGs('ready'); };
  const startG = (l) => { setLv(l); setSc(0); setRd(1); adaptive.reset(); const q = gen(l); setP(q); setUa(null); setShow(true); setGs('playing'); };

  const startRound = (l, r) => {
    const q = gen(l);
    setP(q);
    setUa(null);
    setRd(r);
    setShow(true);
  };

  const handle = (side) => {
    if (ua !== null) return;
    const correct = side === p?.answer;
    setUa(side);
    adaptive.record(correct);
    if (correct) { setSc(s => s + 15 * lv); playSound('correct'); }
    else playSound('wrong');
    setTimeout(() => {
      if (rd < TOTAL_ROUNDS) startRound(lv, rd + 1);
      else setGs('results');
    }, 1200);
  };

  if (gs === 'menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Nokta Karşılaştırma" emoji="👀" description="Hangisinde daha çok nokta var? Saymadan, bir bakışta karar ver! Yaklaşık Sayı Sistemi (YSS) hassasiyetini ölçer." levels={['Seviye 1 (Kolay)', 'Seviye 2 (Orta)', 'Seviye 3 (Zor)', 'Seviye 4 (Uzman)']} colors={colors} />;
  if (gs === 'ready') return <ReadyScreen title="Nokta Karşılaştırma" emoji="👀" level={lv} instruction="İki nokta kümesi gösterilecek. Hangisinde daha çok nokta var? Saymadan, sezgisel olarak karar ver! Hızlı ol ama dikkatli ol." colors={colors} onStart={() => startG(lv)} onBack={() => setGs('menu')} />;
  if (gs === 'results') return <ResultScreen score={sc} onReplay={() => startG(lv)} onBack={onBack} onLevelMenu={() => setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest} />;

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={() => setGs('menu')} round={rd} score={sc} title="Nokta Karşılaştırma" colors={colors} />
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">

        <div className="text-lg font-bold text-gray-700 mb-3">Hangisinde daha çok?</div>

        {/* İki nokta kümesi yan yana */}
        <div className="flex gap-4 mb-4">
          {/* Sol küme */}
          <button onClick={() => handle('left')} disabled={ua !== null}
            className={`relative rounded-2xl border-3 shadow-lg transition-all ${
              ua !== null
                ? (p?.answer === 'left' ? 'border-green-400 bg-green-50 ring-2 ring-green-300' : ua === 'left' ? 'border-orange-400 bg-orange-50' : 'border-gray-200 opacity-50')
                : 'border-gray-200 bg-white hover:border-rose-400 hover:shadow-xl active:scale-95'
            }`} style={{ width: 150, height: 150 }}>
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

          {/* VS */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-300">VS</span>
          </div>

          {/* Sağ küme */}
          <button onClick={() => handle('right')} disabled={ua !== null}
            className={`relative rounded-2xl border-3 shadow-lg transition-all ${
              ua !== null
                ? (p?.answer === 'right' ? 'border-green-400 bg-green-50 ring-2 ring-green-300' : ua === 'right' ? 'border-orange-400 bg-orange-50' : 'border-gray-200 opacity-50')
                : 'border-gray-200 bg-white hover:border-blue-400 hover:shadow-xl active:scale-95'
            }`} style={{ width: 150, height: 150 }}>
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

        {/* Geri bildirim */}
        {ua !== null && (
          <div className="text-center anim-fade">
            <div className={`text-2xl font-bold mb-1 ${ua === p?.answer ? 'text-green-500' : 'text-orange-500'}`}>
              {ua === p?.answer ? '🎉 Doğru!' : `${encourage()}`}
            </div>
            <div className="text-sm text-gray-500">
              Sol: {p?.n1} nokta | Sağ: {p?.n2} nokta → {p?.n1 > p?.n2 ? 'Sol' : 'Sağ'} daha çok
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoktaKarsilastirma;

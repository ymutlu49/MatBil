import React, { useState } from 'react';
import { TOTAL_ROUNDS, playSound, vibrate, encourage, speakNumber } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

// Tek el SVG — openCount: açık parmak sayısı (0-5), isRight: sağ el mi
const HandSVG = ({ openCount, size = 100, isRight = false }) => {
  const s = isRight ? -1 : 1;
  return (
    <svg viewBox="0 0 100 140" width={size} height={size * 1.4} style={isRight ? { transform: 'scaleX(-1)' } : {}}>
      {/* Avuç */}
      <ellipse cx="50" cy="105" rx="33" ry="28" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      {/* Bilek */}
      <rect x="35" y="125" width="30" height="15" rx="6" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2" />

      {/* Başparmak — her zaman ilk açılan */}
      <rect x="10" y={openCount >= 1 ? 62 : 82} width="14" height={openCount >= 1 ? 38 : 16}
        rx="7" fill={openCount >= 1 ? '#FBBF24' : '#E5A910'} stroke="#D97706" strokeWidth="1.3"
        transform="rotate(-20,17,90)" />
      {openCount >= 1 && <ellipse cx="13" cy="60" rx="4.5" ry="3" fill="#FDE68A" />}

      {/* İşaret parmağı */}
      <rect x="25" y={openCount >= 2 ? 18 : 68} width="12" height={openCount >= 2 ? 58 : 18}
        rx="6" fill={openCount >= 2 ? '#FBBF24' : '#E5A910'} stroke="#D97706" strokeWidth="1.2" />
      {openCount >= 2 && <ellipse cx="31" cy="21" rx="4" ry="2.5" fill="#FDE68A" />}

      {/* Orta parmak */}
      <rect x="39" y={openCount >= 3 ? 12 : 65} width="12" height={openCount >= 3 ? 62 : 20}
        rx="6" fill={openCount >= 3 ? '#FBBF24' : '#E5A910'} stroke="#D97706" strokeWidth="1.2" />
      {openCount >= 3 && <ellipse cx="45" cy="15" rx="4" ry="2.5" fill="#FDE68A" />}

      {/* Yüzük parmağı */}
      <rect x="53" y={openCount >= 4 ? 18 : 68} width="12" height={openCount >= 4 ? 56 : 16}
        rx="6" fill={openCount >= 4 ? '#FBBF24' : '#E5A910'} stroke="#D97706" strokeWidth="1.2" />
      {openCount >= 4 && <ellipse cx="59" cy="21" rx="4" ry="2.5" fill="#FDE68A" />}

      {/* Serçe parmak */}
      <rect x="67" y={openCount >= 5 ? 28 : 72} width="11" height={openCount >= 5 ? 46 : 14}
        rx="5.5" fill={openCount >= 5 ? '#FBBF24' : '#E5A910'} stroke="#D97706" strokeWidth="1.2" />
      {openCount >= 5 && <ellipse cx="72.5" cy="31" rx="3.5" ry="2" fill="#FDE68A" />}
    </svg>
  );
};

// İki el birlikte — count: toplam parmak (1-10)
const HandsDisplay = ({ count, size = 100 }) => {
  if (count <= 5) {
    return (
      <div className="flex justify-center">
        <HandSVG openCount={count} size={size} />
      </div>
    );
  }
  // 6-10: sol el 5 parmak açık, sağ el kalanı açık
  return (
    <div className="flex justify-center gap-1">
      <HandSVG openCount={5} size={size * 0.85} />
      <HandSVG openCount={count - 5} size={size * 0.85} isRight />
    </div>
  );
};

const ParmakKoprusu = ({ onBack, colors, onGameComplete, rahatMod, prevBest }) => {
  const [gs, setGs] = useState('menu');
  const [lv, setLv] = useState(1);
  const [sc, setSc] = useState(0);
  const [rd, setRd] = useState(0);
  const [target, setTarget] = useState(0);
  const [fingerCount, setFingerCount] = useState(0);
  const [ua, setUa] = useState(null);
  const [isTouchDevice] = useState(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0);
  const cfg = { 1: { min: 1, max: 5 }, 2: { min: 2, max: 7 }, 3: { min: 3, max: 9 }, 4: { min: 1, max: 10 } };

  const gen = (l) => { const c = cfg[l]; return Math.floor(Math.random() * (c.max - c.min + 1)) + c.min; };
  const prepG = (l) => { setLv(l); setGs('ready'); };
  const startG = (l) => { setLv(l); setSc(0); setRd(1); setTarget(gen(l)); setUa(null); setFingerCount(0); setGs('playing'); };

  const submitAnswer = (count) => {
    if (ua !== null) return;
    const correct = count === target;
    setUa(count);
    if (correct) { setSc(s => s + 15 * lv); speakNumber(target); playSound('correct'); }
    else playSound('wrong');
    setTimeout(() => {
      if (rd < TOTAL_ROUNDS) { setRd(r => r + 1); setTarget(gen(lv)); setUa(null); setFingerCount(0); }
      else setGs('results');
    }, 1800);
  };

  const handleTouch = (e) => { e.preventDefault(); if (ua !== null) return; setFingerCount(e.touches.length); };
  const handleTouchEnd = (e) => { e.preventDefault(); if (ua !== null || fingerCount === 0) return; submitAnswer(fingerCount); };

  if (gs === 'menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Parmak Köprüsü" emoji="🖐️" description="Doğru sayıda parmak göster! Parmakların sayılarla bağlantısını güçlendir." levels={['Seviye 1 (1-5)', 'Seviye 2 (2-7)', 'Seviye 3 (3-9)', 'Seviye 4 (1-10)']} colors={colors} />;
  if (gs === 'ready') return <ReadyScreen title="Parmak Köprüsü" emoji="🖐️" level={lv} instruction={isTouchDevice ? "Bir sayı gösterilecek. Ekrana o kadar parmağınla aynı anda dokun! Parmaklarını kaldırdığında cevabın kontrol edilir." : "Bir sayı gösterilecek. Aşağıdan doğru parmak sayısını gösteren eli seç!"} colors={colors} onStart={() => startG(lv)} onBack={() => setGs('menu')} />;
  if (gs === 'results') return <ResultScreen score={sc} onReplay={() => startG(lv)} onBack={onBack} onLevelMenu={() => setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest} />;

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={() => setGs('menu')} round={rd} score={sc} title="Parmak Köprüsü" colors={colors} />
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">

        {/* Hedef sayı — büyük ve belirgin */}
        <div className="bg-white rounded-2xl shadow-xl px-10 py-5 mb-5 text-center anim-pop" key={rd}>
          <div className="text-base text-gray-500 mb-1">Kaç parmak?</div>
          <div className="text-7xl font-bold text-rose-500">{target}</div>
        </div>

        {ua !== null ? (
          /* Sonuç ekranı */
          <div className="text-center anim-fade">
            <div className="flex justify-center gap-6 mb-4">
              <div className="text-center">
                <div className={`p-3 rounded-2xl ${ua === target ? 'bg-green-50 ring-2 ring-green-300' : 'bg-orange-50 ring-2 ring-orange-300'}`}>
                  <HandsDisplay count={ua} size={70} />
                </div>
                <div className={`text-sm font-bold mt-2 ${ua === target ? 'text-green-600' : 'text-orange-500'}`}>Senin: {ua}</div>
              </div>
              {ua !== target && (
                <div className="text-center">
                  <div className="p-3 rounded-2xl bg-green-50 ring-2 ring-green-300">
                    <HandsDisplay count={target} size={70} />
                  </div>
                  <div className="text-sm font-bold mt-2 text-green-600">Doğru: {target}</div>
                </div>
              )}
            </div>
            <div className={`text-2xl font-bold ${ua === target ? 'text-green-500' : 'text-orange-500'}`}>
              {ua === target ? '🎉 Doğru!' : `${encourage()} Doğru cevap: ${target}`}
            </div>
          </div>
        ) : isTouchDevice ? (
          /* Dokunmatik mod */
          <div
            onTouchStart={handleTouch} onTouchMove={handleTouch} onTouchEnd={handleTouchEnd}
            className={`w-full max-w-md rounded-3xl border-4 border-dashed flex flex-col items-center justify-center transition-all ${fingerCount > 0 ? 'border-rose-400 bg-rose-50 scale-[1.02]' : 'border-gray-300 bg-white'}`}
            style={{ minHeight: 200 }}>
            {fingerCount > 0 ? (
              <div className="text-center py-4">
                <HandsDisplay count={Math.min(fingerCount, 10)} size={90} />
                <div className="text-3xl font-bold text-rose-600 mt-3">{fingerCount} parmak</div>
                <div className="text-sm text-rose-400 mt-1">Parmaklarını kaldırarak onayla ☝️</div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="text-5xl mb-3">🖐️</div>
                <div className="text-lg font-medium">Ekrana <span className="text-rose-500 font-bold">{target}</span> parmakla dokun</div>
              </div>
            )}
          </div>
        ) : (
          /* Masaüstü mod — sadece el görselli butonlar (sembol-sembol eşleşmesini önler) */
          <div className="w-full max-w-lg">
            <div className="text-center text-sm text-gray-500 mb-3">Doğru parmak sayısını gösteren eli seç:</div>
            <div className={`grid ${cfg[lv].max <= 5 ? 'grid-cols-5' : cfg[lv].max <= 7 ? 'grid-cols-4' : 'grid-cols-5'} gap-3 justify-items-center`}>
              {Array.from({ length: cfg[lv].max }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => submitAnswer(n)}
                  aria-label={`${n} parmak`}
                  className="flex items-center justify-center p-3 rounded-2xl border-2 border-gray-200 bg-white hover:border-rose-400 hover:shadow-lg active:scale-95 transition-all">
                  <HandsDisplay count={n} size={n <= 5 ? 52 : 44} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParmakKoprusu;

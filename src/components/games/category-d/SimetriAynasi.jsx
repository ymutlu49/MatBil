import React, { useState } from 'react';
import { shuffle, TOTAL_ROUNDS, encourage, useSafeTimeout } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const SimetriAynasi = ({ onBack, colors, onGameComplete, rahatMod, prevBest }) => {
  const safeSetTimeout = useSafeTimeout();
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);
  const [p,setP]=useState(null);const [ua,setUa]=useState(null);

  // Grid: rows x half sütun (sol yarı), sağ yarı ayna
  // Seviye 1-2: 3 satır x 2 sütun (toplam 4 sütun: 2 sol + 2 sağ)
  // Seviye 3-4: 4 satır x 3 sütun (toplam 6 sütun: 3 sol + 3 sağ)
  const genPattern = (l) => {
    const rows = l <= 2 ? 3 : 4;
    const half = l <= 2 ? 2 : 3;
    const fillChance = l <= 1 ? 0.4 : 0.5;

    // Sol yarıyı oluştur
    const left = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < half; c++) row.push(Math.random() < fillChance ? 1 : 0);
      left.push(row);
    }
    // En az 2 dolu hücre olsun
    const filled = left.flat().filter(c => c === 1).length;
    if (filled < 2) { left[0][0] = 1; left[rows-1][half-1] = 1; }

    // Doğru sağ yarı = sol yarının ayna görüntüsü
    const right = left.map(row => [...row].reverse());
    const rightKey = JSON.stringify(right);

    // Yanlış seçenekler üret — her biri doğru cevaptan VE diğer çeldiricilerden farklı
    const makeWrong = (existing) => {
      const changes = l <= 2 ? 1 : 2;
      for (let attempt = 0; attempt < 30; attempt++) {
        const w = left.map(row => [...row].reverse());
        const used = new Set();
        for (let i = 0; i < changes; i++) {
          let r, c, key, tries = 0;
          do {
            r = Math.floor(Math.random() * rows);
            c = Math.floor(Math.random() * half);
            key = `${r},${c}`;
          } while (used.has(key) && ++tries < 20);
          used.add(key);
          w[r][c] = w[r][c] ? 0 : 1;
        }
        const wKey = JSON.stringify(w);
        if (wKey !== rightKey && !existing.some(e => JSON.stringify(e.right) === wKey)) return w;
      }
      // Fallback: tek hücre flip garantili farklı
      const fb = left.map(row => [...row].reverse());
      const fr = Math.floor(Math.random() * rows);
      const fc = Math.floor(Math.random() * half);
      fb[fr][fc] = fb[fr][fc] ? 0 : 1;
      return fb;
    };

    const opts = [{ right, correct: true }];
    for (let i = 0; i < 3; i++) opts.push({ right: makeWrong(opts), correct: false });
    return { left, rows, half, opts: shuffle(opts) };
  };

  // Grid render - sol ve sağ yarıyı ayrı çiz, arada boşluk (eksen)
  const renderGrid = (left, right, rows, half, small = false) => {
    const cs = small ? 24 : 36;
    const gap = small ? 3 : 4;
    const axisGap = small ? 8 : 14; // Eksen boşluğu

    const renderHalf = (data, color) => (
      <div className="inline-grid" style={{ gridTemplateColumns: `repeat(${half}, ${cs}px)`, gap }}>
        {data.flat().map((cell, i) => (
          <div key={i} className={`rounded-sm ${
            cell === 1 ? `${color} shadow-sm` :
            cell === 0 ? 'bg-gray-100 border border-gray-300' :
            'bg-gray-200 border border-dashed border-gray-400'
          }`} style={{ width: cs, height: cs }} />
        ))}
      </div>
    );

    const rightData = right || left.map(row => Array(half).fill(-1));

    return (
      <div className="flex items-center justify-center">
        {/* Sol yarı */}
        {renderHalf(left, 'bg-indigo-500 border border-indigo-600')}
        {/* Simetri ekseni */}
        <div className="flex flex-col items-center anim-axis-pulse" style={{ width: axisGap }}>
          {Array.from({ length: Math.ceil((rows * (cs + gap)) / 10) }, (_, i) => (
            <div key={i} className="bg-red-400 rounded-full" style={{ width: 3, height: 5, marginBottom: 4 }} />
          ))}
        </div>
        {/* Sağ yarı */}
        {renderHalf(rightData, 'bg-emerald-500 border border-emerald-600')}
      </div>
    );
  };

  const prepG = (l) => { setLv(l); setGs('ready'); };
  const startG = (l) => { setLv(l); setSc(0); setRd(1); setP(genPattern(l)); setUa(null); setGs('playing'); };
  const handle = (i) => { setUa(i); if (p?.opts[i]?.correct) setSc(s => s + 15 * lv); safeSetTimeout(() => { if (rd < TOTAL_ROUNDS) { setRd(r => r + 1); setP(genPattern(lv)); setUa(null); } else setGs('results'); }, 1200); };

  if (gs === 'menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Simetri Aynası" emoji="🪞" description="Deseni simetri eksenine göre tamamla! Ayna görüntüsünü bul." levels={['Sv1: 3 satır Kolay', 'Sv2: 3 satır Orta', 'Sv3: 4 satır Zor', 'Sv4: 4 satır Uzman']} colors={colors} />;
  if (gs === 'ready') return <ReadyScreen title="Simetri Aynası" emoji="🪞" level={lv} instruction="Sol tarafta bir desen gösterilecek. Kırmızı kesikli çizgi simetri eksenidir. Sağ taraftaki ayna görüntüsünü seçeneklerden bul!" colors={colors} onStart={() => startG(lv)} onBack={() => setGs('menu')} />;
  if (gs === 'results') return <ResultScreen score={sc} onReplay={() => startG(lv)} onBack={onBack} onLevelMenu={() => setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest} />;

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={() => setGs('menu')} round={rd} score={sc} title="Simetri Aynası" colors={colors} />
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">

        {/* Soru deseni */}
        <div className="bg-white rounded-2xl shadow-xl px-6 py-4 mb-3 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="inline-block w-3 h-3 rounded-sm bg-indigo-500" />
            <span className="text-sm font-semibold text-indigo-600">Sol yarı</span>
            <span className="text-red-400 font-bold">|</span>
            <span className="inline-block w-3 h-3 rounded-sm bg-gray-200 border border-dashed border-gray-400" />
            <span className="text-sm font-semibold text-gray-500">Sağ yarı (bul!)</span>
          </div>
          {p && renderGrid(p.left, null, p.rows, p.half)}
        </div>

        <div className="text-lg text-gray-700 mb-3 font-semibold">Doğru ayna görüntüsünü seç:</div>

        {/* Seçenekler */}
        <div className="grid grid-cols-2 gap-3">
          {p?.opts?.map((o, i) => (
            <button key={i} onClick={() => ua === null && handle(i)}
              className={`bg-white border-2 rounded-2xl flex items-center justify-center shadow-md transition-all p-3 ${
                ua !== null
                  ? (o.correct ? 'border-green-400 bg-green-50 ring-2 ring-green-300' : i === ua ? 'border-orange-400 bg-orange-50 anim-shake' : 'border-gray-200 opacity-40')
                  : 'border-gray-200 hover:border-indigo-400 hover:shadow-lg active:scale-95'
              }`}>
              {p && renderGrid(p.left, o.right, p.rows, p.half, true)}
            </button>
          ))}
        </div>

        {ua !== null && (
          <div className={`mt-3 text-center font-bold text-base ${p?.opts[ua]?.correct ? 'text-green-500' : 'text-orange-500'}`}>
            {p?.opts[ua]?.correct ? '🎉 Harika! Simetriyi doğru gördün!' : `${encourage()} Kırmızı çizginin her iki yanı aynı olmalı!`}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimetriAynasi;

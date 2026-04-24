import React, { useState, useEffect, useRef } from 'react';
import { TOTAL_ROUNDS, playSound, encourage } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const STRATEGIES = {
  quantity: ['Grupla düşündüm 📦', 'Referans noktası kullandım 📏', 'Sezgisel tahmin yaptım 🧠', 'Yaklaşık saydım 🔢'],
};

const ExplainStep = ({ onDone }) => {
  const strats = STRATEGIES.quantity;
  return (
    <div className="mt-3 anim-fade">
      <div className="text-xs font-bold text-indigo-600 mb-2 text-center">{"🤔"} Hangi stratejiyi kullandın?</div>
      <div className="flex flex-wrap gap-2 justify-center">
        {strats.map((s, i) => (
          <button key={i} onClick={() => onDone(s)}
            className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-medium hover:bg-indigo-100 border border-indigo-200 transition-colors">{s}</button>
        ))}
      </div>
    </div>
  );
};

const TahminKavanozlari = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs, setGs] = useState('menu');
  const [lv, setLv] = useState(1);
  const [sc, setSc] = useState(0);
  const [rd, setRd] = useState(0);
  const [tc, setTc] = useState(0);
  const [ug, setUg] = useState('');
  const [sub, setSub] = useState(false);
  const [visible, setVisible] = useState(true);
  const [peekCount, setPeekCount] = useState(0);
  const [positions, setPositions] = useState([]);
  const [explained, setExplained] = useState(false);

  const cfg = { 1: { min: 5, max: 15 }, 2: { min: 10, max: 25 }, 3: { min: 15, max: 35 }, 4: { min: 20, max: 50 } };
  const bCols = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400', 'bg-orange-400', 'bg-cyan-400'];
  const lastCounts = useRef([]);

  // Tekrarsız sayı seç (son 4 sayıyı hatırla)
  const pickCount = (c) => {
    let count, attempts = 0;
    do {
      count = Math.floor(Math.random() * (c.max - c.min + 1)) + c.min;
      attempts++;
    } while (lastCounts.current.includes(count) && attempts < 12);
    lastCounts.current.push(count);
    if (lastCounts.current.length > 4) lastCounts.current.shift();
    return count;
  };

  const genPositions = (count) => {
    const cols = Math.min(7, Math.ceil(Math.sqrt(count * 1.5)));
    const rows = Math.ceil(count / cols);
    const cellW = 140 / cols;
    const cellH = 190 / rows;
    const pos = [];
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const jitterX = (Math.random() - 0.5) * (cellW * 0.3);
      const jitterY = (Math.random() - 0.5) * (cellH * 0.3);
      pos.push({
        x: Math.max(2, Math.min(138, 8 + col * cellW + cellW / 2 + jitterX)),
        y: Math.max(8, Math.min(198, 190 - (row + 1) * cellH + cellH / 2 + jitterY)),
        col: bCols[i % bCols.length],
      });
    }
    return pos;
  };

  const showTime = { 1: 3000, 2: 2500, 3: 2000, 4: 1500 };

  const prepG = (l) => { setLv(l); setGs('ready'); };
  const startG = (l) => {
    setLv(l); setSc(0); setRd(1); setSub(false); setUg(''); setPeekCount(0);
    lastCounts.current = []; // Yeni seviye → history sıfırla
    const c = cfg[l]; const count = pickCount(c);
    setTc(count); setPositions(genPositions(count));
    setVisible(true); setGs('playing');
    setTimeout(() => setVisible(false), showTime[l]);
  };

  const handlePeek = () => {
    setPeekCount(p => p + 1);
    setVisible(true);
    setTimeout(() => setVisible(false), Math.max(1000, showTime[lv] - peekCount * 500));
  };

  const handleSub = () => {
    const guess = parseInt(ug) || 0;
    const d = Math.abs(guess - tc);
    setSc(s => s + (d === 0 ? 30 : d <= 2 ? 25 : d <= 5 ? 15 : 5) * lv);
    setSub(true); setVisible(true); setExplained(false);
  };

  const handleExplain = () => {
    setExplained(true);
    setTimeout(() => {
      if (rd < TOTAL_ROUNDS) {
        const c = cfg[lv]; setRd(r => r + 1);
        const count = pickCount(c);
        setTc(count); setPositions(genPositions(count));
        setUg(''); setSub(false); setPeekCount(0); setExplained(false);
        setVisible(true);
        setTimeout(() => setVisible(false), showTime[lv]);
      } else setGs('results');
    }, 800);
  };

  if (gs === 'menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Tahmin Kavanozları" emoji="🫙" description="Kavanozda kaç bilye var? Tam isabet en yüksek puanı kazandırır!" levels={['Seviye 1 (5-15)', 'Seviye 2 (10-25)', 'Seviye 3 (15-35)', 'Seviye 4 (20-50)']} colors={colors} />;
  if (gs === 'ready') return <ReadyScreen title="Tahmin Kavanozları" emoji="🫙" level={lv} instruction="Kavanozdaki bilyelere bak ve kaç tane olduğunu tahmin et. Artı/eksi butonlarıyla sayını ayarla ve gönder!" colors={colors} onStart={() => startG(lv)} onBack={() => setGs('menu')} />;
  if (gs === 'results') return <ResultScreen score={sc} onReplay={() => startG(lv)} onBack={onBack} onLevelMenu={() => setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest} />;

  const guess = parseInt(ug) || 0;
  const diff = Math.abs(guess - tc);

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={() => setGs('menu')} round={rd} score={sc} title="Tahmin Kavanozları" colors={colors} />
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 w-full max-w-md">

        {/* Kavanoz */}
        <div className="relative mb-4">
          {/* Kapak */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-32 h-5 bg-gradient-to-b from-amber-500 to-amber-700 rounded-t-xl border-2 border-amber-800 z-10 shadow-md" />
          {/* Gövde */}
          <div className="w-52 h-64 bg-white/90 rounded-2xl border-4 border-amber-400 relative overflow-hidden shadow-xl backdrop-blur-sm">
            {/* Cam parlama efekti */}
            <div className="absolute left-1 top-6 w-2 h-[70%] bg-white/40 rounded-full" />
            <div className="absolute inset-3 top-7">
              {visible ? positions.map((p, i) => (
                <div key={i} className={`absolute w-5 h-5 ${p.col} rounded-full shadow-md border border-white/50`}
                  style={{ left: p.x, top: p.y, transform: 'translate(-50%,-50%)' }} />
              )) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl mb-1">{"❓"}</span>
                  <span className="text-sm text-gray-400 font-medium">Kaç taneydi?</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tekrar göster */}
        {!visible && !sub && (
          <button onClick={handlePeek} className="mb-4 px-5 py-2.5 bg-white text-amber-700 rounded-xl text-sm font-bold hover:bg-amber-50 transition-colors shadow-md border border-amber-200">
            {"👁️"} Tekrar Göster {peekCount > 0 && `(${peekCount})`}
          </button>
        )}

        {/* Tahmin girişi */}
        {!sub ? (
          <div className="flex flex-col items-center w-full">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setUg(String(Math.max(1, (parseInt(ug) || 0) - 5)))}
                className="w-12 h-12 bg-white rounded-2xl font-bold text-lg text-gray-600 shadow-md border border-gray-200 active:scale-95 transition-all hover:bg-gray-50">-5</button>
              <button onClick={() => setUg(String(Math.max(1, (parseInt(ug) || 0) - 1)))}
                className="w-14 h-14 bg-white rounded-2xl font-bold text-2xl text-amber-600 shadow-lg border-2 border-amber-200 active:scale-95 transition-all hover:bg-amber-50">{"−"}</button>
              <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center border-3 border-amber-400">
                <input type="number" value={ug} onChange={e => setUg(e.target.value)} placeholder="?"
                  className="w-16 text-center text-4xl font-bold text-amber-600 outline-none bg-transparent" />
              </div>
              <button onClick={() => setUg(String((parseInt(ug) || 0) + 1))}
                className="w-14 h-14 bg-white rounded-2xl font-bold text-2xl text-amber-600 shadow-lg border-2 border-amber-200 active:scale-95 transition-all hover:bg-amber-50">+</button>
              <button onClick={() => setUg(String((parseInt(ug) || 0) + 5))}
                className="w-12 h-12 bg-white rounded-2xl font-bold text-lg text-gray-600 shadow-md border border-gray-200 active:scale-95 transition-all hover:bg-gray-50">+5</button>
            </div>
            <button onClick={handleSub} disabled={!ug || ug === '0'}
              className={`px-10 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all ${ug && ug !== '0' ? `${colors?.button} text-white hover:shadow-2xl active:scale-95` : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              {"🎯"} Tahmin Et
            </button>
          </div>
        ) : (
          <div className={`text-center w-full max-w-xs ${diff === 0 ? 'anim-pop' : 'anim-fade'}`}>
            <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100 mb-2">
              <div className="text-lg font-bold text-gray-700 mb-1">Doğru cevap: <span className="text-amber-600 text-2xl">{tc}</span></div>
              <div className={`text-lg font-bold ${diff === 0 ? 'text-green-500' : diff <= 2 ? 'text-green-400' : diff <= 5 ? 'text-amber-500' : 'text-orange-500'}`}>
                {diff === 0 ? '🎯 Tam isabet!' : diff <= 2 ? '👏 Çok yaklaştın!' : diff <= 5 ? `💪 Yakın! (Fark: ${diff})` : `Fark: ${diff}`}
              </div>
              <div className="text-xs text-gray-400 mt-1">Senin tahminin: {guess}</div>
            </div>
            {!explained && <ExplainStep onDone={handleExplain} />}
            {explained && <div className="text-xs text-green-600 mt-2 font-medium anim-fade">{"✓"} Harika!</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default TahminKavanozlari;

import React, { useState } from 'react';
import { shuffle, TOTAL_ROUNDS, playSound, encourage, useSafeTimeout } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const SayiBaglari = ({ onBack, colors, onGameComplete, rahatMod, prevBest }) => {
  const safeSetTimeout = useSafeTimeout();
  const [gs, setGs] = useState('menu');
  const [lv, setLv] = useState(1);
  const [sc, setSc] = useState(0);
  const [rd, setRd] = useState(0);
  const [p, setP] = useState(null);
  const [ua, setUa] = useState(null);

  // Seviye yapılandırması
  const cfg = {
    1: { min: 3, max: 5 },   // Küçük sayılar (3-5)
    2: { min: 5, max: 8 },   // Orta sayılar (5-8)
    3: { min: 6, max: 10 },  // Büyük sayılar (6-10)
    4: { min: 8, max: 15 },  // İleri (8-15)
  };

  const gen = (l) => {
    const c = cfg[l];
    const whole = Math.floor(Math.random() * (c.max - c.min + 1)) + c.min;

    // Doğru bir parçalama seç
    const part1 = Math.floor(Math.random() * (whole - 1)) + 1;
    const part2 = whole - part1;

    // Soru tipi: "X + ? = whole" veya "? + X = whole"
    const askSecond = Math.random() > 0.5;
    const given = askSecond ? part1 : part2;
    const answer = askSecond ? part2 : part1;

    // Seçenekler oluştur
    const o = [answer];
    let at = 0;
    while (o.length < 4 && at < 40) {
      const v = Math.max(1, answer + Math.floor(Math.random() * 6) - 3);
      if (!o.includes(v) && v > 0 && v < whole) o.push(v);
      at++;
    }
    while (o.length < 4) o.push(o.length + 1);

    // Benzersiz parçalama çiftleri (3+5 gösterildiyse 5+3 eklenmez)
    const allBonds = [];
    for (let i = 1; i <= Math.floor(whole / 2); i++) allBonds.push(`${i} + ${whole - i}`);

    return {
      whole,
      part1,
      part2,
      given,
      answer,
      askSecond,
      options: shuffle(o),
      allBonds,
    };
  };

  const prepG = (l) => { setLv(l); setGs('ready'); };
  const startG = (l) => { setLv(l); setSc(0); setRd(1); setP(gen(l)); setUa(null); setGs('playing'); };
  const handle = (a) => {
    setUa(a);
    if (a === p?.answer) { setSc(s => s + 15 * lv); playSound('correct'); }
    else playSound('wrong');
    safeSetTimeout(() => {
      if (rd < TOTAL_ROUNDS) { setRd(r => r + 1); setP(gen(lv)); setUa(null); }
      else setGs('results');
    }, 1800);
  };

  if (gs === 'menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Sayı Bağları" emoji="🔗" description="Bir sayının parçalarını bul! Hangi iki sayının toplamı bu sayıyı verir?" levels={['Seviye 1 (3-5)', 'Seviye 2 (5-8)', 'Seviye 3 (6-10)', 'Seviye 4 (8-15)']} colors={colors} />;
  if (gs === 'ready') return <ReadyScreen title="Sayı Bağları" emoji="🔗" level={lv} instruction="Bir bütün sayı ve onun bir parçası gösterilecek. Eksik parçayı bul! Toplamları bütün sayıya eşit olmalı." colors={colors} onStart={() => startG(lv)} onBack={() => setGs('menu')} />;
  if (gs === 'results') return <ResultScreen score={sc} onReplay={() => startG(lv)} onBack={onBack} onLevelMenu={() => setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest} />;

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={() => setGs('menu')} round={rd} score={sc} title="Sayı Bağları" colors={colors} />
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">

        {/* Bütün sayı — üstte daire */}
        <div className="mb-4">
          <div className="w-20 h-20 rounded-full bg-purple-500 shadow-lg flex items-center justify-center mx-auto">
            <span className="text-3xl font-bold text-white">{p?.whole}</span>
          </div>
          <div className="text-xs font-bold text-purple-600 text-center mt-1">BÜTÜN</div>
        </div>

        {/* Bağlantı çizgileri */}
        <svg width="200" height="40" className="mb-2">
          <line x1="100" y1="0" x2="50" y2="40" stroke="#C4B5FD" strokeWidth="3" strokeDasharray="6,4" className="anim-dash-flow" />
          <line x1="100" y1="0" x2="150" y2="40" stroke="#C4B5FD" strokeWidth="3" strokeDasharray="6,4" className="anim-dash-flow" />
        </svg>

        {/* Parçalar — alt iki daire */}
        <div className="flex gap-8 mb-5">
          {/* Sol parça */}
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center ${
              p?.askSecond ? 'bg-rose-100 border-3 border-rose-400' : (ua !== null ? 'bg-green-100 border-3 border-green-400' : 'bg-purple-100 border-3 border-purple-400 animate-pulse')
            }`}>
              {p?.askSecond ? (
                <span className="text-2xl font-bold text-rose-600">{p?.given}</span>
              ) : ua !== null ? (
                <span className="text-2xl font-bold text-green-600">{p?.answer}</span>
              ) : (
                <span className="text-2xl font-bold text-purple-400">?</span>
              )}
            </div>
            <div className="text-xs font-bold text-rose-500 mt-1">PARÇA</div>
          </div>

          {/* Artı işareti */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-400">+</span>
          </div>

          {/* Sağ parça */}
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center ${
              !p?.askSecond ? 'bg-sky-100 border-3 border-sky-400' : (ua !== null ? 'bg-green-100 border-3 border-green-400' : 'bg-purple-100 border-3 border-purple-400 animate-pulse')
            }`}>
              {!p?.askSecond ? (
                <span className="text-2xl font-bold text-sky-600">{p?.given}</span>
              ) : ua !== null ? (
                <span className="text-2xl font-bold text-green-600">{p?.answer}</span>
              ) : (
                <span className="text-2xl font-bold text-purple-400">?</span>
              )}
            </div>
            <div className="text-xs font-bold text-sky-500 mt-1">PARÇA</div>
          </div>
        </div>

        {/* Soru */}
        <div className="bg-white px-5 py-2 rounded-xl shadow mb-4 text-center">
          <span className="text-lg text-gray-700 font-medium">
            {p?.askSecond
              ? `${p?.given} + ? = ${p?.whole}`
              : `? + ${p?.given} = ${p?.whole}`
            }
          </span>
        </div>

        {/* Seçenekler veya geri bildirim */}
        {ua !== null ? (
          <div className="text-center anim-fade">
            <div className={`text-2xl font-bold mb-2 ${ua === p?.answer ? 'text-green-500' : 'text-orange-500'}`}>
              {ua === p?.answer ? '🎉 Doğru!' : `${encourage()} Cevap: ${p?.answer}`}
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700">
              💡 {p?.whole} sayısının bağları: {p?.allBonds.slice(0, 4).join(' | ')}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {p?.options?.map((o, i) => (
              <button key={i} onClick={() => handle(o)}
                className={`px-8 py-4 ${colors?.button} text-white rounded-2xl font-bold text-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all`}>
                {o}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SayiBaglari;

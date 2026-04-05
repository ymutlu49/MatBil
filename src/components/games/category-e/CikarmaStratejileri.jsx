import React, { useState } from 'react';
import { shuffle, TOTAL_ROUNDS, playSound, encourage } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const CikarmaStratejileri = ({ onBack, colors, onGameComplete, rahatMod, prevBest }) => {
  const [gs, setGs] = useState('menu');
  const [lv, setLv] = useState(1);
  const [sc, setSc] = useState(0);
  const [rd, setRd] = useState(0);
  const [p, setP] = useState(null);
  const [ua, setUa] = useState(null);

  const gen = (l) => {
    let a, b, answer, type, question, hint;

    if (l === 1) {
      // Basit çıkarma (1-10 arası, sonuç pozitif)
      a = Math.floor(Math.random() * 8) + 3; // 3-10
      b = Math.floor(Math.random() * (a - 1)) + 1; // 1 ile a-1 arası
      answer = a - b;
      type = 'basic';
      question = `${a} - ${b} = ?`;
      hint = `${a}'den ${b} çıkar: geriye ${answer} kalır`;
    } else if (l === 2) {
      // Onluktan çıkarma (10, 20'den çıkarma)
      const base = Math.random() > 0.5 ? 10 : 20;
      b = Math.floor(Math.random() * (base - 2)) + 1;
      a = base;
      answer = a - b;
      type = 'fromTen';
      question = `${a} - ${b} = ?`;
      hint = `${a}'dan ${b} çıkarmak için: ${a} - ${b} = ${answer}`;
    } else if (l === 3) {
      // Tamamlama stratejisi (eksik çıkan) — ? - b = c
      answer = Math.floor(Math.random() * 10) + 5; // 5-14
      b = Math.floor(Math.random() * (answer - 1)) + 1;
      a = answer;
      const c = a - b;
      type = 'missing';
      question = `? - ${b} = ${c}`;
      hint = `${c} + ${b} = ${a}. Eksik sayı ${a}`;
    } else {
      // İleri: iki basamaklı çıkarma
      a = Math.floor(Math.random() * 30) + 12; // 12-41
      b = Math.floor(Math.random() * Math.min(a - 1, 15)) + 1;
      answer = a - b;
      type = 'advanced';
      // Strateji ipucu
      if (b <= 10) {
        hint = `${a} - ${b}: Önce onluğa in (${a} - ${a % 10} = ${a - a % 10}), sonra kalanı çıkar`;
      } else {
        hint = `${a} - ${b}: Parçala! ${a} - ${Math.floor(b / 10) * 10} = ${a - Math.floor(b / 10) * 10}, sonra - ${b % 10} = ${answer}`;
      }
      question = `${a} - ${b} = ?`;
    }

    // Doğru cevap ve çeldiriciler
    const correctAnswer = type === 'missing' ? a : answer;
    const o = [correctAnswer];
    let at = 0;
    while (o.length < 4 && at < 40) {
      const diff = Math.floor(Math.random() * 6) - 3;
      const v = correctAnswer + diff;
      if (!o.includes(v) && v >= 0 && v !== correctAnswer) o.push(v);
      at++;
    }
    while (o.length < 4) o.push(o.length + correctAnswer);

    return { a, b, answer, type, question, correctAnswer, hint, options: shuffle(o) };
  };

  const prepG = (l) => { setLv(l); setGs('ready'); };
  const startG = (l) => { setLv(l); setSc(0); setRd(1); setP(gen(l)); setUa(null); setGs('playing'); };
  const handle = (a) => {
    setUa(a);
    if (a === p?.correctAnswer) { setSc(s => s + 15 * lv); playSound('correct'); }
    else playSound('wrong');
    setTimeout(() => {
      if (rd < TOTAL_ROUNDS) { setRd(r => r + 1); setP(gen(lv)); setUa(null); }
      else setGs('results');
    }, 1800);
  };

  if (gs === 'menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Çıkarma Stratejileri" emoji="➖" description="Çıkarma işlemlerini farklı stratejilerle çöz! Geriye sayma, onluktan çıkarma ve tamamlama." levels={['Seviye 1 (Basit 1-10)', 'Seviye 2 (Onluktan çıkarma)', 'Seviye 3 (Eksik çıkan)', 'Seviye 4 (İki basamaklı)']} colors={colors} />;
  if (gs === 'ready') return <ReadyScreen title="Çıkarma Stratejileri" emoji="➖" level={lv} instruction={lv <= 2 ? "Çıkarma işleminin sonucunu bul! İpucu: geriye doğru sayabilirsin." : "Eksik sayıyı veya sonucu bul! İpucu: toplama ile kontrol edebilirsin."} colors={colors} onStart={() => startG(lv)} onBack={() => setGs('menu')} />;
  if (gs === 'results') return <ResultScreen score={sc} onReplay={() => startG(lv)} onBack={onBack} onLevelMenu={() => setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest} />;

  // Görsel: çıkarma için nokta gösterimi
  const DotVisual = ({ total, removed }) => {
    if (total > 15) return null;
    return (
      <div className="flex flex-wrap justify-center gap-1 mb-3" style={{ maxWidth: 200 }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={`w-5 h-5 rounded-full transition-all ${
            i < total - removed ? 'bg-purple-400' : 'bg-gray-300 line-through opacity-40'
          }`} style={i >= total - removed ? { textDecoration: 'line-through' } : {}} />
        ))}
      </div>
    );
  };

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={() => setGs('menu')} round={rd} score={sc} title="Çıkarma Stratejileri" colors={colors} />
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">

        {/* Soru */}
        <div className="bg-white rounded-2xl shadow-xl px-8 py-5 mb-4 text-center">
          <div className="text-3xl font-bold text-purple-700 mb-2">{p?.question}</div>
          {p?.type === 'missing' && (
            <div className="text-sm text-gray-500">İpucu: Toplama ile düşün!</div>
          )}
        </div>

        {/* Görsel destek (küçük sayılarda) */}
        {p?.a <= 15 && p?.type !== 'missing' && (
          <DotVisual total={p?.a} removed={p?.b} />
        )}

        {/* Seçenekler veya geri bildirim */}
        {ua !== null ? (
          <div className="text-center anim-fade">
            <div className={`text-2xl font-bold mb-2 ${ua === p?.correctAnswer ? 'text-green-500' : 'text-orange-500'}`}>
              {ua === p?.correctAnswer ? '🎉 Doğru!' : `${encourage()} Cevap: ${p?.correctAnswer}`}
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700 max-w-sm">
              💡 {p?.hint}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {p?.options?.map((o, i) => (
              <button key={i} onClick={() => handle(o)}
                className={`px-8 py-4 ${colors?.button} text-white rounded-xl font-bold text-2xl shadow-lg active:scale-95 transition-transform`}>
                {o}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CikarmaStratejileri;

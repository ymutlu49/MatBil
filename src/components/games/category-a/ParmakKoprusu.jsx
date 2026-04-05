import React, { useState, useRef } from 'react';
import { TOTAL_ROUNDS, playSound, vibrate, encourage, speakNumber } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const ParmakKoprusu = ({ onBack, colors, onGameComplete, rahatMod, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);
  const [target,setTarget]=useState(0);const [fingerCount,setFingerCount]=useState(0);const [ua,setUa]=useState(null);
  const [isTouchDevice] = useState(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0);
  const cfg={1:{min:1,max:5},2:{min:2,max:7},3:{min:3,max:9},4:{min:1,max:10}};

  const gen=(l)=>{const c=cfg[l];return Math.floor(Math.random()*(c.max-c.min+1))+c.min;};
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setTarget(gen(l));setUa(null);setFingerCount(0);setGs('playing');};

  const submitAnswer=(count)=>{
    if(ua!==null) return;
    const correct=count===target;
    setUa(count);
    if(correct){setSc(s=>s+15*lv);speakNumber(target);playSound('correct');}
    else playSound('wrong');
    setTimeout(()=>{
      if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setTarget(gen(lv));setUa(null);setFingerCount(0);}
      else setGs('results');
    },1500);
  };

  const handleTouch=(e)=>{
    e.preventDefault();
    if(ua!==null) return;
    setFingerCount(e.touches.length);
  };

  const handleTouchEnd=(e)=>{
    e.preventDefault();
    if(ua!==null||fingerCount===0) return;
    submitAnswer(fingerCount);
  };

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Parmak Köprüsü" emoji="🖐️" description="Ekrana doğru sayıda parmakla dokun! Parmakların sayılarla bağlantısını güçlendir." levels={['Seviye 1 (1-5)','Seviye 2 (2-7)','Seviye 3 (3-9)','Seviye 4 (1-10)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Parmak Köprüsü" emoji="🖐️" level={lv} instruction={isTouchDevice ? "Bir sayı gösterilecek. Ekrana o kadar parmağınla aynı anda dokun! Parmaklarını kaldırdığında cevabın kontrol edilir." : "Bir sayı gösterilecek. Aşağıdaki butonlardan doğru parmak sayısını seç!"} colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  // Parmak SVG'si oluştur (count kadar açık parmak)
  const HandSVG = ({count, size=120}) => (
    <svg viewBox="0 0 100 130" width={size} height={size*1.3}>
      <ellipse cx="50" cy="100" rx="32" ry="25" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5"/>
      {/* Başparmak */}
      <rect x="14" y="68" width="13" height={count>=1?35:15} rx="6.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2" transform="rotate(-15,20,85)"/>
      {count>=1 && <ellipse cx="17" cy="66" rx="4" ry="2.5" fill="#FDE68A"/>}
      {/* İşaret */}
      <rect x="27" y={count>=2?25:65} width="11" height={count>=2?50:20} rx="5.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2"/>
      {count>=2 && <ellipse cx="32.5" cy="28" rx="3.5" ry="2.5" fill="#FDE68A"/>}
      {/* Orta */}
      <rect x="40" y={count>=3?20:62} width="11" height={count>=3?55:22} rx="5.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2"/>
      {count>=3 && <ellipse cx="45.5" cy="23" rx="3.5" ry="2.5" fill="#FDE68A"/>}
      {/* Yüzük */}
      <rect x="53" y={count>=4?25:65} width="11" height={count>=4?50:18} rx="5.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2"/>
      {count>=4 && <ellipse cx="58.5" cy="28" rx="3.5" ry="2.5" fill="#FDE68A"/>}
      {/* Serçe */}
      <rect x="66" y={count>=5?35:68} width="10" height={count>=5?42:16} rx="5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2"/>
      {count>=5 && <ellipse cx="71" cy="38" rx="3" ry="2" fill="#FDE68A"/>}
    </svg>
  );

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Parmak Köprüsü" colors={colors}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">

        {/* Hedef sayı */}
        <div className="bg-white rounded-2xl shadow-xl px-8 py-4 mb-4 text-center">
          <div className="text-sm text-gray-500 mb-1">{isTouchDevice ? 'Bu sayı kadar parmakla dokun:' : 'Kaç parmak gösterilmeli?'}</div>
          <div className="text-6xl font-bold text-indigo-600 anim-pop" key={rd}>{target}</div>
        </div>

        {/* Hedef el görseli */}
        <div className="mb-4 opacity-30">
          <HandSVG count={target} size={80}/>
          <div className="text-xs text-gray-400 text-center mt-1">Hedef: {target} parmak</div>
        </div>

        {ua !== null ? (
          /* Sonuç */
          <div className="text-center anim-fade">
            <div className="flex justify-center gap-4 mb-3">
              <div className="text-center">
                <HandSVG count={ua} size={90}/>
                <div className="text-sm font-bold text-gray-600 mt-1">Sen: {ua}</div>
              </div>
              {ua !== target && (
                <div className="text-center">
                  <HandSVG count={target} size={90}/>
                  <div className="text-sm font-bold text-green-600 mt-1">Doğru: {target}</div>
                </div>
              )}
            </div>
            <div className={`text-2xl font-bold ${ua===target?'text-green-500':'text-orange-500'}`}>
              {ua===target?'🎉 Doğru!':encourage()}
            </div>
          </div>
        ) : isTouchDevice ? (
          /* Dokunmatik mod: dokunma alanı */
          <div
            onTouchStart={handleTouch} onTouchMove={handleTouch} onTouchEnd={handleTouchEnd}
            className={`w-full max-w-sm rounded-3xl border-4 border-dashed flex flex-col items-center justify-center transition-all p-6 ${
              fingerCount>0 ? 'border-indigo-400 bg-indigo-50 scale-[1.02]' : 'border-gray-300 bg-gray-50'
            }`} style={{minHeight: 160}}>
            {fingerCount > 0 ? (
              <div className="text-center">
                <HandSVG count={Math.min(fingerCount, 10)} size={100}/>
                <div className="text-3xl font-bold text-indigo-600 mt-2">{fingerCount} parmak</div>
                <div className="text-sm text-indigo-400">Kaldırarak onayla ☝️</div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-2">🖐️</div>
                <div className="text-base font-medium">Buraya {target} parmakla dokun</div>
              </div>
            )}
          </div>
        ) : (
          /* Masaüstü mod: sayı butonları */
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-3">Doğru parmak sayısını seç:</div>
            <div className="grid grid-cols-5 gap-2 max-w-sm">
              {Array.from({length: cfg[lv].max}, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => submitAnswer(n)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all active:scale-95 ${colors?.button} bg-opacity-10 hover:shadow-lg border-gray-200 hover:border-indigo-400`}>
                  <HandSVG count={n} size={44}/>
                  <span className="text-lg font-bold text-gray-700">{n}</span>
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

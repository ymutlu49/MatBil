import React, { useState } from 'react';
import { TOTAL_ROUNDS, encourage, playSound, speakNumber } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const SayiDogrusuYurume = ({ onBack, colors, onGameComplete, rahatMod, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);
  const [p,setP]=useState(null);const [pos,setPos]=useState(0);const [steps,setSteps]=useState(0);const [submitted,setSubmitted]=useState(false);
  const [moving, setMoving] = useState(false);
  const [lastDir, setLastDir] = useState(1);

  const gen=(l)=>{
    let a,b,op,answer,max;
    if(l<=2){max=10;a=Math.floor(Math.random()*7)+1;b=Math.floor(Math.random()*Math.min(5,max-a))+1;op='+';answer=a+b;}
    else{max=l===3?15:20;
      if(Math.random()>0.4){a=Math.floor(Math.random()*(max-3))+2;b=Math.floor(Math.random()*Math.min(5,max-a))+1;op='+';answer=a+b;}
      else{a=Math.floor(Math.random()*(max-2))+3;b=Math.floor(Math.random()*Math.min(4,a-1))+1;op='-';answer=a-b;}
    }
    return {a,b,op,answer,max};
  };

  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);const q=gen(l);setP(q);setPos(q.a);setSteps(0);setSubmitted(false);setMoving(false);setLastDir(q.op==='+'?1:-1);setGs('playing');};

  const step=(dir)=>{
    if(submitted) return;
    setSteps(s=>s+1);
    setPos(prev=>Math.max(0,Math.min(p.max,prev+dir)));
    setLastDir(dir);
    setMoving(true);
    setTimeout(()=>setMoving(false), 400);
  };

  const submit=()=>{
    setSubmitted(true);
    const correct=pos===p?.answer;
    if(correct){setSc(s=>s+20*lv);playSound('correct');speakNumber(pos);}
    else playSound('wrong');
    setTimeout(()=>{
      if(rd<TOTAL_ROUNDS){setRd(r=>r+1);const q=gen(lv);setP(q);setPos(q.a);setSteps(0);setSubmitted(false);setMoving(false);setLastDir(q.op==='+'?1:-1);}
      else setGs('results');
    },1800);
  };

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Sayı Yürüyüşü" emoji="🚶" description="Sayı doğrusu üzerinde yürüyerek toplama ve çıkarma yap!" levels={['Sv1: Toplama (0-10)','Sv2: Toplama (0-10)','Sv3: Karışık (0-15)','Sv4: Karışık (0-20)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Sayı Yürüyüşü" emoji="🚶" level={lv} instruction="Sayı doğrusu üzerinde başlangıç noktasındasın. Ok butonlarıyla doğru sayıda adım atarak sonuca ulaş!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  const pct = p ? (pos / p.max) * 100 : 0;
  const ticks = p ? Array.from({length: p.max + 1}, (_, i) => i) : [];

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Sayı Yürüyüşü" colors={colors}/>

      {/* İçerik - dikeyde ortalanmış */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        {/* Soru */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-4 text-center w-full max-w-sm">
          <div className="text-3xl font-bold text-purple-700 mb-1">{p?.a} {p?.op} {p?.b} = ?</div>
          <div className="text-base text-gray-500">{p?.op==='+'?`${p?.a}'den ${p?.b} adım ileri yürü`:`${p?.a}'den ${p?.b} adım geri gel`}</div>
        </div>

        {/* Sayı Doğrusu */}
        <div className="w-full max-w-md mb-4 px-4">
          <div className="relative" style={{height: 100}}>
            {/* Karakter */}
            <div className="absolute transition-all duration-300 -translate-x-1/2 text-center z-10" style={{left:`${pct}%`, top: 0}}>
              <div style={{fontSize: 48, lineHeight: 1, transform: lastDir >= 0 ? 'scaleX(1)' : 'scaleX(-1)'}} className={moving ? 'anim-walk' : ''}>🚶</div>
            </div>

            {/* Doğru çizgisi */}
            <div className="absolute left-0 right-0" style={{top: 60}}>
              {/* Ana çizgi */}
              <div className="w-full h-1 bg-gray-800 rounded-full"/>
              {/* Oklar */}
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0 h-0" style={{borderTop:'6px solid transparent',borderBottom:'6px solid transparent',borderRight:'8px solid #1f2937'}}/>
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0 h-0" style={{borderTop:'6px solid transparent',borderBottom:'6px solid transparent',borderLeft:'8px solid #1f2937'}}/>
            </div>

            {/* Tick mark'lar ve sayılar */}
            {ticks.map(i => {
              const tickPct = (i / p.max) * 100;
              const isStart = i === p.a;
              const isAnswer = submitted && i === p.answer;
              const isCurrent = i === pos;
              const isMajor = i === 0 || i === p.max || i === Math.floor(p.max / 2);
              return (
                <div key={i} className="absolute -translate-x-1/2" style={{left:`${tickPct}%`, top: 52}}>
                  {/* Tick çizgisi */}
                  <div className={`w-0.5 mx-auto ${isMajor || isStart || isAnswer ? 'h-5' : 'h-3'} ${isAnswer ? 'bg-green-500' : isStart ? 'bg-blue-500' : 'bg-gray-600'}`}/>
                  {/* Sayı */}
                  {(isMajor || isStart || isAnswer || isCurrent) && (
                    <div className={`text-center mt-0.5 font-bold ${isAnswer ? 'text-green-600 text-sm' : isStart ? 'text-blue-600 text-sm' : isCurrent && !isMajor ? 'text-purple-600 text-xs' : 'text-gray-600 text-xs'}`}>
                      {i}
                    </div>
                  )}
                  {/* Başlangıç işareti */}
                  {isStart && !submitted && <div className="text-center text-blue-500 text-xs font-bold mt-0.5">▲</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Kontroller */}
        {!submitted ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-5">
              <button onClick={()=>step(-1)} disabled={pos<=0}
                className={`w-16 h-16 rounded-2xl font-bold text-2xl shadow-lg transition-all active:scale-90 ${pos>0?'bg-orange-400 text-white hover:bg-orange-500':'bg-gray-200 text-gray-400'}`}>←</button>
              <div className="text-center min-w-[80px]">
                <div className="text-lg font-extrabold text-purple-600">{steps} adım</div>
                <div className="text-base font-bold text-gray-700">Konum: {pos}</div>
              </div>
              <button onClick={()=>step(1)} disabled={pos>=p?.max}
                className={`w-16 h-16 rounded-2xl font-bold text-2xl shadow-lg transition-all active:scale-90 ${pos<p?.max?'bg-emerald-400 text-white hover:bg-emerald-500':'bg-gray-200 text-gray-400'}`}>→</button>
            </div>
            <button onClick={submit} className={`px-8 py-3 ${colors?.button} text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform`}>✓ Burası!</button>
          </div>
        ) : (
          <div className="text-center anim-fade">
            <div className={`text-2xl font-bold mb-2 ${pos===p?.answer?'text-green-500':'text-orange-500'}`}>
              {pos===p?.answer?'🎉 Doğru yere yürüdün!':encourage()}
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-base text-amber-700">
              {p?.a} {p?.op} {p?.b} = {p?.answer} {pos!==p?.answer?`(Sen ${pos}'a yürüdün)`:''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SayiDogrusuYurume;

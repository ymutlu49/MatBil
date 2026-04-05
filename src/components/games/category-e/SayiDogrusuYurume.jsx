import React, { useState } from 'react';
import { TOTAL_ROUNDS, encourage, playSound, speakNumber } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const numColor = (val, max = 20) => {
  const ratio = Math.min(val / max, 1);
  const hue = 220 - ratio * 160;
  return `hsl(${hue}, 70%, 45%)`;
};

const SayiDogrusuYurume = ({ onBack, colors, onGameComplete, rahatMod, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);
  const [p,setP]=useState(null);const [pos,setPos]=useState(0);const [steps,setSteps]=useState(0);const [submitted,setSubmitted]=useState(false);

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
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);const q=gen(l);setP(q);setPos(q.a);setSteps(0);setSubmitted(false);setGs('playing');};

  const step=(dir)=>{
    if(submitted) return;
    const newSteps=steps+1;
    setSteps(newSteps);
    setPos(prev=>Math.max(0,Math.min(p.max,prev+dir)));
  };

  const submit=()=>{
    setSubmitted(true);
    const correct=pos===p?.answer;
    if(correct){setSc(s=>s+20*lv);playSound('correct');speakNumber(pos);}
    else playSound('wrong');
    setTimeout(()=>{
      if(rd<TOTAL_ROUNDS){setRd(r=>r+1);const q=gen(lv);setP(q);setPos(q.a);setSteps(0);setSubmitted(false);}
      else setGs('results');
    },1800);
  };

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Sayı Yürüyüşü" emoji="" description="Sayı doğrusu üzerinde yürüyerek toplama ve çıkarma yap! İleri git veya geri gel." levels={['Sv1: Toplama (0-10)','Sv2: Toplama (0-10)','Sv3: Karışık (0-15)','Sv4: Karışık (0-20)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Sayı Yürüyüşü" emoji="" level={lv} instruction="Sayı doğrusu üzerinde başlangıç noktasındasın. Ok butonlarıyla doğru sayıda adım atarak sonuca ulaş!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  const pct=p?(pos/p.max)*100:0;
  const startPct=p?(p.a/p.max)*100:0;
  const ansPct=p?(p.answer/p.max)*100:0;

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center justify-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Sayı Yürüyüşü" colors={colors}/>
      <div className="bg-white rounded-2xl shadow-xl p-4 mb-3 text-center w-full max-w-sm">
        <div className="text-2xl font-bold text-purple-700 mb-1">{p?.a} {p?.op} {p?.b} = ?</div>
        <div className="text-sm text-gray-500">{p?.op==='+'?`${p?.a}'den ${p?.b} adım ileri yürü`:`${p?.a}'den ${p?.b} adım geri gel`}</div>
      </div>

      <div className="w-full max-w-sm mb-3 px-2">
        <div className="relative h-16">
          <div className="absolute top-8 left-0 right-0 h-1 bg-gray-300 rounded"/>
          <div className="absolute top-5 h-7 w-0.5 bg-blue-400" style={{left:`${startPct}%`}}/>
          {submitted && <div className="absolute top-5 h-7 w-0.5 bg-green-500" style={{left:`${ansPct}%`}}/>}
          <div className="absolute top-0 transition-all duration-300 -translate-x-1/2 text-center" style={{left:`${pct}%`}}>
            <div className="text-2xl">{'🚶'}</div>
            <div className="text-xs font-bold bg-white px-1 rounded shadow" style={{color:numColor(pos,p?.max||20)}}>{pos}</div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          {p?.max>=10&&<span>{Math.floor(p.max/2)}</span>}
          <span>{p?.max}</span>
        </div>
      </div>

      {!submitted ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <button onClick={()=>step(-1)} disabled={pos<=0} className={`w-16 h-16 rounded-2xl font-bold text-2xl shadow-lg transition-all ${pos>0?'bg-orange-400 text-white hover:bg-orange-500':'bg-gray-200 text-gray-400'}`}>{'←'}</button>
            <div className="text-center">
              <div className="text-xs text-gray-500">{steps} adım</div>
              <div className="text-sm font-bold text-gray-700">Konum: {pos}</div>
            </div>
            <button onClick={()=>step(1)} disabled={pos>=p?.max} className={`w-16 h-16 rounded-2xl font-bold text-2xl shadow-lg transition-all ${pos<p?.max?'bg-emerald-400 text-white hover:bg-emerald-500':'bg-gray-200 text-gray-400'}`}>{'→'}</button>
          </div>
          <button onClick={submit} className={`px-8 py-3 ${colors?.button} text-white rounded-xl font-bold shadow-lg mt-2`}>{'✓'} Burası!</button>
        </div>
      ) : (
        <div className="text-center anim-fade">
          <div className={`text-2xl font-bold mb-2 ${pos===p?.answer?'text-green-500':'text-orange-500'}`}>
            {pos===p?.answer?'✓ Doğru yere yürüdün!':encourage()}
          </div>
          <div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700">
            {'🚶'} {p?.a} {p?.op} {p?.b} = {p?.answer} {pos!==p?.answer?`(Sen ${pos}'a yürüdün)`:''}
          </div>
        </div>
      )}
    </div>
  );
};

export default SayiDogrusuYurume;

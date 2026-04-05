import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TOTAL_ROUNDS, playSound, vibrate, encourage, speakNumber } from '../../../utils';
import { HELP_MAP } from '../../../constants/helpMap';
import Feedback from '../../ui/Feedback';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const useAdaptive = () => ({ record: () => {}, reset: () => {}, diff: 1 });

const STRATEGIES = {
  quantity: ['Grupla d\u00FC\u015F\u00FCnd\u00FCm \uD83D\uDCE6', 'Referans noktas\u0131 kulland\u0131m \uD83D\uDCCF', 'Sezgisel tahmin yapt\u0131m \uD83E\uDDE0', 'Yakla\u015F\u0131k sayd\u0131m \uD83D\uDD22'],
  numberLine: ['Yar\u0131y\u0131 referans ald\u0131m \u00BD', 'Oranlayarak buldum \uD83D\uDCD0', 'Bildi\u011Fim say\u0131lardan yola \u00E7\u0131kt\u0131m \uD83D\uDD11'],
  measurement: ['Referans nesneyi kulland\u0131m \uD83D\uDCCF', 'Kar\u015F\u0131la\u015Ft\u0131rarak tahmin ettim \u2696\uFE0F', 'G\u00FCnl\u00FCk deneyimimden yararland\u0131m \uD83C\uDFE0'],
  computation: ['Say\u0131lar\u0131 yuvarlad\u0131m \uD83D\uDD35', 'Kolay par\u00E7alara ay\u0131rd\u0131m \u2702\uFE0F', 'A\u015Fina say\u0131lar\u0131 kulland\u0131m \uD83D\uDCA1'],
};

const ExplainStep = ({ type, onDone }) => {
  const strats = STRATEGIES[type] || STRATEGIES.quantity;
  return (
    <div className="mt-2 anim-fade">
      <div className="text-xs font-bold text-indigo-600 mb-1.5 text-center">{'\uD83E\uDD14'} Hangi stratejiyi kulland\u0131n?</div>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {strats.map((s,i) => (
          <button key={i} onClick={() => onDone(s)}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 border border-indigo-200 transition-colors">{s}</button>
        ))}
      </div>
    </div>
  );
};

const HesaplamaliTahmin = ({ onBack, colors, onGameComplete, prevBest }) => {
  const adaptive = useAdaptive();
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);

  // "Cirkin" sayi ureteci: yuvarlak sayilardan kacin
  const uglyNum=(min,max)=>{
    let n;
    do { n=Math.floor(Math.random()*(max-min+1))+min; } while(n%10===0 || n%5===0);
    return n;
  };

  const gen=(l)=>{
    let a,b,answer,op,opSymbol,hint;

    if(l===1){
      // 2 basamakli toplama: 13+28, 47+36 gibi
      a=uglyNum(12,49); b=uglyNum(12,49);
      answer=a+b; op='add'; opSymbol='+';
      hint=`${Math.round(a/10)*10} + ${Math.round(b/10)*10} \u2248 ${Math.round(a/10)*10+Math.round(b/10)*10}`;
    } else if(l===2){
      // 2 basamakli toplama/cikarma karisik
      const isAdd=Math.random()>0.4;
      if(isAdd){
        a=uglyNum(23,89); b=uglyNum(14,67);
        answer=a+b; op='add'; opSymbol='+';
      } else {
        a=uglyNum(42,98); b=uglyNum(11,a-10);
        answer=a-b; op='sub'; opSymbol='\u2212';
      }
      hint=`${Math.round(a/10)*10} ${opSymbol} ${Math.round(b/10)*10} \u2248 ${op==='add'?Math.round(a/10)*10+Math.round(b/10)*10:Math.round(a/10)*10-Math.round(b/10)*10}`;
    } else if(l===3){
      // 3 basamakli toplama/cikarma
      const isAdd=Math.random()>0.4;
      if(isAdd){
        a=uglyNum(103,499); b=uglyNum(103,499);
        answer=a+b; op='add'; opSymbol='+';
      } else {
        a=uglyNum(302,899); b=uglyNum(101,a-100);
        answer=a-b; op='sub'; opSymbol='\u2212';
      }
      hint=`${Math.round(a/100)*100} ${opSymbol} ${Math.round(b/100)*100} \u2248 ${op==='add'?Math.round(a/100)*100+Math.round(b/100)*100:Math.round(a/100)*100-Math.round(b/100)*100}`;
    } else {
      // Sv.4: Carpma tahmini
      a=uglyNum(6,19); b=uglyNum(6,19);
      answer=a*b; op='mul'; opSymbol='\u00D7';
      const ra=Math.round(a/5)*5||5, rb=Math.round(b/5)*5||5;
      hint=`${ra} \u00D7 ${rb} \u2248 ${ra*rb}`;
    }

    // Secenek ureteci: cevaba yakin ama farkli araliklarda
    const step = l<=2 ? 10 : (l===3 ? 50 : 20);
    const base=Math.round(answer/step)*step;
    let opts=[base-step, base, base+step, base+2*step].filter(x=>x>0);
    opts=[...new Set(opts)];
    // Dogru cevaba en yakini bul
    while(opts.length<4){opts.push(base+(opts.length)*step);}
    opts=opts.slice(0,4);
    const closest=opts.reduce((prev,curr)=>Math.abs(curr-answer)<Math.abs(prev-answer)?curr:prev);
    return{a,b,answer,closest,op,opSymbol,hint,opts:opts.sort(()=>Math.random()-0.5)};
  };
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(gen(l));setUa(null);setGs('playing');};
  const [explained3,setExplained3]=useState(false);
  const handle=(a)=>{setUa(a);if(a===p?.closest)setSc(s=>s+20*lv);setExplained3(false);};
  const handleExplain3=()=>{setExplained3(true);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);setExplained3(false);}else setGs('results');},800);};
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Hesaplamal\u0131 Tahmin" emoji="\uD83E\uDDEE" description="\u0130\u015Flemin sonucuna en yak\u0131n say\u0131y\u0131 tahmin et! Yuvarlayarak d\u00FC\u015F\u00FCn." levels={['Seviye 1 (2 bsm. toplama)','Seviye 2 (toplama-\u00E7\u0131karma)','Seviye 3 (3 basamakl\u0131)','Seviye 4 (\u00E7arpma tahmini)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Hesaplamal\u0131 Tahmin" emoji="\uD83E\uDDEE" level={lv} instruction="Bir i\u015Flem g\u00F6sterilecek. Tam hesaplamadan, yuvarlayarak en yak\u0131n sonucu tahmin et!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Hesaplamal\u0131 Tahmin" colors={colors}/>
      <div className="bg-white px-5 py-3 rounded-xl shadow-xl mb-3 text-center">
        <div className="text-3xl font-bold text-purple-700">{p?.a} {p?.opSymbol} {p?.b}</div>
        <div className="text-gray-500 text-sm mt-1">Sonuca en yak\u0131n say\u0131 hangisi?</div>
      </div>
      {ua!==null?(<div className="text-center"><div className={`text-2xl font-bold mb-2 ${ua===p?.closest?'text-green-500':'text-orange-500'}`}>{ua===p?.closest?'\u2713 Do\u011Fru!':`${encourage()} En yak\u0131n: ${p?.closest}`}</div><div className="text-gray-600 mb-1">Ger\u00E7ek sonu\u00E7: {p?.a} {p?.opSymbol} {p?.b} = {p?.answer}</div><div className="bg-amber-50 p-2 rounded-xl text-sm text-amber-700">{'\uD83D\uDCA1'} Yuvarlama: {p?.hint}</div>{!explained3 && <ExplainStep type="computation" onDone={handleExplain3}/>}{explained3 && <div className="text-xs text-green-600 mt-2 font-medium anim-fade">{'\u2713'} Ak\u0131ll\u0131ca!</div>}</div>):(<div className="grid grid-cols-2 gap-3">{p?.opts?.map((o,i)=>(<button key={i} onClick={()=>handle(o)} className={`px-8 py-4 ${colors?.button} text-white rounded-xl font-bold text-2xl shadow-lg`}>{o}</button>))}</div>)}
    </div>
  );
};

export default HesaplamaliTahmin;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { shuffle, TOTAL_ROUNDS, playSound, vibrate, encourage, speakNumber } from '../../../utils';
import { HELP_MAP } from '../../../constants/helpMap';
import Feedback from '../../ui/Feedback';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const useAdaptive = () => ({ record: () => {}, reset: () => {}, diff: 1 });

const STRATEGIES = {
  quantity: ['Grupla düşündüm 📦', 'Referans noktası kullandım 📏', 'Sezgisel tahmin yaptım 🧠', 'Yaklaşık saydım 🔢'],
  numberLine: ['Yarıyı referans aldım ½', 'Oranlayarak buldum 📐', 'Bildiğim sayılardan yola çıktım 🔑'],
  measurement: ['Referans nesneyi kullandım 📏', 'Karşılaştırarak tahmin ettim ⚖️', 'Günlük deneyimimden yararlandım 🏠'],
  computation: ['Sayıları yuvarladım 🔵', 'Kolay parçalara ayırdım ✂️', 'Aşina sayıları kullandım 💡'],
};

const ExplainStep = ({ type, onDone, prevBest }) => {
  const strats = STRATEGIES[type] || STRATEGIES.quantity;
  return (
    <div className="mt-2 anim-fade">
      <div className="text-xs font-bold text-indigo-600 mb-1.5 text-center">🤔 Hangi stratejiyi kullandın?</div>
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
      hint=`${Math.round(a/10)*10} + ${Math.round(b/10)*10} ≈ ${Math.round(a/10)*10+Math.round(b/10)*10}`;
    } else if(l===2){
      // 2 basamakli toplama/cikarma karisik
      const isAdd=Math.random()>0.4;
      if(isAdd){
        a=uglyNum(23,89); b=uglyNum(14,67);
        answer=a+b; op='add'; opSymbol='+';
      } else {
        a=uglyNum(42,98); b=uglyNum(11,a-10);
        answer=a-b; op='sub'; opSymbol='−';
      }
      hint=`${Math.round(a/10)*10} ${opSymbol} ${Math.round(b/10)*10} ≈ ${op==='add'?Math.round(a/10)*10+Math.round(b/10)*10:Math.round(a/10)*10-Math.round(b/10)*10}`;
    } else if(l===3){
      // 3 basamakli toplama/cikarma
      const isAdd=Math.random()>0.4;
      if(isAdd){
        a=uglyNum(103,499); b=uglyNum(103,499);
        answer=a+b; op='add'; opSymbol='+';
      } else {
        a=uglyNum(302,899); b=uglyNum(101,a-100);
        answer=a-b; op='sub'; opSymbol='−';
      }
      hint=`${Math.round(a/100)*100} ${opSymbol} ${Math.round(b/100)*100} ≈ ${op==='add'?Math.round(a/100)*100+Math.round(b/100)*100:Math.round(a/100)*100-Math.round(b/100)*100}`;
    } else {
      // Sv.4: Carpma tahmini
      a=uglyNum(6,19); b=uglyNum(6,19);
      answer=a*b; op='mul'; opSymbol='×';
      const ra=Math.round(a/5)*5||5, rb=Math.round(b/5)*5||5;
      hint=`${ra} × ${rb} ≈ ${ra*rb}`;
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
    return{a,b,answer,closest,op,opSymbol,hint,opts:shuffle(opts)};
  };
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(gen(l));setUa(null);setGs('playing');};
  const [explained3,setExplained3]=useState(false);
  const handle=(a)=>{setUa(a);if(a===p?.closest)setSc(s=>s+20*lv);setExplained3(false);};
  const handleExplain3=()=>{setExplained3(true);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);setExplained3(false);}else setGs('results');},800);};
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Hesaplamalı Tahmin" emoji="🧮" description="İşlemin sonucuna en yakın sayıyı tahmin et! Yuvarlayarak düşün." levels={['Seviye 1 (2 bsm. toplama)','Seviye 2 (toplama-çıkarma)','Seviye 3 (3 basamaklı)','Seviye 4 (çarpma tahmini)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Hesaplamalı Tahmin" emoji="🧮" level={lv} instruction="Bir işlem gösterilecek. Tam hesaplamadan, yuvarlayarak en yakın sonucu tahmin et!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Hesaplamalı Tahmin" colors={colors}/>
      <div className="bg-white px-5 py-3 rounded-xl shadow-xl mb-3 text-center">
        <div className="text-3xl font-bold text-purple-700">{p?.a} {p?.opSymbol} {p?.b}</div>
        <div className="text-gray-500 text-sm mt-1">Sonuca en yakın sayı hangisi?</div>
      </div>
      {ua!==null?(<div className="text-center"><div className={`text-2xl font-bold mb-2 ${ua===p?.closest?'text-green-500':'text-orange-500'}`}>{ua===p?.closest?'✓ Doğru!':`${encourage()} En yakın: ${p?.closest}`}</div><div className="text-gray-600 mb-1">Gerçek sonuç: {p?.a} {p?.opSymbol} {p?.b} = {p?.answer}</div><div className="bg-amber-50 p-2 rounded-xl text-sm text-amber-700">💡 Yuvarlama: {p?.hint}</div>{!explained3 && <ExplainStep type="computation" onDone={handleExplain3}/>}{explained3 && <div className="text-xs text-green-600 mt-2 font-medium anim-fade">{'✓'} Akıllıca!</div>}</div>):(<div className="grid grid-cols-2 gap-3">{p?.opts?.map((o,i)=>(<button key={i} onClick={()=>handle(o)} className={`px-8 py-4 ${colors?.button} text-white rounded-xl font-bold text-2xl shadow-lg`}>{o}</button>))}</div>)}
    </div>
  );
};

export default HesaplamaliTahmin;

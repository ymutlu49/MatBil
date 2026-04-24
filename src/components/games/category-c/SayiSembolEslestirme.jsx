import React, { useState, useRef } from 'react';
import { shuffle, TOTAL_ROUNDS, speakNumber, encourage, useSafeTimeout } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

/* SVG tally mark: 4 vertical lines + 1 diagonal cross */
const TallyGroup = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" className="inline-block">
    <line x1="4" y1="4" x2="4" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="10" y1="4" x2="10" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="16" y1="4" x2="16" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="22" y1="4" x2="22" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="1" y1="20" x2="25" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const TallySingle = ({ count, size = 28 }) => {
  const safeSetTimeout = useSafeTimeout();
  const w = count * 7 + 2;
  return (
    <svg width={w} height={size} viewBox={`0 0 ${w} 28`} className="inline-block">
      {Array.from({length: count}, (_, i) => (
        <line key={i} x1={i * 7 + 3} y1="4" x2={i * 7 + 3} y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      ))}
    </svg>
  );
};

const SayiSembolEslestirme = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);
  const nw=['','bir','iki','üç','dört','beş','altı','yedi','sekiz','dokuz','on','on bir','on iki','on üç','on dört','on beş','on altı','on yedi','on sekiz','on dokuz','yirmi'];
  const cfg={1:{max:5},2:{max:10},3:{max:15},4:{max:20}};

  // Temsil türleri
  const renderRep=(val,type,lg=false)=>{
    const sz='text-4xl';
    if(type==='number') return <span className={`font-bold text-indigo-700 ${sz}`}>{val}</span>;
    if(type==='word') return <span className={`font-bold text-indigo-700 capitalize ${lg?'text-2xl':'text-xl'}`}>{nw[val]||String(val)}</span>;
    if(type==='dots') return <div className="flex flex-wrap justify-center gap-1.5" style={{maxWidth:lg?120:100}}>{Array.from({length:Math.min(val,20)},(_,i)=><div key={i} className={`${lg?'w-5 h-5':'w-4 h-4'} bg-indigo-500 rounded-full`}/>)}</div>;
    if(type==='tally'){
      const groups=Math.floor(val/5), rem=val%5;
      return (
        <div className="flex gap-2 items-center flex-wrap justify-center text-indigo-700">
          {Array.from({length:groups},(_,i)=><TallyGroup key={i} size={lg?32:26}/>)}
          {rem>0 && <TallySingle count={rem} size={lg?32:26}/>}
        </div>
      );
    }
    if(type==='tenFrame'){
      const full=Math.min(val,10);
      return <div className="inline-grid grid-cols-5 gap-1 border-2 border-indigo-400 p-1.5 rounded">{Array.from({length:10},(_,i)=><div key={i} className={`${lg?'w-6 h-6':'w-5 h-5'} rounded-sm ${i<full?'bg-indigo-500':'bg-gray-200'}`}/>)}</div>;
    }
    if(type==='fingers'){
      const hands = val<=5 ? [{c:val}] : [{c:5},{c:val-5}];
      const fEmoji = (c) => ['','☝️','✌️','🤟','🖖','🖐️'][c]||'';
      return <div className="flex gap-1">{hands.map((h,i)=><span key={i} className={lg?'text-5xl':'text-4xl'}>{fEmoji(h.c)}</span>)}</div>;
    }
    return <span className={`font-bold ${sz}`}>{val}</span>;
  };

  const lastTargets = useRef([]);
  const gen=(l)=>{
    const mx=cfg[l].max;
    let t, attempts = 0;
    do { t = Math.floor(Math.random()*mx)+1; attempts++; }
    while (lastTargets.current.includes(t) && attempts < 12);
    lastTargets.current.push(t); if (lastTargets.current.length > 4) lastTargets.current.shift();
    // Soru ve cevap temsil türlerini seç
    const allReps = t<=10 ? ['number','dots','word','tally','tenFrame','fingers'] : ['number','dots','word','tally'];
    const qRep = allReps[Math.floor(Math.random()*allReps.length)];
    const ansReps = allReps.filter(r=>r!==qRep);
    const aRep = ansReps[Math.floor(Math.random()*ansReps.length)];

    const o=[t];let at=0;
    while(o.length<4&&at<50){const c=Math.floor(Math.random()*mx)+1;if(!o.includes(c))o.push(c);at++;}
    while(o.length<4)o.push(o.length+mx);
    return{target:t,qRep,aRep,options:shuffle(o)};
  };
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);lastTargets.current=[];setP(gen(l));setUa(null);setGs('playing');};
  const handle=(a)=>{setUa(a);if(a===p?.target){setSc(s=>s+15*lv);speakNumber(p.target);}safeSetTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}else setGs('results');},1200);};
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Sayı-Sembol Eşleştirme" emoji="🔗" description="Sayıyı nokta, parmak, çetele veya sözcükle eşleştir!" levels={['Seviye 1 (1-5)','Seviye 2 (1-10)','Seviye 3 (1-15)','Seviye 4 (1-20)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Sayı-Sembol Eşleştirme" emoji="🔗" level={lv} instruction="Bir sayı farklı biçimlerde gösterilecek: rakam, nokta, sözcük, çetele, parmak veya onluk çerçeve. Aynı sayının farklı temsilini bul!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Sayı-Sembol Eşleştirme" colors={colors}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
      <div className="bg-white p-6 rounded-2xl shadow-xl mb-4 min-w-[200px] min-h-[120px] flex items-center justify-center">
        {renderRep(p?.target, p?.qRep, true)}
      </div>
      <div className="text-gray-500 text-base font-medium mb-3">Aynı değeri bul:</div>
      {ua!==null?(<div className="text-center"><div className={`text-2xl font-bold ${ua===p?.target?'text-green-500':'text-orange-500'}`}>{ua===p?.target?'✓ Doğru!':`${encourage()} Cevap: ${p?.target}`}</div></div>):(<div className="grid grid-cols-2 gap-4">{p?.options?.map((o,i)=>(<button key={i} onClick={()=>handle(o)} className="p-4 bg-white border-2 border-gray-300 rounded-2xl min-w-[140px] min-h-[100px] flex items-center justify-center shadow-lg hover:border-indigo-400 hover:shadow-xl transition-all">
        {renderRep(o, p?.aRep)}
      </button>))}</div>)}

      </div>    </div>
  );
};

export default SayiSembolEslestirme;

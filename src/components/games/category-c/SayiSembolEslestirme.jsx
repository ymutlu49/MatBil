import React, { useState } from 'react';
import { TOTAL_ROUNDS, speakNumber, encourage } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const SayiSembolEslestirme = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);
  const nw=['','bir','iki','üç','dört','beş','altı','yedi','sekiz','dokuz','on','on bir','on iki','on üç','on dört','on beş','on altı','on yedi','on sekiz','on dokuz','yirmi'];
  const cfg={1:{max:5},2:{max:10},3:{max:15},4:{max:20}};

  // Temsil türleri
  const renderRep=(val,type,lg=false)=>{
    const sz=lg?'text-5xl':'text-3xl';
    if(type==='number') return <span className={`font-bold text-indigo-700 ${sz}`}>{val}</span>;
    if(type==='word') return <span className={`font-bold text-indigo-700 capitalize ${lg?'text-2xl':'text-lg'}`}>{nw[val]||String(val)}</span>;
    if(type==='dots') return <div className="flex flex-wrap justify-center gap-1.5" style={{maxWidth:lg?110:90}}>{Array.from({length:Math.min(val,20)},(_,i)=><div key={i} className={`${lg?'w-5 h-5':'w-4 h-4'} bg-indigo-500 rounded-full`}/>)}</div>;
    if(type==='tally'){
      const groups=Math.floor(val/5), rem=val%5;
      return <div className="flex gap-1.5 items-end flex-wrap justify-center">{Array.from({length:groups},(_,i)=><span key={i} className={`${lg?'text-3xl':'text-2xl'} font-bold text-indigo-700`}>{'卜'}</span>)}{rem>0&&<span className={`${lg?'text-2xl':'text-xl'} text-indigo-700 font-bold`}>{'|'.repeat(rem)}</span>}</div>;
    }
    if(type==='tenFrame'){
      const full=Math.min(val,10);
      return <div className="inline-grid grid-cols-5 gap-1 border-2 border-indigo-400 p-1.5 rounded">{Array.from({length:10},(_,i)=><div key={i} className={`${lg?'w-6 h-6':'w-5 h-5'} rounded-sm ${i<full?'bg-indigo-500':'bg-gray-200'}`}/>)}</div>;
    }
    if(type==='fingers'){
      const hands = val<=5 ? [{c:val}] : [{c:5},{c:val-5}];
      const fEmoji = (c) => ['','☝️','✌️','��','��','��️'][c]||'';
      return <div className="flex gap-1">{hands.map((h,i)=><span key={i} className={lg?'text-4xl':'text-3xl'}>{fEmoji(h.c)}</span>)}</div>;
    }
    return <span className={`font-bold ${sz}`}>{val}</span>;
  };

  const gen=(l)=>{
    const mx=cfg[l].max;
    const t=Math.floor(Math.random()*mx)+1;
    // Soru ve cevap temsil türlerini seç
    const allReps = t<=10 ? ['number','dots','word','tally','tenFrame','fingers'] : ['number','dots','word','tally'];
    const qRep = allReps[Math.floor(Math.random()*allReps.length)];
    const ansReps = allReps.filter(r=>r!==qRep);
    const aRep = ansReps[Math.floor(Math.random()*ansReps.length)];

    const o=[t];let at=0;
    while(o.length<4&&at<50){const c=Math.floor(Math.random()*mx)+1;if(!o.includes(c))o.push(c);at++;}
    while(o.length<4)o.push(o.length+mx);
    return{target:t,qRep,aRep,options:o.sort(()=>Math.random()-0.5)};
  };
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(gen(l));setUa(null);setGs('playing');};
  const handle=(a)=>{setUa(a);if(a===p?.target){setSc(s=>s+15*lv);speakNumber(p.target);}setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}else setGs('results');},1200);};
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Sayı-Sembol Eşleştirme" emoji="��" description="Sayıyı nokta, parmak, çetele veya sözcükle eşleştir!" levels={['Seviye 1 (1-5)','Seviye 2 (1-10)','Seviye 3 (1-15)','Seviye 4 (1-20)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Sayı-Sembol Eşleştirme" emoji="��" level={lv} instruction="Bir sayı farklı biçimlerde gösterilecek: rakam, nokta, sözcük, çetele, parmak veya onluk çerçeve. Aynı sayının farklı temsilini bul!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Sayı-Sembol Eşleştirme" colors={colors}/>
      <div className="bg-white p-5 rounded-2xl shadow-xl mb-3 min-w-[160px] min-h-[100px] flex items-center justify-center">
        {renderRep(p?.target, p?.qRep, true)}
      </div>
      <div className="text-gray-500 text-sm mb-2">Aynı değeri bul:</div>
      {ua!==null?(<div className="text-center"><div className={`text-2xl font-bold ${ua===p?.target?'text-green-500':'text-orange-500'}`}>{ua===p?.target?'✓ Doğru!':`${encourage()} Cevap: ${p?.target}`}</div></div>):(<div className="grid grid-cols-2 gap-4">{p?.options?.map((o,i)=>(<button key={i} onClick={()=>handle(o)} className="p-4 bg-white border-2 border-gray-300 rounded-2xl min-w-[150px] min-h-[100px] flex items-center justify-center shadow-lg hover:border-indigo-400 transition-all">
        {renderRep(o, p?.aRep)}
      </button>))}</div>)}
    </div>
  );
};

export default SayiSembolEslestirme;

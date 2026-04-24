import React, { useState } from 'react';
import { shuffle, TOTAL_ROUNDS, encourage, useSafeTimeout } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const CokluGosterim = ({ onBack, colors, onGameComplete, prevBest }) => {
  const safeSetTimeout = useSafeTimeout();
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);
  const nw=['','bir','iki','üç','dört','beş','altı','yedi','sekiz','dokuz','on','on bir','on iki','on üç','on dört','on beş','on altı','on yedi','on sekiz','on dokuz','yirmi'];
  const cfg={1:{max:5},2:{max:10},3:{max:15},4:{max:20}};

  const renderRep=(val,type,lg=false)=>{
    const sz=lg?'text-4xl':'text-2xl';
    if(type==='number') return <span className={`font-bold text-indigo-700 ${sz}`}>{val}</span>;
    if(type==='word') return <span className={`font-bold text-indigo-700 capitalize ${lg?'text-2xl':'text-lg'}`}>{nw[val]||String(val)}</span>;
    if(type==='dots') return <div className="flex flex-wrap justify-center gap-1.5" style={{maxWidth:lg?110:90}}>{Array.from({length:Math.min(val,20)},(_,i)=><div key={i} className={`${lg?'w-5 h-5':'w-4 h-4'} bg-indigo-500 rounded-full`}/>)}</div>;
    if(type==='tally'){
      const groups=Math.floor(val/5), rem=val%5;
      return <div className="flex gap-1.5 items-end flex-wrap justify-center">{Array.from({length:groups},(_,i)=><span key={i} className={`${lg?'text-2xl':'text-xl'} font-bold text-indigo-700`}>卌</span>)}{rem>0&&<span className={`${lg?'text-xl':'text-lg'} text-indigo-700 font-bold`}>{'|'.repeat(rem)}</span>}</div>;
    }
    if(type==='tenFrame'){
      const full=Math.min(val,10), second=val>10?val-10:0;
      return <div className="flex gap-1 flex-col items-center">
        <div className="inline-grid grid-cols-5 gap-1 border-2 border-indigo-400 p-1 rounded">{Array.from({length:10},(_,i)=><div key={i} className={`${lg?'w-5 h-5':'w-4 h-4'} rounded-sm ${i<full?'bg-indigo-500':'bg-gray-200'}`}/>)}</div>
        {second>0&&<div className="inline-grid grid-cols-5 gap-1 border-2 border-indigo-400 p-1 rounded">{Array.from({length:10},(_,i)=><div key={i} className={`${lg?'w-5 h-5':'w-4 h-4'} rounded-sm ${i<second?'bg-indigo-500':'bg-gray-200'}`}/>)}</div>}
      </div>;
    }
    if(type==='fingers'){
      // 1, 2, 5 için tanınır parmak emojileri; 3 ve 4 için el + küçük sayı rozeti
      const renderHand=(n)=>{
        if(n===1) return <span className={lg?'text-4xl':'text-3xl'}>☝️</span>;
        if(n===2) return <span className={lg?'text-4xl':'text-3xl'}>✌️</span>;
        if(n===5) return <span className={lg?'text-4xl':'text-3xl'}>🖐️</span>;
        if(n===3||n===4) return (
          <div className="relative inline-block">
            <span className={lg?'text-4xl':'text-3xl'}>🖐️</span>
            <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">{n}</span>
          </div>
        );
        return null;
      };
      const h1=Math.min(val,5),h2=val>5?Math.min(val-5,5):0;
      return <div className="flex gap-2 items-end">{h1>0&&renderHand(h1)}{h2>0&&renderHand(h2)}</div>;
    }
    if(type==='objects'){
      const emojis=['⭐','🌸','🍎','🐟','🦋'];
      const e=emojis[val%emojis.length];
      return <div className="flex flex-wrap justify-center gap-0.5" style={{maxWidth:lg?120:100}}>{Array.from({length:Math.min(val,20)},(_,i)=><span key={i} className={lg?'text-xl':'text-base'}>{e}</span>)}</div>;
    }
    return <span className={`font-bold ${sz}`}>{val}</span>;
  };

  const gen=(l)=>{
    const mx=cfg[l].max;
    const t=Math.floor(Math.random()*mx)+1;

    const allReps = t<=10 ? ['number','dots','word','tally','tenFrame','fingers','objects'] : ['number','dots','word','tally','tenFrame','objects'];

    const types = l<=2 ? ['match','identify'] : ['match','identify','oddOneOut'];
    const type = types[Math.floor(Math.random()*types.length)];

    if(type==='oddOneOut'){
      const qt = allReps[Math.floor(Math.random()*allReps.length)];
      let wrongVal;do{wrongVal=Math.floor(Math.random()*mx)+1;}while(wrongVal===t);
      const wrongPos = Math.floor(Math.random()*4);
      const repsPool = allReps.filter(r=>r!==qt);
      const opts = Array.from({length:4},(_,i)=>{
        if(i===wrongPos) return {val:wrongVal,rep:repsPool[Math.floor(Math.random()*repsPool.length)]};
        return {val:t,rep:repsPool[i%repsPool.length]};
      });
      return{target:t,type:'oddOneOut',qRep:qt,question:'Diğerlerinden farklı olanı bul!',answer:wrongPos,opts};
    }

    const qt = allReps[Math.floor(Math.random()*allReps.length)];
    const ansReps = allReps.filter(r=>r!==qt);
    const at2 = ansReps[Math.floor(Math.random()*ansReps.length)];
    const o=[t];let at=0;
    while(o.length<4&&at<50){const c=Math.floor(Math.random()*mx)+1;if(!o.includes(c))o.push(c);at++;}
    while(o.length<4)o.push(o.length+mx);
    const question = type==='identify' ? 'Bu kaçtır?' : 'Aynı değeri bul:';
    const aRep2 = type==='identify' ? 'number' : at2;
    return{target:t,type,qRep:qt,aRep:aRep2,question,options:shuffle(o)};
  };
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(gen(l));setUa(null);setGs('playing');};
  const handle=(a)=>{
    if(p?.type==='oddOneOut'){
      setUa(a);if(a===p?.answer)setSc(s=>s+20*lv);
    } else {
      setUa(a);if(a===p?.target)setSc(s=>s+20*lv);
    }
    safeSetTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}else setGs('results');},1200);
  };
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Çoklu Gösterim" emoji="🔮" description="Aynı sayının farklı yüzlerini keşfet: rakam, sözcük, parmak, çetele, onluk çerçeve!" levels={['Seviye 1 (1-5)','Seviye 2 (1-10)','Seviye 3 (1-15)','Seviye 4 (1-20)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Çoklu Gösterim" emoji="🔮" level={lv} instruction="Bir sayı çeşitli biçimlerde gösterilecek. Aynı değerin farklı temsilini bul veya farklı olanı ayırt et!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  if(p?.type==='oddOneOut'){
    return (
      <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
        <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Çoklu Gösterim" colors={colors}/>
        <div className="bg-white p-4 rounded-xl shadow-xl mb-2 min-w-[160px] min-h-[90px] flex items-center justify-center">
          {renderRep(p?.target, p?.qRep, true)}
        </div>
        <div className="text-gray-600 mb-2 text-sm font-medium">{p?.question}</div>
        {ua!==null?(<div className="text-center"><div className={`text-2xl font-bold ${ua===p?.answer?'text-green-500':'text-orange-500'}`}>{ua===p?.answer?'✓ Doğru!':`${encourage()}`}</div></div>):(<div className="grid grid-cols-2 gap-4">{p?.opts?.map((o,i)=>(<button key={i} onClick={()=>handle(i)} className="p-4 bg-white border-2 border-gray-300 rounded-2xl min-h-[100px] flex items-center justify-center shadow hover:border-indigo-400 transition-all">
          {renderRep(o.val, o.rep)}
        </button>))}</div>)}
      </div>
    );
  }

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Çoklu Gösterim" colors={colors}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
      <div className="bg-white p-4 rounded-xl shadow-xl mb-2 min-w-[160px] min-h-[90px] flex items-center justify-center">{renderRep(p?.target,p?.qRep,true)}</div>
      <div className="text-gray-600 mb-2 text-sm">{p?.question}</div>
      {ua!==null?(<div className="text-center"><div className={`text-2xl font-bold ${ua===p?.target?'text-green-500':'text-orange-500'}`}>{ua===p?.target?'✓ Doğru!':`${encourage()} Cevap: ${p?.target}`}</div></div>):(<div className="grid grid-cols-2 gap-4">{p?.options?.map((o,i)=>(<button key={i} onClick={()=>handle(o)} className="p-4 bg-white border-2 border-gray-300 rounded-2xl min-w-[150px] min-h-[100px] flex items-center justify-center shadow hover:border-indigo-400 transition-all">{renderRep(o, p?.aRep)}</button>))}</div>)}

      </div>    </div>
  );
};

export default CokluGosterim;

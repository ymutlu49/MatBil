import React, { useState } from 'react';
import { TOTAL_ROUNDS, encourage } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const SayiKarsilastirma = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);
  const nw=['','bir','iki','üç','dört','beş','altı','yedi','sekiz','dokuz','on'];

  // Çoklu temsil render
  const renderRep=(val,type,size='text-5xl')=>{
    if(type==='number') return <span className={`font-bold text-indigo-700 ${size}`}>{val}</span>;
    if(type==='word') return <span className="font-bold text-indigo-700 text-2xl capitalize">{nw[val]||val}</span>;
    if(type==='dots') return <div className="flex flex-wrap justify-center gap-1.5" style={{maxWidth:100}}>{Array.from({length:val},(_,i)=><div key={i} className="w-5 h-5 bg-indigo-500 rounded-full"/>)}</div>;
    if(type==='tally'){
      const groups=Math.floor(val/5), rem=val%5;
      return <div className="flex gap-2 items-end">{Array.from({length:groups},(_,i)=><span key={i} className="text-3xl font-bold text-indigo-700">卌</span>)}{rem>0&&<span className="text-2xl text-indigo-700 font-bold">{'|'.repeat(rem)}</span>}</div>;
    }
    if(type==='fingers'){
      const h1=Math.min(val,5), h2=Math.max(0,val-5);
      const renderHand=(n)=>{
        if(n===1) return <span className="text-4xl">☝️</span>;
        if(n===2) return <span className="text-4xl">✌️</span>;
        if(n===5) return <span className="text-4xl">🖐️</span>;
        if(n===3||n===4) return (
          <div className="relative inline-block">
            <span className="text-4xl">🖐️</span>
            <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">{n}</span>
          </div>
        );
        return null;
      };
      return <div className="flex gap-2 items-end">{h1>0&&renderHand(h1)}{h2>0&&renderHand(h2)}</div>;
    }
    return <span className={`font-bold ${size}`}>{val}</span>;
  };

  const gen=(l)=>{
    const ranges={1:{max:10,cnt:2},2:{max:10,cnt:2},3:{max:100,cnt:2},4:{max:100,cnt:3}};
    const c=ranges[l];
    const nums=[];let at=0;
    while(nums.length<c.cnt&&at<50){const n=Math.floor(Math.random()*(c.max-1))+1;if(!nums.includes(n))nums.push(n);at++;}

    // Soru tipi belirle
    const types = l===1 ? ['normal','stroop'] : l===2 ? ['stroop','rep'] : l===3 ? ['stroop','rep','mixed'] : ['stroop','rep','mixed'];
    const type = types[Math.floor(Math.random()*types.length)];

    // Stroop: Fiziksel boyut uyumsuzluğu
    let sizes, repType='number', isCongruent=true;
    if(type==='stroop' || type==='mixed'){
      const sorted=[...nums].sort((a,b)=>b-a);
      isCongruent = Math.random()>0.5;
      if(isCongruent){
        // Uyumlu: büyük sayı büyük yazılır
        sizes = nums.map(n => n===sorted[0] ? 'text-7xl' : (n===sorted[sorted.length-1] ? 'text-3xl' : 'text-5xl'));
      } else {
        // Uyumsuz (Stroop): küçük sayı BÜYÜK, büyük sayı KÜÇÜK yazılır
        sizes = nums.map(n => n===sorted[sorted.length-1] ? 'text-8xl' : (n===sorted[0] ? 'text-2xl' : 'text-5xl'));
      }
      repType = type==='mixed' ? ['number','dots','word'][Math.floor(Math.random()*3)] : 'number';
    } else if(type==='rep'){
      const repTypes = c.max<=10 ? ['dots','word','tally','fingers'] : ['dots','tally'];
      repType = repTypes[Math.floor(Math.random()*repTypes.length)];
      sizes = nums.map(()=>'text-5xl');
    } else {
      sizes = nums.map(()=>'text-5xl');
    }

    const answer = Math.max(...nums);
    const question = nums.length>=3 ? 'Hangisi en çok?' : 'Hangisi daha çok?';
    const hint = nums.length===2 ? `${Math.min(...nums)} < ${Math.max(...nums)}` : [...nums].sort((a,b)=>a-b).join(' < ');

    return{nums,answer,question,hint,type,sizes,repType,isCongruent};
  };
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(gen(l));setUa(null);setGs('playing');};
  const handle=(a)=>{setUa(a);if(a===p?.answer)setSc(s=>s+15*lv);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}else setGs('results');},1500);};
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Büyük-Küçük" emoji="⚖️" description="Hangisi daha çok? Boyutuna aldanma, sayısal değere odaklan!" levels={['Seviye 1 (0-10, Stroop)','Seviye 2 (0-10, çoklu temsil)','Seviye 3 (0-100, karışık)','Seviye 4 (0-100, 3 sayı)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Büyük-Küçük" emoji="⚖️" level={lv} instruction="Sayılar farklı boyutlarda veya farklı temsillerle gösterilecek. Fiziksel boyutuna aldanma, değeri büyük olanı seç!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Büyük-Küçük" colors={colors}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
      <div className="bg-white px-5 py-3 rounded-xl shadow mb-3 text-center">
        <span className="text-xl font-bold text-gray-700">{'⚖️'} {p?.question}</span>
        {(p?.type==='stroop'||p?.type==='mixed')&&!p?.isCongruent&&ua===null&&<div className="text-sm text-purple-500 mt-1 font-medium">⚠️ Boyutuna aldanma!</div>}
      </div>
      <div className="flex items-center gap-5 mb-4">
        {p?.nums?.map((n,i)=>(
          <button key={i} onClick={()=>!ua&&handle(n)} disabled={ua!==null}
            className={`rounded-2xl flex items-center justify-center shadow-xl border-4 transition-all p-5 min-w-[110px] min-h-[110px] ${
              ua!==null
                ? (n===p?.answer ? 'bg-green-100 border-green-500' : ua===n ? 'bg-red-100 border-red-500' : 'bg-gray-50 border-gray-300')
                : 'bg-white border-blue-300 hover:shadow-xl hover:border-blue-500 active:scale-95 transition-all'
            }`}>
            {renderRep(n, p?.repType, p?.sizes?.[i])}
          </button>
        ))}
      </div>
      {ua!==null&&<div className="text-center">
        <div className={`text-2xl font-bold ${ua===p?.answer?'text-green-500':'text-orange-500'}`}>{ua===p?.answer?'✓ Doğru!':`${encourage()} Cevap: ${p?.answer}`}</div>
        <div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700 mt-2">
          {'💡'} {p?.hint}
          {p?.type==='stroop'&&!p?.isCongruent&&' (Boyut yanıltıcıydı!)'}
        </div>
      </div>}

      </div>    </div>
  );
};

export default SayiKarsilastirma;

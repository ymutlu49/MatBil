import React, { useState } from 'react';
import { shuffle, TOTAL_ROUNDS, encourage, speakNumber } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const useAdaptive = () => ({ record: () => {}, reset: () => {} });

const numColor = (val, max = 20) => {
  const ratio = Math.min(val / max, 1);
  const hue = 220 - ratio * 160;
  return `hsl(${hue}, 70%, 45%)`;
};

const KodCevirici = ({ onBack, colors, onGameComplete, rahatMod, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);
  const [p,setP]=useState(null);const [ua,setUa]=useState(null);
  const adaptive = useAdaptive();
  const nw=['','bir','iki','üç','dört','beş','altı','yedi','sekiz','dokuz','on',
    'on bir','on iki','on üç','on dört','on beş','on altı','on yedi','on sekiz','on dokuz','yirmi'];

  const renderCode=(val,type,sz='lg')=>{
    if(type==='digit') return <span className={`font-bold ${sz==='lg'?'text-5xl':'text-3xl'}`} style={{color:numColor(val)}}>{val}</span>;
    if(type==='word') return <span className={`font-bold text-purple-700 ${sz==='lg'?'text-2xl':'text-lg'} capitalize`}>{nw[val]||val}</span>;
    if(type==='dots') return <div className="flex flex-wrap justify-center gap-1" style={{maxWidth:sz==='lg'?120:80}}>
      {Array.from({length:val},(_,i)=><div key={i} className={`${sz==='lg'?'w-5 h-5':'w-4 h-4'} bg-indigo-500 rounded-full`}/>)}</div>;
    if(type==='tally'){const g=Math.floor(val/5),r=val%5;return <div className="flex gap-1 items-end">
      {Array.from({length:g},(_,i)=><span key={i} className="text-2xl font-bold text-indigo-700">{'卜'}</span>)}{r>0&&<span className="text-xl text-indigo-700">{'|'.repeat(r)}</span>}</div>;}
    if(type==='fingers') return <span className={sz==='lg'?'text-4xl':'text-2xl'}>{'✋'.repeat(Math.floor(val/5))}{'☝️'.repeat(val%5>0?1:0)}{val%5>1?`+${val%5-1}`:''}</span>;
    return <span>{val}</span>;
  };

  const codes = {1:['dots','digit'],2:['digit','word'],3:['dots','digit','word'],4:['dots','digit','word','tally']};
  const ranges = {1:{min:1,max:5},2:{min:1,max:10},3:{min:1,max:10},4:{min:1,max:20}};

  const gen=(l)=>{
    const r=ranges[l]; const val=Math.floor(Math.random()*(r.max-r.min+1))+r.min;
    const avail=codes[l]; const fromType=avail[Math.floor(Math.random()*avail.length)];
    let toType; do{toType=avail[Math.floor(Math.random()*avail.length)];}while(toType===fromType);
    let opts=[val]; while(opts.length<4){const o=Math.floor(Math.random()*(r.max-r.min+1))+r.min;if(!opts.includes(o))opts.push(o);}
    return {val,fromType,toType,opts:shuffle(opts)};
  };

  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(gen(l));setUa(null);adaptive.reset();setGs('playing');};
  const handle=(a)=>{setUa(a);adaptive.record(a===p?.val);if(a===p?.val){setSc(s=>s+15*lv);speakNumber(p.val);}setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}else setGs('results');},1200);};

  const codeLabel={dots:'Nokta',digit:'Rakam',word:'Sözcük',tally:'Çetele'};
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Kod Çevirici" emoji="" description="Aynı sayıyı farklı biçimlerde tanı! Nokta↔Rakam↔Sözcük arasında çeviri yap." levels={['Sv1: Nokta↔Rakam (1-5)','Sv2: Rakam↔Sözcük (1-10)','Sv3: Üçlü Kod (1-10)','Sv4: Dörtlü Kod (1-20)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Kod Çevirici" emoji="" level={lv} instruction="Bir sayı gösterilecek (nokta, rakam veya sözcük olarak). Aynı sayının farklı gösterimini seçeneklerden bul!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Kod Çevirici" colors={colors}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
      <div className="bg-white rounded-2xl shadow-xl p-4 mb-3 text-center min-h-[100px] flex flex-col items-center">
        <div className="text-xs text-gray-400 mb-2">{codeLabel[p?.fromType]} gösterimi:</div>
        {p && renderCode(p.val, p.fromType)}
      </div>
      <div className="text-sm text-gray-600 mb-2 font-medium">Bu sayının <span className="text-indigo-600 font-bold">{codeLabel[p?.toType]}</span> gösterimini bul:</div>
      {ua!==null?(<div className="text-center"><div className={`text-2xl font-bold mb-2 ${ua===p?.val?'text-green-500':'text-orange-500'}`}>{ua===p?.val?'✓ Doğru!':`${encourage()} Cevap:`}</div>
        <div className="flex items-center justify-center gap-3 bg-amber-50 p-3 rounded-xl">
          {renderCode(p.val,p.fromType,'sm')}<span className="text-xl text-gray-400">=</span>{renderCode(p.val,p.toType,'sm')}
        </div>
      </div>):(
      <div className="grid grid-cols-2 gap-3">{p?.opts?.map((o,i)=>(
        <button key={i} onClick={()=>handle(o)} className={`p-4 bg-white border-2 border-gray-200 rounded-2xl min-h-[80px] flex items-center justify-center shadow-lg hover:border-indigo-400 transition-all`}>
          {renderCode(o,p?.toType,'sm')}
        </button>
      ))}</div>)}

      </div>    </div>
  );
};

export default KodCevirici;

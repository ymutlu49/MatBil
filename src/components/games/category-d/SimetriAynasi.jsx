import React, { useState } from 'react';
import { TOTAL_ROUNDS, encourage } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const SimetriAynasi = ({ onBack, colors, onGameComplete, rahatMod, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);
  const [p,setP]=useState(null);const [ua,setUa]=useState(null);

  const genPattern = (l) => {
    const sz = l <= 2 ? 3 : 4;
    const half = Math.floor(sz/2);
    const left = [];
    for(let r=0;r<sz;r++){
      const row=[];
      for(let c=0;c<half;c++) row.push(Math.random() > (l<=1?0.5:0.4) ? 1 : 0);
      left.push(row);
    }
    const right = left.map(row => [...row].reverse());
    const makeWrong = () => {
      const w = left.map(row => [...row].reverse());
      const changes = l <= 2 ? 1 : 2;
      for(let i=0;i<changes;i++){
        const r=Math.floor(Math.random()*sz), c=Math.floor(Math.random()*half);
        w[r][c] = w[r][c] ? 0 : 1;
      }
      return w;
    };
    const opts = [{right, correct:true}];
    for(let i=0;i<3;i++) opts.push({right:makeWrong(), correct:false});
    return {left, sz, half, opts:opts.sort(()=>Math.random()-0.5), axis:l>=3?'yatay':'dikey'};
  };

  const renderGrid = (left, right, sz, half, small=false) => {
    const cs = small ? 10 : 14;
    const full = left.map((row,r) => [...row, ...(right ? right[r] : Array(half).fill(-1))]);
    return (<div className="inline-grid gap-0.5" style={{gridTemplateColumns:`repeat(${sz}, ${cs}px)`}}>
      {full.flat().map((cell,i) => {
        const col = i % sz;
        const isLeft = col < half;
        return (<div key={i} className={`rounded-sm border ${
          cell===1 ? (isLeft?'bg-indigo-500 border-indigo-600':'bg-emerald-500 border-emerald-600') :
          cell===0 ? 'bg-gray-100 border-gray-200' :
          'bg-gray-300 border-gray-400 border-dashed'
        }`} style={{width:cs,height:cs}}/>);
      })}
    </div>);
  };

  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(genPattern(l));setUa(null);setGs('playing');};
  const handle=(i)=>{setUa(i);if(p?.opts[i]?.correct)setSc(s=>s+15*lv);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(genPattern(lv));setUa(null);}else setGs('results');},1200);};

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Simetri Aynası" emoji="" description="Deseni simetri eksenine göre tamamla! Ayna görüntüsünü bul." levels={['Sv1: 3x3 Kolay','Sv2: 3x3 Orta','Sv3: 4x4 Zor','Sv4: 4x4 Uzman']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Simetri Aynası" emoji="" level={lv} instruction="Sol tarafta bir desen gösterilecek. Sağ taraftaki simetrik (ayna) tamamlamayı seçeneklerden bul!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Simetri Aynası" colors={colors}/>
      <div className="bg-white rounded-2xl shadow-xl p-4 mb-3 text-center">
        <div className="text-xs text-gray-400 mb-2">Deseni simetrik tamamla (| simetri ekseni):</div>
        {p && renderGrid(p.left, null, p.sz, p.half)}
        <div className="text-[10px] text-indigo-500 mt-1">{'📋'} Sol yarı | {'❓'} Sağ yarı = ?</div>
      </div>
      <div className="text-sm text-gray-600 mb-2 font-medium">Doğru ayna görüntüsünü seç:</div>
      <div className="grid grid-cols-2 gap-2">
        {p?.opts?.map((o,i)=>(
          <button key={i} onClick={()=>ua===null&&handle(i)} className={`p-2 bg-white border-2 rounded-xl flex items-center justify-center shadow transition-all ${
            ua!==null ? (o.correct ? 'border-green-400 bg-green-50' : i===ua ? 'border-orange-400 bg-orange-50' : 'border-gray-200') : 'border-gray-200 hover:border-indigo-400'
          }`}>
            {renderGrid(p.left, o.right, p.sz, p.half, true)}
          </button>
        ))}
      </div>
      {ua!==null && <div className={`mt-2 text-center font-bold text-sm ${p?.opts[ua]?.correct?'text-green-500':'text-orange-500'}`}>
        {p?.opts[ua]?.correct?'✓ Harika! Simetriyi doğru gördün!':encourage()+' Ayna ekseni boyunca her hücreyi kontrol et!'}
      </div>}
    </div>
  );
};

export default SimetriAynasi;

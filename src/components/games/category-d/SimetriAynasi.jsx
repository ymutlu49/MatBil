import React, { useState } from 'react';
import { shuffle, TOTAL_ROUNDS, encourage } from '../../../utils';
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
    return {left, sz, half, opts:shuffle(opts), axis:l>=3?'yatay':'dikey'};
  };

  const renderGrid = (left, right, sz, half, small=false, optionIndex=null) => {
    const cs = small ? 28 : 40;
    const full = left.map((row,r) => [...row, ...(right ? right[r] : Array(half).fill(-1))]);
    const isSelectedOption = optionIndex !== null && ua === optionIndex;
    const isCorrectSelected = isSelectedOption && p?.opts[optionIndex]?.correct;
    const isWrongSelected = isSelectedOption && !p?.opts[optionIndex]?.correct;
    return (
      <div className="relative inline-block">
        <div className="inline-grid gap-1" style={{gridTemplateColumns:`repeat(${sz}, ${cs}px)`}}>
          {full.flat().map((cell,i) => {
            const col = i % sz;
            const isLeft = col < half;
            const isRight = !isLeft;
            // Mirror flip animation for correct answer right-side cells
            const mirrorStyle = isCorrectSelected && isRight ? {
              transform: 'scaleX(1)',
              transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            } : isRight && ua === null ? {
              transform: 'scaleX(1)',
              transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            } : {};
            return (<div key={i} className={`rounded ${
              cell===1 ? (isLeft
                ? 'bg-indigo-500 border-2 border-indigo-600 shadow-md'
                : 'bg-emerald-500 border-2 border-emerald-600 shadow-md')
              : cell===0 ? 'bg-gray-100 border-2 border-gray-300' :
              'bg-gray-200 border-2 border-gray-400 border-dashed'
            }${isSelectedOption ? ' anim-cell-glow' : ''}`}
              style={{width:cs, height:cs, ...mirrorStyle}}
            />);
          })}
        </div>
        {/* Simetri ekseni - dikey kesikli çizgi */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none anim-axis-pulse"
          style={{
            left: `calc(${half * (cs + 4)}px - 1px)`,
            width: '3px',
            backgroundImage: 'repeating-linear-gradient(to bottom, #6366F1 0px, #6366F1 6px, transparent 6px, transparent 12px)',
            borderRadius: '2px',
          }}
        />
      </div>
    );
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
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">

      {/* Soru deseni - büyük ve ortada */}
      <div className="bg-white rounded-2xl shadow-xl px-6 py-4 mb-3 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="inline-block w-3 h-3 rounded-full bg-indigo-500"></span>
          <span className="text-sm font-semibold text-indigo-600">Sol yarı (verilen)</span>
          <span className="mx-1 text-gray-300">|</span>
          <span className="inline-block w-3 h-3 rounded-full bg-gray-300 border border-dashed border-gray-400"></span>
          <span className="text-sm font-semibold text-gray-500">Sağ yarı (bul!)</span>
        </div>
        {p && renderGrid(p.left, null, p.sz, p.half)}
      </div>

      {/* Talimat */}
      <div className="text-lg text-gray-700 mb-3 font-semibold">Doğru ayna görüntüsünü seç:</div>

      {/* Seçenek butonları */}
      <div className="grid grid-cols-2 gap-3">
        {p?.opts?.map((o,i)=>(
          <button key={i} onClick={()=>ua===null&&handle(i)}
            className={`bg-white border-2 rounded-2xl flex items-center justify-center shadow-md transition-all ${
              ua!==null ? (o.correct ? 'border-green-400 bg-green-50 ring-2 ring-green-300' : i===ua ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-300 anim-mismatch' : 'border-gray-200 opacity-60') : 'border-gray-200 hover:border-indigo-400 hover:shadow-lg active:scale-95'
            }`}
            style={{minWidth:'130px', minHeight:'130px', padding:'12px'}}
          >
            {renderGrid(p.left, o.right, p.sz, p.half, true, i)}
          </button>
        ))}
      </div>

      {ua!==null && <div className={`mt-3 text-center font-bold text-base ${p?.opts[ua]?.correct?'text-green-500':'text-orange-500'}`}>
        {p?.opts[ua]?.correct?'✓ Harika! Simetriyi doğru gördün!':encourage()+' Ayna ekseni boyunca her hücreyi kontrol et!'}
      </div>}

      </div>    </div>
  );
};

export default SimetriAynasi;

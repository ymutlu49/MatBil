import React, { useState } from 'react';
import { TOTAL_ROUNDS, encourage } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const ZihinselDondurme = ({ onBack, colors, onGameComplete, rahatMod, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);
  const [p,setP]=useState(null);const [ua,setUa]=useState(null);

  const patterns = [
    {id:'L',path:'M10,10 L10,60 L35,60 L35,45 L25,45 L25,10 Z',name:'L şekli'},
    {id:'T',path:'M10,10 L50,10 L50,25 L35,25 L35,60 L25,60 L25,25 L10,25 Z',name:'T şekli'},
    {id:'Z',path:'M10,10 L30,10 L30,30 L50,30 L50,60 L30,60 L30,40 L10,40 Z',name:'Z şekli'},
    {id:'F',path:'M10,10 L40,10 L40,25 L25,25 L25,35 L35,35 L35,50 L25,50 L25,60 L10,60 Z',name:'F şekli'},
    {id:'P',path:'M10,10 L35,10 L35,35 L25,35 L25,60 L10,60 Z',name:'P şekli'},
    {id:'Arrow',path:'M30,5 L55,30 L40,30 L40,60 L20,60 L20,30 L5,30 Z',name:'Ok şekli'},
  ];

  const renderShape=(patternId,rotation,mirror=false,size=60,highlight=false)=>{
    const pat=patterns.find(p=>p.id===patternId)||patterns[0];
    return (<svg width={size} height={size} viewBox="0 0 60 65">
      <g transform={`translate(30,32.5) rotate(${rotation}) scale(${mirror?-1:1},1) translate(-30,-32.5)`}>
        <path d={pat.path} fill={highlight?'#10B981':'#6366F1'} stroke={highlight?'#059669':'#4338CA'} strokeWidth="2" opacity="0.9"/>
      </g>
    </svg>);
  };

  const gen=(l)=>{
    const pat=patterns[Math.floor(Math.random()*patterns.length)];
    const baseRot=[0,90,180,270][Math.floor(Math.random()*4)];
    const rots=l<=2?[90,180,270]:[45,90,135,180,225,270,315];
    const correctRot=(baseRot+rots[Math.floor(Math.random()*rots.length)])%360;
    const opts=[{rot:correctRot,mirror:false,correct:true}];
    const usedRots=[correctRot];
    for(let i=0;i<3;i++){
      let r; do{r=(baseRot+rots[Math.floor(Math.random()*rots.length)])%360;}while(usedRots.includes(r)&&usedRots.length<rots.length);
      usedRots.push(r);
      opts.push({rot:r,mirror:l>=2?Math.random()>0.4:Math.random()>0.7,correct:false});
    }
    return {patId:pat.id,baseRot,opts:opts.sort(()=>Math.random()-0.5),correctIdx:0};
  };

  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(gen(l));setUa(null);setGs('playing');};
  const handle=(i)=>{const correct=p?.opts[i]?.correct;setUa(i);if(correct)setSc(s=>s+15*lv);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}else setGs('results');},1200);};

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Zihinsel Döndürme" emoji="" description="Şekli zihninde döndür! Hedef şeklin döndürülmüş halini bul, aynalı olanları ayırt et." levels={['Sv1: Kolay (90° adım)','Sv2: Orta (aynalı var)','Sv3: Zor (45° adım)','Sv4: Uzman']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Zihinsel Döndürme" emoji="" level={lv} instruction="Üstteki şekli zihninde döndür. Alttaki seçeneklerden aynı şeklin döndürülmüş halini bul! Aynalı olanlar YANLIŞ." colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Zihinsel Döndürme" colors={colors}/>

      {/* Hedef şekil - belirgin ve büyük */}
      <div className="bg-white rounded-2xl shadow-xl px-8 py-5 mb-3 text-center border-2 border-indigo-100">
        <div className="text-sm font-semibold text-indigo-600 mb-2">Hedef Şekil</div>
        <div className="flex items-center justify-center bg-indigo-50 rounded-xl p-3">
          {p && renderShape(p.patId, p.baseRot, false, 100)}
        </div>
      </div>

      {/* Talimat */}
      <div className="text-base text-gray-700 mb-3 font-semibold">Aynı şeklin döndürülmüş halini bul:</div>

      {/* Seçenek butonları */}
      <div className="grid grid-cols-2 gap-4">
        {p?.opts?.map((o,i)=>(
          <button key={i} onClick={()=>ua===null&&handle(i)}
            className={`relative bg-white border-2 rounded-2xl flex items-center justify-center shadow-md transition-all ${
              ua!==null ? (o.correct ? 'border-green-400 bg-green-50 ring-2 ring-green-300' : i===ua ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-300' : 'border-gray-200 opacity-60') : 'border-gray-200 hover:border-indigo-400 hover:shadow-lg active:scale-95'
            }`}
            style={{padding:'14px'}}
          >
            {renderShape(p.patId, o.rot, o.mirror, 90, ua!==null && o.correct)}
            {ua!==null && o.mirror && (
              <span className="absolute top-1.5 right-1.5 text-sm font-bold text-white bg-orange-500 rounded-md px-1.5 py-0.5 shadow">
                Aynalı
              </span>
            )}
          </button>
        ))}
      </div>

      {ua!==null && <div className="mt-3 text-base text-center">
        <div className={`font-bold ${p?.opts[ua]?.correct?'text-green-500':'text-orange-500'}`}>{p?.opts[ua]?.correct?'✓ Doğru! Şekli zihninde döndürebildin.':encourage()}</div>
        {!p?.opts[ua]?.correct && <div className="text-sm text-gray-500 mt-1">Aynalı şekiller farklıdır. Şeklin köşelerine ve kenarlarına odaklan!</div>}
      </div>}
    </div>
  );
};

export default ZihinselDondurme;

import React, { useState } from 'react';
import { TOTAL_ROUNDS, encourage } from '../../../utils';
import Feedback from '../../ui/Feedback';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const YonVeMesafe = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);
  const objs=[{e:'🏠',n:'ev'},{e:'🌳',n:'ağaç'},{e:'🚗',n:'araba'},{e:'⭐',n:'yıldız'},{e:'🎈',n:'balon'},{e:'🐶',n:'köpek'},{e:'🌸',n:'çiçek'},{e:'📚',n:'kitap'},{e:'🐱',n:'kedi'},{e:'🍎',n:'elma'}];
  const lvCfg={1:{dirs:['solunda','sağında'],label:'Yatay (Sol/Sağ)'},2:{dirs:['üstünde','altında'],label:'Dikey (Üst/Alt)'},3:{dirs:['solunda','sağında','üstünde','altında'],label:'Dört Yön Karışık'},4:{dirs:['solunda','sağında','üstünde','altında'],label:'Çoklu Nesne'}};
  const posMap={solunda:3,sağında:5,'üstünde':1,altında:7};
  const gen=(l)=>{
    const g=Array(9).fill(null);
    const o1=objs[Math.floor(Math.random()*objs.length)];
    let o2;do{o2=objs[Math.floor(Math.random()*objs.length)];}while(o2.e===o1.e);
    g[4]=o1;
    const dirs=lvCfg[l].dirs;
    const pos=dirs[Math.floor(Math.random()*dirs.length)];
    g[posMap[pos]]=o2;
    if(l===4){
      let o3;do{o3=objs[Math.floor(Math.random()*objs.length)];}while(o3.e===o1.e||o3.e===o2.e);
      const otherPos=dirs.filter(d=>d!==pos);
      const extraPos=otherPos[Math.floor(Math.random()*otherPos.length)];
      g[posMap[extraPos]]=o3;
    }
    return{grid:g,obj1:o1,obj2:o2,position:pos};
  };
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(gen(l));setUa(null);setGs('playing');};
  const handle=(a)=>{setUa(a);if(a===p?.position)setSc(s=>s+15*lv);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}else setGs('results');},1500);};
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Yön ve Mesafe" emoji="🧭" description="Nesnelerin birbirine göre konumunu bul! Sol, sağ, üst, alt yönlerini öğren." levels={['Seviye 1 (Sol/Sağ)','Seviye 2 (Üst/Alt)','Seviye 3 (4 Yön Karışık)','Seviye 4 (Çoklu Nesne)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Yön ve Mesafe" emoji="🧭" level={lv} instruction="Izgarada iki nesne gösterilecek. Birinin diğerine göre konumunu (sol, sağ, üst, alt) bul!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  const dirs=lvCfg[lv].dirs;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Yön ve Mesafe" colors={colors}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
      <div className="bg-white px-3 py-1 rounded-lg shadow mb-2 text-xs text-gray-500">{lvCfg[lv].label}</div>
      <div className="grid grid-cols-3 gap-1 bg-white p-3 rounded-2xl shadow-xl mb-3">{p?.grid.map((c,i)=>(<div key={i} className={`w-20 h-20 rounded-xl flex flex-col items-center ${i===4?'bg-blue-50 border-2 border-blue-200':'bg-gray-100'}`}>{c&&<><span className="text-3xl">{c.e}</span><span className="text-xs text-gray-500">({c.n})</span></>}</div>))}</div>
      <div className="bg-white px-4 py-3 rounded-xl shadow mb-3 text-center"><span className="text-lg text-gray-700"><span className="font-bold">{p?.obj2?.e} ({p?.obj2?.n})</span>, {p?.obj1?.e} ({p?.obj1?.n})'ın neresinde?</span></div>
      {ua!==null?(<Feedback isCorrect={ua===p?.position} answer={p?.position} hint={ua===p?.position ? `Doğru! ${p?.obj2?.n}, ${p?.obj1?.n}'ın ${p?.position}.` : `${p?.obj2?.n}, ${p?.obj1?.n}'ın ${p?.position}. Izgarada konumlara dikkat et!`}/>):(<div className={`grid ${dirs.length<=2?'grid-cols-2':'grid-cols-2'} gap-3`}>{dirs.map((pos,i)=>(<button key={i} onClick={()=>handle(pos)} className={`px-8 py-4 ${colors?.button} text-white rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-transform`}>{pos}</button>))}</div>)}

      </div>    </div>
  );
};

export default YonVeMesafe;

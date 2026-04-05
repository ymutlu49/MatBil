import React, { useState } from 'react';
import { TOTAL_ROUNDS, encourage } from '../../../utils';
import Feedback from '../../ui/Feedback';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const YonVeMesafe = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);
  const objs=[{e:'\ud83c\udfe0',n:'ev'},{e:'\ud83c\udf33',n:'a\u011fa\u00e7'},{e:'\ud83d\ude97',n:'araba'},{e:'\u2b50',n:'y\u0131ld\u0131z'},{e:'\ud83c\udf88',n:'balon'},{e:'\ud83d\udc36',n:'k\u00f6pek'},{e:'\ud83c\udf38',n:'\u00e7i\u00e7ek'},{e:'\ud83d\udcda',n:'kitap'},{e:'\ud83d\udc31',n:'kedi'},{e:'\ud83c\udf4e',n:'elma'}];
  const lvCfg={1:{dirs:['solunda','sa\u011f\u0131nda'],label:'Yatay (Sol/Sa\u011f)'},2:{dirs:['\u00fcst\u00fcnde','alt\u0131nda'],label:'Dikey (\u00dcst/Alt)'},3:{dirs:['solunda','sa\u011f\u0131nda','\u00fcst\u00fcnde','alt\u0131nda'],label:'D\u00f6rt Y\u00f6n Kar\u0131\u015f\u0131k'},4:{dirs:['solunda','sa\u011f\u0131nda','\u00fcst\u00fcnde','alt\u0131nda'],label:'\u00c7oklu Nesne'}};
  const posMap={solunda:3,sa\u011f\u0131nda:5,'\u00fcst\u00fcnde':1,alt\u0131nda:7};
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
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Y\u00f6n ve Mesafe" emoji="\ud83e\udded" description="Nesnelerin birbirine g\u00f6re konumunu bul! Sol, sa\u011f, \u00fcst, alt y\u00f6nlerini \u00f6\u011fren." levels={['Seviye 1 (Sol/Sa\u011f)','Seviye 2 (\u00dcst/Alt)','Seviye 3 (4 Y\u00f6n Kar\u0131\u015f\u0131k)','Seviye 4 (\u00c7oklu Nesne)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Y\u00f6n ve Mesafe" emoji="\ud83e\udded" level={lv} instruction="Izgarada iki nesne g\u00f6sterilecek. Birinin di\u011ferine g\u00f6re konumunu (sol, sa\u011f, \u00fcst, alt) bul!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  const dirs=lvCfg[lv].dirs;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Y\u00f6n ve Mesafe" colors={colors}/>
      <div className="bg-white px-3 py-1 rounded-lg shadow mb-2 text-xs text-gray-500">{lvCfg[lv].label}</div>
      <div className="grid grid-cols-3 gap-1 bg-white p-3 rounded-2xl shadow-xl mb-3">{p?.grid.map((c,i)=>(<div key={i} className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center ${i===4?'bg-blue-50 border-2 border-blue-200':'bg-gray-100'}`}>{c&&<><span className="text-3xl">{c.e}</span><span className="text-xs text-gray-500">({c.n})</span></>}</div>))}</div>
      <div className="bg-white px-4 py-3 rounded-xl shadow mb-3 text-center"><span className="text-lg text-gray-700"><span className="font-bold">{p?.obj2?.e} ({p?.obj2?.n})</span>, {p?.obj1?.e} ({p?.obj1?.n})'{\u0131}n neresinde?</span></div>
      {ua!==null?(<Feedback isCorrect={ua===p?.position} answer={p?.position} hint={ua===p?.position ? `Do\u011fru! ${p?.obj2?.n}, ${p?.obj1?.n}'\u0131n ${p?.position}.` : `${p?.obj2?.n}, ${p?.obj1?.n}'\u0131n ${p?.position}. Izgarada konumlara dikkat et!`}/>):(<div className={`grid ${dirs.length<=2?'grid-cols-2':'grid-cols-2'} gap-3`}>{dirs.map((pos,i)=>(<button key={i} onClick={()=>handle(pos)} className={`px-8 py-4 ${colors?.button} text-white rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-transform`}>{pos}</button>))}</div>)}
    </div>
  );
};

export default YonVeMesafe;

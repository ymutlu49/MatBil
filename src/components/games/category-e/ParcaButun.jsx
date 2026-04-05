import React, { useState } from 'react';
import { TOTAL_ROUNDS, encourage } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const ParcaButun = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);
  const cfg={1:{max:5},2:{max:10},3:{max:10},4:{max:15}};

  const gen=(l)=>{
    const mx=cfg[l].max;
    const whole=Math.floor(Math.random()*(mx-2))+3;
    const part1=Math.floor(Math.random()*(whole-1))+1;
    const part2=whole-part1;
    const mt=Math.random()<0.33?'whole':(Math.random()<0.5?'part1':'part2');
    const answer=mt==='whole'?whole:mt==='part1'?part1:part2;
    const o=[answer];let at=0;while(o.length<4&&at<40){const c=Math.max(0,answer+Math.floor(Math.random()*6)-3);if(!o.includes(c)&&c>=0)o.push(c);at++;}while(o.length<4)o.push(o.length+answer);
    return{whole,part1,part2,missingType:mt,answer,options:o.sort(()=>Math.random()-0.5)};
  };
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(gen(l));setUa(null);setGs('playing');};
  const handle=(a)=>{setUa(a);if(a===p?.answer)setSc(s=>s+15*lv);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}else setGs('results');},1500);};

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Par\u00e7a-B\u00fct\u00fcn" emoji="\ud83e\udde9" description="\u00dc\u00e7genin k\u00f6\u015felerindeki say\u0131lar aras\u0131ndaki ili\u015fkiyi ke\u015ffet! Par\u00e7alar\u0131n toplam\u0131 b\u00fct\u00fcn\u00fc verir." levels={['Seviye 1 (1-5)','Seviye 2 (1-10)','Seviye 3 (1-10 \u0130leri)','Seviye 4 (1-15)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Par\u00e7a-B\u00fct\u00fcn" emoji="\ud83e\udde9" level={lv} instruction="\u00dc\u00e7genin tepesinde b\u00fct\u00fcn, alt k\u00f6\u015felerinde par\u00e7alar var. \u0130ki par\u00e7an\u0131n toplam\u0131 b\u00fct\u00fcne e\u015fittir. Eksik say\u0131y\u0131 bul!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  const isMissing=(t)=>p?.missingType===t;
  const nodeVal=(val,type)=>{
    const missing = isMissing(type);
    if(missing && ua===null) return <span className="text-2xl font-bold text-purple-400 animate-pulse">?</span>;
    if(missing && ua!==null) return <span className="text-2xl font-bold text-green-600">{val}</span>;
    return <span className="text-2xl font-bold text-gray-800">{val}</span>;
  };

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Par\u00e7a-B\u00fct\u00fcn" colors={colors}/>

      <div className="bg-white rounded-2xl shadow-xl p-4 mb-2 w-full max-w-xs">
        <div className="relative" style={{height:190}}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 190">
            <line x1="120" y1="38" x2="40" y2="148" stroke="#C4B5FD" strokeWidth="3" strokeDasharray="6,4"/>
            <line x1="120" y1="38" x2="200" y2="148" stroke="#C4B5FD" strokeWidth="3" strokeDasharray="6,4"/>
          </svg>

          <div className="absolute left-1/2 -translate-x-1/2 top-0 flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-3 ${isMissing('whole')?'bg-purple-100 border-purple-400 ring-2 ring-purple-300':'bg-indigo-100 border-indigo-400'}`}>
              {nodeVal(p?.whole,'whole')}
            </div>
            <span className="text-[10px] font-bold text-indigo-500 mt-0.5">B\u00dcT\u00dcN</span>
          </div>

          <div className="absolute left-0 bottom-0 flex flex-col items-center" style={{left:4}}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-3 ${isMissing('part1')?'bg-purple-100 border-purple-400 ring-2 ring-purple-300':'bg-rose-100 border-rose-400'}`}>
              {nodeVal(p?.part1,'part1')}
            </div>
            <span className="text-[10px] font-bold text-rose-500 mt-0.5">PAR\u00c7A</span>
          </div>

          <div className="absolute right-0 bottom-0 flex flex-col items-center" style={{right:4}}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-3 ${isMissing('part2')?'bg-purple-100 border-purple-400 ring-2 ring-purple-300':'bg-sky-100 border-sky-400'}`}>
              {nodeVal(p?.part2,'part2')}
            </div>
            <span className="text-[10px] font-bold text-sky-500 mt-0.5">PAR\u00c7A</span>
          </div>
        </div>
      </div>

      <div className="bg-white px-4 py-2 rounded-xl shadow mb-2 text-center max-w-xs">
        <div className="text-sm text-gray-700 font-medium">
          {isMissing('whole')?'\u0130ki par\u00e7an\u0131n toplam\u0131 (b\u00fct\u00fcn) ka\u00e7t\u0131r?':isMissing('part1')?`B\u00fct\u00fcn ${p?.whole}, bir par\u00e7a ${p?.part2}. Eksik par\u00e7a ka\u00e7?`:`B\u00fct\u00fcn ${p?.whole}, bir par\u00e7a ${p?.part1}. Eksik par\u00e7a ka\u00e7?`}
        </div>
      </div>

      {ua!==null?(<div className="text-center"><div className={`text-2xl font-bold mb-2 ${ua===p?.answer?'text-green-500':'text-orange-500'}`}>{ua===p?.answer?'\u2713 Do\u011fru!':`${encourage()} Cevap: ${p?.answer}`}</div><div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700">{'\ud83d\udca1'} {p?.part1} + {p?.part2} = {p?.whole}</div></div>):(<div className="grid grid-cols-2 gap-3">{p?.options?.map((o,i)=>(<button key={i} onClick={()=>handle(o)} className={`px-8 py-4 ${colors?.button} text-white rounded-xl font-bold text-2xl shadow-lg`}>{o}</button>))}</div>)}
    </div>
  );
};

export default ParcaButun;

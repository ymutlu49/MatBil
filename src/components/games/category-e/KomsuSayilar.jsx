import React, { useState } from 'react';
import { TOTAL_ROUNDS, encourage } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const KomsuSayilar = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);

  const gen=(l)=>{
    const ranges={1:{max:10},2:{max:20},3:{max:50},4:{max:100}};
    const mx=ranges[l].max;
    const allTypes = {
      1:['next','prev','between'],
      2:['next','prev','between','twoGap'],
      3:['next','prev','between','twoGap','sequence','backward'],
      4:['next','prev','between','twoGap','sequence','backward','skip2','skip5']
    };
    const types=allTypes[l];
    const type=types[Math.floor(Math.random()*types.length)];

    let answer, slots, question, hint;

    if(type==='next'){
      const n=Math.floor(Math.random()*(mx-1))+1;
      answer=n+1;
      slots=[{v:n-1,show:true},{v:n,show:true},{v:n+1,show:false},{v:n+2,show:true}];
      question=`${n} say\u0131s\u0131ndan hemen sonra hangi say\u0131 gelir?`;
      hint=`...${n}, ${n+1}, ${n+2}...`;
    } else if(type==='prev'){
      const n=Math.floor(Math.random()*(mx-2))+2;
      answer=n-1;
      slots=[{v:n-2,show:true},{v:n-1,show:false},{v:n,show:true},{v:n+1,show:true}];
      question=`${n} say\u0131s\u0131ndan hemen \u00f6nce hangi say\u0131 gelir?`;
      hint=`...${n-1}, ${n}, ${n+1}...`;
    } else if(type==='between'){
      const n=Math.floor(Math.random()*(mx-2))+2;
      answer=n;
      slots=[{v:n-1,show:true},{v:n,show:false},{v:n+1,show:true}];
      question=`${n-1} ile ${n+1} aras\u0131ndaki say\u0131 hangisidir?`;
      hint=`${n-1}, ${n}, ${n+1}`;
    } else if(type==='twoGap'){
      const n=Math.floor(Math.random()*(mx-4))+2;
      answer=n;
      slots=[{v:n-1,show:true},{v:n,show:false},{v:n+1,show:true},{v:n+2,show:false},{v:n+3,show:true}];
      question=`Dizideki iki bo\u015flu\u011fa hangi say\u0131lar gelir?`;
      hint=`${n-1}, ${n}, ${n+1}, ${n+2}, ${n+3}`;
    } else if(type==='sequence'){
      const start=Math.floor(Math.random()*(mx-5))+1;
      const pos=Math.floor(Math.random()*3)+1;
      answer=start+pos;
      slots=Array.from({length:5},(_,i)=>({v:start+i,show:i!==pos}));
      question=`Say\u0131 dizisindeki bo\u015flu\u011fu tamamla:`;
      hint=slots.map(s=>s.v).join(', ');
    } else if(type==='backward'){
      const start=Math.floor(Math.random()*(mx-5))+6;
      const pos=Math.floor(Math.random()*3)+1;
      answer=start-pos;
      slots=Array.from({length:5},(_,i)=>({v:start-i,show:i!==pos}));
      question=`Geriye do\u011fru say\u0131yoruz, bo\u015fluk ne?`;
      hint=slots.map(s=>s.v).join(', ');
    } else if(type==='skip2'){
      const start=Math.floor(Math.random()*Math.floor(mx/2))*2+2;
      const pos=Math.floor(Math.random()*3)+1;
      answer=start+pos*2;
      slots=Array.from({length:5},(_,i)=>({v:start+i*2,show:i!==pos}));
      question=`\u0130ki\u015fer atlayarak say\u0131yoruz, bo\u015fluk ne?`;
      hint=slots.map(s=>s.v).join(', ');
    } else { // skip5
      const start=Math.floor(Math.random()*Math.floor(mx/5))*5+5;
      const pos=Math.floor(Math.random()*3)+1;
      answer=start+pos*5;
      slots=Array.from({length:5},(_,i)=>({v:start+i*5,show:i!==pos}));
      question=`Be\u015fer atlayarak say\u0131yoruz, bo\u015fluk ne?`;
      hint=slots.map(s=>s.v).join(', ');
    }

    const o=[answer];let at=0;
    while(o.length<4&&at<40){
      const diff=Math.floor(Math.random()*5)+1;
      const v=Math.random()>0.5?answer+diff:answer-diff;
      if(!o.includes(v)&&v>=0)o.push(v);at++;
    }
    while(o.length<4)o.push(o.length+answer);
    return{type,slots:slots.filter(s=>s.v>=0),question,answer,hint,options:o.sort(()=>Math.random()-0.5)};
  };
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(gen(l));setUa(null);setGs('playing');};
  const handle=(a)=>{setUa(a);if(a===p?.answer)setSc(s=>s+15*lv);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}else setGs('results');},1500);};

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Kom\u015fu Say\u0131lar" emoji="\ud83d\udd22" description="Say\u0131 dizilerindeki eksik say\u0131lar\u0131 bul! \u0130leriye, geriye ve atlayarak say." levels={['Seviye 1 (1-10, temel)','Seviye 2 (1-20, iki bo\u015fluk)','Seviye 3 (1-50, geri sayma)','Seviye 4 (1-100, atlayarak)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Kom\u015fu Say\u0131lar" emoji="\ud83d\udd22" level={lv} instruction="Say\u0131 dizisindeki bo\u015fluklar\u0131 doldur! \u00d6nceki, sonraki, aradaki ve atlayarak sayma sorular\u0131n\u0131 \u00e7\u00f6z." colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Kom\u015fu Say\u0131lar" colors={colors}/>

      <div className="bg-white p-3 rounded-2xl shadow-xl mb-2 w-full max-w-sm">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {p?.slots?.map((s,i)=>(
            <div key={i} className="flex items-center">
              {i>0&&<div className="w-3 h-0.5 bg-purple-300 mx-0.5"/>}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border-2 transition-all ${
                s.show
                  ? 'bg-gray-50 border-gray-300 text-gray-800'
                  : ua!==null
                    ? 'bg-green-100 border-green-400 text-green-700'
                    : 'bg-purple-100 border-purple-400 animate-pulse'
              }`}>
                {s.show ? s.v : (ua!==null ? s.v : '?')}
              </div>
            </div>
          ))}
        </div>
        {(p?.type==='backward'||p?.type==='skip2'||p?.type==='skip5')&&(
          <div className="text-center mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 font-medium">
              {p?.type==='backward'?'\u2b05 Geriye sayma':p?.type==='skip2'?'2\u015fer atlama':'5er atlama'}
            </span>
          </div>
        )}
      </div>

      <div className="bg-white px-4 py-2 rounded-xl shadow mb-2 text-center max-w-sm">
        <div className="text-sm text-gray-700 font-medium">{p?.question}</div>
      </div>

      {ua!==null?(<div className="text-center"><div className={`text-2xl font-bold mb-2 ${ua===p?.answer?'text-green-500':'text-orange-500'}`}>{ua===p?.answer?'\u2713 Do\u011fru!':`${encourage()} Cevap: ${p?.answer}`}</div><div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700">{'\ud83d\udca1'} {p?.hint}</div></div>):(<div className="grid grid-cols-2 gap-3">{p?.options?.map((o,i)=>(<button key={i} onClick={()=>handle(o)} className={`px-8 py-4 ${colors?.button} text-white rounded-xl font-bold text-2xl shadow-lg`}>{o}</button>))}</div>)}
    </div>
  );
};

export default KomsuSayilar;

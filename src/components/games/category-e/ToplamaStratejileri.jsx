import React, { useState } from 'react';
import { shuffle, TOTAL_ROUNDS, encourage } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const ToplamaStratejileri = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);
  const cfg={1:{maxA:5,maxB:4},2:{maxA:9,maxB:9},3:{maxA:10,maxB:10},4:{maxA:15,maxB:15}};

  const gen=(l)=>{
    const c=cfg[l];
    const a=Math.floor(Math.random()*c.maxA)+1;
    const b=Math.floor(Math.random()*c.maxB)+1;
    const answer=a+b;
    const types=['normal','missing_result','missing_first','missing_second'];
    const type=l<=2?types[Math.floor(Math.random()*2)]:types[Math.floor(Math.random()*types.length)];
    let question,correctAnswer;
    switch(type){
      case'missing_first':question=`? + ${b} = ${answer}`;correctAnswer=a;break;
      case'missing_second':question=`${a} + ? = ${answer}`;correctAnswer=b;break;
      default:question=`${a} + ${b} = ?`;correctAnswer=answer;break;
    }
    const o=[correctAnswer];let at=0;while(o.length<4&&at<40){const v=Math.max(0,correctAnswer+Math.floor(Math.random()*6)-3);if(!o.includes(v)&&v>=0)o.push(v);at++;}while(o.length<4)o.push(o.length+correctAnswer);
    return{a,b,answer,type,question,correctAnswer,options:shuffle(o)};
  };
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(gen(l));setUa(null);setGs('playing');};
  const handle=(ans)=>{setUa(ans);if(ans===p?.correctAnswer)setSc(s=>s+15*lv);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}else setGs('results');},1500);};

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Toplama Stratejileri" emoji="➕" description="Toplama işlemini görsel destekle öğren! İleri seviyelerde eksik sayıyı bul." levels={['Seviye 1 (1-5)','Seviye 2 (1-9)','Seviye 3 (1-10 Eksik)','Seviye 4 (1-15 Eksik)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Toplama Stratejileri" emoji="➕" level={lv} instruction="Toplama işlemi gösterilecek. Sonucu bul! İleri seviyelerde eksik olan sayıyı tamamla." colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center justify-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Toplama Stratejileri" colors={colors}/>

      <div className="bg-white p-5 rounded-2xl shadow-xl mb-3 flex items-center gap-3">
        <div className="flex flex-wrap gap-1 justify-center" style={{maxWidth:70}}>
          {Array.from({length:p?.a||0},(_,i)=>(<div key={i} className="w-4 h-4 bg-rose-400 rounded-full"/>))}
        </div>
        <span className="text-2xl font-bold text-gray-400">+</span>
        <div className="flex flex-wrap gap-1 justify-center" style={{maxWidth:70}}>
          {Array.from({length:p?.b||0},(_,i)=>(<div key={i} className="w-4 h-4 bg-blue-400 rounded-full"/>))}
        </div>
      </div>

      <div className="bg-white px-8 py-4 rounded-2xl shadow-xl mb-3 border-4 border-purple-200">
        <div className="text-3xl font-bold text-purple-700 text-center">{p?.question}</div>
      </div>

      {ua!==null?(<div className="text-center"><div className={`text-2xl font-bold mb-2 ${ua===p?.correctAnswer?'text-green-500':'text-orange-500'}`}>{ua===p?.correctAnswer?'✓ Doğru!':`${encourage()} Cevap: ${p?.correctAnswer}`}</div><div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700">{'💡'} {p?.a} + {p?.b} = {p?.answer}</div></div>):(<div className="grid grid-cols-2 gap-3">{p?.options?.map((o,i)=>(<button key={i} onClick={()=>handle(o)} className={`px-8 py-4 ${colors?.button} text-white rounded-xl font-bold text-2xl shadow-lg`}>{o}</button>))}</div>)}
    </div>
  );
};

export default ToplamaStratejileri;

import React, { useState } from 'react';
import { TOTAL_ROUNDS, encourage } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const BolusmeZamani = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);
  const items=[
    {e:'\ud83c\udf4e',n:'elma'},{e:'\ud83c\udf4a',n:'portakal'},{e:'\ud83c\udf4b',n:'limon'},{e:'\ud83c\udf47',n:'\u00fcz\u00fcm'},{e:'\ud83c\udf53',n:'\u00e7ilek'},
    {e:'\ud83c\udf4c',n:'muz'},{e:'\ud83c\udf6a',n:'kurabiye'},{e:'\ud83e\uddc1',n:'kek'},{e:'\ud83c\udf6c',n:'\u015feker'},{e:'\ud83c\udf88',n:'balon'},
    {e:'\u270f\ufe0f',n:'kalem'},{e:'\ud83d\udcda',n:'kitap'},{e:'\u26bd',n:'top'},{e:'\ud83c\udf38',n:'\u00e7i\u00e7ek'},{e:'\ud83e\uddf8',n:'oyuncak'}
  ];
  const kids=['\ud83d\udc67','\ud83d\udc66','\ud83e\uddd2','\ud83d\udc76','\ud83e\uddd2'];
  const cfg={1:{maxKids:2,maxPer:3},2:{maxKids:3,maxPer:3},3:{maxKids:4,maxPer:4},4:{maxKids:5,maxPer:5}};

  const gen=(l)=>{
    const c=cfg[l];
    const numKids=Math.floor(Math.random()*(c.maxKids-1))+2;
    const perKid=Math.floor(Math.random()*c.maxPer)+1;
    const total=numKids*perKid;
    const item=items[Math.floor(Math.random()*items.length)];
    const kidEmojis=Array.from({length:numKids},(_,i)=>kids[i%kids.length]);

    const types = l<=2 ? ['share','total'] : ['share','total','groupCount','groupSize'];
    const type = types[Math.floor(Math.random()*types.length)];

    let answer, question, hint;
    if(type==='share'){
      answer=perKid;
      question=`${total} ${item.n} ${numKids} \u00e7ocu\u011fa e\u015fit payla\u015ft\u0131r\u0131l\u0131rsa her \u00e7ocuk ka\u00e7 ${item.n} al\u0131r?`;
      hint=`${total} ${item.n} \u00f7 ${numKids} \u00e7ocuk = her biri ${perKid} tane`;
    } else if(type==='total'){
      answer=total;
      question=`${numKids} \u00e7ocu\u011fa ${perKid}'\u015fer ${item.n} verilirse toplam ka\u00e7 ${item.n} gerekir?`;
      hint=`${numKids} \u00e7ocuk \u00d7 ${perKid} tane = toplam ${total} ${item.n}`;
    } else if(type==='groupCount'){
      answer=numKids;
      question=`${total} ${item.n} ${perKid}'${perKid>1?'erli':'li'} gruplara ayr\u0131l\u0131rsa ka\u00e7 grup olur?`;
      hint=`${total} ${item.n} \u00f7 ${perKid}'li gruplar = ${numKids} grup`;
    } else {
      answer=perKid;
      question=`${total} ${item.n} ${numKids} e\u015fit gruba ayr\u0131l\u0131rsa her grupta ka\u00e7 ${item.n} olur?`;
      hint=`${total} ${item.n} \u00f7 ${numKids} grup = her grupta ${perKid} tane`;
    }

    const o=[answer];let at=0;while(o.length<4&&at<40){const v=Math.max(1,answer+Math.floor(Math.random()*6)-3);if(!o.includes(v))o.push(v);at++;}while(o.length<4)o.push(o.length+answer);
    return{numKids,perKid,total,item,kidEmojis,type,answer,question,hint,options:o.sort(()=>Math.random()-0.5)};
  };
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(gen(l));setUa(null);setGs('playing');};
  const handle=(a)=>{setUa(a);if(a===p?.answer)setSc(s=>s+20*lv);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}else setGs('results');},1500);};

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="B\u00f6l\u00fc\u015fme Zaman\u0131" emoji="\ud83c\udf4e" description="Nesneleri e\u015fit payla\u015ft\u0131r veya gruplara ay\u0131r!" levels={['Seviye 1 (2 \u00e7ocuk)','Seviye 2 (2-3 \u00e7ocuk)','Seviye 3 (2-4, gruplama)','Seviye 4 (2-5, gruplama)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="B\u00f6l\u00fc\u015fme Zaman\u0131" emoji="\ud83c\udf4e" level={lv} instruction="Nesneleri \u00e7ocuklara e\u015fit payla\u015ft\u0131r veya gruplara ay\u0131r. Do\u011fru say\u0131y\u0131 bul!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  const isGroupQ = p?.type==='groupCount'||p?.type==='groupSize';
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="B\u00f6l\u00fc\u015fme Zaman\u0131" colors={colors}/>

      <div className="bg-white p-3 rounded-2xl shadow-xl mb-2 text-center w-full max-w-sm">
        <div className="flex flex-wrap justify-center gap-1 mb-2">
          {Array.from({length:Math.min(p?.total||0,20)},(_,i)=>(<span key={i} className="text-2xl">{p?.item?.e}</span>))}
          {(p?.total||0)>20&&<span className="text-gray-500 ml-1">...({p?.total})</span>}
        </div>
        {!isGroupQ ? (
          <div className="flex justify-center gap-3">
            {p?.kidEmojis?.map((k,i)=>(<div key={i} className="flex flex-col items-center"><span className="text-2xl">{k}</span><div className="w-10 h-1 bg-gray-300 rounded mt-1"/></div>))}
          </div>
        ) : (
          <div className="flex justify-center gap-2">
            {Array.from({length:Math.min(p?.numKids||0,6)},(_,i)=>(
              <div key={i} className="border-2 border-dashed border-purple-300 rounded-lg px-2 py-1 bg-purple-50">
                <span className="text-xs text-purple-500">grup {i+1}</span>
              </div>
            ))}
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

export default BolusmeZamani;

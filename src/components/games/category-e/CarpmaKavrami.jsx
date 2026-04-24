import React, { useState } from 'react';
import { shuffle, TOTAL_ROUNDS, playSound, encourage, useSafeTimeout } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const items=[{e:'🍎',n:'elma'},{e:'🍊',n:'portakal'},{e:'⭐',n:'yıldız'},{e:'🌸',n:'çiçek'},{e:'🎈',n:'balon'}];

const CarpmaKavrami = ({ onBack, colors, onGameComplete, rahatMod, prevBest }) => {
  const safeSetTimeout = useSafeTimeout();
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);

  const gen=(l)=>{
    const item=items[Math.floor(Math.random()*items.length)];
    let groups,perGroup,answer,question,hint;

    if(l===1){
      groups=Math.floor(Math.random()*3)+2;
      perGroup=Math.floor(Math.random()*3)+2;
      answer=groups*perGroup;
      question=`Toplam kaç ${item.n} var?`;
      hint=`${groups} grup × ${perGroup} = ${Array(groups).fill(perGroup).join(' + ')} = ${answer}`;
    } else if(l===2){
      groups=Math.floor(Math.random()*3)+2;
      perGroup=Math.floor(Math.random()*3)+2;
      answer=groups;
      question=`${groups*perGroup} tane ${item.n} var. Her grupta ${perGroup} tane. Kaç grup var?`;
      hint=`${groups*perGroup} ÷ ${perGroup} = ${groups} grup`;
    } else if(l===3){
      groups=Math.floor(Math.random()*3)+2;
      perGroup=Math.floor(Math.random()*4)+2;
      answer=groups*perGroup;
      question=`${groups} × ${perGroup} = ${Array(groups).fill(perGroup).join(' + ')} = ?`;
      hint=`${groups} × ${perGroup} = ${Array(groups).fill(perGroup).join(' + ')} = ${answer} (çarpma = tekrarlı toplama)`;
    } else {
      perGroup=Math.floor(Math.random()*3)+2;
      groups=Math.floor(Math.random()*3)+2;
      const total=groups*perGroup;
      answer=groups;
      question=`? × ${perGroup} = ${total}`;
      hint=`${total} ÷ ${perGroup} = ${answer}`;
    }

    const o=[answer];let at=0;
    while(o.length<4&&at<40){
      const d=answer+((Math.random()<0.5?1:-1)*(Math.floor(Math.random()*4)+1));
      if(!o.includes(d)&&d>0) o.push(d);
      at++;
    }
    while(o.length<4) o.push(answer+o.length+1);
    return{groups,perGroup,item,answer,question,hint,options:shuffle(o)};
  };

  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(gen(l));setUa(null);setGs('playing');};
  const handle=(a)=>{
    setUa(a);
    if(a===p?.answer) { playSound('correct'); setSc(s=>s+15*lv); }
    else playSound('wrong');
    safeSetTimeout(()=>{
      if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}
      else setGs('results');
    },1500);
  };

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Çarpma Kavramı" emoji="✖️" description="Eşit grupları sayarak çarpmayı öğren! Tekrarlı toplama ile çarpma arasındaki bağı keşfet." levels={['Seviye 1 (Grupları say)','Seviye 2 (Kaç grup?)','Seviye 3 (Tekrarlı toplama)','Seviye 4 (Eksik çarpan)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Çarpma Kavramı" emoji="✖️" level={lv} instruction={lv===1?'Eşit grupların toplamını bul!':lv===2?'Toplam ve grup büyüklüğünden grup sayısını bul!':lv===3?'Tekrarlı toplamayı hesapla!':'Eksik çarpanı bul!'} colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  const isCorrect=ua!==null&&ua===p?.answer;

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Çarpma Kavramı" colors={colors}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">

        {(lv===1||lv===2) && (
          <div className="bg-white rounded-2xl shadow-xl p-4 mb-3 w-full max-w-sm">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {Array.from({length:p?.groups||0}).map((_,gi)=>(
                <div key={gi} className="flex items-center gap-1 bg-indigo-50 rounded-xl px-3 py-2 border-2 border-indigo-200">
                  {Array.from({length:p?.perGroup||0}).map((__,pi)=>(
                    <span key={pi} className="text-2xl">{p?.item.e}</span>
                  ))}
                </div>
              ))}
            </div>
            <div className="text-center mt-2 text-sm text-gray-500">
              {p?.groups} grup × {p?.perGroup} {p?.item.n}
            </div>
          </div>
        )}

        {lv===3 && (
          <div className="bg-white rounded-2xl shadow-xl p-4 mb-3 w-full max-w-sm">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {Array.from({length:p?.groups||0}).map((_,gi)=>(
                <div key={gi} className="flex items-center gap-1 bg-amber-50 rounded-xl px-3 py-2 border-2 border-amber-200">
                  {Array.from({length:p?.perGroup||0}).map((__,pi)=>(
                    <span key={pi} className="text-2xl">{p?.item.e}</span>
                  ))}
                </div>
              ))}
            </div>
            <div className="text-center mt-2 text-lg font-bold text-gray-700">
              {Array(p?.groups).fill(p?.perGroup).join(' + ')} = ?
            </div>
          </div>
        )}

        {lv===4 && (
          <div className="bg-white rounded-2xl shadow-xl p-4 mb-3 w-full max-w-sm">
            <div className="text-center text-3xl font-bold text-gray-700 mb-2">
              <span className="text-purple-400 animate-pulse">?</span> × {p?.perGroup} = {p?.groups * p?.perGroup}
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {Array.from({length:p?.groups||0}).map((_,gi)=>(
                <div key={gi} className="flex items-center gap-1 bg-purple-50 rounded-xl px-3 py-2 border-2 border-purple-200">
                  {Array.from({length:p?.perGroup||0}).map((__,pi)=>(
                    <span key={pi} className="text-2xl">{p?.item.e}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white px-4 py-2 rounded-xl shadow mb-3 text-center max-w-xs">
          <div className="text-sm text-gray-700 font-medium">{p?.question}</div>
        </div>

        {ua!==null?(
          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${isCorrect?'text-green-500':'text-orange-500'}`}>
              {isCorrect?'✓ Doğru!':`${encourage()} Cevap: ${p?.answer}`}
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700">
              {'💡'} {p?.hint}
            </div>
          </div>
        ):(
          <div className="grid grid-cols-2 gap-3">
            {p?.options?.map((o,i)=>(
              <button key={i} onClick={()=>handle(o)} className={`px-8 py-4 ${colors?.button} text-white rounded-2xl font-bold text-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all`}>{o}</button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default CarpmaKavrami;

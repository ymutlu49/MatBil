import React, { useState, useRef } from 'react';
import { TOTAL_ROUNDS, playSound, encourage, useAdaptive } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const SayisalStroop = ({ onBack, colors, onGameComplete, rahatMod, prevBest, sesAcik }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);
  const adaptive = useAdaptive();

  const cfg={
    1:{min:1,max:5,incongruent:0,label:'Kolay (1-5, uyumlu)'},
    2:{min:1,max:9,incongruent:0.4,label:'Karışık (1-9)'},
    3:{min:1,max:20,incongruent:0.6,label:'Zor (1-20)'},
    4:{min:1,max:50,incongruent:0.7,label:'Uzman (1-50)'}
  };

  const lastPairs = useRef([]);
  const gen=(l)=>{
    const c=cfg[l];
    let a,b,pairKey,attempts=0;
    do{
      do{
        a=Math.floor(Math.random()*(c.max-c.min+1))+c.min;
        b=Math.floor(Math.random()*(c.max-c.min+1))+c.min;
      }while(a===b);
      pairKey = `${Math.min(a,b)}-${Math.max(a,b)}`;
      attempts++;
    } while (lastPairs.current.includes(pairKey) && attempts < 12);
    lastPairs.current.push(pairKey); if (lastPairs.current.length > 4) lastPairs.current.shift();

    const bigger=Math.max(a,b);
    const smaller=Math.min(a,b);
    const isIncongruent=Math.random()<c.incongruent;

    let leftNum,rightNum,leftSize,rightSize;
    if(Math.random()<0.5){
      leftNum=bigger; rightNum=smaller;
    } else {
      leftNum=smaller; rightNum=bigger;
    }

    if(isIncongruent){
      // Incongruent: numerically bigger number gets smaller font
      leftSize=leftNum>rightNum?'text-3xl':'text-7xl';
      rightSize=rightNum>leftNum?'text-3xl':'text-7xl';
    } else {
      // Congruent: numerically bigger number gets bigger font
      leftSize=leftNum>rightNum?'text-7xl':'text-3xl';
      rightSize=rightNum>leftNum?'text-7xl':'text-3xl';
    }

    return{leftNum,rightNum,leftSize,rightSize,answer:bigger,isIncongruent};
  };

  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);lastPairs.current=[];setP(gen(l));setUa(null);adaptive.reset();setGs('playing');};
  const handle=(chosen)=>{
    const correct=chosen===p?.answer;
    setUa(chosen);
    adaptive.record(correct);
    if(correct){ playSound('correct'); setSc(s=>s+15*lv); }
    else playSound('wrong');
    setTimeout(()=>{
      if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}
      else setGs('results');
    },1500);
  };

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Sayısal Stroop" emoji="⚡" description="Boyuta aldanma! Fiziksel büyüklüğü görmezden gel, sayısal olarak büyük olanı seç." levels={['Seviye 1 (Kolay, uyumlu)','Seviye 2 (Karışık 1-9)','Seviye 3 (Zor 1-20)','Seviye 4 (Uzman 1-50)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Sayısal Stroop" emoji="⚡" level={lv} instruction={`Sayıların boyutuna aldanma! Sayısal olarak BÜYÜK olanı seç. (${cfg[lv].label})`} colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  const isCorrect=ua!==null&&ua===p?.answer;

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Sayısal Stroop" colors={colors}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">

        <div className="text-lg font-bold text-gray-700 mb-3">
          Sayısal olarak büyük olanı seç!
        </div>

        {p?.isIncongruent && (
          <div className="bg-orange-100 px-3 py-1 rounded-full text-xs text-orange-600 font-medium mb-2">
            Dikkat! Boyut yanıltıcı
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-4 w-full max-w-sm">
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={()=>ua===null&&handle(p?.leftNum)}
              disabled={ua!==null}
              className={`w-32 h-32 rounded-2xl flex items-center justify-center font-black transition-all duration-300 border-4 ${
                ua===null
                  ?'bg-gradient-to-br from-blue-50 to-indigo-100 border-indigo-200 hover:border-indigo-400 hover:shadow-lg active:scale-95 cursor-pointer'
                  :p?.leftNum===p?.answer
                    ?'bg-green-100 border-green-400'
                    :ua===p?.leftNum
                      ?'bg-orange-100 border-orange-400'
                      :'bg-gray-50 border-gray-200'
              }`}
            >
              <span className={`${p?.leftSize} ${
                ua!==null&&p?.leftNum===p?.answer?'text-green-600':
                ua!==null&&ua===p?.leftNum?'text-orange-500':'text-gray-800'
              }`}>
                {p?.leftNum}
              </span>
            </button>

            <span className="text-gray-300 text-2xl font-bold">vs</span>

            <button
              onClick={()=>ua===null&&handle(p?.rightNum)}
              disabled={ua!==null}
              className={`w-32 h-32 rounded-2xl flex items-center justify-center font-black transition-all duration-300 border-4 ${
                ua===null
                  ?'bg-gradient-to-br from-purple-50 to-pink-100 border-pink-200 hover:border-pink-400 hover:shadow-lg active:scale-95 cursor-pointer'
                  :p?.rightNum===p?.answer
                    ?'bg-green-100 border-green-400'
                    :ua===p?.rightNum
                      ?'bg-orange-100 border-orange-400'
                      :'bg-gray-50 border-gray-200'
              }`}
            >
              <span className={`${p?.rightSize} ${
                ua!==null&&p?.rightNum===p?.answer?'text-green-600':
                ua!==null&&ua===p?.rightNum?'text-orange-500':'text-gray-800'
              }`}>
                {p?.rightNum}
              </span>
            </button>
          </div>
        </div>

        {ua!==null&&(
          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${isCorrect?'text-green-500':'text-orange-500'}`}>
              {isCorrect?'✓ Doğru!':`${encourage()} Cevap: ${p?.answer}`}
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700">
              {'💡'} {p?.leftNum} {p?.leftNum>p?.rightNum?'>':'<'} {p?.rightNum}
              {p?.isIncongruent?' (Boyut yanıltıcıydı!)':' (Boyut uyumluydu)'}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SayisalStroop;

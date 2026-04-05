import React, { useState, useEffect, useCallback, useRef } from 'react';
import { shuffle, TOTAL_ROUNDS, playSound, vibrate, encourage, speakNumber } from '../../../utils';
import { HELP_MAP } from '../../../constants/helpMap';
import Feedback from '../../ui/Feedback';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const HafizaOyunu = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [cards,setCards]=useState([]);const [flipped,setFlipped]=useState([]);const [matched,setMatched]=useState([]);
  const [mismatchIds,setMismatchIds]=useState([]);
  const [newMatchIds,setNewMatchIds]=useState([]);
  // Seviye 1: Kolay (1-4) cokluk-cokluk, Seviye 2: Orta (5-9) sembol-sembol, Seviye 3: Zor (1-9) cokluk-sembol
  const cfg={1:{range:[1,2,3,4],type:'dots-dots',pairs:4},2:{range:[5,6,7,8,9],type:'num-num',pairs:5},3:{range:[1,2,3,4,5,6,7,8,9],type:'dots-num',pairs:6}};
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setFlipped([]);setMatched([]);setMismatchIds([]);setNewMatchIds([]);const c=cfg[l];const vals=c.range.slice(0,c.pairs);let cp;
    if(c.type==='dots-dots'){cp=[...vals.map(v=>({value:v,type:'dots',col:'bg-rose-400'})),...vals.map(v=>({value:v,type:'dots',col:'bg-blue-400'}))];}
    else if(c.type==='num-num'){cp=[...vals.map(v=>({value:v,type:'number',col:'text-rose-600'})),...vals.map(v=>({value:v,type:'number',col:'text-blue-600'}))];}
    else{cp=[...vals.map(v=>({value:v,type:'dots',col:'bg-purple-500'})),...vals.map(v=>({value:v,type:'number',col:'text-purple-700'}))];}
    setCards(shuffle(cp).map((c2,i)=>({...c2,id:i})));setGs('playing');};

  const handleClick=(i)=>{
    if(flipped.length===2||flipped.includes(i)||matched.includes(i))return;
    const nf=[...flipped,i];setFlipped(nf);
    if(nf.length===2){
      const[f,s]=nf;
      if(cards[f].value===cards[s].value&&f!==s){
        const nm=[...matched,f,s];
        setMatched(nm);
        setNewMatchIds([f,s]);
        setTimeout(()=>setNewMatchIds([]),700);
        setSc(s2=>s2+20*lv);
        setFlipped([]);
        if(nm.length===cards.length)setTimeout(()=>setGs('results'),800);
      } else {
        setMismatchIds([f,s]);
        setTimeout(()=>{
          setMismatchIds([]);
          setFlipped([]);
        },1000);
      }
    }
  };

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Hafıza Oyunu" emoji="" description="Kartları çevir ve aynı sayıdaki eşlerini bul! Eşleşen çiftler puan kazandırır." levels={['Kolay (1-4, Çokluk-Çokluk)','Orta (5-9, Sembol-Sembol)','Zor (1-9, Çokluk-Sembol)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Hafıza Oyunu" emoji="" level={lv} instruction="Kartları ikişer ikişer çevir. Aynı sayıyı gösteren kartları bulursan eşleşir ve açık kalır. Tüm çiftleri bulmaya çalış!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={3} onNextLevel={startG} prevBest={prevBest}/>;
  const instrText=lv===1?'Aynı sayıdaki noktaları eşleştir':lv===2?'Aynı sayıları eşleştir':'Çoklukları sayıları ile eşleştir';

  const isRevealed=(i)=>flipped.includes(i)||matched.includes(i);

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col p-3 overflow-hidden`}>
      <div className="shrink-0 flex items-center justify-between w-full max-w-md mx-auto mb-2"><button onClick={onBack} className={`px-4 py-2 ${colors?.button} text-white rounded-xl font-bold`}>{'🏠'}</button><div className="text-sm text-gray-600">Eşleşen: {matched.length/2}/{cards.length/2}</div><div className="bg-yellow-100 px-4 py-2 rounded-full font-bold text-yellow-700">{'⭐'} {sc}</div></div>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
      <div className="bg-white px-4 py-2 rounded-xl shadow mb-3 text-center"><span className="text-sm font-medium text-gray-600">{'💡'} {instrText}</span></div>
      <div className="grid gap-2" style={{gridTemplateColumns:`repeat(${cards.length<=12?4:5},1fr)`}}>
        {cards.map((c,i)=>(
          <div key={i} className="card-flip-container w-16 h-16 sm:w-20 sm:h-20">
            <div
              className={`card-flip-inner w-full h-full ${isRevealed(i)?'flipped':''} ${newMatchIds.includes(i)?'anim-match':''} ${mismatchIds.includes(i)?'anim-mismatch':''}`}
              onClick={()=>handleClick(i)}
              style={{cursor:'pointer'}}
            >
              {/* Card front - the hidden side (shows gradient + ?) */}
              <div className={`card-front ${colors?.button || 'bg-indigo-500'} rounded-xl shadow-md`}>
                <span className="text-2xl font-bold text-white/70">?</span>
              </div>
              {/* Card back - the revealed side (shows content) */}
              <div className={`card-back rounded-xl border-2 ${matched.includes(i)?'bg-green-50 border-green-400 shadow-[0_0_12px_rgba(34,197,94,0.4)]':'bg-white border-purple-400 shadow-md'}`}>
                {c.type==='number'
                  ? <span className={`${c.col||'text-purple-700'} text-xl font-bold`}>{c.value}</span>
                  : <div className="flex flex-wrap justify-center gap-1" style={{maxWidth:52}}>
                      {Array.from({length:c.value},(_,j)=>(
                        <div key={j} className={`w-3 h-3 ${c.col||'bg-purple-500'} rounded-full`}/>
                      ))}
                    </div>
                }
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default HafizaOyunu;

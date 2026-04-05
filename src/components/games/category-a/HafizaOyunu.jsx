import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TOTAL_ROUNDS, playSound, vibrate, encourage, speakNumber } from '../../../utils';
import { HELP_MAP } from '../../../constants/helpMap';
import Feedback from '../../ui/Feedback';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const HafizaOyunu = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [cards,setCards]=useState([]);const [flipped,setFlipped]=useState([]);const [matched,setMatched]=useState([]);
  // Seviye 1: Kolay (1-4) cokluk-cokluk, Seviye 2: Orta (5-9) sembol-sembol, Seviye 3: Zor (1-9) cokluk-sembol
  const cfg={1:{range:[1,2,3,4],type:'dots-dots',pairs:4},2:{range:[5,6,7,8,9],type:'num-num',pairs:5},3:{range:[1,2,3,4,5,6,7,8,9],type:'dots-num',pairs:6}};
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setFlipped([]);setMatched([]);const c=cfg[l];const vals=c.range.sort(()=>Math.random()-0.5).slice(0,c.pairs);let cp;
    if(c.type==='dots-dots'){cp=[...vals.map(v=>({value:v,type:'dots',col:'bg-rose-400'})),...vals.map(v=>({value:v,type:'dots',col:'bg-blue-400'}))];}
    else if(c.type==='num-num'){cp=[...vals.map(v=>({value:v,type:'number',col:'text-rose-600'})),...vals.map(v=>({value:v,type:'number',col:'text-blue-600'}))];}
    else{cp=[...vals.map(v=>({value:v,type:'dots',col:'bg-purple-500'})),...vals.map(v=>({value:v,type:'number',col:'text-purple-700'}))];}
    setCards(cp.sort(()=>Math.random()-0.5).map((c2,i)=>({...c2,id:i})));setGs('playing');};
  const handleClick=(i)=>{if(flipped.length===2||flipped.includes(i)||matched.includes(i))return;const nf=[...flipped,i];setFlipped(nf);if(nf.length===2){const[f,s]=nf;if(cards[f].value===cards[s].value&&f!==s){const nm=[...matched,f,s];setMatched(nm);setSc(s2=>s2+20*lv);setFlipped([]);if(nm.length===cards.length)setTimeout(()=>setGs('results'),800);}else setTimeout(()=>setFlipped([]),1000);}};
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Haf\u0131za Oyunu" emoji="\uD83E\uDDE0" description="Kartlar\u0131 \u00E7evir ve ayn\u0131 say\u0131daki e\u015Flerini bul! E\u015Fle\u015Fen \u00E7iftler puan kazand\u0131r\u0131r." levels={['Kolay (1-4, \u00C7okluk-\u00C7okluk)','Orta (5-9, Sembol-Sembol)','Zor (1-9, \u00C7okluk-Sembol)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Haf\u0131za Oyunu" emoji="\uD83E\uDDE0" level={lv} instruction="Kartlar\u0131 iki\u015Fer iki\u015Fer \u00E7evir. Ayn\u0131 say\u0131y\u0131 g\u00F6steren kartlar\u0131 bulursan e\u015Fle\u015Fir ve a\u00E7\u0131k kal\u0131r. T\u00FCm \u00E7iftleri bulmaya \u00E7al\u0131\u015F!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={3} onNextLevel={startG} prevBest={prevBest}/>;
  const instrText=lv===1?'Ayn\u0131 say\u0131daki noktalar\u0131 e\u015Fle\u015Ftir':lv===2?'Ayn\u0131 say\u0131lar\u0131 e\u015Fle\u015Ftir':'\u00C7okluklar\u0131 say\u0131lar\u0131 ile e\u015Fle\u015Ftir';
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <div className="flex items-center justify-between w-full max-w-md mb-2"><button onClick={onBack} className={`px-4 py-2 ${colors?.button} text-white rounded-xl font-bold`}>{'\uD83C\uDFE0'}</button><div className="text-sm text-gray-600">E\u015Fle\u015Fen: {matched.length/2}/{cards.length/2}</div><div className="bg-yellow-100 px-4 py-2 rounded-full font-bold text-yellow-700">{'\u2B50'} {sc}</div></div>
      <div className="bg-white px-4 py-2 rounded-xl shadow mb-3 text-center"><span className="text-sm font-medium text-gray-600">{'\uD83D\uDCA1'} {instrText}</span></div>
      <div className="grid gap-2" style={{gridTemplateColumns:`repeat(${cards.length<=12?4:5},1fr)`}}>{cards.map((c,i)=>(<button key={i} onClick={()=>handleClick(i)} className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${matched.includes(i)?'bg-green-200 border-2 border-green-400':flipped.includes(i)?'bg-white border-2 border-purple-400':colors?.button}`}>{(flipped.includes(i)||matched.includes(i))?(c.type==='number'?<span className={`${c.col||'text-purple-700'} text-xl font-bold`}>{c.value}</span>:<div className="flex flex-wrap justify-center gap-1" style={{maxWidth:40}}>{Array.from({length:c.value},(_,j)=>(<div key={j} className={`w-2.5 h-2.5 ${c.col||'bg-purple-500'} rounded-full`}/>))}</div>):<span className="text-white text-xl">?</span>}</button>))}</div>
    </div>
  );
};

export default HafizaOyunu;

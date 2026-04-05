import React, { useState, useEffect, useCallback, useRef } from 'react';
import { shuffle, TOTAL_ROUNDS, playSound, vibrate, encourage, speakNumber } from '../../../utils';
import { HELP_MAP } from '../../../constants/helpMap';
import Feedback from '../../ui/Feedback';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const GruplamaUstasi = ({ onBack, colors, onGameComplete, rahatMod, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [cards,setCards]=useState([]);const [ua,setUa]=useState(null);const [curOpts,setCurOpts]=useState([]);
  const Frame=({count,max,color='bg-blue-500'})=>(<div className="bg-white p-2 rounded-xl shadow-lg border-2 border-gray-200"><div className="text-xs text-center text-gray-600 font-medium mb-1">{max===5?'Beşlik':'Onluk'}</div><div className={`grid grid-cols-5 gap-1`}>{Array.from({length:max},(_,i)=>(<div key={i} className={`w-6 h-6 rounded-md border-2 border-gray-300 ${i<count?color:'bg-gray-100'}`}/>))}</div></div>);
  const cCols=['bg-red-400','bg-blue-400','bg-green-400','bg-purple-400','bg-amber-400'];
  const genCards=(l)=>{const cfgs={1:{type:'five',n:1},2:{type:'five',n:2},3:{type:'ten',n:1},4:{type:'mixed',n:3}};const cf=cfgs[l];return Array.from({length:cf.n},(_,i)=>{const t=cf.type==='five'?'five':cf.type==='ten'?'ten':Math.random()>0.5?'five':'ten';const mx=t==='five'?5:10;return{type:t,count:Math.floor(Math.random()*mx)+1,color:cCols[i%cCols.length]};});};
  const mkOpts=(cds)=>{const tot=cds.reduce((s,c)=>s+c.count,0);const o=[tot];let at=0,sp=3;while(o.length<4){if(at>30){sp++;at=0;}const c=Math.max(1,tot+Math.floor(Math.random()*sp*2)-sp);if(!o.includes(c))o.push(c);at++;}return shuffle(o);};
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);const c=genCards(l);setCards(c);setCurOpts(mkOpts(c));setUa(null);setGs('playing');};
  const total=cards.reduce((s,c)=>s+c.count,0);
  const handle=(a)=>{setUa(a);if(a===total)setSc(s=>s+15*lv);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);const c=genCards(lv);setCards(c);setCurOpts(mkOpts(c));setUa(null);}else setGs('results');},1200);};
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Gruplama Ustası" emoji="" description="Beşlik ve onluk çerçevelerdeki nesneleri sayarak toplamı bul!" levels={['Beşlik (1 kart)','Beşlik (2 kart)','Onluk (1 kart)','Karışık']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Gruplama Ustası" emoji="" level={lv} instruction="Beşlik veya onluk çerçeveler gösterilecek. Dolu kutuları sayarak toplamın kaç olduğunu bul!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Gruplama Ustası" colors={colors} hideRound={rahatMod}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
      <div className="flex gap-3 mb-3 flex-wrap justify-center">{cards.map((c,i)=>(<Frame key={i} count={c.count} max={c.type==='five'?5:10} color={c.color}/>))}</div>
      <div className="text-base text-gray-600 mb-3 bg-white px-4 py-2 rounded-xl shadow">Toplam kaç tane?</div>
      {ua!==null?(<div className="text-center"><div className={`text-3xl font-bold mb-2 ${ua===total?'text-green-500':'text-orange-500'}`}>{ua===total?'✓ Doğru!':`${encourage()} Cevap: ${total}`}</div><div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700">{'💡'} {cards.map(c=>c.count).join(' + ')} = {total}</div></div>):(<div className="grid grid-cols-2 gap-3">{curOpts.map((n,i)=>(<button key={i} onClick={()=>handle(n)} className={`px-8 py-4 ${colors?.button} text-white rounded-xl font-bold text-2xl shadow-lg`}>{n}</button>))}</div>)}

      </div>    </div>
  );
};

export default GruplamaUstasi;

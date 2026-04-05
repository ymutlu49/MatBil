import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TOTAL_ROUNDS, playSound, vibrate, encourage, speakNumber } from '../../../utils';
import { HELP_MAP } from '../../../constants/helpMap';
import Feedback from '../../ui/Feedback';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const GunlukSanbil = ({ onBack, colors, onGameComplete, rahatMod }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [oc,setOc]=useState(0);const [show,setShow]=useState(false);const [ua,setUa]=useState(null);const [si,setSi]=useState(0);const [sceneOrder,setSceneOrder]=useState([]);
  const scenes=[
    {name:'Mutfak',obj:['🍎','🍊','🍋','🍇','🍓','🍌','🥕','🍅','🌽']},
    {name:'Bahçe',obj:['🌸','🌺','🌻','🌷','🌹','🌼','💐','🌵','🍀']},
    {name:'Oyuncak',obj:['🚗','🚂','🎈','🧸','⚽','🎮','🪀','🎪','🪁']},
    {name:'Okul',obj:['📚','✏️','📏','🎨','📐','🖍️','📓','🔬','🖊️']},
    {name:'Deniz',obj:['🐟','🐙','🦀','🐚','🐬','🦈','🪸','🐠','🦑']},
    {name:'Orman',obj:['🌲','🍄','🐿️','🦉','🐛','🦋','🐞','🍂','🌰']},
    {name:'Çiftlik',obj:['🐄','🐔','🐑','🐖','🐴','🐓','🐇','🦆','🐐']},
    {name:'Uzay',obj:['⭐','🌙','☄️','🪐','🛸','🌟','💫','🚀','🌠']},
    {name:'Tatlı',obj:['🍰','🧁','🍩','🍪','🍬','🍭','🎂','🍫','🍮']},
    {name:'Spor',obj:['⚽','🏀','🎾','🏐','🏈','⚾','🏓','🏸','🥎']}
  ];
  const cfg={1:{max:4,t:3000},2:{max:5,t:2500},3:{max:6,t:2000},4:{max:7,t:1500}};
  const shuffleScenes = () => {const order=[...Array(scenes.length).keys()];for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}return order;};
  const startR=(l)=>{const c=Math.floor(Math.random()*cfg[l].max)+2;setOc(c);setShow(true);setUa(null);setTimeout(()=>setShow(false), rahatMod ? Math.round(cfg[l].t * 1.5) : cfg[l].t);};
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);const order=shuffleScenes();setSceneOrder(order);setSi(0);setGs('playing');startR(l);};
  const handle=(a)=>{setUa(a);if(a===oc){setSc(s=>s+15*lv);speakNumber(oc);}setTimeout(()=>{if(rd<TOTAL_ROUNDS){setSi(s=>s+1);setRd(r=>r+1);startR(lv);}else setGs('results');},1200);};
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Günlük Sanbil" emoji="🏠" description="Gerçek nesneler kısa süre gösterilecek. Saymadan bakarak kaç tane olduğunu bul!" levels={['Seviye 1 (2-5 nesne, 3sn)','Seviye 2 (2-6 nesne, 2.5sn)','Seviye 3 (2-7 nesne, 2sn)','Seviye 4 (2-8 nesne, 1.5sn)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Günlük Sanbil" emoji="🏠" level={lv} instruction="Meyve, çiçek veya oyuncak gibi nesneler kısa süreliğine görünüp kaybolacak. Kaç tane olduğunu saymadan bul!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  const sceneIdx = sceneOrder.length > 0 ? sceneOrder[si % sceneOrder.length] : 0;
  const scene=scenes[sceneIdx];
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title={`Günlük • ${scene.name}`} colors={colors} hideRound={rahatMod}/>
      <div className="w-56 h-40 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-3 border-4 border-green-200">
        {show?<div className="flex gap-2 flex-wrap justify-center p-4">{Array.from({length:oc},(_,i)=>(<span key={i} className="text-4xl">{scene.obj[i%scene.obj.length]}</span>))}</div>:ua===null?<span className="text-4xl">{'❓'}</span>:<Feedback isCorrect={ua===oc} answer={oc} hint={ua===oc ? `Harika! ${oc} tane ${scene.name.toLowerCase()} nesnesi vardı.` : `${oc} tane vardı. Bir bakışta anlamaya çalış!`}/>}
      </div>
      {!show&&ua===null&&<div className="grid grid-cols-5 gap-2">{Array.from({length:9},(_,i)=>i+1).map(n=>(<button key={n} onClick={()=>handle(n)} className={`w-14 h-14 ${colors?.button} text-white rounded-xl font-bold text-xl hover:scale-105 transition-transform`}>{n}</button>))}</div>}
    </div>
  );
};

export default GunlukSanbil;

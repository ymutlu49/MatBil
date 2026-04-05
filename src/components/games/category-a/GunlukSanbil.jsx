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
    {name:'Mutfak',obj:['\uD83C\uDF4E','\uD83C\uDF4A','\uD83C\uDF4B','\uD83C\uDF47','\uD83C\uDF53','\uD83C\uDF4C','\uD83E\uDD55','\uD83C\uDF45','\uD83C\uDF3D']},
    {name:'Bah\u00E7e',obj:['\uD83C\uDF38','\uD83C\uDF3A','\uD83C\uDF3B','\uD83C\uDF37','\uD83C\uDF39','\uD83C\uDF3C','\uD83D\uDC90','\uD83C\uDF35','\uD83C\uDF40']},
    {name:'Oyuncak',obj:['\uD83D\uDE97','\uD83D\uDE82','\uD83C\uDF88','\uD83E\uDDF8','\u26BD','\uD83C\uDFAE','\uD83E\uDE80','\uD83C\uDFAA','\uD83E\uDE81']},
    {name:'Okul',obj:['\uD83D\uDCDA','\u270F\uFE0F','\uD83D\uDCCF','\uD83C\uDFA8','\uD83D\uDCD0','\uD83D\uDD8D\uFE0F','\uD83D\uDCD3','\uD83D\uDD2C','\uD83D\uDD8A\uFE0F']},
    {name:'Deniz',obj:['\uD83D\uDC1F','\uD83D\uDC19','\uD83E\uDD80','\uD83D\uDC1A','\uD83D\uDC2C','\uD83E\uDD88','\uD83E\uDEB8','\uD83D\uDC20','\uD83E\uDD91']},
    {name:'Orman',obj:['\uD83C\uDF32','\uD83C\uDF44','\uD83D\uDC3F\uFE0F','\uD83E\uDD89','\uD83D\uDC1B','\uD83E\uDD8B','\uD83D\uDC1E','\uD83C\uDF42','\uD83C\uDF30']},
    {name:'\u00C7iftlik',obj:['\uD83D\uDC04','\uD83D\uDC14','\uD83D\uDC11','\uD83D\uDC16','\uD83D\uDC34','\uD83D\uDC13','\uD83D\uDC07','\uD83E\uDD86','\uD83D\uDC10']},
    {name:'Uzay',obj:['\u2B50','\uD83C\uDF19','\u2604\uFE0F','\uD83E\uDE90','\uD83D\uDEF8','\uD83C\uDF1F','\uD83D\uDCAB','\uD83D\uDE80','\uD83C\uDF20']},
    {name:'Tatl\u0131',obj:['\uD83C\uDF70','\uD83E\uDDC1','\uD83C\uDF69','\uD83C\uDF6A','\uD83C\uDF6C','\uD83C\uDF6D','\uD83C\uDF82','\uD83C\uDF6B','\uD83C\uDF6E']},
    {name:'Spor',obj:['\u26BD','\uD83C\uDFC0','\uD83C\uDFBE','\uD83C\uDFD0','\uD83C\uDFC8','\u26BE','\uD83C\uDFD3','\uD83C\uDFF8','\uD83E\uDD4E']}
  ];
  const cfg={1:{max:4,t:3000},2:{max:5,t:2500},3:{max:6,t:2000},4:{max:7,t:1500}};
  const shuffleScenes = () => {const order=[...Array(scenes.length).keys()];for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}return order;};
  const startR=(l)=>{const c=Math.floor(Math.random()*cfg[l].max)+2;setOc(c);setShow(true);setUa(null);setTimeout(()=>setShow(false), rahatMod ? Math.round(cfg[l].t * 1.5) : cfg[l].t);};
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);const order=shuffleScenes();setSceneOrder(order);setSi(0);setGs('playing');startR(l);};
  const handle=(a)=>{setUa(a);if(a===oc){setSc(s=>s+15*lv);speakNumber(oc);}setTimeout(()=>{if(rd<TOTAL_ROUNDS){setSi(s=>s+1);setRd(r=>r+1);startR(lv);}else setGs('results');},1200);};
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="G\u00FCnl\u00FCk Sanbil" emoji="\uD83C\uDFE0" description="Ger\u00E7ek nesneler k\u0131sa s\u00FCre g\u00F6sterilecek. Saymadan bakarak ka\u00E7 tane oldu\u011Funu bul!" levels={['Seviye 1 (2-5 nesne, 3sn)','Seviye 2 (2-6 nesne, 2.5sn)','Seviye 3 (2-7 nesne, 2sn)','Seviye 4 (2-8 nesne, 1.5sn)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="G\u00FCnl\u00FCk Sanbil" emoji="\uD83C\uDFE0" level={lv} instruction="Meyve, \u00E7i\u00E7ek veya oyuncak gibi nesneler k\u0131sa s\u00FCreli\u011Fine g\u00F6r\u00FCn\u00FCp kaybolacak. Ka\u00E7 tane oldu\u011Funu saymadan bul!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  const sceneIdx = sceneOrder.length > 0 ? sceneOrder[si % sceneOrder.length] : 0;
  const scene=scenes[sceneIdx];
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title={`G\u00FCnl\u00FCk \u2022 ${scene.name}`} colors={colors} hideRound={rahatMod}/>
      <div className="w-56 h-40 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-3 border-4 border-green-200">
        {show?<div className="flex gap-2 flex-wrap justify-center p-4">{Array.from({length:oc},(_,i)=>(<span key={i} className="text-4xl">{scene.obj[i%scene.obj.length]}</span>))}</div>:ua===null?<span className="text-4xl">{'\u2753'}</span>:<Feedback isCorrect={ua===oc} answer={oc} hint={ua===oc ? `Harika! ${oc} tane ${scene.name.toLowerCase()} nesnesi vard\u0131.` : `${oc} tane vard\u0131. Bir bak\u0131\u015Fta anlamaya \u00E7al\u0131\u015F!`}/>}
      </div>
      {!show&&ua===null&&<div className="grid grid-cols-5 gap-2">{Array.from({length:9},(_,i)=>i+1).map(n=>(<button key={n} onClick={()=>handle(n)} className={`w-14 h-14 ${colors?.button} text-white rounded-xl font-bold text-xl hover:scale-105 transition-transform`}>{n}</button>))}</div>}
    </div>
  );
};

export default GunlukSanbil;

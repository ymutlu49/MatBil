import React, { useState } from 'react';
import { TOTAL_ROUNDS, encourage } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const ElemanVeOzellikler = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);const [used,setUsed]=useState([]);

  // SVG \u00e7okgen
  const Poly = ({sides,size=80,color='#6366f1'}) => {
    if(sides===0) return <svg width={size} height={size} style={{overflow:'visible'}}><circle cx={size/2} cy={size/2} r={size/2-5} fill="none" stroke={color} strokeWidth={3}/></svg>;
    const pts = Array.from({length:sides},(_,i)=>{const a=(i*2*Math.PI/sides)-Math.PI/2;return `${size/2+(size/2-5)*Math.cos(a)},${size/2+(size/2-5)*Math.sin(a)}`;}).join(' ');
    return <svg width={size} height={size} style={{overflow:'visible'}}><polygon points={pts} fill="none" stroke={color} strokeWidth={3}/></svg>;
  };

  // E\u015fkenar d\u00f6rtgen SVG
  const Rhombus = ({size=80,color='#6366f1'}) => {
    const s=size,m=5;
    const pts=`${s/2},${m} ${s-m},${s/2} ${s/2},${s-m} ${m},${s/2}`;
    return <svg width={s} height={s} style={{overflow:'visible'}}><polygon points={pts} fill="none" stroke={color} strokeWidth={3}/></svg>;
  };

  const shapeData = {
    cember: {name:'\u00c7ember',sides:0,corners:0,render:(s,c)=><Poly sides={0} size={s} color={c}/>},
    ucgen: {name:'\u00dc\u00e7gen',sides:3,corners:3,render:(s,c)=><Poly sides={3} size={s} color={c}/>},
    kare: {name:'Kare',sides:4,corners:4,render:(s,c)=><Poly sides={4} size={s} color={c}/>},
    dikdortgen: {name:'Dikd\u00f6rtgen',sides:4,corners:4,render:(s,c)=>{const w=s*1.4,sw=3,m=sw+2;return <svg width={w} height={s} style={{overflow:'visible'}}><rect x={m} y={m} width={w-m*2} height={s-m*2} fill="none" stroke={c} strokeWidth={sw}/></svg>;}},
    eskenar_dortgen: {name:'E\u015fkenar D\u00f6rtgen',sides:4,corners:4,render:(s,c)=><Rhombus size={s} color={c}/>},
    besgen: {name:'Be\u015fgen',sides:5,corners:5,render:(s,c)=><Poly sides={5} size={s} color={c}/>},
    altigen: {name:'Alt\u0131gen',sides:6,corners:6,render:(s,c)=><Poly sides={6} size={s} color={c}/>},
    sekizgen: {name:'Sekizgen',sides:8,corners:8,render:(s,c)=><Poly sides={8} size={s} color={c}/>},
  };

  const allQuestions = [
    {id:1,shape:'ucgen',type:'edges',q:'\u00dc\u00e7genin ka\u00e7 kenar\u0131 var?',a:3,explain:'\u00dc\u00e7genin 3 kenar\u0131 vard\u0131r.',lv:1},
    {id:2,shape:'kare',type:'edges',q:'Karenin ka\u00e7 kenar\u0131 var?',a:4,explain:'Karenin 4 e\u015fit kenar\u0131 vard\u0131r.',lv:1},
    {id:3,shape:'dikdortgen',type:'edges',q:'Dikd\u00f6rtgenin ka\u00e7 kenar\u0131 var?',a:4,explain:'Dikd\u00f6rtgenin 4 kenar\u0131 vard\u0131r.',lv:1},
    {id:4,shape:'ucgen',type:'corners',q:'\u00dc\u00e7genin ka\u00e7 k\u00f6\u015fesi var?',a:3,explain:'\u00dc\u00e7genin 3 k\u00f6\u015fesi vard\u0131r.',lv:1},
    {id:5,shape:'kare',type:'corners',q:'Karenin ka\u00e7 k\u00f6\u015fesi var?',a:4,explain:'Karenin 4 k\u00f6\u015fesi vard\u0131r.',lv:1},
    {id:6,shape:'dikdortgen',type:'corners',q:'Dikd\u00f6rtgenin ka\u00e7 k\u00f6\u015fesi var?',a:4,explain:'Dikd\u00f6rtgenin 4 k\u00f6\u015fesi vard\u0131r.',lv:1},
    {id:7,shape:'eskenar_dortgen',type:'edges',q:'E\u015fkenar d\u00f6rtgenin ka\u00e7 kenar\u0131 var?',a:4,explain:'E\u015fkenar d\u00f6rtgenin 4 e\u015fit kenar\u0131 vard\u0131r.',lv:1},
    {id:8,shape:'cember',type:'edges',q:'\u00c7emberin ka\u00e7 kenar\u0131 var?',a:0,explain:'\u00c7emberin d\u00fcz kenar\u0131 yoktur!',lv:1},
    {id:11,shape:'besgen',type:'edges',q:'Be\u015fgenin ka\u00e7 kenar\u0131 var?',a:5,explain:'Be\u015fgenin 5 kenar\u0131 vard\u0131r.',lv:2},
    {id:12,shape:'altigen',type:'edges',q:'Alt\u0131genin ka\u00e7 kenar\u0131 var?',a:6,explain:'Alt\u0131genin 6 kenar\u0131 vard\u0131r.',lv:2},
    {id:13,shape:'sekizgen',type:'edges',q:'Sekizgenin ka\u00e7 kenar\u0131 var?',a:8,explain:'Sekizgenin 8 kenar\u0131 vard\u0131r.',lv:2},
    {id:14,shape:'besgen',type:'corners',q:'Be\u015fgenin ka\u00e7 k\u00f6\u015fesi var?',a:5,explain:'Be\u015fgenin 5 k\u00f6\u015fesi vard\u0131r.',lv:2},
    {id:15,shape:'altigen',type:'corners',q:'Alt\u0131genin ka\u00e7 k\u00f6\u015fesi var?',a:6,explain:'Alt\u0131genin 6 k\u00f6\u015fesi vard\u0131r.',lv:2},
    {id:21,shape:null,type:'identify',q:'3 kenar\u0131 ve 3 k\u00f6\u015fesi olan \u015fekil hangisi?',a:'\u00dc\u00e7gen',opts:['\u00dc\u00e7gen','Kare','Dikd\u00f6rtgen','Be\u015fgen'],explain:'3 kenarl\u0131 \u015fekle \u00fc\u00e7gen denir.',lv:3},
    {id:22,shape:null,type:'identify',q:'4 e\u015fit kenar\u0131 ve 4 dik a\u00e7\u0131s\u0131 olan \u015fekil?',a:'Kare',opts:['\u00dc\u00e7gen','Kare','Dikd\u00f6rtgen','Be\u015fgen'],explain:'Kare: 4 e\u015fit kenar + 4 dik a\u00e7\u0131.',lv:3},
    {id:23,shape:null,type:'identify',q:'Kar\u015f\u0131l\u0131kl\u0131 kenarlar\u0131 e\u015fit, 4 dik a\u00e7\u0131l\u0131 \u015fekil?',a:'Dikd\u00f6rtgen',opts:['\u00dc\u00e7gen','Kare','Dikd\u00f6rtgen','Alt\u0131gen'],explain:'Dikd\u00f6rtgende kar\u015f\u0131l\u0131kl\u0131 kenarlar e\u015fittir.',lv:3},
    {id:24,shape:null,type:'identify',q:'4 e\u015fit kenar\u0131 olan ama a\u00e7\u0131lar\u0131 dik olmayan \u015fekil?',a:'E\u015fkenar D\u00f6rtgen',opts:['Kare','E\u015fkenar D\u00f6rtgen','Dikd\u00f6rtgen','\u00dc\u00e7gen'],explain:'E\u015fkenar d\u00f6rtgenin kenarlar\u0131 e\u015fit, a\u00e7\u0131lar\u0131 dik de\u011fildir.',lv:3},
    {id:31,shape:'kare',type:'property',q:'Karenin t\u00fcm kenarlar\u0131 e\u015fit mi?',a:'Evet',explain:'Evet! Karenin 4 kenar\u0131 da e\u015fit uzunluktad\u0131r.',lv:4},
    {id:32,shape:'dikdortgen',type:'property',q:'Dikd\u00f6rtgenin t\u00fcm kenarlar\u0131 e\u015fit mi?',a:'Hay\u0131r',explain:'Hay\u0131r! Sadece kar\u015f\u0131l\u0131kl\u0131 kenarlar e\u015fittir.',lv:4},
    {id:33,shape:'cember',type:'property',q:'\u00c7emberin k\u00f6\u015fesi var m\u0131?',a:'Hay\u0131r',explain:'Hay\u0131r! \u00c7ember yuvarlak oldu\u011fu i\u00e7in k\u00f6\u015fesi yoktur.',lv:4},
    {id:34,shape:'kare',type:'property',q:'Karenin t\u00fcm a\u00e7\u0131lar\u0131 e\u015fit mi?',a:'Evet',explain:'Evet! 4 a\u00e7\u0131s\u0131 da 90 derecedir.',lv:4},
    {id:35,shape:'eskenar_dortgen',type:'property',q:'E\u015fkenar d\u00f6rtgenin a\u00e7\u0131lar\u0131 dik mi?',a:'Hay\u0131r',explain:'Hay\u0131r! E\u015fkenar d\u00f6rtgenin a\u00e7\u0131lar\u0131 genelde dik de\u011fildir.',lv:4},
  ];

  const genOpts = (q) => {
    if(q.type==='identify') return q.opts;
    if(q.type==='property') return ['Evet','Hay\u0131r'];
    const o=[q.a];let at=0;while(o.length<4&&at<40){const c=Math.floor(Math.random()*10);if(!o.includes(c))o.push(c);at++;}while(o.length<4)o.push(o.length+10);return o.sort(()=>Math.random()-0.5);
  };

  const gen = (l, u) => {
    const av = allQuestions.filter(q=>q.lv<=l&&!u.includes(q.id));
    const pool = av.length>0 ? av : allQuestions.filter(q=>q.lv<=l);
    const q = pool[Math.floor(Math.random()*pool.length)];
    return {...q, options: genOpts(q)};
  };

  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG = (l) => {setLv(l);setSc(0);setRd(1);setUsed([]);const q=gen(l,[]);setP(q);setUsed([q.id]);setUa(null);setGs('playing');};

  const handle = (a) => {
    const correct = a === p?.a;
    setUa(a);if(correct)setSc(s=>s+15*lv);
    setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);const q=gen(lv,used);setP(q);setUsed(prev=>[...prev,q.id]);setUa(null);}else setGs('results');},2000);
  };

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Eleman ve \u00d6zellikler" emoji="\ud83d\udd0e" description="\u015eekillerin kenar, k\u00f6\u015fe ve a\u00e7\u0131lar\u0131n\u0131 incele! Her \u015feklin \u00f6zelliklerini \u00f6\u011fren." levels={['D\u00fczey 2a (Temel)','D\u00fczey 2b (Orta)','D\u00fczey 2c (Tan\u0131mlama)','D\u00fczey 2d (\u00d6zellik)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Eleman ve \u00d6zellikler" emoji="\ud83d\udd0e" level={lv} instruction="Bir \u015fekil g\u00f6sterilecek ve kenar, k\u00f6\u015fe veya a\u00e7\u0131 say\u0131s\u0131 sorulacak. Do\u011fru cevab\u0131 bul!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  const sd = p?.shape ? shapeData[p?.shape] : null;

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Eleman ve \u00d6zellikler" colors={colors}/>
      <div className="bg-white px-4 py-2 rounded-xl shadow mb-3 text-center"><span className="text-sm text-gray-500">D\u00fczey 2: Analiz</span></div>

      <div className="bg-white px-6 py-3 rounded-2xl shadow-xl mb-3 text-center">
        {sd && <div className="flex justify-center mb-3">{sd.render(80,'#6366f1')}</div>}
        {sd && <div className="text-sm text-gray-500 mb-2">{sd.name}</div>}
        <div className="text-lg text-gray-700 font-medium">{p?.q}</div>
      </div>

      {ua!==null?(<div className="text-center max-w-sm"><div className={`text-2xl font-bold mb-2 ${ua===p?.a?'text-green-500':'text-orange-500'}`}>{ua===p?.a?'\u2713 Do\u011fru!':`${encourage()} Cevap: ${p?.a}`}</div><div className="bg-amber-50 p-3 rounded-xl text-amber-700 text-sm">{'\ud83d\udca1'} {p?.explain}</div></div>):(<div className={`grid ${p?.options?.length<=2?'grid-cols-2':'grid-cols-2'} gap-3`}>{p?.options?.map((o,i)=>(<button key={i} onClick={()=>handle(o)} className={`px-6 py-4 ${colors?.button} text-white rounded-xl font-bold text-xl shadow-lg hover:scale-105 transition-transform`}>{o}</button>))}</div>)}
    </div>
  );
};

export default ElemanVeOzellikler;

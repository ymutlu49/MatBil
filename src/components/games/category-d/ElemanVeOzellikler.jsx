import React, { useState } from 'react';
import { TOTAL_ROUNDS, encourage } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const ElemanVeOzellikler = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);const [used,setUsed]=useState([]);

  // SVG çokgen
  const Poly = ({sides,size=80,color='#6366f1'}) => {
    if(sides===0) return <svg width={size} height={size} style={{overflow:'visible'}}><circle cx={size/2} cy={size/2} r={size/2-5} fill="none" stroke={color} strokeWidth={3}/></svg>;
    const pts = Array.from({length:sides},(_,i)=>{const a=(i*2*Math.PI/sides)-Math.PI/2;return `${size/2+(size/2-5)*Math.cos(a)},${size/2+(size/2-5)*Math.sin(a)}`;}).join(' ');
    return <svg width={size} height={size} style={{overflow:'visible'}}><polygon points={pts} fill="none" stroke={color} strokeWidth={3}/></svg>;
  };

  // Eşkenar dörtgen SVG
  const Rhombus = ({size=80,color='#6366f1'}) => {
    const s=size,m=5;
    const pts=`${s/2},${m} ${s-m},${s/2} ${s/2},${s-m} ${m},${s/2}`;
    return <svg width={s} height={s} style={{overflow:'visible'}}><polygon points={pts} fill="none" stroke={color} strokeWidth={3}/></svg>;
  };

  const shapeData = {
    cember: {name:'Çember',sides:0,corners:0,render:(s,c)=><Poly sides={0} size={s} color={c}/>},
    ucgen: {name:'Üçgen',sides:3,corners:3,render:(s,c)=><Poly sides={3} size={s} color={c}/>},
    kare: {name:'Kare',sides:4,corners:4,render:(s,c)=><Poly sides={4} size={s} color={c}/>},
    dikdortgen: {name:'Dikdörtgen',sides:4,corners:4,render:(s,c)=>{const w=s*1.4,sw=3,m=sw+2;return <svg width={w} height={s} style={{overflow:'visible'}}><rect x={m} y={m} width={w-m*2} height={s-m*2} fill="none" stroke={c} strokeWidth={sw}/></svg>;}},
    eskenar_dortgen: {name:'Eşkenar Dörtgen',sides:4,corners:4,render:(s,c)=><Rhombus size={s} color={c}/>},
    besgen: {name:'Beşgen',sides:5,corners:5,render:(s,c)=><Poly sides={5} size={s} color={c}/>},
    altigen: {name:'Altıgen',sides:6,corners:6,render:(s,c)=><Poly sides={6} size={s} color={c}/>},
    sekizgen: {name:'Sekizgen',sides:8,corners:8,render:(s,c)=><Poly sides={8} size={s} color={c}/>},
  };

  const allQuestions = [
    {id:1,shape:'ucgen',type:'edges',q:'Üçgenin kaç kenarı var?',a:3,explain:'Üçgenin 3 kenarı vardır.',lv:1},
    {id:2,shape:'kare',type:'edges',q:'Karenin kaç kenarı var?',a:4,explain:'Karenin 4 eşit kenarı vardır.',lv:1},
    {id:3,shape:'dikdortgen',type:'edges',q:'Dikdörtgenin kaç kenarı var?',a:4,explain:'Dikdörtgenin 4 kenarı vardır.',lv:1},
    {id:4,shape:'ucgen',type:'corners',q:'Üçgenin kaç köşesi var?',a:3,explain:'Üçgenin 3 köşesi vardır.',lv:1},
    {id:5,shape:'kare',type:'corners',q:'Karenin kaç köşesi var?',a:4,explain:'Karenin 4 köşesi vardır.',lv:1},
    {id:6,shape:'dikdortgen',type:'corners',q:'Dikdörtgenin kaç köşesi var?',a:4,explain:'Dikdörtgenin 4 köşesi vardır.',lv:1},
    {id:7,shape:'eskenar_dortgen',type:'edges',q:'Eşkenar dörtgenin kaç kenarı var?',a:4,explain:'Eşkenar dörtgenin 4 eşit kenarı vardır.',lv:1},
    {id:8,shape:'cember',type:'edges',q:'Çemberin kaç kenarı var?',a:0,explain:'Çemberin düz kenarı yoktur!',lv:1},
    {id:11,shape:'besgen',type:'edges',q:'Beşgenin kaç kenarı var?',a:5,explain:'Beşgenin 5 kenarı vardır.',lv:2},
    {id:12,shape:'altigen',type:'edges',q:'Altıgenin kaç kenarı var?',a:6,explain:'Altıgenin 6 kenarı vardır.',lv:2},
    {id:13,shape:'sekizgen',type:'edges',q:'Sekizgenin kaç kenarı var?',a:8,explain:'Sekizgenin 8 kenarı vardır.',lv:2},
    {id:14,shape:'besgen',type:'corners',q:'Beşgenin kaç köşesi var?',a:5,explain:'Beşgenin 5 köşesi vardır.',lv:2},
    {id:15,shape:'altigen',type:'corners',q:'Altıgenin kaç köşesi var?',a:6,explain:'Altıgenin 6 köşesi vardır.',lv:2},
    {id:21,shape:null,type:'identify',q:'3 kenarı ve 3 köşesi olan şekil hangisi?',a:'Üçgen',opts:['Üçgen','Kare','Dikdörtgen','Beşgen'],explain:'3 kenarlı şekle üçgen denir.',lv:3},
    {id:22,shape:null,type:'identify',q:'4 eşit kenarı ve 4 dik açısı olan şekil?',a:'Kare',opts:['Üçgen','Kare','Dikdörtgen','Beşgen'],explain:'Kare: 4 eşit kenar + 4 dik açı.',lv:3},
    {id:23,shape:null,type:'identify',q:'Karşılıklı kenarları eşit, 4 dik açılı şekil?',a:'Dikdörtgen',opts:['Üçgen','Kare','Dikdörtgen','Altıgen'],explain:'Dikdörtgende karşılıklı kenarlar eşittir.',lv:3},
    {id:24,shape:null,type:'identify',q:'4 eşit kenarı olan ama açıları dik olmayan şekil?',a:'Eşkenar Dörtgen',opts:['Kare','Eşkenar Dörtgen','Dikdörtgen','Üçgen'],explain:'Eşkenar dörtgenin kenarları eşit, açıları dik değildir.',lv:3},
    {id:31,shape:'kare',type:'property',q:'Karenin tüm kenarları eşit mi?',a:'Evet',explain:'Evet! Karenin 4 kenarı da eşit uzunluktadır.',lv:4},
    {id:32,shape:'dikdortgen',type:'property',q:'Dikdörtgenin tüm kenarları eşit mi?',a:'Hayır',explain:'Hayır! Sadece karşılıklı kenarlar eşittir.',lv:4},
    {id:33,shape:'cember',type:'property',q:'Çemberin köşesi var mı?',a:'Hayır',explain:'Hayır! Çember yuvarlak olduğu için köşesi yoktur.',lv:4},
    {id:34,shape:'kare',type:'property',q:'Karenin tüm açıları eşit mi?',a:'Evet',explain:'Evet! 4 açısı da 90 derecedir.',lv:4},
    {id:35,shape:'eskenar_dortgen',type:'property',q:'Eşkenar dörtgenin açıları dik mi?',a:'Hayır',explain:'Hayır! Eşkenar dörtgenin açıları genelde dik değildir.',lv:4},
  ];

  const genOpts = (q) => {
    if(q.type==='identify') return q.opts;
    if(q.type==='property') return ['Evet','Hayır'];
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

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Eleman ve Özellikler" emoji="" description="Şekillerin kenar, köşe ve açılarını incele! Her şeklin özelliklerini öğren." levels={['Düzey 2a (Temel)','Düzey 2b (Orta)','Düzey 2c (Tanımlama)','Düzey 2d (Özellik)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Eleman ve Özellikler" emoji="" level={lv} instruction="Bir şekil gösterilecek ve kenar, köşe veya açı sayısı sorulacak. Doğru cevabı bul!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  const sd = p?.shape ? shapeData[p?.shape] : null;

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Eleman ve Özellikler" colors={colors}/>
      <div className="bg-white px-4 py-2 rounded-xl shadow mb-3 text-center"><span className="text-sm text-gray-500">Düzey 2: Analiz</span></div>

      <div className="bg-white px-6 py-3 rounded-2xl shadow-xl mb-3 text-center">
        {sd && <div className="flex justify-center mb-3">{sd.render(80,'#6366f1')}</div>}
        {sd && <div className="text-sm text-gray-500 mb-2">{sd.name}</div>}
        <div className="text-lg text-gray-700 font-medium">{p?.q}</div>
      </div>

      {ua!==null?(<div className="text-center max-w-sm"><div className={`text-2xl font-bold mb-2 ${ua===p?.a?'text-green-500':'text-orange-500'}`}>{ua===p?.a?'✓ Doğru!':`${encourage()} Cevap: ${p?.a}`}</div><div className="bg-amber-50 p-3 rounded-xl text-amber-700 text-sm">{'💡'} {p?.explain}</div></div>):(<div className={`grid ${p?.options?.length<=2?'grid-cols-2':'grid-cols-2'} gap-3`}>{p?.options?.map((o,i)=>(<button key={i} onClick={()=>handle(o)} className={`px-6 py-4 ${colors?.button} text-white rounded-xl font-bold text-xl shadow-lg hover:scale-105 transition-transform`}>{o}</button>))}</div>)}
    </div>
  );
};

export default ElemanVeOzellikler;

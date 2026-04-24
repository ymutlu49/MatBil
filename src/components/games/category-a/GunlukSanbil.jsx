import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TOTAL_ROUNDS, playSound, vibrate, encourage, speakNumber, useSafeTimeout } from '../../../utils';
import { HELP_MAP } from '../../../constants/helpMap';
import Feedback from '../../ui/Feedback';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

/**
 * Günlük Sanbil - SAF ALGISAL Sanbil (Perceptual Subitizing)
 *
 * Pedagojik tasarım:
 * - Tüm seviyelerde nesne sayısı 1-5 aralığında (algısal sanbil sınırı).
 * - Zorluk artışı nesne sayısıyla değil, gösterim süresiyle ve ortam karışıklığıyla yapılır.
 * - Günlük nesneler (emoji) ile tanıdık bağlamda saymadan tanıma pratiği.
 *
 * Referanslar: Kaufman ve ark. (1949); Clements (1999); MacDonald & Wilkins (2016).
 */
const GunlukSanbil = ({ onBack, colors, onGameComplete, rahatMod, prevBest }) => {
  const safeSetTimeout = useSafeTimeout();
  const [gs,setGs]=useState('menu');
  const [lv,setLv]=useState(1);
  const [sc,setSc]=useState(0);
  const [rd,setRd]=useState(0);
  const [oc,setOc]=useState(0);
  const [ua,setUa]=useState(null);
  const [si,setSi]=useState(0);
  const [sceneOrder,setSceneOrder]=useState([]);
  const [showObj,setShowObj]=useState(true); // gösterim (true) / gizleme (false)
  const last = useRef([]);

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

  // ALGISAL SANBİL: Tüm seviyeler max 5 nesne (Kaufman ve ark., 1949: subitizing limit ≤5).
  // Zorluk = gösterim süresi.
  const cfg = {
    1: { min: 1, max: 3, showMs: 2200 }, // Kolay: uzun süre, 1-3 nesne
    2: { min: 2, max: 4, showMs: 1600 }, // Orta: 2-4 nesne
    3: { min: 2, max: 5, showMs: 1100 }, // Zor: 2-5 nesne, kısa süre
    4: { min: 1, max: 5, showMs: 700 },  // Uzman: 1-5 nesne, çok kısa süre (otomatik tanıma)
  };

  const shuffleScenes = () => {
    const order=[...Array(scenes.length).keys()];
    for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
    return order;
  };

  const getC = (cf) => {
    // Son 5 sayıyı hatırla (algısal sanbil aralığı 1-5 olduğu için max-1 kadar)
    const maxKeep = Math.max(2, cf.max - cf.min);
    let c, a = 0;
    do { c = Math.floor(Math.random()*(cf.max-cf.min+1)) + cf.min; a++; }
    while (last.current.includes(c) && a < 12);
    last.current.push(c); if (last.current.length > maxKeep) last.current.shift();
    return c;
  };

  const startR=(l)=>{
    const cf = cfg[l];
    const c = getC(cf);
    setOc(c);
    setUa(null);
    setShowObj(true);
    // Rahat modda gösterim süresi 2 katı; otherwise seviye-bazlı
    const ms = rahatMod ? cf.showMs * 2 : cf.showMs;
    safeSetTimeout(() => setShowObj(false), ms);
  };

  const prepG=(l)=>{setLv(l);setGs('ready');};

  const startG=(l)=>{
    setLv(l);setSc(0);setRd(1);
    last.current = [];
    const order=shuffleScenes();
    setSceneOrder(order);setSi(0);
    setGs('playing');startR(l);
  };

  const handle=(a)=>{
    setUa(a);
    if(a===oc){setSc(s=>s+15*lv);speakNumber(oc);}
    safeSetTimeout(()=>{
      if(rd<TOTAL_ROUNDS){setSi(s=>s+1);setRd(r=>r+1);startR(lv);}
      else setGs('results');
    },1200);
  };

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Günlük Sanbil" emoji="🏠" description="Nesneleri saymadan, bir bakışta tanı! Algısal sanbil için 1-5 nesne. Zorluk gösterim süresiyle artar." levels={['Seviye 1 (1-3 nesne, yavaş)','Seviye 2 (2-4 nesne, orta)','Seviye 3 (2-5 nesne, hızlı)','Seviye 4 (1-5 nesne, çok hızlı)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Günlük Sanbil" emoji="🏠" level={lv} instruction={`Nesneler ${Math.round(cfg[lv].showMs/100)/10} saniye gösterilecek. Saymadan, bir bakışta kaç tane olduğunu tanı!`} colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  const sceneIdx = sceneOrder.length > 0 ? sceneOrder[si % sceneOrder.length] : 0;
  const scene=scenes[sceneIdx];

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title={`Günlük • ${scene.name}`} colors={colors} hideRound={rahatMod}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 gap-3">

        {/* Nesne alanı — gösterim süresi sonra kapanır, böylece saymak mümkün olmaz */}
        <div className="w-56 h-40 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-green-200 shrink-0" key={rd}>
          {ua===null ? (
            showObj ? (
              <div className="flex gap-2 flex-wrap justify-center p-4">
                {Array.from({length:oc},(_,i)=>(
                  <span key={i} className="text-4xl anim-pop" style={{animationDelay:`${i*60}ms`}}>{scene.obj[i%scene.obj.length]}</span>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="text-3xl text-gray-200">{"?"}</div>
                <div className="text-xs text-gray-400 font-medium">Kaç taneydi?</div>
              </div>
            )
          ) : (
            <Feedback isCorrect={ua===oc} answer={oc} hint={ua===oc ? `Harika! ${oc} tane ${scene.name.toLowerCase()} nesnesi vardı.` : `${oc} tane vardı. Bir bakışta anlamaya çalış!`}/>
          )}
        </div>

        {/* Sayı butonları — sadece 1-5 (algısal sanbil sınırı) */}
        {ua===null && (
          <div className="grid grid-cols-5 gap-2.5 w-full max-w-xs mx-auto">
            {Array.from({length:5},(_,i)=>i+1).map(n=>(
              <button key={n} onClick={()=>handle(n)} disabled={showObj} className={`h-14 ${colors?.button} text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed`}>{n}</button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default GunlukSanbil;

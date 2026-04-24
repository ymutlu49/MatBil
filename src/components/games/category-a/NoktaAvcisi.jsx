import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TOTAL_ROUNDS, playSound, vibrate, encourage, speakNumber, useAdaptive, useSafeTimeout } from '../../../utils';
import { HELP_MAP } from '../../../constants/helpMap';
import Feedback from '../../ui/Feedback';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

/**
 * Nokta Avcısı - Sanbil (Subitizing)
 *
 * Pedagojik tasarım:
 * - Seviye 1-2: ALGISAL sanbil (1-5 nokta) — saymadan bir bakışta tanıma, kanonik zar deseni
 * - Seviye 3-4: KAVRAMSAL sanbil (4-10 nokta) — kanonik alt gruplara ayırarak tanıma
 *
 * Referanslar: MacDonald & Wilkins (2016); Clements (1999); Kaufman ve ark. (1949).
 * Algısal sınır: ~4-5 nesne; kavramsal sanbil için 12 sınırı (Clements & Sarama).
 */
const NoktaAvcisi = ({ onBack, colors, onGameComplete, rahatMod, prevBest }) => {
  const adaptive = useAdaptive();
  const safeSetTimeout = useSafeTimeout();
  const [gs, setGs] = useState('menu');
  const [lv, setLv] = useState(1);
  const [sc, setSc] = useState(0);
  const [rd, setRd] = useState(0);
  const [dc, setDc] = useState(0);
  const [dots, setDots] = useState([]);
  const [correctFlash, setCorrectFlash] = useState(false);
  const [ua, setUa] = useState(null);
  const last = useRef([]);
  // Algısal: L1-L2 (max 5) | Kavramsal: L3-L4 (max 10, kanonik gruplu)
  const cfg = { 1: { min: 1, max: 3 }, 2: { min: 2, max: 5 }, 3: { min: 4, max: 7 }, 4: { min: 6, max: 10 } };
  const dCols = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  // Seviye türü: 1-2 algısal, 3-4 kavramsal
  const isPerceptualLevel = (l) => l <= 2;

  // Kanonik dizilimler (zar deseni, % pozisyon) — algısal sanbil için
  const canonical = {
    1: [[50,50]],
    2: [[30,30],[70,70]],
    3: [[30,25],[70,25],[50,70]],
    4: [[30,30],[70,30],[30,70],[70,70]],
    5: [[30,25],[70,25],[50,50],[30,75],[70,75]],
  };

  // 4-10 icin gruplu dizilimler: kanonik alt-gruplar (kavramsal sanbil)
  const groupLayouts = {
    4: [
      {groups:[[2,2]], pos:[[[25,35],[25,65]], [[75,35],[75,65]]]},
    ],
    5: [
      {groups:[[3,2]], pos:[[[22,25],[22,50],[22,75]], [[78,35],[78,65]]]},
      {groups:[[2,3]], pos:[[[22,35],[22,65]], [[78,25],[78,50],[78,75]]]},
    ],
    6: [
      {groups:[[3,3]], pos:[[[20,25],[20,50],[20,75]], [[75,25],[75,50],[75,75]]]},
      {groups:[[3,3]], pos:[[[25,25],[50,25],[75,25]], [[25,70],[50,70],[75,70]]]},
      {groups:[[2,2,2]], pos:[[[18,30],[18,70]], [[50,30],[50,70]], [[82,30],[82,70]]]},
    ],
    7: [
      {groups:[[4,3]], pos:[[[20,20],[20,45],[20,70],[20,90]], [[75,25],[75,50],[75,75]]]},
      {groups:[[3,4]], pos:[[[25,25],[50,25],[75,25]], [[18,70],[38,70],[58,70],[78,70]]]},
      {groups:[[3,2,2]], pos:[[[18,25],[18,50],[18,75]], [[55,30],[55,65]], [[85,30],[85,65]]]},
    ],
    8: [
      {groups:[[4,4]], pos:[[[22,20],[22,42],[22,64],[22,86]], [[78,20],[78,42],[78,64],[78,86]]]},
      {groups:[[3,3,2]], pos:[[[18,25],[18,50],[18,75]], [[50,25],[50,50],[50,75]], [[82,35],[82,65]]]},
      {groups:[[5,3]], pos:[[[20,15],[20,33],[20,51],[20,69],[20,87]], [[75,25],[75,50],[75,75]]]},
    ],
    9: [
      {groups:[[5,4]], pos:[[[20,15],[20,35],[20,55],[20,75],[20,92]], [[78,22],[78,42],[78,62],[78,82]]]},
      {groups:[[3,3,3]], pos:[[[18,25],[18,50],[18,75]], [[50,25],[50,50],[50,75]], [[82,25],[82,50],[82,75]]]},
      {groups:[[4,3,2]], pos:[[[15,20],[15,42],[15,64],[15,86]], [[50,25],[50,50],[50,75]], [[85,35],[85,65]]]},
    ],
    10: [
      // Onluk çerçeve (5x2 kanonik, Clements & Sarama)
      {groups:[[5,5]], pos:[[[16,25],[36,25],[56,25],[76,25],[92,25]], [[16,70],[36,70],[56,70],[76,70],[92,70]]]},
      {groups:[[5,5]], pos:[[[20,15],[20,33],[20,51],[20,69],[20,87]], [[80,15],[80,33],[80,51],[80,69],[80,87]]]},
      {groups:[[4,3,3]], pos:[[[15,18],[15,38],[15,58],[15,78]], [[50,25],[50,50],[50,75]], [[85,25],[85,50],[85,75]]]},
    ],
  };

  const genDots = (count, level) => {
    const col1 = dCols[Math.floor(Math.random()*dCols.length)];

    // L1-L2 (ALGISAL): her zaman kanonik zar deseni, max 5 nokta
    if(isPerceptualLevel(level)) {
      const pattern = canonical[Math.min(count, 5)];
      return { type:'canonical', groups:[{
        dots: pattern.map(([x,y]) => ({
          x: x + (Math.random()*6-3),
          y: y + (Math.random()*6-3),
          c: col1
        }))
      }]};
    }

    // L3-L4 (KAVRAMSAL): her zaman kanonik gruplu dizilim
    const layouts = groupLayouts[count];
    const layout = layouts[Math.floor(Math.random()*layouts.length)];
    const groupColors = [col1];
    let ci=0;
    while(groupColors.length < layout.pos.length){
      ci++;
      const nc = dCols[(dCols.indexOf(col1)+ci) % dCols.length];
      if(nc!==col1) groupColors.push(nc);
      else groupColors.push(dCols[(ci+2)%dCols.length]);
    }

    const groups = layout.pos.map((grpPos, gi) => ({
      dots: grpPos.map(([x,y]) => ({
        x: x + (Math.random()*4-2),
        y: y + (Math.random()*4-2),
        c: groupColors[gi % groupColors.length]
      }))
    }));

    return { type:'grouped', groups };
  };

  const getC = (cf) => {
    // Son N sayıyı hatırla — N = aralık genişliği - 1 (en az 3, en çok 6)
    const range = cf.max - cf.min + 1;
    const keep = Math.min(6, Math.max(3, range - 1));
    let c, a = 0;
    do { c = Math.floor(Math.random()*range) + cf.min; a++; }
    while (last.current.includes(c) && a < 12);
    last.current.push(c); if (last.current.length > keep) last.current.shift();
    return c;
  };

  const startR = useCallback((l,r) => {
    const cf=cfg[l]; const c=getC(cf);
    setDc(c); setDots(genDots(c, l)); setCorrectFlash(false); setUa(null); setRd(r);
  },[]);

  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG = (l) => { setLv(l); setSc(0); last.current=[]; adaptive.reset(); setGs('playing'); startR(l,1); };

  const handle = (a) => {
    setUa(a); adaptive.record(a===dc);
    if(a===dc){
      setSc(s=>s+10*lv); speakNumber(dc);
      setCorrectFlash(true);
      safeSetTimeout(()=>setCorrectFlash(false), 800);
    }
    safeSetTimeout(()=>{if(rd<TOTAL_ROUNDS)startR(lv,rd+1);else setGs('results');},1200);
  };

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Nokta Avcısı" emoji="" description="Noktaları saymadan, bakarak kaç tane olduğunu bul! L1-L2 algısal (1-5), L3-L4 kavramsal (kanonik gruplar)." levels={['⭐ Algısal (1-3)','⭐⭐ Algısal (2-5)','⭐⭐⭐ Kavramsal (4-7)','⭐⭐⭐⭐ Kavramsal (6-10)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Nokta Avcısı" emoji="" level={lv} instruction={isPerceptualLevel(lv) ? 'Noktalar kanonik (zar) deseninde gösterilecek. Saymadan, bir bakışta tanı!' : 'Noktalar kanonik alt gruplara bölünmüş olarak gösterilecek. Grupları hızlıca say ve topla (örn. 5+3=8).'} colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  // Compute a flat index for staggered animation delays
  let dotIndex = 0;

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Nokta Avcısı" colors={colors} hideRound={rahatMod}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 gap-3">

        {/* Nokta alanı — her zaman görünür */}
        <div className={`w-56 h-56 bg-white rounded-3xl shadow-xl relative border-4 ${colors?.border} ${correctFlash ? 'anim-correct-pulse' : ''} shrink-0`} key={rd}>
          {ua === null && dots?.groups?.map((grp,gi)=>(
            grp.dots.map((d,di)=>{
              const idx = dotIndex++;
              return (
                <div
                  key={`${gi}-${di}`}
                  className="absolute w-10 h-10 rounded-full shadow-lg anim-dot-in"
                  style={{
                    left:`${d.x}%`,
                    top:`${d.y}%`,
                    backgroundColor:d.c,
                    animationDelay: `${idx * 50}ms`,
                  }}
                />
              );
            })
          ))}
          {ua!==null && <Feedback isCorrect={ua===dc} answer={dc} hint={ua===dc ? `Harika! ${dc} tane vardı.` : `${dc} tane vardı. ${dots?.type==='grouped' ? 'Renkli grupları toplayarak düşün!' : 'Zar desenini bir bakışta tanı!'}`}/>}
        </div>

        {/* Sayı butonları — noktalarla aynı anda görünür */}
        {ua===null && (
          <div className="grid grid-cols-5 gap-2.5 w-full max-w-xs mx-auto">
            {Array.from({length:10},(_,i)=>i+1).map(n=>(
              <button key={n} onClick={()=>handle(n)} className={`h-14 ${colors?.button} text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl active:scale-95 transition-all`}>{n}</button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default NoktaAvcisi;

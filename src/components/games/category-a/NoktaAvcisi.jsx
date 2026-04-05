import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TOTAL_ROUNDS, playSound, vibrate, encourage, speakNumber } from '../../../utils';
import { HELP_MAP } from '../../../constants/helpMap';
import Feedback from '../../ui/Feedback';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const useAdaptive = () => ({ record: () => {}, reset: () => {}, diff: 1 });

const NoktaAvcisi = ({ onBack, colors, onGameComplete, rahatMod }) => {
  const adaptive = useAdaptive();
  const [gs, setGs] = useState('menu');
  const [lv, setLv] = useState(1);
  const [sc, setSc] = useState(0);
  const [rd, setRd] = useState(0);
  const [dc, setDc] = useState(0);
  const [dots, setDots] = useState([]);
  const [show, setShow] = useState(false);
  const [ua, setUa] = useState(null);
  const last = useRef([]);
  const cfg = { 1: { min: 1, max: 4, t: 2000 }, 2: { min: 2, max: 5, t: 1500 }, 3: { min: 3, max: 7, t: 1200 }, 4: { min: 4, max: 9, t: 1000 } };
  const dCols = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  // Kanonik dizilimler (zar deseni, % pozisyon)
  const canonical = {
    1: [[50,50]],
    2: [[30,30],[70,70]],
    3: [[30,25],[70,25],[50,70]],
    4: [[30,30],[70,30],[30,70],[70,70]],
    5: [[30,25],[70,25],[50,50],[30,75],[70,75]],
  };

  // 6-9 icin gruplu dizilimler: 2 veya 3 alt grup
  const groupLayouts = {
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
      {groups:[[5,3]], pos:[[[20,18],[20,40],[20,62],[20,84],[20,96]].slice(0,5), [[75,25],[75,50],[75,75]]]},
    ],
    9: [
      {groups:[[5,4]], pos:[[[20,15],[20,35],[20,55],[20,75],[20,92]], [[78,22],[78,42],[78,62],[78,82]]]},
      {groups:[[3,3,3]], pos:[[[18,25],[18,50],[18,75]], [[50,25],[50,50],[50,75]], [[82,25],[82,50],[82,75]]]},
      {groups:[[4,3,2]], pos:[[[15,20],[15,42],[15,64],[15,86]], [[50,25],[50,50],[50,75]], [[85,35],[85,65]]]},
    ],
  };

  const genDots = (count) => {
    const col1 = dCols[Math.floor(Math.random()*dCols.length)];
    // Kanonik vs Non-kanonik rastgele secim (MacDonald-Wilkins modeli)
    const useRandom = Math.random() < 0.4; // %40 non-kanonik desen

    if(count <= 5) {
      if(useRandom) {
        // Non-kanonik: rastgele pozisyonlar (kavramsal sanbili zorlayan desen)
        const usedPos = [];
        const rndDots = Array.from({length:count}, () => {
          let x,y,ok;
          do { x=15+Math.random()*70; y=15+Math.random()*70; ok=usedPos.every(p=>Math.hypot(p[0]-x,p[1]-y)>18); } while(!ok && usedPos.length>0);
          usedPos.push([x,y]);
          return { x, y, c: col1 };
        });
        return { type:'random', groups:[{ dots: rndDots }]};
      }
      // Kanonik dizilim + kucuk rastgele sapma
      const pattern = canonical[count];
      return { type:'canonical', groups:[{
        dots: pattern.map(([x,y]) => ({
          x: x + (Math.random()*6-3),
          y: y + (Math.random()*6-3),
          c: col1
        }))
      }]};
    }

    // 6-9: Gruplu dizilim sec
    const layouts = groupLayouts[count];
    const layout = layouts[Math.floor(Math.random()*layouts.length)];
    const groupColors = [col1];
    // Her gruba farkli renk
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

  const getC = (cf) => { let c,a=0; do{c=Math.floor(Math.random()*(cf.max-cf.min+1))+cf.min;a++;}while(last.current.includes(c)&&a<10); last.current.push(c); if(last.current.length>3)last.current.shift(); return c; };
  const startR = useCallback((l,r) => { const cf=cfg[l]; const c=getC(cf); setDc(c); setDots(genDots(c)); setShow(true); setUa(null); setRd(r); setTimeout(()=>setShow(false), Math.round((rahatMod ? cf.t * 1.5 : cf.t) / adaptive.diff)); },[rahatMod]);
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG = (l) => { setLv(l); setSc(0); last.current=[]; adaptive.reset(); setGs('playing'); startR(l,1); };
  const handle = (a) => { setUa(a); adaptive.record(a===dc); if(a===dc){setSc(s=>s+10*lv);speakNumber(dc);} setTimeout(()=>{if(rd<TOTAL_ROUNDS)startR(lv,rd+1);else setGs('results');},1200); };
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Nokta Avc\u0131s\u0131" emoji="\uD83C\uDFAF" description="Noktalar k\u0131sa s\u00FCre g\u00F6sterilecek. Saymadan, bakarak ka\u00E7 tane oldu\u011Funu bul!" levels={['\u2B50 Seviye 1 (1-4, 2sn)','\u2B50\u2B50 Seviye 2 (2-5, 1.5sn)','\u2B50\u2B50\u2B50 Seviye 3 (3-7, 1.2sn)','\u2B50\u2B50\u2B50\u2B50 Seviye 4 (4-9, 1sn)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Nokta Avc\u0131s\u0131" emoji="\uD83C\uDFAF" level={lv} instruction="Ekranda noktalar k\u0131sa s\u00FCreli\u011Fine g\u00F6r\u00FCn\u00FCp kaybolacak. Ka\u00E7 nokta oldu\u011Funu saymadan, bir bak\u0131\u015Fta bulmaya \u00E7al\u0131\u015F!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Nokta Avc\u0131s\u0131" colors={colors} hideRound={rahatMod}/>
      <div className={`w-56 h-56 bg-white rounded-3xl shadow-xl relative mb-3 border-4 ${colors?.border}`}>
        {show && dots?.groups?.map((grp,gi)=>(
          grp.dots.map((d,di)=>(
            <div key={`${gi}-${di}`} className="absolute w-9 h-9 rounded-full shadow-lg" style={{left:`${d.x}%`,top:`${d.y}%`,backgroundColor:d.c,transform:'translate(-50%,-50%)'}}/>
          ))
        ))}
        {!show && ua===null && <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-4xl mb-1">{'\uD83E\uDD14'}</span><span className={`text-lg font-bold ${colors?.text}`}>Ka\u00E7 taneydi?</span></div>}
        {ua!==null && <Feedback isCorrect={ua===dc} answer={dc} hint={ua===dc ? `Harika! ${dc} tane vard\u0131.` : `${dc} tane vard\u0131. ${dots?.type==='random' ? 'Rastgele dizilimde grupla d\u00FC\u015F\u00FCn: ka\u00E7l\u0131 gruplar g\u00F6r\u00FCyorsun?' : 'Bildi\u011Fin desenleri ara: zar, domino gibi!'}`}/>}
      </div>
      {!show && ua===null && <div className="grid grid-cols-5 gap-2">{Array.from({length:9},(_,i)=>i+1).map(n=>(<button key={n} onClick={()=>handle(n)} className={`w-14 h-14 ${colors?.button} text-white rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition-transform`}>{n}</button>))}</div>}
    </div>
  );
};

export default NoktaAvcisi;

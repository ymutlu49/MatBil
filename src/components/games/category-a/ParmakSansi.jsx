import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TOTAL_ROUNDS, playSound, vibrate, encourage, speakNumber } from '../../../utils';
import { HELP_MAP } from '../../../constants/helpMap';
import Feedback from '../../ui/Feedback';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const ParmakSansi = ({ onBack, colors, onGameComplete, rahatMod }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [fc,setFc]=useState(0);const [ua,setUa]=useState(null);
  const cfg={1:{max:5},2:{max:7},3:{max:10},4:{max:10}};

  const Hand=({fingers,mirror=false})=>{
    // Parmak aciklik durumu: mirror=sag el, normal=sol el
    // Sol el: basparmak=0, isaret=1, orta=2, yuzuk=3, serce=4
    const isOpen=(i)=> mirror ? i < fingers : (4-i) < fingers;

    // Parmak SVG path verileri: [x, kapaliY, acikY, genislik, egrilik]
    const fingerData = [
      { x: 18, openH: 55, closedH: 22, w: 22, curve: -12, nail: true },  // basparmak
      { x: 38, openH: 75, closedH: 22, w: 19, curve: 0, nail: true },    // isaret
      { x: 58, openH: 82, closedH: 22, w: 18, curve: 0, nail: true },    // orta
      { x: 77, openH: 72, closedH: 22, w: 17, curve: 0, nail: true },    // yuzuk
      { x: 94, openH: 58, closedH: 22, w: 16, curve: 8, nail: true },    // serce
    ];

    return (
      <svg width="140" height="200" viewBox="0 0 130 185" style={{transform: mirror ? 'scaleX(-1)' : 'none'}}>
        {/* Avuc ici */}
        <rect x="22" y="110" width="86" height="65" rx="22" ry="22" fill="#FBBF24" stroke="#D97706" strokeWidth="2"/>
        {/* Bilek */}
        <rect x="38" y="160" width="52" height="24" rx="8" fill="#FBBF24" stroke="#D97706" strokeWidth="2"/>
        {/* Parmaklar */}
        {fingerData.map((f, i) => {
          const open = isOpen(i);
          const h = open ? f.openH : f.closedH;
          const y = 115 - h;
          const cx = f.x + f.w / 2;
          return (
            <g key={i}>
              <rect
                x={f.x} y={y} width={f.w} height={h}
                rx={f.w/2} ry={f.w/2}
                fill={open ? '#FBBF24' : '#F59E0B'}
                stroke="#D97706" strokeWidth="2"
                opacity={open ? 1 : 0.4}
                transform={i===0 ? `rotate(${f.curve}, ${cx}, 115)` : (i===4 ? `rotate(${f.curve}, ${cx}, 115)` : '')}
              />
              {/* Tirnak */}
              {open && (
                <rect
                  x={f.x + f.w*0.2} y={y + 4} width={f.w*0.6} height={f.w*0.55}
                  rx={4} ry={4}
                  fill="#FDE68A" stroke="#F59E0B" strokeWidth="1"
                  transform={i===0 ? `rotate(${f.curve}, ${cx}, 115)` : (i===4 ? `rotate(${f.curve}, ${cx}, 115)` : '')}
                />
              )}
              {/* Eklem cizgileri */}
              {open && h > 40 && (
                <line
                  x1={f.x+3} y1={y + h*0.45} x2={f.x+f.w-3} y2={y + h*0.45}
                  stroke="#D97706" strokeWidth="1" opacity="0.3"
                  transform={i===0 ? `rotate(${f.curve}, ${cx}, 115)` : (i===4 ? `rotate(${f.curve}, ${cx}, 115)` : '')}
                />
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setFc(Math.floor(Math.random()*cfg[l].max)+1);setUa(null);setGs('playing');};
  const handle=(a)=>{setUa(a);if(a===fc)setSc(s=>s+10*lv);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setFc(Math.floor(Math.random()*cfg[lv].max)+1);setUa(null);}else setGs('results');},1200);};
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Ka\u00E7 Parmak?" emoji="\uD83D\uDD90\uFE0F" description="Parmak say\u0131s\u0131n\u0131 h\u0131zlica say! Ellerdeki a\u00E7\u0131k parmaklar\u0131 saymadan tan\u0131maya \u00E7al\u0131\u015F." levels={['Seviye 1 (1-5)','Seviye 2 (1-7)','Seviye 3 (1-10)','Seviye 4 (1-10 H\u0131zl\u0131)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Ka\u00E7 Parmak?" emoji="\uD83D\uDD90\uFE0F" level={lv} instruction="Ekranda bir veya iki el g\u00F6sterilecek. A\u00E7\u0131k parmaklar\u0131n say\u0131s\u0131n\u0131 tek bak\u0131\u015Fta tan\u0131 ve do\u011Fru say\u0131y\u0131 se\u00E7!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Ka\u00E7 Parmak?" colors={colors} hideRound={rahatMod}/>
      <div className="bg-white p-4 rounded-2xl shadow-xl mb-3 flex gap-2 items-end justify-center min-h-[180px]">
        <Hand fingers={Math.min(fc,5)}/>
        {fc>5&&<Hand fingers={fc-5} mirror/>}
      </div>
      {ua!==null?(<Feedback isCorrect={ua===fc} answer={fc} hint={ua===fc ? `S\u00FCper! ${fc} parmak vard\u0131.` : `${fc} parmak a\u00E7\u0131kt\u0131. Elde 5, iki elde 10 parmak oldu\u011Funu hat\u0131rla!`}/>):(<div className="grid grid-cols-5 gap-2">{Array.from({length:cfg[lv].max},(_,i)=>i+1).map(n=>(<button key={n} onClick={()=>handle(n)} className={`w-14 h-14 ${colors?.button} text-white rounded-xl font-bold text-2xl shadow-lg hover:scale-105 transition-transform`}>{n}</button>))}</div>)}
    </div>
  );
};

export default ParmakSansi;

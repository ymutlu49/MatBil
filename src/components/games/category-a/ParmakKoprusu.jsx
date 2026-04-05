import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TOTAL_ROUNDS, playSound, vibrate, encourage, speakNumber } from '../../../utils';
import { HELP_MAP } from '../../../constants/helpMap';
import Feedback from '../../ui/Feedback';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const ParmakKoprusu = ({ onBack, colors, onGameComplete, rahatMod, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);
  const [target,setTarget]=useState(0);const [fingerCount,setFingerCount]=useState(0);const [ua,setUa]=useState(null);const [showTarget,setShowTarget]=useState(true);
  const cfg={1:{min:1,max:5},2:{min:2,max:7},3:{min:3,max:9},4:{min:1,max:10}};
  const touchRef=useRef(null);

  const gen=(l)=>{const c=cfg[l];return Math.floor(Math.random()*(c.max-c.min+1))+c.min;};
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setTarget(gen(l));setUa(null);setFingerCount(0);setShowTarget(true);setGs('playing');};

  const handleTouch=(e)=>{
    e.preventDefault();
    if(ua!==null) return;
    const count=e.touches.length;
    setFingerCount(count);
  };

  const handleTouchEnd=(e)=>{
    e.preventDefault();
    if(ua!==null||fingerCount===0) return;
    const correct=fingerCount===target;
    setUa(fingerCount);
    if(correct){setSc(s=>s+15*lv);speakNumber(target);playSound('correct');}
    else playSound('wrong');
    setTimeout(()=>{
      if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setTarget(gen(lv));setUa(null);setFingerCount(0);}
      else setGs('results');
    },1500);
  };

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Parmak Köprüsü" emoji="" description="Ekrana doğru sayıda parmakla aynı anda dokun! Parmakların sayılarla bağlantısını güçlendir." levels={['Sv1 (1-5)','Sv2 (2-7)','Sv3 (3-9)','Sv4 (1-10)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Parmak Köprüsü" emoji="" level={lv} instruction="Bir sayı gösterilecek. Ekrana o kadar parmağınla aynı anda dokun! Parmaklarını kaldırdığında cevabın kontrol edilir." colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Parmak Köprüsü" colors={colors}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
      <div className="bg-white rounded-2xl shadow-xl p-4 mb-3 text-center">
        <div className="text-xs text-gray-400 mb-1">Bu sayı kadar parmakla dokun:</div>
        <div className="text-6xl font-bold text-indigo-600">{target}</div>
      </div>
      <div ref={touchRef}
        onTouchStart={handleTouch} onTouchMove={handleTouch} onTouchEnd={handleTouchEnd}
        className={`w-full flex-1 max-h-[280px] rounded-3xl border-4 border-dashed flex items-center justify-center transition-all ${
          ua!==null ? (ua===target ? 'border-green-400 bg-green-50' : 'border-orange-400 bg-orange-50') :
          fingerCount>0 ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-gray-50'
        }`}>
        {ua!==null ? (
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${ua===target?'text-green-500':'text-orange-500'}`}>
              {ua===target?'✓ Doğru!':encourage()}
            </div>
            <div className="text-gray-600">Sen {ua} parmak bastın, doğru cevap: {target}</div>
          </div>
        ) : fingerCount>0 ? (
          <div className="text-center">
            <div className="text-5xl font-bold text-indigo-600 mb-2">{fingerCount}</div>
            <div className="text-sm text-indigo-400">parmak algılandı — kaldırarak onayla</div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">{''}</div>
            <div className="text-sm">Buraya {target} parmakla dokun</div>
          </div>
        )}
      </div>
      <div className="text-xs text-gray-400 mt-2 text-center">Tablet/telefonda çalışır. Masaüstünde tıklama = 1 parmak</div>

      </div>    </div>
  );
};

export default ParmakKoprusu;

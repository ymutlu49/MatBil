import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TOTAL_ROUNDS, playSound, vibrate, encourage, speakNumber } from '../../../utils';
import { HELP_MAP } from '../../../constants/helpMap';
import Feedback from '../../ui/Feedback';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const ReferansNoktasi = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);
  const cfg={1:{refs:[0,5,10]},2:{refs:[0,10,20]},3:{refs:[0,25,50]},4:{refs:[0,50,100]}};
  const gen=(l)=>{const c=cfg[l];const ri=Math.floor(Math.random()*(c.refs.length-1));const r1=c.refs[ri],r2=c.refs[ri+1];let n;do{n=Math.floor(Math.random()*(r2-r1-1))+r1+1;}while(Math.abs(n-r1)===Math.abs(n-r2));const a=Math.abs(n-r1)<Math.abs(n-r2)?r1:r2;return{number:n,ref1:r1,ref2:r2,answer:a};};
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(gen(l));setUa(null);setGs('playing');};
  const handle=(a)=>{setUa(a);if(a===p?.answer)setSc(s=>s+15*lv);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}else setGs('results');},1500);};
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Yakınlık Tahmini" emoji="" description="Sayı hangi referans noktasına daha yakın? Mesafe tahmini yap!" levels={['Seviye 1 (0-5-10)','Seviye 2 (0-10-20)','Seviye 3 (0-25-50)','Seviye 4 (0-50-100)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Yakınlık Tahmini" emoji="" level={lv} instruction="Bir sayı gösterilecek. Bu sayı, verilen iki referans noktasından hangisine daha yakın? Doğru olanı seç!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  const fullMin=cfg[lv].refs[0], fullMax=cfg[lv].refs[cfg[lv].refs.length-1];
  const ballPct=p?((p?.number-fullMin)/(fullMax-fullMin))*100:50;
  const ref1Pct=p?((p?.ref1-fullMin)/(fullMax-fullMin))*100:0;
  const ref2Pct=p?((p?.ref2-fullMin)/(fullMax-fullMin))*100:100;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Yakınlık Tahmini" colors={colors}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
      <p className={`${colors?.text} mb-2 font-bold text-lg`}>Bu sayı hangisine daha yakın?</p>
      <div className="bg-white px-10 py-4 rounded-2xl shadow-xl mb-3 border-4 border-amber-300"><span className="text-4xl font-bold text-amber-600">{p?.number}</span></div>
      <div className="w-full max-w-2xl mb-4 px-8">
        <div className="relative" style={{height:50}}>
          {/* Ana çizgi */}
          <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-700 rounded-full" style={{transform:'translateY(-50%)'}}/>
          {/* Oklar */}
          <div className="absolute top-1/2 -translate-y-1/2 w-0 h-0" style={{left:-2, borderTop:'6px solid transparent',borderBottom:'6px solid transparent',borderRight:'8px solid #374151'}}/>
          <div className="absolute top-1/2 -translate-y-1/2 w-0 h-0" style={{right:-2, borderTop:'6px solid transparent',borderBottom:'6px solid transparent',borderLeft:'8px solid #374151'}}/>
          {/* Tüm referans tick'leri ve etiketleri */}
          {cfg[lv].refs.map((r,i)=>{
            const rp=((r-fullMin)/(fullMax-fullMin))*100;
            return (
              <div key={i} className="absolute -translate-x-1/2" style={{left:`${rp}%`, top: '50%', transform: `translateX(-50%) translateY(-50%)`}}>
                <div className="w-0.5 h-6 bg-gray-700 rounded-full mx-auto"/>
                <div className="text-center mt-1">
                  <span className="bg-amber-50 px-2 py-0.5 rounded text-sm font-bold text-gray-600 border border-amber-200">{r}</span>
                </div>
              </div>
            );
          })}
          {/* Sayı topu */}
          <div className="absolute top-1/2 w-9 h-9 bg-amber-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center" style={{left:`${ballPct}%`,transform:'translate(-50%,-50%)',zIndex:2}}>
            <span className="text-white text-sm font-bold">{p?.number}</span>
          </div>
        </div>
        <div style={{height:32}}/>
      </div>
      {ua!==null?(<div className="text-center anim-fade"><Feedback isCorrect={ua===p?.answer} answer={p?.answer} hint={`${p?.number}: ${p?.ref1}'e ${Math.abs(p?.number-p?.ref1)} uzaklıkta, ${p?.ref2}'ye ${Math.abs(p?.number-p?.ref2)} uzaklıkta → ${p?.answer}`}/></div>):(<div className="flex gap-4"><button onClick={()=>handle(p?.ref1)} className={`px-8 py-4 ${colors?.button} text-white rounded-2xl font-bold text-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all`}>{p?.ref1}</button><button onClick={()=>handle(p?.ref2)} className={`px-8 py-4 ${colors?.button} text-white rounded-2xl font-bold text-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all`}>{p?.ref2}</button></div>)}

      </div>    </div>
  );
};

export default ReferansNoktasi;

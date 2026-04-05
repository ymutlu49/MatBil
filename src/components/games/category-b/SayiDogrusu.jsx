import React, { useState, useEffect, useCallback, useRef } from 'react';
import { shuffle, TOTAL_ROUNDS, playSound, vibrate, encourage, speakNumber } from '../../../utils';
import { HELP_MAP } from '../../../constants/helpMap';
import Feedback from '../../ui/Feedback';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const useAdaptive = () => ({ record: () => {}, reset: () => {}, diff: 1 });

const SayiDogrusu = ({ onBack, colors, onGameComplete, prevBest }) => {
  const adaptive = useAdaptive();
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [target,setTarget]=useState(0);const [opts,setOpts]=useState([]);const [ua,setUa]=useState(null);
  const cfg={1:{max:10,tol:1,step:1},2:{max:100,tol:10,step:1},3:{max:1000,tol:50,step:50}};
  const genR=(l)=>{const c=cfg[l];let t;
    if(l===3){const steps=[50,100,150,200,250,300,350,400,450,500,550,600,650,700,750,800,850,900,950];t=steps[Math.floor(Math.random()*steps.length)];}
    else{t=Math.floor(Math.random()*(c.max-2))+2;}
    setTarget(t);const o=[t];let at=0,sp=l===3?100:3;
    while(o.length<4&&at<60){const delta=l===3?(Math.floor(Math.random()*4)+1)*50*(Math.random()>0.5?1:-1):(Math.floor(Math.random()*sp)+1)*(Math.random()>0.5?1:-1);const v=Math.max(l===3?50:1,Math.min(c.max,t+delta));if(!o.includes(v))o.push(v);at++;if(at>30)sp++;}
    while(o.length<4)o.push(o.length*c.step+t);setOpts(shuffle(o));setUa(null);};
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);genR(l);setGs('playing');};
  const getFeedback=(ans,tgt,tol)=>{if(ans===tgt)return{cls:'text-green-500',msg:'✓ Doğru!'};const diff=Math.abs(ans-tgt);if(diff<=tol)return{cls:'text-amber-500',msg:` Çok yaklaştın! Yanıt: ${tgt}`};return{cls:'text-orange-500',msg:`${encourage()} Yanıt: ${tgt}`};};
  const handle=(a)=>{setUa(a);adaptive.record(a===target);const fb=getFeedback(a,target,cfg[lv].tol);const isClose=a===target||Math.abs(a-target)<=cfg[lv].tol;if(a===target)setSc(s=>s+20*lv);else if(isClose)setSc(s=>s+10*lv);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);genR(lv);}else setGs('results');},1500);};
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Sayı Doğrusu" emoji="" description="Ok hangi sayıyı gösteriyor? Sayı doğrusundaki konumu tahmin et!" levels={['Seviye 1 (0-10)','Seviye 2 (0-100)','Seviye 3 (0-1000)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Sayı Doğrusu" emoji="" level={lv} instruction="Sayı doğrusu üzerinde bir ok gösterilecek. Okun gösterdiği sayıyı seçenekler arasından bul!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={3} onNextLevel={startG} prevBest={prevBest}/>;
  const mx=cfg[lv].max;const pct=(target/mx)*100;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Sayı Doğrusu" colors={colors}/>
      <p className={`${colors?.text} mb-3 text-center font-bold text-lg`}>Ok hangi sayıyı gösteriyor?</p>
      <div className="w-full max-w-sm mb-3 px-3">
        <div className="relative h-8 mb-1"><div className="absolute flex flex-col items-center" style={{left:`${pct}%`,transform:'translateX(-50%)'}}><div className="text-2xl">{'⬇️'}</div></div></div>
        <div className="relative">
          <div className="h-2 bg-amber-400 border border-amber-600" style={{borderRadius:0}}/>
          <div className="absolute top-0 w-1 h-4 bg-red-600" style={{left:`${pct}%`,transform:'translate(-50%,-25%)'}}/>
          <div className="absolute bg-amber-700 h-5 w-0.5" style={{left:'0%',top:-2,transform:'translateX(-50%)'}}/>
          <div className="absolute bg-amber-700 h-5 w-0.5" style={{left:'100%',top:-2,transform:'translateX(-50%)'}}/>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-600 mt-2"><span>0</span><span>{mx}</span></div>
      </div>
      {ua!==null?(()=>{const fb=getFeedback(ua,target,cfg[lv].tol);return(<div className="text-center"><div className={`text-2xl font-bold mb-1 ${fb.cls}`}>{fb.msg}</div><div className="bg-amber-50 px-3 py-2 rounded-xl text-sm text-amber-700 mt-1">{'💡'} Ok, 0‑{mx} arasında <strong>{target}</strong> sayısını gösteriyor.</div></div>);})():(<div className="grid grid-cols-2 gap-3 w-full max-w-sm">{opts.map((o,i)=>(<button key={i} onClick={()=>handle(o)} className={`py-4 ${colors?.button} text-white rounded-2xl font-bold text-2xl shadow-lg active:scale-95 transition-transform`}>{o}</button>))}</div>)}
    </div>
  );
};

export default SayiDogrusu;

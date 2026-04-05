import React, { useState } from 'react';
import { shuffle, TOTAL_ROUNDS, encourage } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const ParcaButun = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);
  const cfg={1:{max:5},2:{max:10},3:{max:10},4:{max:15}};

  const gen=(l)=>{
    const mx=cfg[l].max;
    const whole=Math.floor(Math.random()*(mx-2))+3;
    const part1=Math.floor(Math.random()*(whole-1))+1;
    const part2=whole-part1;
    const mt=Math.random()<0.33?'whole':(Math.random()<0.5?'part1':'part2');
    const answer=mt==='whole'?whole:mt==='part1'?part1:part2;
    const o=[answer];let at=0;while(o.length<4&&at<40){const c=Math.max(0,answer+Math.floor(Math.random()*6)-3);if(!o.includes(c)&&c>=0)o.push(c);at++;}while(o.length<4)o.push(o.length+answer);
    return{whole,part1,part2,missingType:mt,answer,options:shuffle(o)};
  };
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(gen(l));setUa(null);setGs('playing');};
  const handle=(a)=>{setUa(a);if(a===p?.answer)setSc(s=>s+15*lv);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}else setGs('results');},1500);};

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Parça-Bütün" emoji="" description="Üçgenin köşelerindeki sayılar arasındaki ilişkiyi keşfet! Parçaların toplamı bütünü verir." levels={['Seviye 1 (1-5)','Seviye 2 (1-10)','Seviye 3 (1-10 İleri)','Seviye 4 (1-15)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Parça-Bütün" emoji="" level={lv} instruction="Üçgenin tepesinde bütün, alt köşelerinde parçalar var. İki parçanın toplamı bütüne eşittir. Eksik sayıyı bul!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  const isMissing=(t)=>p?.missingType===t;
  const isCorrect = ua!==null && ua===p?.answer;

  const nodeVal=(val,type)=>{
    const missing = isMissing(type);
    if(missing && ua===null) return <span className="text-2xl font-bold text-purple-400 animate-pulse">?</span>;
    if(missing && ua!==null) return <span className={`text-2xl font-bold ${isCorrect?'text-green-600':'text-orange-500'}`}>{val}</span>;
    return <span className="text-2xl font-bold text-gray-800">{val}</span>;
  };

  const lineColor = isCorrect ? '#22C55E' : '#C4B5FD';

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center justify-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Parça-Bütün" colors={colors}/>

      <div className="bg-white rounded-2xl shadow-xl p-5 mb-2 w-full max-w-sm">
        <div className="relative" style={{height:220}}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 220">
            <line x1="140" y1="44" x2="46" y2="172" stroke={lineColor} strokeWidth="3" strokeDasharray="6,4" strokeDashoffset="0" className="anim-dash-flow"/>
            <line x1="140" y1="44" x2="234" y2="172" stroke={lineColor} strokeWidth="3" strokeDasharray="6,4" strokeDashoffset="0" className="anim-dash-flow"/>
          </svg>

          {/* Top node - BÜTÜN */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 flex flex-col items-center anim-number-pop" style={{animationDelay:'0ms'}}>
            <div className={`w-18 h-18 rounded-full flex items-center justify-center shadow-lg border-3 transition-all duration-300 ${isMissing('whole')?'bg-gradient-to-r from-purple-200 to-indigo-200 border-purple-400 ring-2 ring-purple-300 animate-pulse':'bg-indigo-100 border-indigo-400'} ${isCorrect?'anim-bounce-in':''}`}>
              {nodeVal(p?.whole,'whole')}
            </div>
            <span className="text-xs font-bold text-indigo-500 mt-0.5">BÜTÜN</span>
          </div>

          {/* Bottom-left node - PARÇA 1 */}
          <div className="absolute left-0 bottom-0 flex flex-col items-center anim-number-pop" style={{left:4,animationDelay:'200ms'}}>
            <div className={`w-18 h-18 rounded-full flex items-center justify-center shadow-lg border-3 transition-all duration-300 ${isMissing('part1')?'bg-gradient-to-r from-purple-200 to-indigo-200 border-purple-400 ring-2 ring-purple-300 animate-pulse':'bg-rose-100 border-rose-400'} ${isCorrect?'anim-bounce-in':''}`}>
              {nodeVal(p?.part1,'part1')}
            </div>
            <span className="text-xs font-bold text-rose-500 mt-0.5">PARÇA</span>
          </div>

          {/* Bottom-right node - PARÇA 2 */}
          <div className="absolute right-0 bottom-0 flex flex-col items-center anim-number-pop" style={{right:4,animationDelay:'400ms'}}>
            <div className={`w-18 h-18 rounded-full flex items-center justify-center shadow-lg border-3 transition-all duration-300 ${isMissing('part2')?'bg-gradient-to-r from-purple-200 to-indigo-200 border-purple-400 ring-2 ring-purple-300 animate-pulse':'bg-sky-100 border-sky-400'} ${isCorrect?'anim-bounce-in':''}`}>
              {nodeVal(p?.part2,'part2')}
            </div>
            <span className="text-xs font-bold text-sky-500 mt-0.5">PARÇA</span>
          </div>
        </div>
      </div>

      <div className="bg-white px-4 py-2 rounded-xl shadow mb-2 text-center max-w-xs">
        <div className="text-sm text-gray-700 font-medium">
          {isMissing('whole')?'İki parçanın toplamı (bütün) kaçtır?':isMissing('part1')?`Bütün ${p?.whole}, bir parça ${p?.part2}. Eksik parça kaç?`:`Bütün ${p?.whole}, bir parça ${p?.part1}. Eksik parça kaç?`}
        </div>
      </div>

      {ua!==null?(<div className="text-center"><div className={`text-2xl font-bold mb-2 ${ua===p?.answer?'text-green-500':'text-orange-500'}`}>{ua===p?.answer?'✓ Doğru!':`${encourage()} Cevap: ${p?.answer}`}</div><div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700">{'💡'} {p?.part1} + {p?.part2} = {p?.whole}</div></div>):(<div className="grid grid-cols-2 gap-3">{p?.options?.map((o,i)=>(<button key={i} onClick={()=>handle(o)} className={`px-8 py-4 ${colors?.button} text-white rounded-xl font-bold text-2xl shadow-lg`}>{o}</button>))}</div>)}
    </div>
  );
};

export default ParcaButun;

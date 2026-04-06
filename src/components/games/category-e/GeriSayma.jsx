import React, { useState } from 'react';
import { shuffle, TOTAL_ROUNDS, playSound, encourage } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const GeriSayma = ({ onBack, colors, onGameComplete, rahatMod, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);

  const cfg={
    1:{start:10,step:1,label:'10\'dan geriye'},
    2:{start:20,step:1,label:'20\'den geriye'},
    3:{start:20,step:2,label:'İkişer geriye'},
    4:{start:50,step:5,label:'Beşer geriye'}
  };

  const gen=(l)=>{
    const c=cfg[l];
    const maxStart=c.start;
    const step=c.step;
    const startVal=l<=2
      ? Math.floor(Math.random()*(maxStart-step*4))+step*4+step
      : maxStart-Math.floor(Math.random()*3)*step;
    const seq=[];
    for(let i=0;i<5;i++) seq.push(startVal-i*step);
    const mi=Math.floor(Math.random()*5);
    const answer=seq[mi];
    const o=[answer];let at=0;
    while(o.length<4&&at<40){
      const d=answer+((Math.random()<0.5?1:-1)*step*(Math.floor(Math.random()*3)+1));
      if(!o.includes(d)&&d>=0) o.push(d);
      at++;
    }
    while(o.length<4) o.push(answer+o.length*step);
    return{seq,missingIdx:mi,answer,options:shuffle(o)};
  };

  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(gen(l));setUa(null);setGs('playing');};
  const handle=(a)=>{
    setUa(a);
    if(a===p?.answer) { playSound('correct'); setSc(s=>s+15*lv); }
    else playSound('wrong');
    setTimeout(()=>{
      if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}
      else setGs('results');
    },1500);
  };

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Geri Sayma" emoji="🔢" description="Geriye doğru say! Eksik sayıyı bul ve sırayı tamamla." levels={['Seviye 1 (10\'dan geriye)','Seviye 2 (20\'den geriye)','Seviye 3 (İkişer geriye)','Seviye 4 (Beşer geriye)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Geri Sayma" emoji="🔢" level={lv} instruction={`Sayılar geriye doğru sıralanmış. Eksik olan sayıyı bul! (${cfg[lv].label})`} colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  const isCorrect=ua!==null&&ua===p?.answer;

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Geri Sayma" colors={colors}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">

        <div className="text-lg font-bold text-gray-700 mb-3">Geriye doğru say!</div>

        <div className="bg-white rounded-2xl shadow-xl p-4 mb-3 w-full max-w-sm">
          <div className="flex items-center justify-center gap-2">
            {p?.seq.map((num,i)=>{
              const isMissing=i===p.missingIdx;
              return (
                <React.Fragment key={i}>
                  {i>0 && <span className="text-gray-400 text-lg font-bold">→</span>}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold border-2 transition-all duration-300 ${
                    isMissing
                      ? ua===null
                        ? 'bg-gradient-to-r from-purple-200 to-indigo-200 border-purple-400 ring-2 ring-purple-300 animate-pulse'
                        : isCorrect
                          ? 'bg-green-100 border-green-400'
                          : 'bg-orange-100 border-orange-400'
                      : 'bg-gray-50 border-gray-300'
                  }`}>
                    {isMissing
                      ? ua===null
                        ? <span className="text-purple-400">?</span>
                        : <span className={isCorrect?'text-green-600':'text-orange-500'}>{num}</span>
                      : <span className="text-gray-800">{num}</span>
                    }
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="bg-white px-4 py-2 rounded-xl shadow mb-3 text-center max-w-xs">
          <div className="text-sm text-gray-700 font-medium">
            Eksik sayı kaçtır?
          </div>
        </div>

        {ua!==null?(
          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${ua===p?.answer?'text-green-500':'text-orange-500'}`}>
              {ua===p?.answer?'✓ Doğru!':`${encourage()} Cevap: ${p?.answer}`}
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700">
              {'💡'} Sıra: {p?.seq.join(', ')}
            </div>
          </div>
        ):(
          <div className="grid grid-cols-2 gap-3">
            {p?.options?.map((o,i)=>(
              <button key={i} onClick={()=>handle(o)} className={`px-8 py-4 ${colors?.button} text-white rounded-2xl font-bold text-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all`}>{o}</button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default GeriSayma;

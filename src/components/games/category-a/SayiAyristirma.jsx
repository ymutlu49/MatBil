import React, { useState } from 'react';
import { shuffle, TOTAL_ROUNDS, playSound, encourage, useSafeTimeout } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const SayiAyristirma = ({ onBack, colors, onGameComplete, rahatMod, prevBest }) => {
  const safeSetTimeout = useSafeTimeout();
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);

  const makeDots=(g1,g2)=>({group1:g1,group2:g2,total:g1+g2});

  const genArrangement=(total)=>{
    const a=Math.floor(Math.random()*(total-1))+1;
    return{group1:a,group2:total-a,total};
  };

  const gen=(l)=>{
    if(l===1){
      const total=Math.floor(Math.random()*2)+5;
      const g1=Math.floor(Math.random()*(total-1))+1;
      const g2=total-g1;
      const dots=makeDots(g1,g2);
      const answer=total;
      const question='Toplam kaç nokta var?';
      const hint=`${g1} + ${g2} = ${total}`;
      const o=[answer];let at=0;
      while(o.length<4&&at<40){const d=answer+((Math.random()<0.5?1:-1)*(Math.floor(Math.random()*3)+1));if(!o.includes(d)&&d>0)o.push(d);at++;}
      while(o.length<4)o.push(answer+o.length+1);
      return{dots,answer,question,hint,type:'total',options:shuffle(o)};
    }
    if(l===2){
      const total=Math.floor(Math.random()*3)+6;
      const g1=Math.floor(Math.random()*(total-2))+2;
      const g2=total-g1;
      const dots=makeDots(g1,g2);
      const answer=total;
      const question=`${g1} kırmızı ve ${g2} mavi nokta var. Toplam kaç?`;
      const hint=`${g1} + ${g2} = ${total}`;
      const o=[answer];let at=0;
      while(o.length<4&&at<40){const d=answer+((Math.random()<0.5?1:-1)*(Math.floor(Math.random()*3)+1));if(!o.includes(d)&&d>0)o.push(d);at++;}
      while(o.length<4)o.push(answer+o.length+1);
      return{dots,answer,question,hint,type:'total',options:shuffle(o)};
    }
    if(l===3){
      const total=Math.floor(Math.random()*4)+5;
      const correct=genArrangement(total);
      const arrangements=[correct];
      let at=0;
      while(arrangements.length<4&&at<40){
        const wrongTotal=total+((Math.random()<0.5?1:-1)*(Math.floor(Math.random()*3)+1));
        if(wrongTotal>1){
          const wa=Math.floor(Math.random()*(wrongTotal-1))+1;
          const arr={group1:wa,group2:wrongTotal-wa,total:wrongTotal};
          if(!arrangements.some(a=>a.total===arr.total&&a.group1===arr.group1))arrangements.push(arr);
        }
        at++;
      }
      while(arrangements.length<4){
        const ft=total+arrangements.length;
        arrangements.push({group1:1,group2:ft-1,total:ft});
      }
      const shuffled=shuffle(arrangements);
      const answerIdx=shuffled.indexOf(correct);
      return{targetNumber:total,arrangements:shuffled,answer:answerIdx,question:`${total} sayısının doğru gruplandırılması hangisi?`,hint:`${total} = ${correct.group1} + ${correct.group2}`,type:'pick',dots:makeDots(correct.group1,correct.group2)};
    }
    // Level 4 — tüm olası (a, total-a) çiftlerini topla, doğrudan farklı çeldiriciler seç
    const total=Math.floor(Math.random()*4)+6;
    const best1=Math.round(total/2);
    const best2=total-best1;
    const correct={group1:best1,group2:best2,total,balanced:true};
    // "en dengeli" olan tüm kombinasyonları (best1,best2) ve (best2,best1) hariç tut
    const pool=[];
    for(let a=1;a<total;a++){
      if(a!==best1 && a!==best2) pool.push({group1:a,group2:total-a,total,balanced:false});
    }
    const distractors=shuffle(pool).slice(0,3);
    const arrangements=[correct,...distractors];
    // Garanti: havuz yeterli değilse (küçük total'lerde), farklı group1'lerle doldur
    let filler=1;
    while(arrangements.length<4){
      if(filler!==best1 && filler!==best2 && !arrangements.some(x=>x.group1===filler)){
        arrangements.push({group1:filler,group2:total-filler,total,balanced:false});
      }
      filler++;
      if(filler>=total) break;
    }
    const shuffled=shuffle(arrangements);
    const answerIdx=shuffled.indexOf(correct);
    return{targetNumber:total,arrangements:shuffled,answer:answerIdx,question:`${total} noktayı en dengeli nasıl gruplarız?`,hint:`${total} = ${best1} + ${best2} (en dengeli)`,type:'pick',dots:makeDots(best1,best2)};
  };

  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(gen(l));setUa(null);setGs('playing');};
  const handle=(a)=>{
    setUa(a);
    if(a===p?.answer) { playSound('correct'); setSc(s=>s+15*lv); }
    else playSound('wrong');
    safeSetTimeout(()=>{
      if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}
      else setGs('results');
    },1500);
  };

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Sayı Ayrıştırma" emoji="🔴🔵" description="Noktaları gruplara ayırarak sayıları parçalara böl! Kavramsal subitizing becerini geliştir." levels={['Seviye 1 (Toplam bul 5-6)','Seviye 2 (Renkli gruplar 6-8)','Seviye 3 (Doğru grubu seç)','Seviye 4 (En iyi strateji)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Sayı Ayrıştırma" emoji="🔴🔵" level={lv} instruction={lv<=2?'Renkli nokta gruplarını sayarak toplamı bul!':lv===3?'Verilen sayının doğru gruplandırmasını seç!':'Noktaları en dengeli şekilde grupla!'} colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  const isCorrect=ua!==null&&ua===p?.answer;

  const DotGroup=({count,color,size='w-8 h-8'})=>(
    <div className="flex flex-wrap gap-1.5 justify-center">
      {Array.from({length:count}).map((_,i)=>(
        <div key={i} className={`${size} rounded-full ${color} shadow-md`}/>
      ))}
    </div>
  );

  const DotsDisplay=({g1,g2,compact=false})=>(
    <div className={`flex items-center justify-center gap-${compact?'3':'5'}`}>
      <DotGroup count={g1} color="bg-rose-500" size={compact?'w-6 h-6':'w-8 h-8'}/>
      <div className={`w-0.5 ${compact?'h-8':'h-12'} bg-gray-300`}/>
      <DotGroup count={g2} color="bg-blue-500" size={compact?'w-6 h-6':'w-8 h-8'}/>
    </div>
  );

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Sayı Ayrıştırma" colors={colors}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">

        {p?.type==='total' && (
          <div className="bg-white rounded-2xl shadow-xl p-5 mb-3 w-full max-w-sm">
            <DotsDisplay g1={p.dots.group1} g2={p.dots.group2}/>
            <div className="text-center mt-3 text-sm text-gray-500">
              <span className="text-rose-500 font-bold">{p.dots.group1} kırmızı</span>
              {' + '}
              <span className="text-blue-500 font-bold">{p.dots.group2} mavi</span>
            </div>
          </div>
        )}

        {p?.type==='pick' && (
          <div className="bg-white rounded-2xl shadow-xl p-4 mb-3 w-full max-w-sm">
            <div className="text-center text-3xl font-bold text-gray-700 mb-2">{p.targetNumber}</div>
            <div className="text-center text-sm text-gray-500">Bu sayıyı nasıl gruplarız?</div>
          </div>
        )}

        <div className="bg-white px-4 py-2 rounded-xl shadow mb-3 text-center max-w-xs">
          <div className="text-sm text-gray-700 font-medium">{p?.question}</div>
        </div>

        {ua!==null?(
          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${isCorrect?'text-green-500':'text-orange-500'}`}>
              {isCorrect?'✓ Doğru!':`${encourage()} Cevap: ${p?.type==='pick'?`${p.dots.group1} + ${p.dots.group2}`:p?.answer}`}
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700">
              {'💡'} {p?.hint}
            </div>
          </div>
        ):p?.type==='total'?(
          <div className="grid grid-cols-2 gap-3">
            {p?.options?.map((o,i)=>(
              <button key={i} onClick={()=>handle(o)} className={`px-8 py-4 ${colors?.button} text-white rounded-2xl font-bold text-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all`}>{o}</button>
            ))}
          </div>
        ):(
          <div className="grid grid-cols-2 gap-3">
            {p?.arrangements?.map((arr,i)=>(
              <button key={i} onClick={()=>handle(i)} className={`p-3 bg-white rounded-xl shadow-lg border-2 ${ua===null?'border-gray-200 hover:border-indigo-400':'border-gray-200'} transition-all`}>
                <DotsDisplay g1={arr.group1} g2={arr.group2} compact/>
                <div className="text-xs text-gray-500 mt-1 text-center">{arr.group1} + {arr.group2}</div>
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default SayiAyristirma;

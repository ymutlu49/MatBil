import React, { useState, useRef } from 'react';
import { shuffle, TOTAL_ROUNDS, playSound, encourage, useAdaptive } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const GorevDegistirme = ({ onBack, colors, onGameComplete, rahatMod, prevBest, sesAcik }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);
  const adaptive = useAdaptive();
  const trialsSinceSwitch = useRef(0);
  const lastRule = useRef(null);

  const rules2=['Toplama','Çıkarma'];
  const rules3=['Toplama','Çıkarma','Sonraki Sayı'];

  const pickRule=(l)=>{
    trialsSinceSwitch.current++;
    const switchInterval=l<=2?3:2;
    const shouldSwitch=trialsSinceSwitch.current>=switchInterval;

    let available;
    if(l<=2) available=rules2;
    else available=rules3;

    if(shouldSwitch||!lastRule.current){
      let newRule;
      do{ newRule=available[Math.floor(Math.random()*available.length)]; }
      while(newRule===lastRule.current && available.length>1);
      lastRule.current=newRule;
      trialsSinceSwitch.current=0;
      return{rule:newRule,switched:lastRule.current!==null};
    }
    return{rule:lastRule.current,switched:false};
  };

  const gen=(l)=>{
    const{rule,switched}=pickRule(l);
    let a,b,answer,question,hint;
    const ops={1:1,2:2,3:Math.floor(Math.random()*3)+1,4:Math.floor(Math.random()*5)+1};
    const opVal=ops[l];

    if(rule==='Toplama'){
      a=Math.floor(Math.random()*(l<=2?10:20))+1;
      b=opVal;
      answer=a+b;
      question=`${a} + ${b} = ?`;
      hint=`${a} + ${b} = ${answer}`;
    } else if(rule==='Çıkarma'){
      b=opVal;
      a=Math.floor(Math.random()*(l<=2?10:20))+b+1;
      answer=a-b;
      question=`${a} - ${b} = ?`;
      hint=`${a} - ${b} = ${answer}`;
    } else {
      a=Math.floor(Math.random()*30)+1;
      answer=a+1;
      question=`${a}'${a%10>=8||a===11||a===12?'i':'ı'}n sonraki sayı = ?`;
      hint=`${a} + 1 = ${answer}`;
    }

    const o=[answer];let at=0;
    while(o.length<4&&at<40){
      const d=answer+((Math.random()<0.5?1:-1)*(Math.floor(Math.random()*4)+1));
      if(!o.includes(d)&&d>=0) o.push(d);
      at++;
    }
    while(o.length<4) o.push(answer+o.length+1);

    return{rule,question,answer,hint,switched,options:shuffle(o)};
  };

  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{
    setLv(l);setSc(0);setRd(1);setUa(null);adaptive.reset();
    trialsSinceSwitch.current=0;lastRule.current=null;
    setP(gen(l));setGs('playing');
  };
  const handle=(a)=>{
    const correct=a===p?.answer;
    setUa(a);
    adaptive.record(correct);
    if(correct){ playSound('correct'); setSc(s=>s+15*lv); }
    else playSound('wrong');
    setTimeout(()=>{
      if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}
      else setGs('results');
    },1500);
  };

  const ruleColor={
    'Toplama':'from-green-400 to-emerald-500',
    'Çıkarma':'from-orange-400 to-red-400',
    'Sonraki Sayı':'from-blue-400 to-indigo-500'
  };
  const ruleEmoji={'Toplama':'➕','Çıkarma':'➖','Sonraki Sayı':'➡️'};

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Görev Değiştirme" emoji="🔀" description="Kurallar değişiyor! Toplama mı çıkarma mı? Hızlı düşün ve doğru işlemi uygula." levels={['Seviye 1 (+1 / -1)','Seviye 2 (+2 / -2)','Seviye 3 (Karışık işlemler)','Seviye 4 (Hızlı geçiş, 3 işlem)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Görev Değiştirme" emoji="🔀" level={lv} instruction={lv===1?'Kural değişecek: +1 veya -1 yap!':lv===2?'+2 veya -2 yap! Kurala dikkat et!':lv===3?'Karışık işlemler! Kural her an değişebilir!':'3 farklı işlem! Çok hızlı değişiyor!'} colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  const isCorrect=ua!==null&&ua===p?.answer;

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Görev Değiştirme" colors={colors}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">

        {p?.switched && (
          <div className="bg-yellow-100 border-2 border-yellow-300 px-4 py-1 rounded-full text-sm font-bold text-yellow-700 mb-2 animate-bounce">
            Kural Değişti!
          </div>
        )}

        <div className={`bg-gradient-to-r ${ruleColor[p?.rule]||''} px-6 py-3 rounded-2xl shadow-lg mb-4`}>
          <div className="text-white text-center">
            <span className="text-2xl mr-2">{ruleEmoji[p?.rule]}</span>
            <span className="text-xl font-bold">{p?.rule}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-4 w-full max-w-sm">
          <div className="text-center text-3xl font-black text-gray-800">
            {p?.question}
          </div>
        </div>

        {ua!==null?(
          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${isCorrect?'text-green-500':'text-orange-500'}`}>
              {isCorrect?'✓ Doğru!':`${encourage()} Cevap: ${p?.answer}`}
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700">
              {'💡'} {p?.hint}
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

export default GorevDegistirme;

import React, { useState } from 'react';
import { shuffle, TOTAL_ROUNDS, encourage } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const useAdaptive = () => ({ record: () => {} });

const numColor = (val, max = 99) => {
  const ratio = Math.min(val / max, 1);
  const hue = 220 - ratio * 160;
  return `hsl(${hue}, 70%, 45%)`;
};

const BasamakDegeri = ({ onBack, colors, onGameComplete, prevBest }) => {
  const adaptive = useAdaptive();
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);

  // Birim boyutu: tüm görseller bu ölçüye göre orantılı
  const UNIT = 14; // px - birlik küpünün kenar uzunluğu

  // Onluk çubuk: 1 birim genişlik × 10 birim yükseklik
  const TenBar = ({count, highlight}) => (
    <div className="flex gap-1 flex-wrap justify-center items-end">
      {Array.from({length:count},(_,i)=>(
        <div key={i} className={`rounded-sm shadow-sm flex flex-col gap-px p-px ${highlight?'bg-blue-500 ring-2 ring-blue-300':'bg-blue-400'}`}
          style={{width: UNIT + 4, height: UNIT * 10 + 12}}>
          {Array.from({length:10},(_,j)=><div key={j} className="flex-1 bg-blue-100 rounded-[1px]"/>)}
        </div>
      ))}
    </div>
  );
  // Birlik küp: 1 birim × 1 birim kare
  const UnitCubes = ({count, highlight}) => (
    <div className="flex gap-1 flex-wrap justify-center items-end" style={{maxWidth: UNIT * 4 + 16}}>
      {Array.from({length:count},(_,i)=>(
        <div key={i} className={`rounded-sm shadow-sm ${highlight?'bg-amber-500 border-amber-600 ring-2 ring-amber-300':'bg-amber-300 border-amber-400'} border`}
          style={{width: UNIT, height: UNIT}}/>
      ))}
    </div>
  );
  // Yüzlük kare: 10×10 birim grid
  const HundredSquare = ({count, highlight}) => (
    <div className="flex gap-2 flex-wrap justify-center items-end">
      {Array.from({length:count},(_,i)=>(
        <div key={i} className={`rounded shadow-sm grid grid-cols-10 gap-px p-px ${highlight?'bg-red-500 ring-2 ring-red-300':'bg-red-400'}`}
          style={{width: UNIT * 10 + 12, height: UNIT * 10 + 12}}>
          {Array.from({length:100},(_,j)=><div key={j} className="bg-red-100 rounded-[1px]"/>)}
        </div>
      ))}
    </div>
  );

  const gen=(l)=>{
    let n,q,a,o,askHL,tens,ones,hundreds=0,showNumber=true;

    if(l===1){
      n=Math.floor(Math.random()*90)+10;
      tens=Math.floor(n/10); ones=n%10;
      const types=['countTens','valueTens'];
      const type=types[Math.floor(Math.random()*types.length)];
      if(type==='countTens'){
        a=tens; askHL='onluk'; showNumber=false;
        q=`Kaç tane onluk çubuk var?`;
        o=[a];let at=0;while(o.length<4&&at<30){const c=Math.floor(Math.random()*9)+1;if(!o.includes(c))o.push(c);at++;}
      } else {
        a=tens*10; askHL='onluk';
        q=`${n} sayısının onluk basamağının değeri kaçtır?`;
        o=[a,tens,ones,a+10].filter(x=>x>=0);
        o=[...new Set(o)];let at=0;while(o.length<4&&at<30){const c=Math.floor(Math.random()*9+1)*10;if(!o.includes(c))o.push(c);at++;}
      }
    } else if(l===2){
      n=Math.floor(Math.random()*90)+11;
      tens=Math.floor(n/10); ones=n%10;
      if(ones===0){ones=Math.floor(Math.random()*8)+1; n=tens*10+ones;}
      const types=['countOnes','valueOnes','countTens'];
      const type=types[Math.floor(Math.random()*types.length)];
      if(type==='countOnes'){
        a=ones; askHL='birlik'; showNumber=false;
        q=`Kaç tane birlik küp var?`;
        o=[a];let at=0;while(o.length<4&&at<30){const c=Math.floor(Math.random()*10);if(!o.includes(c)&&c>=0)o.push(c);at++;}
      } else if(type==='valueOnes'){
        a=ones; askHL='birlik';
        q=`${n} sayısının birlik basamağındaki rakam kaçtır?`;
        o=[a,tens,a+1,tens*10].filter(x=>x>=0&&x<=99);
        o=[...new Set(o)];let at=0;while(o.length<4&&at<30){const c=Math.floor(Math.random()*10);if(!o.includes(c))o.push(c);at++;}
      } else {
        a=tens; askHL='onluk'; showNumber=false;
        q=`Kaç tane onluk çubuk var?`;
        o=[a];let at=0;while(o.length<4&&at<30){const c=Math.floor(Math.random()*9)+1;if(!o.includes(c))o.push(c);at++;}
      }
    } else if(l===3){
      tens=Math.floor(Math.random()*9)+1;
      ones=Math.floor(Math.random()*9)+1;
      n=tens*10+ones;
      const types=['totalFromVisual','decompose'];
      const type=types[Math.floor(Math.random()*types.length)];
      if(type==='totalFromVisual'){
        a=n; askHL='toplam'; showNumber=false;
        q=`Bu çubuk ve küpler toplam kaç eder?`;
        o=[a,a+10,a-10,tens+ones].filter(x=>x>0);
        o=[...new Set(o)];let at=0;while(o.length<4&&at<30){const c=Math.max(1,a+Math.floor(Math.random()*21)-10);if(!o.includes(c))o.push(c);at++;}
      } else {
        a=tens; askHL='onluk';
        const wrongTens=[ones,tens+1,tens-1,Math.floor(n/100)].filter(x=>x>0&&x!==a);
        q=`${n} sayısında kaç tane onluk vardır?`;
        o=[a,...wrongTens];
        o=[...new Set(o)].slice(0,4);let at=0;while(o.length<4&&at<30){const c=Math.floor(Math.random()*9)+1;if(!o.includes(c))o.push(c);at++;}
      }
    } else {
      hundreds=Math.floor(Math.random()*4)+1;
      tens=Math.floor(Math.random()*9)+1;
      ones=Math.floor(Math.random()*9)+1;
      n=hundreds*100+tens*10+ones;
      const types=['totalFromVisual','countHundreds','valueHundreds','decomposeAll'];
      const type=types[Math.floor(Math.random()*types.length)];
      if(type==='totalFromVisual'){
        a=n; askHL='toplam'; showNumber=false;
        q=`Bu bloklar toplam kaç eder?`;
        o=[a,a+100,a-100,a+10].filter(x=>x>0);
        o=[...new Set(o)];let at=0;while(o.length<4&&at<30){const c=Math.max(1,a+Math.floor(Math.random()*101)-50);if(!o.includes(c))o.push(c);at++;}
      } else if(type==='countHundreds'){
        a=hundreds; askHL='yüzlük'; showNumber=false;
        q=`Kaç tane yüzlük kare var?`;
        o=[a];let at=0;while(o.length<4&&at<30){const c=Math.floor(Math.random()*5)+1;if(!o.includes(c))o.push(c);at++;}
      } else if(type==='valueHundreds'){
        a=hundreds*100; askHL='yüzlük';
        q=`${n} sayısının yüzlük basamağının değeri kaçtır?`;
        o=[a,hundreds,tens*10,n].filter(x=>x>0);
        o=[...new Set(o)];let at=0;while(o.length<4&&at<30){const c=Math.floor(Math.random()*4+1)*100;if(!o.includes(c))o.push(c);at++;}
      } else {
        a=tens; askHL='onluk';
        q=`${n} sayısının onluk basamağındaki rakam kaçtır?`;
        o=[a,hundreds,ones,a+1].filter(x=>x>=0);
        o=[...new Set(o)];let at=0;while(o.length<4&&at<30){const c=Math.floor(Math.random()*10);if(!o.includes(c))o.push(c);at++;}
      }
    }
    o=o.filter((v,i,ar)=>ar.indexOf(v)===i).slice(0,4);
    while(o.length<4){o.push(o[o.length-1]+1);}
    return{number:n,question:q,answer:a,options:shuffle(o),askHL,tens:tens||Math.floor(n/10)%10,ones:ones!==undefined?ones:n%10,hundreds,showNumber};
  };
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setP(gen(l));setUa(null);setGs('playing');};
  const handle=(a)=>{setUa(a);if(a===p?.answer)setSc(s=>s+20*lv);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);setP(gen(lv));setUa(null);}else setGs('results');},1500);};
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Basamak Değeri" emoji="" description="Onluk çubukları ve birlik küpleri kullanarak basamak değerlerini keşfet!" levels={['Seviye 1 (Onluklar)','Seviye 2 (Birlikler)','Seviye 3 (Birleştir)','Seviye 4 (Yüzlükler)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Basamak Değeri" emoji="" level={lv} instruction="Onluk çubuklar ve birlik küpler gösterilecek. Görselden sayarak veya sayıyı ayrıştırarak doğru cevabı bul!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  const hl = p?.askHL;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Basamak Değeri" colors={colors}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
      {/* Görsel temsil */}
      <div className="bg-white rounded-2xl shadow-xl p-4 mb-3 w-full max-w-sm">
        {p?.showNumber && <div className="text-center text-4xl font-bold mb-3" style={{color:numColor(p?.number,p?.number>99?999:99)}}>{p?.number}</div>}
        <div className="flex items-end justify-center gap-5 min-h-[80px]">
          {p?.hundreds > 0 && <div className="text-center">
            <HundredSquare count={p?.hundreds} highlight={hl==='yüzlük'}/>
            {ua!==null && <div className="text-sm text-red-500 font-bold mt-1">{p?.hundreds} yüzlük</div>}
          </div>}
          {p?.tens > 0 && <div className="text-center">
            <TenBar count={p?.tens} highlight={hl==='onluk'}/>
            {ua!==null && <div className="text-sm text-blue-500 font-bold mt-1">{p?.tens} onluk</div>}
          </div>}
          {p?.ones > 0 && <div className="text-center">
            <UnitCubes count={p?.ones} highlight={hl==='birlik'}/>
            {ua!==null && <div className="text-sm text-amber-500 font-bold mt-1">{p?.ones} birlik</div>}
          </div>}
        </div>
      </div>
      {/* Soru */}
      <div className="bg-white px-5 py-3 rounded-xl shadow mb-3 text-center"><div className="text-base text-gray-700 font-semibold">{p?.question}</div></div>
      {/* Cevap / Seçenekler */}
      {ua!==null?(<div className="text-center"><div className={`text-2xl font-bold ${ua===p?.answer?'text-green-500':'text-orange-500'}`}>{ua===p?.answer?'✓ Doğru!':`${encourage()} Cevap: ${p?.answer}`}</div><div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700 mt-2">{'💡'} {p?.hundreds>0?`${p?.hundreds} yüzlük (${p?.hundreds*100}) + `:''}{p?.tens} onluk ({p?.tens*10}) + {p?.ones} birlik ({p?.ones}) = {p?.number}</div></div>):(<div className="grid grid-cols-2 gap-3">{p?.options?.map((o,i)=>(<button key={i} onClick={()=>handle(o)} className={`px-8 py-4 min-h-[56px] ${colors?.button} text-white rounded-xl font-bold text-2xl shadow-lg`}>{o}</button>))}</div>)}

      </div>    </div>
  );
};

export default BasamakDegeri;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TOTAL_ROUNDS, playSound, vibrate, encourage, speakNumber } from '../../../utils';
import { HELP_MAP } from '../../../constants/helpMap';
import Feedback from '../../ui/Feedback';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const STRATEGIES = {
  quantity: ['Grupla düşündüm ', 'Referans noktası kullandım ', 'Sezgisel tahmin yaptım ', 'Yaklaşık saydım '],
  numberLine: ['Yarıyı referans aldım ½', 'Oranlayarak buldum ', 'Bildiğim sayılardan yola çıktım '],
  measurement: ['Referans nesneyi kullandım ', 'Karşılaştırarak tahmin ettim ⚖️', 'Günlük deneyimimden yararlandım '],
  computation: ['Sayıları yuvarladım ', 'Kolay parçalara ayırdım ✂️', 'Aşina sayıları kullandım '],
};

const ExplainStep = ({ type, onDone }) => {
  const strats = STRATEGIES[type] || STRATEGIES.quantity;
  return (
    <div className="mt-2 anim-fade">
      <div className="text-xs font-bold text-indigo-600 mb-1.5 text-center">{'📋'} Hangi stratejiyi kullandın?</div>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {strats.map((s,i) => (
          <button key={i} onClick={() => onDone(s)}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 border border-indigo-200 transition-colors">{s}</button>
        ))}
      </div>
    </div>
  );
};

const OlcmeTahmini = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);const [p,setP]=useState(null);const [ua,setUa]=useState(null);const [used,setUsed]=useState([]);
  const [explained2,setExplained2]=useState(false);
  const comps=[
    // Seviye 1: UZUNLUK (Kolay)
    {id:1,ref:{name:'Cetvel',emoji:'',value:30,unit:'cm'},target:{name:'Kalem',emoji:'✏️',value:15,unit:'cm'},opts:[5,15,40,80],lv:1},
    {id:2,ref:{name:'Kapı yüksekliği',emoji:'',value:200,unit:'cm'},target:{name:'Masa yüksekliği',emoji:'',value:75,unit:'cm'},opts:[30,75,150,200],lv:1},
    {id:3,ref:{name:'Araba uzunluğu',emoji:'',value:4,unit:'m'},target:{name:'Otobüs uzunluğu',emoji:'',value:12,unit:'m'},opts:[6,12,20,30],lv:1},
    {id:4,ref:{name:'Araba uzunluğu',emoji:'',value:4,unit:'m'},target:{name:'Bisiklet uzunluğu',emoji:'',value:2,unit:'m'},opts:[1,2,4,6],lv:1},
    {id:50,ref:{name:'Adım boyu',emoji:'',value:60,unit:'cm'},target:{name:'Sınıf tahtası genişliği',emoji:'',value:300,unit:'cm'},opts:[100,200,300,500],lv:1},
    {id:51,ref:{name:'Karış',emoji:'',value:20,unit:'cm'},target:{name:'Kitap uzunluğu',emoji:'',value:25,unit:'cm'},opts:[10,25,40,60],lv:1},
    {id:52,ref:{name:'Parmak genişliği',emoji:'☝️',value:1,unit:'cm'},target:{name:'Silgi uzunluğu',emoji:'',value:5,unit:'cm'},opts:[2,5,10,15],lv:1},
    {id:53,ref:{name:'Bebekboyu',emoji:'',value:50,unit:'cm'},target:{name:'Yastık uzunluğu',emoji:'',value:70,unit:'cm'},opts:[30,50,70,100],lv:1},
    {id:54,ref:{name:'Direksiyon genişliği',emoji:'',value:40,unit:'cm'},target:{name:'Pizza genişliği',emoji:'',value:30,unit:'cm'},opts:[15,30,50,70],lv:1},
    {id:55,ref:{name:'Çocuk boyu',emoji:'',value:120,unit:'cm'},target:{name:'Dolap yüksekliği',emoji:'',value:180,unit:'cm'},opts:[100,140,180,220],lv:1},
    {id:56,ref:{name:'Ayak uzunluğu',emoji:'',value:25,unit:'cm'},target:{name:'Tablet uzunluğu',emoji:'',value:24,unit:'cm'},opts:[12,24,35,50],lv:1},
    {id:57,ref:{name:'Masa uzunluğu',emoji:'',value:120,unit:'cm'},target:{name:'Pencere genişliği',emoji:'',value:100,unit:'cm'},opts:[60,100,150,200],lv:1},
    // Seviye 2: UZUNLUK (Ileri)
    {id:5,ref:{name:'Cetvel',emoji:'',value:30,unit:'cm'},target:{name:'Defter uzunluğu',emoji:'',value:24,unit:'cm'},opts:[10,24,50,80],lv:2},
    {id:6,ref:{name:'Basketbol topu genişliği',emoji:'',value:24,unit:'cm'},target:{name:'Tenis topu genişliği',emoji:'',value:7,unit:'cm'},opts:[3,7,15,24],lv:2},
    {id:7,ref:{name:'A4 kağıt uzunluğu',emoji:'',value:30,unit:'cm'},target:{name:'A4 kağıt genişliği',emoji:'',value:21,unit:'cm'},opts:[10,21,40,60],lv:2},
    {id:8,ref:{name:'Kapı genişliği',emoji:'',value:80,unit:'cm'},target:{name:'Buzdolabı genişliği',emoji:'',value:60,unit:'cm'},opts:[30,60,90,120],lv:2},
    {id:58,ref:{name:'Futbol kalesi genişliği',emoji:'',value:7,unit:'m'},target:{name:'Voleybol ağı uzunluğu',emoji:'',value:9,unit:'m'},opts:[5,9,14,18],lv:2},
    {id:59,ref:{name:'Televizyon genişliği',emoji:'',value:55,unit:'inch'},target:{name:'Laptop genişliği',emoji:'',value:15,unit:'inch'},opts:[10,15,25,40],lv:2},
    {id:60,ref:{name:'Yüzme havuzu',emoji:'',value:25,unit:'m'},target:{name:'Sınıf uzunluğu',emoji:'',value:8,unit:'m'},opts:[4,8,15,25],lv:2},
    {id:61,ref:{name:'Gitar uzunluğu',emoji:'',value:100,unit:'cm'},target:{name:'Keman uzunluğu',emoji:'',value:60,unit:'cm'},opts:[30,60,90,120],lv:2},
    {id:62,ref:{name:'Zürafa boynu',emoji:'',value:2,unit:'m'},target:{name:'Fil yüksekliği',emoji:'',value:3,unit:'m'},opts:[1,3,5,8],lv:2},
    {id:63,ref:{name:'Kol uzunluğu',emoji:'',value:60,unit:'cm'},target:{name:'Bacak uzunluğu',emoji:'',value:80,unit:'cm'},opts:[50,80,110,140],lv:2},
    {id:64,ref:{name:'Bant rulosu genişliği',emoji:'',value:5,unit:'cm'},target:{name:'Kol saati genişliği',emoji:'⌚',value:4,unit:'cm'},opts:[2,4,7,10],lv:2},
    {id:65,ref:{name:'Merdiven basamağı',emoji:'',value:20,unit:'cm'},target:{name:'Tabure yüksekliği',emoji:'',value:45,unit:'cm'},opts:[25,45,70,100],lv:2},
    // Seviye 3: KUTLE ve HACIM (Kolay)
    {id:9,ref:{name:'1 kg şeker',emoji:'⚖️',value:1000,unit:'g'},target:{name:'Elma',emoji:'',value:200,unit:'g'},opts:[50,200,500,1000],lv:3},
    {id:10,ref:{name:'1 kg un',emoji:'⚖️',value:1000,unit:'g'},target:{name:'Yumurta',emoji:'',value:60,unit:'g'},opts:[10,60,200,500],lv:3},
    {id:11,ref:{name:'Bebek doğum ağırlığı',emoji:'',value:3500,unit:'g'},target:{name:'Karpuz',emoji:'',value:3000,unit:'g'},opts:[500,1500,3000,5000],lv:3},
    {id:12,ref:{name:'1 litre su',emoji:'',value:1000,unit:'ml'},target:{name:'Su bardağı',emoji:'',value:250,unit:'ml'},opts:[50,250,600,1000],lv:3},
    {id:66,ref:{name:'1 litre süt',emoji:'',value:1000,unit:'ml'},target:{name:'Çay bardağı',emoji:'',value:100,unit:'ml'},opts:[50,100,300,500],lv:3},
    {id:67,ref:{name:'Cep telefonu',emoji:'',value:180,unit:'g'},target:{name:'Tablet',emoji:'',value:500,unit:'g'},opts:[200,500,900,1500],lv:3},
    {id:68,ref:{name:'Futbol topu',emoji:'⚽',value:430,unit:'g'},target:{name:'Tenis topu',emoji:'',value:58,unit:'g'},opts:[20,58,150,300],lv:3},
    {id:69,ref:{name:'Kedi ağırlığı',emoji:'',value:4,unit:'kg'},target:{name:'Tavşan ağırlığı',emoji:'',value:2,unit:'kg'},opts:[1,2,4,8],lv:3},
    {id:70,ref:{name:'Pet şişe',emoji:'',value:500,unit:'ml'},target:{name:'Yoğurt kabı',emoji:'',value:200,unit:'ml'},opts:[100,200,400,700],lv:3},
    {id:71,ref:{name:'Çikolata bar',emoji:'',value:80,unit:'g'},target:{name:'Ceviz',emoji:'',value:10,unit:'g'},opts:[3,10,30,60],lv:3},
    {id:72,ref:{name:'Okul çantası (dolu)',emoji:'',value:5,unit:'kg'},target:{name:'Ders kitabı',emoji:'',value:500,unit:'g'},opts:[200,500,1000,2000],lv:3},
    {id:73,ref:{name:'1 litre meyve suyu',emoji:'',value:1000,unit:'ml'},target:{name:'Kaşık',emoji:'',value:15,unit:'ml'},opts:[5,15,50,100],lv:3},
    // Seviye 4: KUTLE ve HACIM (Ileri)
    {id:13,ref:{name:'1 litre su',emoji:'',value:1000,unit:'ml'},target:{name:'Çay kaşığı',emoji:'',value:5,unit:'ml'},opts:[1,5,20,100],lv:4},
    {id:14,ref:{name:'Küvet',emoji:'',value:200,unit:'litre'},target:{name:'Kova',emoji:'',value:10,unit:'litre'},opts:[5,10,25,50],lv:4},
    {id:15,ref:{name:'1 kg pirinç',emoji:'',value:1000,unit:'g'},target:{name:'Ekmek',emoji:'',value:400,unit:'g'},opts:[100,400,800,1500],lv:4},
    {id:16,ref:{name:'Köpek ağırlığı',emoji:'',value:15,unit:'kg'},target:{name:'Portakal',emoji:'',value:150,unit:'g'},opts:[30,150,500,1000],lv:4},
    {id:74,ref:{name:'İnsan vücudu',emoji:'',value:70,unit:'kg'},target:{name:'Bisiklet',emoji:'',value:12,unit:'kg'},opts:[5,12,25,40],lv:4},
    {id:75,ref:{name:'Otomobil',emoji:'',value:1500,unit:'kg'},target:{name:'Motor',emoji:'',value:200,unit:'kg'},opts:[80,200,500,800],lv:4},
    {id:76,ref:{name:'Havuz',emoji:'',value:50000,unit:'litre'},target:{name:'Çamaşır makinesi',emoji:'',value:60,unit:'litre'},opts:[20,60,150,300],lv:4},
    {id:77,ref:{name:'Kalem kutusu',emoji:'',value:300,unit:'g'},target:{name:'Silgi',emoji:'',value:30,unit:'g'},opts:[10,30,80,200],lv:4},
    {id:78,ref:{name:'Bebek ağırlığı',emoji:'',value:3,unit:'kg'},target:{name:'Sırt çantası (boş)',emoji:'',value:800,unit:'g'},opts:[300,800,1500,3000],lv:4},
    {id:79,ref:{name:'Kahve fincanı',emoji:'☕',value:150,unit:'ml'},target:{name:'Damacana',emoji:'',value:19000,unit:'ml'},opts:[5000,10000,19000,30000],lv:4},
    {id:80,ref:{name:'Büyük pizza',emoji:'',value:800,unit:'g'},target:{name:'Hamburger',emoji:'',value:250,unit:'g'},opts:[100,250,500,800],lv:4},
    {id:81,ref:{name:'Penguen',emoji:'',value:30,unit:'kg'},target:{name:'Papağan',emoji:'',value:1,unit:'kg'},opts:[1,3,8,15],lv:4},
  ];
  const gen=(l,u)=>{const av=comps.filter(c=>c.lv<=l&&!u.includes(c.id));const pool=av.length>0?av:comps.filter(c=>c.lv<=l);const c=pool[Math.floor(Math.random()*pool.length)];return{...c,opts:c.opts.sort(()=>Math.random()-0.5)};};
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setUsed([]);const f=gen(l,[]);setP(f);setUsed([f.id]);setUa(null);setGs('playing');};
  const handle=(a)=>{setUa(a);if(a===p?.target?.value)setSc(s=>s+20*lv);setExplained2(false);};
  const handleExplain2=()=>{setExplained2(true);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);const n=gen(lv,used);setP(n);setUsed(prev=>[...prev,n.id]);setUa(null);setExplained2(false);}else setGs('results');},800);};
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Ölçme Tahmini" emoji="" description="Nesnelerin uzunluk, ağırlık veya hacimlerini referansa bakarak tahmin et!" levels={['Seviye 1 (Uzunluk Kolay)','Seviye 2 (Uzunluk İleri)','Seviye 3 (Kütle/Hacim Kolay)','Seviye 4 (Kütle/Hacim İleri)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Ölçme Tahmini" emoji="" level={lv} instruction="Bir referans nesne ve onun ölçüsü gösterilecek. Hedef nesnenin ölçüsünü karşılaştırarak tahmin et!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Ölçme Tahmini" colors={colors}/>
      <div className="bg-green-100 p-4 rounded-2xl shadow-lg mb-3 border-2 border-green-300 text-center"><span className="text-4xl">{p?.ref?.emoji}</span><div className="font-bold text-green-700">{p?.ref?.name}</div><div className="text-2xl font-bold text-green-600">{p?.ref?.value} {p?.ref?.unit}</div></div>
      <div className="bg-white p-3 rounded-xl shadow-xl mb-3 border-2 border-amber-300 text-center"><span className="text-4xl">{p?.target?.emoji}</span><div className="font-bold text-gray-700 text-lg mt-2">{p?.target?.name}</div><div className="text-amber-600 font-medium">Yaklaşık kaç {p?.target?.unit}?</div></div>
      {ua!==null?(<div className="text-center"><div className={`text-2xl font-bold mb-2 ${ua===p?.target?.value?'text-green-500':'text-orange-500'}`}>{ua===p?.target?.value?'✓ Doğru!':`${encourage()} Cevap: ${p?.target?.value} ${p?.target?.unit}`}</div><div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700 mt-2">{'📋'} {p?.ref?.name} ({p?.ref?.value} {p?.ref?.unit}) referans alındığında {p?.target?.name} yaklaşık {p?.target?.value} {p?.target?.unit} eder.</div>{!explained2 && <ExplainStep type="measurement" onDone={handleExplain2}/>}{explained2 && <div className="text-xs text-green-600 mt-2 font-medium anim-fade">{'✓'} Güzel strateji!</div>}</div>):(<div className="grid grid-cols-2 gap-3">{p?.opts?.map((o,i)=>(<button key={i} onClick={()=>handle(o)} className={`px-6 py-4 ${colors?.button} text-white rounded-xl font-bold text-xl shadow-lg`}>{o} {p?.target?.unit}</button>))}</div>)}
    </div>
  );
};

export default OlcmeTahmini;

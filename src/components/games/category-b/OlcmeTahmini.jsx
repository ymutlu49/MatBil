import React, { useState, useEffect, useCallback, useRef } from 'react';
import { shuffle, TOTAL_ROUNDS, playSound, vibrate, encourage, speakNumber } from '../../../utils';
import { HELP_MAP } from '../../../constants/helpMap';
import Feedback from '../../ui/Feedback';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const STRATEGIES = {
  quantity: ['Grupla düşündüm 📦', 'Referans noktası kullandım 📏', 'Sezgisel tahmin yaptım 🧠', 'Yaklaşık saydım 🔢'],
  numberLine: ['Yarıyı referans aldım ½', 'Oranlayarak buldum 📐', 'Bildiğim sayılardan yola çıktım 🔑'],
  measurement: ['Referans nesneyi kullandım 📏', 'Karşılaştırarak tahmin ettim ⚖️', 'Günlük deneyimimden yararlandım 🏠'],
  computation: ['Sayıları yuvarladım 🔵', 'Kolay parçalara ayırdım ✂️', 'Aşina sayıları kullandım 💡'],
};

const ExplainStep = ({ type, onDone, prevBest }) => {
  const strats = STRATEGIES[type] || STRATEGIES.quantity;
  return (
    <div className="mt-2 anim-fade">
      <div className="text-xs font-bold text-indigo-600 mb-1.5 text-center">🤔 Hangi stratejiyi kullandın?</div>
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
  // Benchmark (Referans Noktası) Stratejisi Yaklaşımı
  // Kaynak: Joram ve ark. (2005); Hildreth (1983); DREME Stanford
  // Tüm değerler standart/ortalama ölçülere dayalı, tartışmasız
  const comps=[
    // Seviye 1: UZUNLUK — Vücut ölçüleri ve sınıf nesneleri (Benchmark: kendi vücudun)
    {id:1,ref:{name:'Cetvel (30 cm)',emoji:'📏',value:30,unit:'cm'},target:{name:'Kalem',emoji:'✏️',value:18,unit:'cm'},q:'Bir kalem yaklaşık kaç cm?',lv:1,opts:[8,18,35,50]},
    {id:2,ref:{name:'Karış (yaklaşık 20 cm)',emoji:'🖐️',value:20,unit:'cm'},target:{name:'A4 kağıt kısa kenarı',emoji:'📄',value:21,unit:'cm'},q:'A4 kağıdın kısa kenarı kaç cm?',lv:1,opts:[10,21,35,50]},
    {id:3,ref:{name:'Parmak genişliği (1 cm)',emoji:'☝️',value:1,unit:'cm'},target:{name:'Silgi',emoji:'🧹',value:5,unit:'cm'},q:'Bir silgi yaklaşık kaç cm uzunluğunda?',lv:1,opts:[2,5,12,20]},
    {id:4,ref:{name:'Adım (yaklaşık 50 cm)',emoji:'👟',value:50,unit:'cm'},target:{name:'Sıra genişliği',emoji:'🪑',value:50,unit:'cm'},q:'Okul sırası yaklaşık kaç cm genişliğinde?',lv:1,opts:[25,50,80,120]},
    {id:5,ref:{name:'Cetvel (30 cm)',emoji:'📏',value:30,unit:'cm'},target:{name:'Kitap uzunluğu',emoji:'📕',value:25,unit:'cm'},q:'Bir kitap yaklaşık kaç cm uzunluğunda?',lv:1,opts:[10,25,40,60]},
    {id:6,ref:{name:'Karış (yaklaşık 20 cm)',emoji:'🖐️',value:20,unit:'cm'},target:{name:'Ayakkabı uzunluğu',emoji:'👟',value:22,unit:'cm'},q:'Bir çocuk ayakkabısı yaklaşık kaç cm?',lv:1,opts:[12,22,35,45]},
    {id:7,ref:{name:'Çocuk boyu (120 cm)',emoji:'🧒',value:120,unit:'cm'},target:{name:'Kapı yüksekliği',emoji:'🚪',value:200,unit:'cm'},q:'Bir kapının yüksekliği yaklaşık kaç cm?',lv:1,opts:[120,160,200,250]},
    {id:8,ref:{name:'Adım (yaklaşık 50 cm)',emoji:'👟',value:50,unit:'cm'},target:{name:'Masa uzunluğu',emoji:'🍽️',value:120,unit:'cm'},q:'Yemek masası yaklaşık kaç cm uzunluğunda?',lv:1,opts:[60,120,200,300]},

    // Seviye 2: UZUNLUK — Dış mekan ve büyük nesneler
    {id:10,ref:{name:'1 metre (kol açıklığı)',emoji:'📏',value:100,unit:'cm'},target:{name:'Araba uzunluğu',emoji:'🚗',value:4,unit:'m'},q:'Bir otomobil yaklaşık kaç metre uzunluğunda?',lv:2,opts:[2,4,7,10]},
    {id:11,ref:{name:'1 metre',emoji:'📏',value:1,unit:'m'},target:{name:'Sınıf uzunluğu',emoji:'🏫',value:8,unit:'m'},q:'Bir sınıf odası yaklaşık kaç metre uzunluğunda?',lv:2,opts:[3,8,15,25]},
    {id:12,ref:{name:'Basketbol potası (3.05 m)',emoji:'🏀',value:305,unit:'cm'},target:{name:'Tek katlı bina',emoji:'🏠',value:3,unit:'m'},q:'Tek katlı bir binanın yüksekliği yaklaşık kaç metre?',lv:2,opts:[2,3,5,8]},
    {id:13,ref:{name:'Futbol sahası (100 m)',emoji:'⚽',value:100,unit:'m'},target:{name:'Olimpik yüzme havuzu',emoji:'🏊',value:50,unit:'m'},q:'Olimpik yüzme havuzu kaç metre?',lv:2,opts:[25,50,75,100]},
    {id:14,ref:{name:'A4 kağıt uzun kenar (30 cm)',emoji:'📄',value:30,unit:'cm'},target:{name:'Televizyon köşegen',emoji:'📺',value:100,unit:'cm'},q:'Bir televizyonun köşegeni yaklaşık kaç cm?',lv:2,opts:[50,100,150,200]},
    {id:15,ref:{name:'Çocuk boyu (120 cm)',emoji:'🧒',value:120,unit:'cm'},target:{name:'Bisiklet yüksekliği',emoji:'🚲',value:100,unit:'cm'},q:'Bir çocuk bisikletinin yüksekliği yaklaşık kaç cm?',lv:2,opts:[60,100,150,200]},
    {id:16,ref:{name:'1 metre',emoji:'📏',value:1,unit:'m'},target:{name:'Otobüs uzunluğu',emoji:'🚌',value:12,unit:'m'},q:'Bir şehir otobüsü yaklaşık kaç metre?',lv:2,opts:[6,12,20,30]},
    {id:17,ref:{name:'Adım (50 cm)',emoji:'👟',value:50,unit:'cm'},target:{name:'Masa yüksekliği',emoji:'🍽️',value:75,unit:'cm'},q:'Yemek masası yüksekliği yaklaşık kaç cm?',lv:2,opts:[45,75,110,150]},

    // Seviye 3: KÜTLE — Günlük nesneler (Benchmark: 1 kg paket)
    {id:20,ref:{name:'1 kg şeker paketi',emoji:'⚖️',value:1000,unit:'g'},target:{name:'Elma',emoji:'🍎',value:200,unit:'g'},q:'Bir elma yaklaşık kaç gram?',lv:3,opts:[50,200,500,1000]},
    {id:21,ref:{name:'1 kg şeker paketi',emoji:'⚖️',value:1000,unit:'g'},target:{name:'Yumurta',emoji:'🥚',value:60,unit:'g'},q:'Bir yumurta yaklaşık kaç gram?',lv:3,opts:[15,60,200,400]},
    {id:22,ref:{name:'1 litre su (1 kg)',emoji:'💧',value:1,unit:'kg'},target:{name:'Ekmek',emoji:'🍞',value:400,unit:'g'},q:'Bir ekmek yaklaşık kaç gram?',lv:3,opts:[100,400,800,1500]},
    {id:23,ref:{name:'1 kg şeker paketi',emoji:'⚖️',value:1000,unit:'g'},target:{name:'Cep telefonu',emoji:'📱',value:180,unit:'g'},q:'Bir cep telefonu yaklaşık kaç gram?',lv:3,opts:[50,180,500,900]},
    {id:24,ref:{name:'1 kg un paketi',emoji:'⚖️',value:1,unit:'kg'},target:{name:'Ders kitabı',emoji:'📘',value:500,unit:'g'},q:'Bir ders kitabı yaklaşık kaç gram?',lv:3,opts:[100,500,1000,2000]},
    {id:25,ref:{name:'1 litre su şişesi',emoji:'💧',value:1000,unit:'ml'},target:{name:'Su bardağı',emoji:'🥛',value:250,unit:'ml'},q:'Bir su bardağı yaklaşık kaç ml alır?',lv:3,opts:[50,250,600,1000]},
    {id:26,ref:{name:'1 litre süt kutusu',emoji:'🥛',value:1000,unit:'ml'},target:{name:'Çay bardağı',emoji:'🍵',value:100,unit:'ml'},q:'Bir çay bardağı yaklaşık kaç ml alır?',lv:3,opts:[30,100,300,500]},
    {id:27,ref:{name:'Pet şişe (500 ml)',emoji:'🍶',value:500,unit:'ml'},target:{name:'Yoğurt kabı',emoji:'🥣',value:200,unit:'ml'},q:'Küçük bir yoğurt kabı yaklaşık kaç ml?',lv:3,opts:[50,200,400,700]},

    // Seviye 4: KÜTLE ve HACİM — Büyük nesneler ve karışık birimler
    {id:30,ref:{name:'Yetişkin (70 kg)',emoji:'🧑',value:70,unit:'kg'},target:{name:'Bisiklet',emoji:'🚲',value:12,unit:'kg'},q:'Bir bisiklet yaklaşık kaç kg?',lv:4,opts:[5,12,25,40]},
    {id:31,ref:{name:'Dolu okul çantası (5 kg)',emoji:'🎒',value:5,unit:'kg'},target:{name:'Kedi',emoji:'🐱',value:4,unit:'kg'},q:'Bir ev kedisi yaklaşık kaç kg?',lv:4,opts:[1,4,10,20]},
    {id:32,ref:{name:'1 litre su',emoji:'💧',value:1000,unit:'ml'},target:{name:'Çay kaşığı',emoji:'🥄',value:5,unit:'ml'},q:'Bir çay kaşığı yaklaşık kaç ml?',lv:4,opts:[1,5,15,50]},
    {id:33,ref:{name:'Kova (10 litre)',emoji:'🪣',value:10,unit:'litre'},target:{name:'Küvet',emoji:'🛁',value:200,unit:'litre'},q:'Bir küvet yaklaşık kaç litre su alır?',lv:4,opts:[50,200,500,1000]},
    {id:34,ref:{name:'1 kg pirinç paketi',emoji:'⚖️',value:1000,unit:'g'},target:{name:'Karpuz',emoji:'🍉',value:5,unit:'kg'},q:'Bir karpuz yaklaşık kaç kg?',lv:4,opts:[2,5,10,20]},
    {id:35,ref:{name:'Çocuk (30 kg)',emoji:'🧒',value:30,unit:'kg'},target:{name:'Köpek (orta boy)',emoji:'🐕',value:15,unit:'kg'},q:'Orta boy bir köpek yaklaşık kaç kg?',lv:4,opts:[5,15,30,50]},
    {id:36,ref:{name:'1 litre su şişesi',emoji:'💧',value:1,unit:'litre'},target:{name:'Çamaşır makinesi kapasitesi',emoji:'🧺',value:50,unit:'litre'},q:'Bir çamaşır makinesi yaklaşık kaç litre su kullanır?',lv:4,opts:[10,50,150,300]},
    {id:37,ref:{name:'Büyük pizza (800 g)',emoji:'🍕',value:800,unit:'g'},target:{name:'Hamburger',emoji:'🍔',value:250,unit:'g'},q:'Bir hamburger yaklaşık kaç gram?',lv:4,opts:[100,250,500,800]},
  ];
  const gen=(l,u)=>{const av=comps.filter(c=>c.lv<=l&&!u.includes(c.id));const pool=av.length>0?av:comps.filter(c=>c.lv<=l);const c=pool[Math.floor(Math.random()*pool.length)];return{...c,opts:shuffle(c.opts)};};
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setUsed([]);const f=gen(l,[]);setP(f);setUsed([f.id]);setUa(null);setGs('playing');};
  const handle=(a)=>{setUa(a);if(a===p?.target?.value)setSc(s=>s+20*lv);setExplained2(false);};
  const handleExplain2=()=>{setExplained2(true);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);const n=gen(lv,used);setP(n);setUsed(prev=>[...prev,n.id]);setUa(null);setExplained2(false);}else setGs('results');},800);};
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Ölçme Tahmini" emoji="📐" description="Nesnelerin uzunluk, ağırlık veya hacimlerini referansa bakarak tahmin et!" levels={['Seviye 1 (Uzunluk Kolay)','Seviye 2 (Uzunluk İleri)','Seviye 3 (Kütle/Hacim Kolay)','Seviye 4 (Kütle/Hacim İleri)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Ölçme Tahmini" emoji="📐" level={lv} instruction="Bir referans nesne ve onun ölçüsü gösterilecek. Hedef nesnenin ölçüsünü karşılaştırarak tahmin et!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Ölçme Tahmini" colors={colors}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
      <div className="bg-green-100 p-4 rounded-2xl shadow-lg mb-3 border-2 border-green-300 text-center"><span className="text-4xl">{p?.ref?.emoji}</span><div className="font-bold text-green-700">{p?.ref?.name}</div><div className="text-2xl font-bold text-green-600">{p?.ref?.value} {p?.ref?.unit}</div></div>
      <div className="bg-white p-4 rounded-xl shadow-xl mb-3 border-2 border-amber-300 text-center"><span className="text-4xl">{p?.target?.emoji}</span><div className="font-bold text-gray-700 text-lg mt-2">{p?.q || `${p?.target?.name} yaklaşık kaç ${p?.target?.unit}?`}</div></div>
      {ua!==null?(<div className="text-center"><div className={`text-2xl font-bold mb-2 ${ua===p?.target?.value?'text-green-500':'text-orange-500'}`}>{ua===p?.target?.value?'✓ Doğru!':`${encourage()} Cevap: ${p?.target?.value} ${p?.target?.unit}`}</div><div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700 mt-2">💡 {p?.ref?.name} ({p?.ref?.value} {p?.ref?.unit}) referans alındığında {p?.target?.name} yaklaşık {p?.target?.value} {p?.target?.unit} eder.</div>{!explained2 && <ExplainStep type="measurement" onDone={handleExplain2}/>}{explained2 && <div className="text-xs text-green-600 mt-2 font-medium anim-fade">{'✓'} Güzel strateji!</div>}</div>):(<div className="grid grid-cols-2 gap-3">{p?.opts?.map((o,i)=>(<button key={i} onClick={()=>handle(o)} className={`px-6 py-4 ${colors?.button} text-white rounded-xl font-bold text-xl shadow-lg`}>{o} {p?.target?.unit}</button>))}</div>)}

      </div>    </div>
  );
};

export default OlcmeTahmini;

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
  // Benchmark (Referans Noktası) Stratejisi
  // Kaynak: Joram ve ark. (2005); NCTM (2000); DREME Stanford
  // İlke: Referans kesin ve bilinen bir ölçü, hedef somut ve doğrulanabilir
  // Tüm referanslar çocuğun günlük hayatından bildiği sabit ölçüler
  const comps=[
    // Seviye 1: UZUNLUK — Kesin referanslarla sınıf nesneleri
    // Referanslar: cetvel=30cm, parmak genişliği=1cm, A4 kısa kenar=21cm (ISO standart)
    {id:1,ref:{name:'Cetvel',emoji:'📏',value:30,unit:'cm'},target:{name:'Kurşun kalem (standart)',emoji:'✏️',value:19,unit:'cm'},q:'Standart bir kurşun kalem kaç cm uzunluğundadır?',lv:1,opts:[10,19,30,45],hint:'Cetvelin yaklaşık üçte ikisi kadar'},
    {id:2,ref:{name:'Cetvel',emoji:'📏',value:30,unit:'cm'},target:{name:'A4 kağıt kısa kenarı',emoji:'📄',value:21,unit:'cm'},q:'A4 kağıdın kısa kenarı kaç cm?',lv:1,opts:[15,21,30,42],hint:'Uluslararası kağıt standardı: 21 × 29.7 cm'},
    {id:3,ref:{name:'Cetvel',emoji:'📏',value:30,unit:'cm'},target:{name:'Standart silgi',emoji:'🧽',value:6,unit:'cm'},q:'Standart bir silgi kaç cm uzunluğundadır?',lv:1,opts:[3,6,12,20],hint:'Cetvelin beşte biri kadar'},
    {id:4,ref:{name:'Cetvel',emoji:'📏',value:30,unit:'cm'},target:{name:'Ders kitabı uzun kenarı',emoji:'📕',value:28,unit:'cm'},q:'Bir ders kitabının uzun kenarı yaklaşık kaç cm?',lv:1,opts:[15,28,40,55],hint:'Neredeyse cetvel kadar'},
    {id:5,ref:{name:'Cetvel',emoji:'📏',value:30,unit:'cm'},target:{name:'A4 kağıt uzun kenarı',emoji:'📄',value:30,unit:'cm'},q:'A4 kağıdın uzun kenarı kaç cm?',lv:1,opts:[21,25,30,40],hint:'Tam bir cetvel uzunluğu!'},
    {id:6,ref:{name:'Parmak genişliği',emoji:'☝️',value:1,unit:'cm'},target:{name:'Ataş uzunluğu',emoji:'📎',value:3,unit:'cm'},q:'Bir ataş kaç cm uzunluğundadır?',lv:1,opts:[1,3,6,10],hint:'Yaklaşık 3 parmak genişliği'},
    {id:7,ref:{name:'Parmak genişliği',emoji:'☝️',value:1,unit:'cm'},target:{name:'USB bellek uzunluğu',emoji:'💾',value:6,unit:'cm'},q:'Bir USB bellek yaklaşık kaç cm?',lv:1,opts:[3,6,12,20],hint:'Yaklaşık 6 parmak genişliği'},
    {id:8,ref:{name:'Cetvel',emoji:'📏',value:30,unit:'cm'},target:{name:'Boya kalemi',emoji:'🖍️',value:9,unit:'cm'},q:'Bir mum boya kalemi kaç cm uzunluğundadır?',lv:1,opts:[4,9,18,25],hint:'Cetvelin yaklaşık üçte biri'},

    // Seviye 2: UZUNLUK — Kesin referanslarla büyük nesneler
    // Referanslar: 1m=100cm (kesin), kapı yüksekliği=200cm (TSE standart)
    {id:10,ref:{name:'1 metre (100 cm)',emoji:'📏',value:100,unit:'cm'},target:{name:'Standart kapı yüksekliği',emoji:'🚪',value:200,unit:'cm'},q:'Standart bir iç kapının yüksekliği kaç cm?',lv:2,opts:[150,200,250,300],hint:'TSE standardı: tam 2 metre'},
    {id:11,ref:{name:'1 metre (100 cm)',emoji:'📏',value:100,unit:'cm'},target:{name:'Standart masa yüksekliği',emoji:'🍽️',value:75,unit:'cm'},q:'Standart yemek masası yüksekliği kaç cm?',lv:2,opts:[55,75,100,130],hint:'Yaklaşık 1 metrenin dörtte üçü'},
    {id:12,ref:{name:'1 metre (100 cm)',emoji:'📏',value:100,unit:'cm'},target:{name:'Standart sandalye oturak yüksekliği',emoji:'🪑',value:45,unit:'cm'},q:'Sandalyenin oturak yüksekliği kaç cm?',lv:2,opts:[30,45,65,90],hint:'Yaklaşık yarım metre'},
    {id:13,ref:{name:'1 metre (100 cm)',emoji:'📏',value:1,unit:'m'},target:{name:'Otomobil uzunluğu',emoji:'🚗',value:4,unit:'m'},q:'Bir otomobil yaklaşık kaç metre uzunluğundadır?',lv:2,opts:[2,4,8,12],hint:'Yaklaşık 4 metre çubuk yan yana'},
    {id:14,ref:{name:'Olimpik yüzme havuzu',emoji:'🏊',value:50,unit:'m'},target:{name:'Futbol sahası uzunluğu',emoji:'⚽',value:100,unit:'m'},q:'Bir futbol sahası kaç metre uzunluğundadır?',lv:2,opts:[50,100,200,400],hint:'FIFA standardı: tam 100 metre'},
    {id:15,ref:{name:'1 metre (100 cm)',emoji:'📏',value:1,unit:'m'},target:{name:'Şehir otobüsü uzunluğu',emoji:'🚌',value:12,unit:'m'},q:'Bir şehir otobüsü yaklaşık kaç metre?',lv:2,opts:[6,12,20,30],hint:'Standart solo otobüs: 12 metre'},
    {id:16,ref:{name:'1 metre (100 cm)',emoji:'📏',value:100,unit:'cm'},target:{name:'Okul tahtası genişliği',emoji:'📋',value:120,unit:'cm'},q:'Bir okul tahtasının genişliği yaklaşık kaç cm?',lv:2,opts:[80,120,180,250],hint:'1 metreden biraz fazla'},
    {id:17,ref:{name:'Standart kapı (200 cm)',emoji:'🚪',value:200,unit:'cm'},target:{name:'Basketbol potası yüksekliği',emoji:'🏀',value:305,unit:'cm'},q:'Basketbol potası yerden kaç cm yüksekliktedir?',lv:2,opts:[200,250,305,400],hint:'FIBA standardı: 3 metre 5 cm'},

    // Seviye 3: KÜTLE ve HACİM — Standart ambalajlarla
    // Referanslar: 1kg şeker (kesin), 1L su=1kg (fizik yasası), yumurta L=63g (TSE)
    {id:20,ref:{name:'1 kg şeker paketi',emoji:'⚖️',value:1000,unit:'g'},target:{name:'Büyük boy yumurta (L)',emoji:'🥚',value:63,unit:'g'},q:'Büyük boy (L) bir yumurta kaç gram?',lv:3,opts:[20,63,150,300],hint:'TSE standardı: 63-73 gram arası'},
    {id:21,ref:{name:'1 kg şeker paketi',emoji:'⚖️',value:1000,unit:'g'},target:{name:'Orta boy elma',emoji:'🍎',value:180,unit:'g'},q:'Orta boy bir elma yaklaşık kaç gram?',lv:3,opts:[50,180,400,800],hint:'Yaklaşık 5-6 yumurta ağırlığında'},
    {id:22,ref:{name:'1 litre su (= 1 kg)',emoji:'💧',value:1000,unit:'g'},target:{name:'Somun ekmek',emoji:'🍞',value:750,unit:'g'},q:'Standart bir somun ekmek kaç gram?',lv:3,opts:[250,500,750,1200],hint:'Fırın standardı: 750 gram'},
    {id:23,ref:{name:'1 litre su şişesi',emoji:'💧',value:1000,unit:'ml'},target:{name:'Standart su bardağı',emoji:'🥛',value:200,unit:'ml'},q:'Standart bir su bardağı kaç ml alır?',lv:3,opts:[50,200,500,800],hint:'1 litrelik şişeyi 5 bardağa doldurabilirsin'},
    {id:24,ref:{name:'1 litre süt kutusu',emoji:'🥛',value:1000,unit:'ml'},target:{name:'İnce belli çay bardağı',emoji:'🍵',value:100,unit:'ml'},q:'İnce belli çay bardağı kaç ml alır?',lv:3,opts:[30,100,250,500],hint:'1 litrede 10 çay bardağı var'},
    {id:25,ref:{name:'Pet şişe',emoji:'🍶',value:500,unit:'ml'},target:{name:'Kutu kola',emoji:'🥤',value:330,unit:'ml'},q:'Bir kutu kola kaç ml?',lv:3,opts:[150,330,500,750],hint:'Kutunun üzerinde yazar: 330 ml'},
    {id:26,ref:{name:'1 kg şeker paketi',emoji:'⚖️',value:1000,unit:'g'},target:{name:'Standart çikolata',emoji:'🍫',value:80,unit:'g'},q:'Standart bir tablet çikolata kaç gram?',lv:3,opts:[30,80,200,500],hint:'Ambalajda yazar: genellikle 80g'},
    {id:27,ref:{name:'1 litre su şişesi',emoji:'💧',value:1000,unit:'ml'},target:{name:'Yemek kaşığı',emoji:'🥄',value:15,unit:'ml'},q:'Bir yemek kaşığı kaç ml alır?',lv:3,opts:[5,15,50,100],hint:'1 litre = yaklaşık 67 yemek kaşığı'},

    // Seviye 4: KÜTLE ve HACİM — Büyük ölçekler
    {id:30,ref:{name:'1 kg şeker paketi',emoji:'⚖️',value:1,unit:'kg'},target:{name:'Orta boy karpuz',emoji:'🍉',value:5,unit:'kg'},q:'Orta boy bir karpuz yaklaşık kaç kg?',lv:4,opts:[2,5,10,20],hint:'Yaklaşık 5 şeker paketi ağırlığında'},
    {id:31,ref:{name:'1 litre su şişesi',emoji:'💧',value:1,unit:'litre'},target:{name:'Standart kova',emoji:'🪣',value:10,unit:'litre'},q:'Standart bir kova kaç litre su alır?',lv:4,opts:[3,10,25,50],hint:'10 tane 1 litrelik şişe sığar'},
    {id:32,ref:{name:'Çay kaşığı (5 ml)',emoji:'🥄',value:5,unit:'ml'},target:{name:'Yemek kaşığı',emoji:'🥄',value:15,unit:'ml'},q:'Bir yemek kaşığı kaç ml? (İpucu: Çay kaşığı 5 ml)',lv:4,opts:[5,15,30,50],hint:'Tam 3 çay kaşığı = 1 yemek kaşığı'},
    {id:33,ref:{name:'1 kg şeker paketi',emoji:'⚖️',value:1,unit:'kg'},target:{name:'Dolu okul çantası',emoji:'🎒',value:5,unit:'kg'},q:'Kitaplarla dolu bir okul çantası yaklaşık kaç kg?',lv:4,opts:[2,5,10,20],hint:'Yaklaşık 5 şeker paketi kadar ağır'},
    {id:34,ref:{name:'1 litre su (1 kg)',emoji:'💧',value:1,unit:'litre'},target:{name:'Küvet (dolu)',emoji:'🛁',value:200,unit:'litre'},q:'Dolu bir küvet yaklaşık kaç litre su alır?',lv:4,opts:[50,200,500,1000],hint:'200 tane 1 litrelik şişe!'},
    {id:35,ref:{name:'1 kg şeker paketi',emoji:'⚖️',value:1000,unit:'g'},target:{name:'Cep telefonu',emoji:'📱',value:200,unit:'g'},q:'Bir cep telefonu yaklaşık kaç gram?',lv:4,opts:[50,200,500,1000],hint:'Yaklaşık şeker paketinin beşte biri'},
    {id:36,ref:{name:'1 litre su şişesi',emoji:'💧',value:1000,unit:'ml'},target:{name:'Damacana',emoji:'💧',value:19,unit:'litre'},q:'Bir damacana kaç litre su alır?',lv:4,opts:[5,10,19,30],hint:'Damacananın üzerinde yazar: 19 litre'},
    {id:37,ref:{name:'1 kg paket',emoji:'⚖️',value:1,unit:'kg'},target:{name:'1 litre süt',emoji:'🥛',value:1030,unit:'g'},q:'1 litre süt yaklaşık kaç gram?',lv:4,opts:[500,800,1030,1500],hint:'Su 1000g, süt biraz daha ağır: 1030g'},
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
      {ua!==null?(<div className="text-center"><div className={`text-2xl font-bold mb-2 ${ua===p?.target?.value?'text-green-500':'text-orange-500'}`}>{ua===p?.target?.value?'✓ Doğru!':`${encourage()} Cevap: ${p?.target?.value} ${p?.target?.unit}`}</div><div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700 mt-2">💡 {p?.hint || `${p?.ref?.name} (${p?.ref?.value} ${p?.ref?.unit}) referans alındığında ${p?.target?.name} yaklaşık ${p?.target?.value} ${p?.target?.unit} eder.`}</div>{!explained2 && <ExplainStep type="measurement" onDone={handleExplain2}/>}{explained2 && <div className="text-xs text-green-600 mt-2 font-medium anim-fade">{'✓'} Güzel strateji!</div>}</div>):(<div className="grid grid-cols-2 gap-3">{p?.opts?.map((o,i)=>(<button key={i} onClick={()=>handle(o)} className={`px-6 py-4 ${colors?.button} text-white rounded-xl font-bold text-xl shadow-lg`}>{o} {p?.target?.unit}</button>))}</div>)}

      </div>    </div>
  );
};

export default OlcmeTahmini;

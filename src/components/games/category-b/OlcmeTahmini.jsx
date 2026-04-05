import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TOTAL_ROUNDS, playSound, vibrate, encourage, speakNumber } from '../../../utils';
import { HELP_MAP } from '../../../constants/helpMap';
import Feedback from '../../ui/Feedback';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const STRATEGIES = {
  quantity: ['Grupla d\u00FC\u015F\u00FCnd\u00FCm \uD83D\uDCE6', 'Referans noktas\u0131 kulland\u0131m \uD83D\uDCCF', 'Sezgisel tahmin yapt\u0131m \uD83E\uDDE0', 'Yakla\u015F\u0131k sayd\u0131m \uD83D\uDD22'],
  numberLine: ['Yar\u0131y\u0131 referans ald\u0131m \u00BD', 'Oranlayarak buldum \uD83D\uDCD0', 'Bildi\u011Fim say\u0131lardan yola \u00E7\u0131kt\u0131m \uD83D\uDD11'],
  measurement: ['Referans nesneyi kulland\u0131m \uD83D\uDCCF', 'Kar\u015F\u0131la\u015Ft\u0131rarak tahmin ettim \u2696\uFE0F', 'G\u00FCnl\u00FCk deneyimimden yararland\u0131m \uD83C\uDFE0'],
  computation: ['Say\u0131lar\u0131 yuvarlad\u0131m \uD83D\uDD35', 'Kolay par\u00E7alara ay\u0131rd\u0131m \u2702\uFE0F', 'A\u015Fina say\u0131lar\u0131 kulland\u0131m \uD83D\uDCA1'],
};

const ExplainStep = ({ type, onDone }) => {
  const strats = STRATEGIES[type] || STRATEGIES.quantity;
  return (
    <div className="mt-2 anim-fade">
      <div className="text-xs font-bold text-indigo-600 mb-1.5 text-center">{'\uD83E\uDD14'} Hangi stratejiyi kulland\u0131n?</div>
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
    {id:1,ref:{name:'Cetvel',emoji:'\uD83D\uDCCF',value:30,unit:'cm'},target:{name:'Kalem',emoji:'\u270F\uFE0F',value:15,unit:'cm'},opts:[5,15,40,80],lv:1},
    {id:2,ref:{name:'Kap\u0131 y\u00FCksekli\u011Fi',emoji:'\uD83D\uDEAA',value:200,unit:'cm'},target:{name:'Masa y\u00FCksekli\u011Fi',emoji:'\uD83C\uDF7D\uFE0F',value:75,unit:'cm'},opts:[30,75,150,200],lv:1},
    {id:3,ref:{name:'Araba uzunlu\u011Fu',emoji:'\uD83D\uDE97',value:4,unit:'m'},target:{name:'Otob\u00FCs uzunlu\u011Fu',emoji:'\uD83D\uDE8C',value:12,unit:'m'},opts:[6,12,20,30],lv:1},
    {id:4,ref:{name:'Araba uzunlu\u011Fu',emoji:'\uD83D\uDE97',value:4,unit:'m'},target:{name:'Bisiklet uzunlu\u011Fu',emoji:'\uD83D\uDEB2',value:2,unit:'m'},opts:[1,2,4,6],lv:1},
    {id:50,ref:{name:'Ad\u0131m boyu',emoji:'\uD83E\uDDB6',value:60,unit:'cm'},target:{name:'S\u0131n\u0131f tahtas\u0131 geni\u015Fli\u011Fi',emoji:'\uD83C\uDFEB',value:300,unit:'cm'},opts:[100,200,300,500],lv:1},
    {id:51,ref:{name:'Kar\u0131\u015F',emoji:'\uD83D\uDD90\uFE0F',value:20,unit:'cm'},target:{name:'Kitap uzunlu\u011Fu',emoji:'\uD83D\uDCD5',value:25,unit:'cm'},opts:[10,25,40,60],lv:1},
    {id:52,ref:{name:'Parmak geni\u015Fli\u011Fi',emoji:'\u261D\uFE0F',value:1,unit:'cm'},target:{name:'Silgi uzunlu\u011Fu',emoji:'\uD83E\uDDFC',value:5,unit:'cm'},opts:[2,5,10,15],lv:1},
    {id:53,ref:{name:'Bebekboyu',emoji:'\uD83D\uDC76',value:50,unit:'cm'},target:{name:'Yast\u0131k uzunlu\u011Fu',emoji:'\uD83D\uDECF\uFE0F',value:70,unit:'cm'},opts:[30,50,70,100],lv:1},
    {id:54,ref:{name:'Direksiyon geni\u015Fli\u011Fi',emoji:'\uD83D\uDEDE',value:40,unit:'cm'},target:{name:'Pizza geni\u015Fli\u011Fi',emoji:'\uD83C\uDF55',value:30,unit:'cm'},opts:[15,30,50,70],lv:1},
    {id:55,ref:{name:'\u00C7ocuk boyu',emoji:'\uD83E\uDDD2',value:120,unit:'cm'},target:{name:'Dolap y\u00FCksekli\u011Fi',emoji:'\uD83D\uDDC4\uFE0F',value:180,unit:'cm'},opts:[100,140,180,220],lv:1},
    {id:56,ref:{name:'Ayak uzunlu\u011Fu',emoji:'\uD83D\uDC5F',value:25,unit:'cm'},target:{name:'Tablet uzunlu\u011Fu',emoji:'\uD83D\uDCBB',value:24,unit:'cm'},opts:[12,24,35,50],lv:1},
    {id:57,ref:{name:'Masa uzunlu\u011Fu',emoji:'\uD83C\uDF7D\uFE0F',value:120,unit:'cm'},target:{name:'Pencere geni\u015Fli\u011Fi',emoji:'\uD83E\uDE9F',value:100,unit:'cm'},opts:[60,100,150,200],lv:1},
    // Seviye 2: UZUNLUK (Ileri)
    {id:5,ref:{name:'Cetvel',emoji:'\uD83D\uDCCF',value:30,unit:'cm'},target:{name:'Defter uzunlu\u011Fu',emoji:'\uD83D\uDCD3',value:24,unit:'cm'},opts:[10,24,50,80],lv:2},
    {id:6,ref:{name:'Basketbol topu geni\u015Fli\u011Fi',emoji:'\uD83C\uDFC0',value:24,unit:'cm'},target:{name:'Tenis topu geni\u015Fli\u011Fi',emoji:'\uD83C\uDFBE',value:7,unit:'cm'},opts:[3,7,15,24],lv:2},
    {id:7,ref:{name:'A4 ka\u011F\u0131t uzunlu\u011Fu',emoji:'\uD83D\uDCC4',value:30,unit:'cm'},target:{name:'A4 ka\u011F\u0131t geni\u015Fli\u011Fi',emoji:'\uD83D\uDCC4',value:21,unit:'cm'},opts:[10,21,40,60],lv:2},
    {id:8,ref:{name:'Kap\u0131 geni\u015Fli\u011Fi',emoji:'\uD83D\uDEAA',value:80,unit:'cm'},target:{name:'Buzdolab\u0131 geni\u015Fli\u011Fi',emoji:'\uD83E\uDDCA',value:60,unit:'cm'},opts:[30,60,90,120],lv:2},
    {id:58,ref:{name:'Futbol kalesi geni\u015Fli\u011Fi',emoji:'\uD83E\uDD45',value:7,unit:'m'},target:{name:'Voleybol a\u011F\u0131 uzunlu\u011Fu',emoji:'\uD83E\uDD45',value:9,unit:'m'},opts:[5,9,14,18],lv:2},
    {id:59,ref:{name:'Televizyon geni\u015Fli\u011Fi',emoji:'\uD83D\uDCFA',value:55,unit:'inch'},target:{name:'Laptop geni\u015Fli\u011Fi',emoji:'\uD83D\uDCBB',value:15,unit:'inch'},opts:[10,15,25,40],lv:2},
    {id:60,ref:{name:'Y\u00FCzme havuzu',emoji:'\uD83C\uDFCA',value:25,unit:'m'},target:{name:'S\u0131n\u0131f uzunlu\u011Fu',emoji:'\uD83C\uDFEB',value:8,unit:'m'},opts:[4,8,15,25],lv:2},
    {id:61,ref:{name:'Gitar uzunlu\u011Fu',emoji:'\uD83C\uDFB8',value:100,unit:'cm'},target:{name:'Keman uzunlu\u011Fu',emoji:'\uD83C\uDFBB',value:60,unit:'cm'},opts:[30,60,90,120],lv:2},
    {id:62,ref:{name:'Z\u00FCrafa boynu',emoji:'\uD83E\uDD92',value:2,unit:'m'},target:{name:'Fil y\u00FCksekli\u011Fi',emoji:'\uD83D\uDC18',value:3,unit:'m'},opts:[1,3,5,8],lv:2},
    {id:63,ref:{name:'Kol uzunlu\u011Fu',emoji:'\uD83D\uDCAA',value:60,unit:'cm'},target:{name:'Bacak uzunlu\u011Fu',emoji:'\uD83E\uDDB5',value:80,unit:'cm'},opts:[50,80,110,140],lv:2},
    {id:64,ref:{name:'Bant rulosu geni\u015Fli\u011Fi',emoji:'\uD83D\uDD35',value:5,unit:'cm'},target:{name:'Kol saati geni\u015Fli\u011Fi',emoji:'\u231A',value:4,unit:'cm'},opts:[2,4,7,10],lv:2},
    {id:65,ref:{name:'Merdiven basama\u011F\u0131',emoji:'\uD83E\uDE9C',value:20,unit:'cm'},target:{name:'Tabure y\u00FCksekli\u011Fi',emoji:'\uD83E\uDE91',value:45,unit:'cm'},opts:[25,45,70,100],lv:2},
    // Seviye 3: KUTLE ve HACIM (Kolay)
    {id:9,ref:{name:'1 kg \u015Feker',emoji:'\u2696\uFE0F',value:1000,unit:'g'},target:{name:'Elma',emoji:'\uD83C\uDF4E',value:200,unit:'g'},opts:[50,200,500,1000],lv:3},
    {id:10,ref:{name:'1 kg un',emoji:'\u2696\uFE0F',value:1000,unit:'g'},target:{name:'Yumurta',emoji:'\uD83E\uDD5A',value:60,unit:'g'},opts:[10,60,200,500],lv:3},
    {id:11,ref:{name:'Bebek do\u011Fum a\u011F\u0131rl\u0131\u011F\u0131',emoji:'\uD83D\uDC76',value:3500,unit:'g'},target:{name:'Karpuz',emoji:'\uD83C\uDF49',value:3000,unit:'g'},opts:[500,1500,3000,5000],lv:3},
    {id:12,ref:{name:'1 litre su',emoji:'\uD83E\uDED7',value:1000,unit:'ml'},target:{name:'Su barda\u011F\u0131',emoji:'\uD83E\uDD5B',value:250,unit:'ml'},opts:[50,250,600,1000],lv:3},
    {id:66,ref:{name:'1 litre s\u00FCt',emoji:'\uD83E\uDD5B',value:1000,unit:'ml'},target:{name:'\u00C7ay barda\u011F\u0131',emoji:'\uD83C\uDF75',value:100,unit:'ml'},opts:[50,100,300,500],lv:3},
    {id:67,ref:{name:'Cep telefonu',emoji:'\uD83D\uDCF1',value:180,unit:'g'},target:{name:'Tablet',emoji:'\uD83D\uDCBB',value:500,unit:'g'},opts:[200,500,900,1500],lv:3},
    {id:68,ref:{name:'Futbol topu',emoji:'\u26BD',value:430,unit:'g'},target:{name:'Tenis topu',emoji:'\uD83C\uDFBE',value:58,unit:'g'},opts:[20,58,150,300],lv:3},
    {id:69,ref:{name:'Kedi a\u011F\u0131rl\u0131\u011F\u0131',emoji:'\uD83D\uDC31',value:4,unit:'kg'},target:{name:'Tav\u015Fan a\u011F\u0131rl\u0131\u011F\u0131',emoji:'\uD83D\uDC30',value:2,unit:'kg'},opts:[1,2,4,8],lv:3},
    {id:70,ref:{name:'Pet \u015Fi\u015Fe',emoji:'\uD83C\uDF76',value:500,unit:'ml'},target:{name:'Yo\u011Furt kab\u0131',emoji:'\uD83E\uDD63',value:200,unit:'ml'},opts:[100,200,400,700],lv:3},
    {id:71,ref:{name:'\u00C7ikolata bar',emoji:'\uD83C\uDF6B',value:80,unit:'g'},target:{name:'Ceviz',emoji:'\uD83E\uDD5C',value:10,unit:'g'},opts:[3,10,30,60],lv:3},
    {id:72,ref:{name:'Okul \u00E7antas\u0131 (dolu)',emoji:'\uD83C\uDF92',value:5,unit:'kg'},target:{name:'Ders kitab\u0131',emoji:'\uD83D\uDCD8',value:500,unit:'g'},opts:[200,500,1000,2000],lv:3},
    {id:73,ref:{name:'1 litre meyve suyu',emoji:'\uD83E\uDDC3',value:1000,unit:'ml'},target:{name:'Ka\u015F\u0131k',emoji:'\uD83E\uDD44',value:15,unit:'ml'},opts:[5,15,50,100],lv:3},
    // Seviye 4: KUTLE ve HACIM (Ileri)
    {id:13,ref:{name:'1 litre su',emoji:'\uD83E\uDED7',value:1000,unit:'ml'},target:{name:'\u00C7ay ka\u015F\u0131\u011F\u0131',emoji:'\uD83E\uDD44',value:5,unit:'ml'},opts:[1,5,20,100],lv:4},
    {id:14,ref:{name:'K\u00FCvet',emoji:'\uD83D\uDEC1',value:200,unit:'litre'},target:{name:'Kova',emoji:'\uD83E\uDEA3',value:10,unit:'litre'},opts:[5,10,25,50],lv:4},
    {id:15,ref:{name:'1 kg pirin\u00E7',emoji:'\uD83C\uDF5A',value:1000,unit:'g'},target:{name:'Ekmek',emoji:'\uD83C\uDF5E',value:400,unit:'g'},opts:[100,400,800,1500],lv:4},
    {id:16,ref:{name:'K\u00F6pek a\u011F\u0131rl\u0131\u011F\u0131',emoji:'\uD83D\uDC15',value:15,unit:'kg'},target:{name:'Portakal',emoji:'\uD83C\uDF4A',value:150,unit:'g'},opts:[30,150,500,1000],lv:4},
    {id:74,ref:{name:'\u0130nsan v\u00FCcudu',emoji:'\uD83E\uDDD1',value:70,unit:'kg'},target:{name:'Bisiklet',emoji:'\uD83D\uDEB2',value:12,unit:'kg'},opts:[5,12,25,40],lv:4},
    {id:75,ref:{name:'Otomobil',emoji:'\uD83D\uDE97',value:1500,unit:'kg'},target:{name:'Motor',emoji:'\uD83C\uDFCD\uFE0F',value:200,unit:'kg'},opts:[80,200,500,800],lv:4},
    {id:76,ref:{name:'Havuz',emoji:'\uD83C\uDFCA',value:50000,unit:'litre'},target:{name:'\u00C7ama\u015F\u0131r makinesi',emoji:'\uD83E\uDDFA',value:60,unit:'litre'},opts:[20,60,150,300],lv:4},
    {id:77,ref:{name:'Kalem kutusu',emoji:'\uD83E\uDDF0',value:300,unit:'g'},target:{name:'Silgi',emoji:'\uD83E\uDDFC',value:30,unit:'g'},opts:[10,30,80,200],lv:4},
    {id:78,ref:{name:'Bebek a\u011F\u0131rl\u0131\u011F\u0131',emoji:'\uD83D\uDC76',value:3,unit:'kg'},target:{name:'S\u0131rt \u00E7antas\u0131 (bo\u015F)',emoji:'\uD83C\uDF92',value:800,unit:'g'},opts:[300,800,1500,3000],lv:4},
    {id:79,ref:{name:'Kahve fincan\u0131',emoji:'\u2615',value:150,unit:'ml'},target:{name:'Damacana',emoji:'\uD83D\uDEB0',value:19000,unit:'ml'},opts:[5000,10000,19000,30000],lv:4},
    {id:80,ref:{name:'B\u00FCy\u00FCk pizza',emoji:'\uD83C\uDF55',value:800,unit:'g'},target:{name:'Hamburger',emoji:'\uD83C\uDF54',value:250,unit:'g'},opts:[100,250,500,800],lv:4},
    {id:81,ref:{name:'Penguen',emoji:'\uD83D\uDC27',value:30,unit:'kg'},target:{name:'Papa\u011Fan',emoji:'\uD83E\uDD9C',value:1,unit:'kg'},opts:[1,3,8,15],lv:4},
  ];
  const gen=(l,u)=>{const av=comps.filter(c=>c.lv<=l&&!u.includes(c.id));const pool=av.length>0?av:comps.filter(c=>c.lv<=l);const c=pool[Math.floor(Math.random()*pool.length)];return{...c,opts:c.opts.sort(()=>Math.random()-0.5)};};
  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);setUsed([]);const f=gen(l,[]);setP(f);setUsed([f.id]);setUa(null);setGs('playing');};
  const handle=(a)=>{setUa(a);if(a===p?.target?.value)setSc(s=>s+20*lv);setExplained2(false);};
  const handleExplain2=()=>{setExplained2(true);setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);const n=gen(lv,used);setP(n);setUsed(prev=>[...prev,n.id]);setUa(null);setExplained2(false);}else setGs('results');},800);};
  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="\u00D6l\u00E7me Tahmini" emoji="\uD83D\uDCD0" description="Nesnelerin uzunluk, a\u011F\u0131rl\u0131k veya hacimlerini referansa bakarak tahmin et!" levels={['Seviye 1 (Uzunluk Kolay)','Seviye 2 (Uzunluk \u0130leri)','Seviye 3 (K\u00FCtle/Hacim Kolay)','Seviye 4 (K\u00FCtle/Hacim \u0130leri)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="\u00D6l\u00E7me Tahmini" emoji="\uD83D\uDCD0" level={lv} instruction="Bir referans nesne ve onun \u00F6l\u00E7\u00FCs\u00FC g\u00F6sterilecek. Hedef nesnenin \u00F6l\u00E7\u00FCs\u00FCn\u00FC kar\u015F\u0131la\u015Ft\u0131rarak tahmin et!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;
  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="\u00D6l\u00E7me Tahmini" colors={colors}/>
      <div className="bg-green-100 p-4 rounded-2xl shadow-lg mb-3 border-2 border-green-300 text-center"><span className="text-4xl">{p?.ref?.emoji}</span><div className="font-bold text-green-700">{p?.ref?.name}</div><div className="text-2xl font-bold text-green-600">{p?.ref?.value} {p?.ref?.unit}</div></div>
      <div className="bg-white p-3 rounded-xl shadow-xl mb-3 border-2 border-amber-300 text-center"><span className="text-4xl">{p?.target?.emoji}</span><div className="font-bold text-gray-700 text-lg mt-2">{p?.target?.name}</div><div className="text-amber-600 font-medium">Yakla\u015F\u0131k ka\u00E7 {p?.target?.unit}?</div></div>
      {ua!==null?(<div className="text-center"><div className={`text-2xl font-bold mb-2 ${ua===p?.target?.value?'text-green-500':'text-orange-500'}`}>{ua===p?.target?.value?'\u2713 Do\u011Fru!':`${encourage()} Cevap: ${p?.target?.value} ${p?.target?.unit}`}</div><div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700 mt-2">{'\uD83D\uDCA1'} {p?.ref?.name} ({p?.ref?.value} {p?.ref?.unit}) referans al\u0131nd\u0131\u011F\u0131nda {p?.target?.name} yakla\u015F\u0131k {p?.target?.value} {p?.target?.unit} eder.</div>{!explained2 && <ExplainStep type="measurement" onDone={handleExplain2}/>}{explained2 && <div className="text-xs text-green-600 mt-2 font-medium anim-fade">{'\u2713'} G\u00FCzel strateji!</div>}</div>):(<div className="grid grid-cols-2 gap-3">{p?.opts?.map((o,i)=>(<button key={i} onClick={()=>handle(o)} className={`px-6 py-4 ${colors?.button} text-white rounded-xl font-bold text-xl shadow-lg`}>{o} {p?.target?.unit}</button>))}</div>)}
    </div>
  );
};

export default OlcmeTahmini;

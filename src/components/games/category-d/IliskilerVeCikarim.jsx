import React, { useState } from 'react';
import { TOTAL_ROUNDS, encourage } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const IliskilerVeCikarim = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);
  const [p,setP]=useState(null);const [selected,setSelected]=useState([]);const [sub,setSub]=useState(false);const [used,setUsed]=useState([]);

  const questions = [
    // D\u00fczey 1
    {id:1,q:'E\u011fer bir \u015feklin 4 kenar\u0131 varsa...',opts:[
      {text:'4 k\u00f6\u015fesi de vard\u0131r',correct:true},
      {text:'5 a\u00e7\u0131s\u0131 da vard\u0131r',correct:false},
      {text:'4 a\u00e7\u0131s\u0131 da vard\u0131r',correct:true},
      {text:'B\u00fct\u00fcn a\u00e7\u0131lar\u0131 e\u015ftir',correct:false}
    ],explain:'4 kenarl\u0131 \u015fekillerin 4 k\u00f6\u015fesi ve 4 a\u00e7\u0131s\u0131 vard\u0131r, ama a\u00e7\u0131lar e\u015fit olmak zorunda de\u011fildir.',lv:1},
    {id:2,q:'Kare ayn\u0131 zamanda...',opts:[
      {text:'Bir dikd\u00f6rtgendir',correct:true},
      {text:'Bir \u00fc\u00e7gendir',correct:false},
      {text:'Bir \u00e7emberdir',correct:false},
      {text:'Bir d\u00f6rtgendir',correct:true}
    ],explain:'Kare hem dikd\u00f6rtgenin hem de d\u00f6rtgenin \u00f6zel bir halidir.',lv:1},
    {id:6,q:'Her dikd\u00f6rtgen ayn\u0131 zamanda...',opts:[
      {text:'Bir karedir',correct:false},
      {text:'Bir d\u00f6rtgendir',correct:true},
      {text:'Bir paralelkenard\u0131r',correct:true},
      {text:'Bir \u00fc\u00e7gendir',correct:false}
    ],explain:'Dikd\u00f6rtgen bir d\u00f6rtgendir ve ayn\u0131 zamanda bir paralelkenard\u0131r.',lv:1},
    {id:13,q:'\u00dc\u00e7genin i\u00e7 a\u00e7\u0131lar\u0131 toplam\u0131...',opts:[
      {text:'180 derecedir',correct:true},
      {text:'360 derecedir',correct:false},
      {text:'Kenar uzunluklar\u0131na ba\u011fl\u0131d\u0131r',correct:false},
      {text:'Her \u00fc\u00e7gen i\u00e7in ayn\u0131d\u0131r',correct:true}
    ],explain:'Her \u00fc\u00e7genin i\u00e7 a\u00e7\u0131lar\u0131 toplam\u0131 180 derecedir, bu kenar uzunlu\u011fundan ba\u011f\u0131ms\u0131zd\u0131r.',lv:1},
    {id:14,q:'Bir \u00e7ember i\u00e7in...',opts:[
      {text:'K\u00f6\u015fesi yoktur',correct:true},
      {text:'Kenar\u0131 yoktur',correct:true},
      {text:'3 kenar\u0131 vard\u0131r',correct:false},
      {text:'Sonsuz simetri ekseni vard\u0131r',correct:true}
    ],explain:'\u00c7emberin k\u00f6\u015fesi ve d\u00fcz kenar\u0131 yoktur, sonsuz say\u0131da simetri ekseni vard\u0131r.',lv:1},
    {id:15,q:'E\u011fer bir \u015feklin 3 kenar\u0131 varsa...',opts:[
      {text:'Bir \u00fc\u00e7gendir',correct:true},
      {text:'3 k\u00f6\u015fesi vard\u0131r',correct:true},
      {text:'Bir d\u00f6rtgendir',correct:false},
      {text:'Her zaman e\u015fkenar olmal\u0131d\u0131r',correct:false}
    ],explain:'3 kenar\u0131 olan \u015fekil \u00fc\u00e7gendir ve 3 k\u00f6\u015fesi vard\u0131r. E\u015fkenar olmak zorunda de\u011fildir.',lv:1},
    {id:25,q:'Bir \u00e7okgenin kenar say\u0131s\u0131 ile k\u00f6\u015fe say\u0131s\u0131...',opts:[
      {text:'Her zaman e\u015fittir',correct:true},
      {text:'Kenar say\u0131s\u0131 daha fazlad\u0131r',correct:false},
      {text:'K\u00f6\u015fe say\u0131s\u0131 daha fazlad\u0131r',correct:false},
      {text:'\u00dc\u00e7gende de e\u015fittir',correct:true}
    ],explain:'Her \u00e7okgende kenar say\u0131s\u0131 = k\u00f6\u015fe say\u0131s\u0131d\u0131r (\u00fc\u00e7gen: 3, kare: 4, be\u015fgen: 5...).',lv:1},
    {id:26,q:'E\u015fkenar \u00fc\u00e7genlerin t\u00fcm a\u00e7\u0131lar\u0131...',opts:[
      {text:'60 derecedir',correct:true},
      {text:'90 derecedir',correct:false},
      {text:'Birbirine e\u015fittir',correct:true},
      {text:'Toplam 180 derecedir',correct:true}
    ],explain:'E\u015fkenar \u00fc\u00e7gendeki 3 a\u00e7\u0131 birbirine e\u015fittir: 60\u00b0+60\u00b0+60\u00b0=180\u00b0.',lv:1},
    {id:27,q:'Dikd\u00f6rtgenin t\u00fcm a\u00e7\u0131lar\u0131...',opts:[
      {text:'90 derecedir',correct:true},
      {text:'Dik a\u00e7\u0131d\u0131r',correct:true},
      {text:'60 derecedir',correct:false},
      {text:'Toplam 360 derecedir',correct:true}
    ],explain:'Dikd\u00f6rtgenin 4 a\u00e7\u0131s\u0131 da 90\u00b0 (dik a\u00e7\u0131) ve toplam\u0131 4\u00d790=360 derecedir.',lv:1},
    {id:28,q:'Be\u015fgenin...',opts:[
      {text:'5 kenar\u0131 vard\u0131r',correct:true},
      {text:'5 k\u00f6\u015fesi vard\u0131r',correct:true},
      {text:'4 a\u00e7\u0131s\u0131 vard\u0131r',correct:false},
      {text:'\u0130\u00e7 a\u00e7\u0131lar\u0131 toplam\u0131 540\u00b0 dir',correct:true}
    ],explain:'Be\u015fgenin 5 kenar\u0131, 5 k\u00f6\u015fesi ve i\u00e7 a\u00e7\u0131lar\u0131 toplam\u0131 (5-2)\u00d7180=540 derecedir.',lv:1},
    // D\u00fczey 2
    {id:3,q:'E\u011fer bir d\u00f6rtgenin kar\u015f\u0131l\u0131kl\u0131 kenarlar\u0131 e\u015fse...',opts:[
      {text:'Kar\u015f\u0131l\u0131kl\u0131 kenarlar\u0131 da paraleldir',correct:true},
      {text:'Kar\u015f\u0131l\u0131kl\u0131 a\u00e7\u0131lar\u0131 da e\u015ftir',correct:true},
      {text:'T\u00fcm a\u00e7\u0131lar\u0131 e\u015ftir',correct:false},
      {text:'T\u00fcm kenarlar\u0131 e\u015ftir',correct:false}
    ],explain:'Kar\u015f\u0131l\u0131kl\u0131 kenarlar\u0131 e\u015f d\u00f6rtgende kar\u015f\u0131l\u0131kl\u0131 kenarlar paralel ve kar\u015f\u0131l\u0131kl\u0131 a\u00e7\u0131lar e\u015ftir.',lv:2},
    {id:4,q:'Kenarlar\u0131 e\u015f olan bir d\u00f6rtgende bir a\u00e7\u0131 dik ise...',opts:[
      {text:'B\u00fct\u00fcn a\u00e7\u0131lar dik olur',correct:true},
      {text:'Di\u011fer a\u00e7\u0131lar dik olmayabilir',correct:false},
      {text:'Sadece kar\u015f\u0131 a\u00e7\u0131 dik olur',correct:false},
      {text:'Bu \u015fekil kesinlikle karedir',correct:true}
    ],explain:'4 kenar\u0131 e\u015f ve bir a\u00e7\u0131s\u0131 dik olan d\u00f6rtgen kesinlikle karedir, t\u00fcm a\u00e7\u0131lar\u0131 diktir.',lv:2},
    {id:10,q:'4 e\u015fit kenar\u0131 olan her \u015fekil...',opts:[
      {text:'Kesinlikle karedir',correct:false},
      {text:'E\u015fkenar d\u00f6rtgen olabilir',correct:true},
      {text:'Bir d\u00f6rtgendir',correct:true},
      {text:'T\u00fcm a\u00e7\u0131lar\u0131 e\u015ftir',correct:false}
    ],explain:'4 e\u015fit kenar hem kare hem e\u015fkenar d\u00f6rtgen olabilir. Kare olmak i\u00e7in a\u00e7\u0131lar\u0131n da dik olmas\u0131 gerekir.',lv:2},
    {id:16,q:'Yamuk \u015feklinde...',opts:[
      {text:'En az bir \u00e7ift kenar paraleldir',correct:true},
      {text:'T\u00fcm kenarlar paralel olmal\u0131d\u0131r',correct:false},
      {text:'4 kenar\u0131 vard\u0131r',correct:true},
      {text:'Her zaman simetri ekseni vard\u0131r',correct:false}
    ],explain:'Yamukta en az bir \u00e7ift kenar paraleldir, 4 kenar\u0131 vard\u0131r ama her zaman simetrik olmak zorunda de\u011fildir.',lv:2},
    {id:17,q:'Bir paralelkenar\u0131n k\u00f6\u015fegenleri...',opts:[
      {text:'Birbirini ortalar',correct:true},
      {text:'Her zaman e\u015fittir',correct:false},
      {text:'Birbirine dik olmak zorundad\u0131r',correct:false},
      {text:'\u015eekli 4 \u00fc\u00e7gene b\u00f6ler',correct:true}
    ],explain:'Paralelkenar\u0131n k\u00f6\u015fegenleri birbirini ortalar ve \u015fekli 4 \u00fc\u00e7gene b\u00f6ler ama e\u015fit ve dik olmak zorunda de\u011fildir.',lv:2},
    {id:18,q:'Dikd\u00f6rtgenin k\u00f6\u015fegenleri...',opts:[
      {text:'E\u015f uzunluktad\u0131r',correct:true},
      {text:'Birbirini ortalar',correct:true},
      {text:'Birbirine diktir',correct:false},
      {text:'Kenarlardan uzundur',correct:true}
    ],explain:'Dikd\u00f6rtgenin k\u00f6\u015fegenleri e\u015fit ve birbirini ortalar. Kenarlardan uzundur ama birbirine dik de\u011fildir.',lv:2},
    // D\u00fczey 3
    {id:5,q:'Bir \u00fc\u00e7genin 2 kenar\u0131 e\u015fse...',opts:[
      {text:'B\u00fct\u00fcn a\u00e7\u0131lar\u0131 da e\u015f olur',correct:false},
      {text:'Sadece 2 a\u00e7\u0131s\u0131 e\u015f olur',correct:true},
      {text:'E\u015f kenarlar\u0131n kar\u015f\u0131 a\u00e7\u0131lar\u0131 e\u015ftir',correct:true},
      {text:'B\u00fct\u00fcn a\u00e7\u0131lar\u0131 farkl\u0131 olabilir',correct:false}
    ],explain:'\u0130kizkenar \u00fc\u00e7gende e\u015f kenarlar\u0131n kar\u015f\u0131s\u0131ndaki 2 a\u00e7\u0131 birbirine e\u015ftir.',lv:3},
    {id:7,q:'E\u011fer bir \u015feklin kenar say\u0131s\u0131 artarsa...',opts:[
      {text:'\u0130\u00e7 a\u00e7\u0131lar\u0131 toplam\u0131 da artar',correct:true},
      {text:'K\u00f6\u015fe say\u0131s\u0131 da artar',correct:true},
      {text:'\u00c7embere daha \u00e7ok benzer',correct:true},
      {text:'Kenar uzunluklar\u0131 artar',correct:false}
    ],explain:'Kenar say\u0131s\u0131 artt\u0131k\u00e7a k\u00f6\u015fe say\u0131s\u0131 ve i\u00e7 a\u00e7\u0131 toplam\u0131 artar, \u015fekil \u00e7embere yakla\u015f\u0131r.',lv:3},
    {id:8,q:'T\u00fcm e\u015fkenar \u00fc\u00e7genler ayn\u0131 zamanda...',opts:[
      {text:'\u0130kizkenard\u0131r',correct:true},
      {text:'Dik a\u00e7\u0131l\u0131d\u0131r',correct:false},
      {text:'D\u00fczg\u00fcn \u00e7okgendir',correct:true},
      {text:'E\u015fit a\u00e7\u0131l\u0131d\u0131r',correct:true}
    ],explain:'E\u015fkenar \u00fc\u00e7gen hem ikizkenard\u0131r, hem d\u00fczg\u00fcn \u00e7okgendir, hem de t\u00fcm a\u00e7\u0131lar\u0131 e\u015fittir (60\u00b0).',lv:3},
    {id:19,q:'Bir \u00fc\u00e7genin bir a\u00e7\u0131s\u0131 90\u00b0 ise...',opts:[
      {text:'Dik \u00fc\u00e7gendir',correct:true},
      {text:'Di\u011fer 2 a\u00e7\u0131n\u0131n toplam\u0131 90\u00b0dir',correct:true},
      {text:'\u0130kizkenar olamaz',correct:false},
      {text:'En uzun kenar\u0131 hipoten\u00fcst\u00fcr',correct:true}
    ],explain:'Dik \u00fc\u00e7gende bir a\u00e7\u0131 90\u00b0, di\u011fer ikisinin toplam\u0131 da 90\u00b0 ve en uzun kenar hipoten\u00fcst\u00fcr.',lv:3},
    {id:20,q:'D\u00fczg\u00fcn \u00e7okgenlerde...',opts:[
      {text:'T\u00fcm kenarlar e\u015ftir',correct:true},
      {text:'T\u00fcm a\u00e7\u0131lar e\u015ftir',correct:true},
      {text:'Kenar say\u0131s\u0131 kadar simetri ekseni vard\u0131r',correct:true},
      {text:'\u0130\u00e7 a\u00e7\u0131lar her zaman 90\u00b0dir',correct:false}
    ],explain:'D\u00fczg\u00fcn \u00e7okgenlerde kenarlar ve a\u00e7\u0131lar e\u015fittir, simetri ekseni say\u0131s\u0131 kenar say\u0131s\u0131na e\u015fittir.',lv:3},
    {id:21,q:'E\u015fkenar d\u00f6rtgen (baklava) ile kare aras\u0131ndaki fark...',opts:[
      {text:'Karenin a\u00e7\u0131lar\u0131 diktir',correct:true},
      {text:'E\u015fkenar d\u00f6rtgenin a\u00e7\u0131lar\u0131 dik olmak zorunda de\u011fildir',correct:true},
      {text:'Kenar say\u0131lar\u0131 farkl\u0131d\u0131r',correct:false},
      {text:'Kare \u00f6zel bir e\u015fkenar d\u00f6rtgendir',correct:true}
    ],explain:'Kare, t\u00fcm a\u00e7\u0131lar\u0131 dik olan \u00f6zel bir e\u015fkenar d\u00f6rtgendir.',lv:3},
    // D\u00fczey 4
    {id:9,q:'Bir d\u00f6rtgenin k\u00f6\u015fegenleri birbirini ortal\u0131yorsa...',opts:[
      {text:'Paralelkenard\u0131r',correct:true},
      {text:'Kesinlikle karedir',correct:false},
      {text:'Kar\u015f\u0131l\u0131kl\u0131 kenarlar\u0131 paraleldir',correct:true},
      {text:'T\u00fcm a\u00e7\u0131lar\u0131 diktir',correct:false}
    ],explain:'K\u00f6\u015fegenleri birbirini ortlayan d\u00f6rtgen paralelkenard\u0131r ve kar\u015f\u0131l\u0131kl\u0131 kenarlar\u0131 paraleldir.',lv:4},
    {id:11,q:'D\u00fczg\u00fcn alt\u0131genin...',opts:[
      {text:'T\u00fcm kenarlar\u0131 e\u015ftir',correct:true},
      {text:'T\u00fcm a\u00e7\u0131lar\u0131 e\u015ftir',correct:true},
      {text:'6 simetri ekseni vard\u0131r',correct:true},
      {text:'A\u00e7\u0131lar\u0131 90 derecedir',correct:false}
    ],explain:'D\u00fczg\u00fcn alt\u0131genin kenarlar\u0131 ve a\u00e7\u0131lar\u0131 e\u015ftir, 6 simetri ekseni vard\u0131r. A\u00e7\u0131lar\u0131 120 derecedir.',lv:4},
    {id:12,q:'Her ikizkenar \u00fc\u00e7gen...',opts:[
      {text:'E\u015fkenard\u0131r',correct:false},
      {text:'Bir simetri ekseni vard\u0131r',correct:true},
      {text:'En az 2 e\u015fit a\u00e7\u0131s\u0131 vard\u0131r',correct:true},
      {text:'Dik a\u00e7\u0131l\u0131 olabilir',correct:true}
    ],explain:'\u0130kizkenar \u00fc\u00e7genin 2 e\u015fit a\u00e7\u0131s\u0131 ve 1 simetri ekseni vard\u0131r. E\u015fkenar olmak zorunda de\u011fildir.',lv:4},
    {id:22,q:'K\u00f6\u015fegenleri hem e\u015f hem dik olan d\u00f6rtgen...',opts:[
      {text:'Kesinlikle karedir',correct:true},
      {text:'Dikd\u00f6rtgen olabilir',correct:false},
      {text:'E\u015fkenar d\u00f6rtgen olabilir',correct:false},
      {text:'T\u00fcm kenarlar\u0131 e\u015ftir',correct:true}
    ],explain:'K\u00f6\u015fegenleri hem e\u015f hem dik olan d\u00f6rtgen karedir \u00e7\u00fcnk\u00fc hem dikd\u00f6rtgen hem e\u015fkenar d\u00f6rtgen \u00f6zelliklerini ta\u015f\u0131r.',lv:4},
    {id:23,q:'Bir \u00e7okgenin i\u00e7 a\u00e7\u0131lar\u0131 toplam\u0131 720\u00b0 ise...',opts:[
      {text:'6 kenar\u0131 vard\u0131r',correct:true},
      {text:'Alt\u0131gendir',correct:true},
      {text:'8 kenar\u0131 vard\u0131r',correct:false},
      {text:'D\u00fczg\u00fcn alt\u0131gen olabilir',correct:true}
    ],explain:'\u0130\u00e7 a\u00e7\u0131lar toplam\u0131 (n-2)\u00d7180 form\u00fcl\u00fcnden: 720\u00f7180=4, n=6. Yani alt\u0131gendir.',lv:4},
    {id:24,q:'Pisagor teoremine g\u00f6re dik \u00fc\u00e7gende...',opts:[
      {text:'Hipoten\u00fcs\u00fcn karesi di\u011fer iki kenar\u0131n karelerinin toplam\u0131d\u0131r',correct:true},
      {text:'En k\u0131sa kenar hipoten\u00fcst\u00fcr',correct:false},
      {text:'3-4-5 kenar uzunluklar\u0131 dik \u00fc\u00e7gen olu\u015fturur',correct:true},
      {text:'Bu kural t\u00fcm \u00fc\u00e7genlerde ge\u00e7erlidir',correct:false}
    ],explain:'Pisagor teoremi sadece dik \u00fc\u00e7genlerde ge\u00e7erlidir: a\u00b2+b\u00b2=c\u00b2 (c=hipoten\u00fcs). 3\u00b2+4\u00b2=5\u00b2=25.',lv:4},
  ];

  const gen = (l, u) => {
    const av = questions.filter(q=>q.lv<=l&&!u.includes(q.id));
    const pool = av.length>0 ? av : questions.filter(q=>q.lv<=l);
    return pool[Math.floor(Math.random()*pool.length)];
  };

  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG = (l) => {setLv(l);setSc(0);setRd(1);setUsed([]);const q=gen(l,[]);setP(q);setUsed([q.id]);setSelected([]);setSub(false);setGs('playing');};

  const toggleOpt = (i) => {
    if(sub) return;
    setSelected(prev => prev.includes(i) ? prev.filter(x=>x!==i) : [...prev, i]);
  };

  const handleSub = () => {
    setSub(true);
    const correctIndices = p?.opts.map((o,i)=>o.correct?i:-1).filter(i=>i>=0);
    const isCorrect = selected.length===correctIndices.length && selected.every(i=>correctIndices.includes(i));
    if(isCorrect) setSc(s=>s+25*lv);
    else if(selected.some(i=>correctIndices.includes(i))) setSc(s=>s+10*lv);
    setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);const q=gen(lv,used);setP(q);setUsed(prev=>[...prev,q.id]);setSelected([]);setSub(false);}else setGs('results');},3000);
  };

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="\u0130li\u015fkiler ve \u00c7\u0131kar\u0131m" emoji="\ud83d\udd17" description="\u015eekiller aras\u0131ndaki ili\u015fkileri ke\u015ffet! Do\u011fru olan t\u00fcm se\u00e7enekleri i\u015faretle." levels={['D\u00fczey 3a (Temel)','D\u00fczey 3b (Orta)','D\u00fczey 3c (\u0130leri)','D\u00fczey 3d (Uzman)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="\u0130li\u015fkiler ve \u00c7\u0131kar\u0131m" emoji="\ud83d\udd17" level={lv} instruction="\u015eekiller hakk\u0131nda ifadeler g\u00f6sterilecek. Do\u011fru olan t\u00fcm ifadeleri se\u00e7! Dikkat: birden fazla do\u011fru olabilir." colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  const correctIndices = p?.opts?.map((o,i)=>o.correct?i:-1).filter(i=>i>=0) || [];

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="\u0130li\u015fkiler ve \u00c7\u0131kar\u0131m" colors={colors}/>
      <div className="bg-white px-4 py-2 rounded-xl shadow mb-3 text-center"><span className="text-sm text-gray-500">D\u00fczey 3: \u0130nformel \u00c7\u0131kar\u0131m</span></div>

      <div className="bg-white px-4 py-3 rounded-xl shadow-xl mb-2 text-center max-w-sm">
        <div className="text-lg text-gray-700 font-medium leading-relaxed">{p?.q}</div>
        <div className="text-xs text-gray-600 mt-2">Do\u011fru olan t\u00fcm se\u00e7enekleri i\u015faretle</div>
      </div>

      <div className="space-y-2 w-full max-w-sm mb-3">
        {p?.opts?.map((o,i) => {
          let btnClass = 'bg-white border-2 border-gray-300 text-gray-700';
          if(sub){
            if(o.correct && selected.includes(i)) btnClass = 'bg-green-100 border-2 border-green-500 text-green-700';
            else if(o.correct) btnClass = 'bg-green-50 border-2 border-green-300 text-green-600';
            else if(selected.includes(i)) btnClass = 'bg-red-100 border-2 border-red-500 text-red-700';
          } else if(selected.includes(i)){
            btnClass = 'bg-emerald-100 border-2 border-emerald-500 text-emerald-700';
          }
          return (
            <button key={i} onClick={()=>toggleOpt(i)} className={`w-full px-4 py-3 rounded-xl font-medium text-left transition-all ${btnClass}`}>
              <span className="mr-2">{sub ? (o.correct ? '\u2713' : '\u25cb') : (selected.includes(i) ? '\u2611' : '\u2610')}</span>
              {o.text}
            </button>
          );
        })}
      </div>

      {!sub && selected.length > 0 && (
        <button onClick={handleSub} className={`px-10 py-4 ${colors?.button} text-white rounded-xl font-bold text-lg shadow-lg`}>Kontrol Et</button>
      )}

      {sub && (
        <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm max-w-sm text-center">
          {'\ud83d\udca1'} {p?.explain}
        </div>
      )}
    </div>
  );
};

export default IliskilerVeCikarim;

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
    // Düzey 1
    {id:1,q:'Eğer bir şeklin 4 kenarı varsa...',opts:[
      {text:'4 köşesi de vardır',correct:true},
      {text:'5 açısı da vardır',correct:false},
      {text:'4 açısı da vardır',correct:true},
      {text:'Bütün açıları eştir',correct:false}
    ],explain:'4 kenarlı şekillerin 4 köşesi ve 4 açısı vardır, ama açılar eşit olmak zorunda değildir.',lv:1},
    {id:2,q:'Kare aynı zamanda...',opts:[
      {text:'Bir dikdörtgendir',correct:true},
      {text:'Bir üçgendir',correct:false},
      {text:'Bir çemberdir',correct:false},
      {text:'Bir dörtgendir',correct:true}
    ],explain:'Kare hem dikdörtgenin hem de dörtgenin özel bir halidir.',lv:1},
    {id:6,q:'Her dikdörtgen aynı zamanda...',opts:[
      {text:'Bir karedir',correct:false},
      {text:'Bir dörtgendir',correct:true},
      {text:'Bir paralelkenardır',correct:true},
      {text:'Bir üçgendir',correct:false}
    ],explain:'Dikdörtgen bir dörtgendir ve aynı zamanda bir paralelkenardır.',lv:1},
    {id:13,q:'Üçgenin iç açıları toplamı...',opts:[
      {text:'180 derecedir',correct:true},
      {text:'360 derecedir',correct:false},
      {text:'Kenar uzunluklarına bağlıdır',correct:false},
      {text:'Her üçgen için aynıdır',correct:true}
    ],explain:'Her üçgenin iç açıları toplamı 180 derecedir, bu kenar uzunluğundan bağımsızdır.',lv:1},
    {id:14,q:'Bir çember için...',opts:[
      {text:'Köşesi yoktur',correct:true},
      {text:'Kenarı yoktur',correct:true},
      {text:'3 kenarı vardır',correct:false},
      {text:'Sonsuz simetri ekseni vardır',correct:true}
    ],explain:'Çemberin köşesi ve düz kenarı yoktur, sonsuz sayıda simetri ekseni vardır.',lv:1},
    {id:15,q:'Eğer bir şeklin 3 kenarı varsa...',opts:[
      {text:'Bir üçgendir',correct:true},
      {text:'3 köşesi vardır',correct:true},
      {text:'Bir dörtgendir',correct:false},
      {text:'Her zaman eşkenar olmalıdır',correct:false}
    ],explain:'3 kenarı olan şekil üçgendir ve 3 köşesi vardır. Eşkenar olmak zorunda değildir.',lv:1},
    {id:25,q:'Bir çokgenin kenar sayısı ile köşe sayısı...',opts:[
      {text:'Her zaman eşittir',correct:true},
      {text:'Kenar sayısı daha fazladır',correct:false},
      {text:'Köşe sayısı daha fazladır',correct:false},
      {text:'Üçgende de eşittir',correct:true}
    ],explain:'Her çokgende kenar sayısı = köşe sayısıdır (üçgen: 3, kare: 4, beşgen: 5...).',lv:1},
    {id:26,q:'Eşkenar üçgenlerin tüm açıları...',opts:[
      {text:'60 derecedir',correct:true},
      {text:'90 derecedir',correct:false},
      {text:'Birbirine eşittir',correct:true},
      {text:'Toplam 180 derecedir',correct:true}
    ],explain:'Eşkenar üçgendeki 3 açı birbirine eşittir: 60°+60°+60°=180°.',lv:1},
    {id:27,q:'Dikdörtgenin tüm açıları...',opts:[
      {text:'90 derecedir',correct:true},
      {text:'Dik açıdır',correct:true},
      {text:'60 derecedir',correct:false},
      {text:'Toplam 360 derecedir',correct:true}
    ],explain:'Dikdörtgenin 4 açısı da 90° (dik açı) ve toplamı 4×90=360 derecedir.',lv:1},
    {id:28,q:'Beşgenin...',opts:[
      {text:'5 kenarı vardır',correct:true},
      {text:'5 köşesi vardır',correct:true},
      {text:'4 açısı vardır',correct:false},
      {text:'İç açıları toplamı 540° dir',correct:true}
    ],explain:'Beşgenin 5 kenarı, 5 köşesi ve iç açıları toplamı (5-2)×180=540 derecedir.',lv:1},
    // Düzey 2
    {id:3,q:'Eğer bir dörtgenin karşılıklı kenarları eşse...',opts:[
      {text:'Karşılıklı kenarları da paraleldir',correct:true},
      {text:'Karşılıklı açıları da eştir',correct:true},
      {text:'Tüm açıları eştir',correct:false},
      {text:'Tüm kenarları eştir',correct:false}
    ],explain:'Karşılıklı kenarları eş dörtgende karşılıklı kenarlar paralel ve karşılıklı açılar eştir.',lv:2},
    {id:4,q:'Kenarları eş olan bir dörtgende bir açı dik ise...',opts:[
      {text:'Bütün açılar dik olur',correct:true},
      {text:'Diğer açılar dik olmayabilir',correct:false},
      {text:'Sadece karşı açı dik olur',correct:false},
      {text:'Bu şekil kesinlikle karedir',correct:true}
    ],explain:'4 kenarı eş ve bir açısı dik olan dörtgen kesinlikle karedir, tüm açıları diktir.',lv:2},
    {id:10,q:'4 eşit kenarı olan her şekil...',opts:[
      {text:'Kesinlikle karedir',correct:false},
      {text:'Eşkenar dörtgen olabilir',correct:true},
      {text:'Bir dörtgendir',correct:true},
      {text:'Tüm açıları eştir',correct:false}
    ],explain:'4 eşit kenar hem kare hem eşkenar dörtgen olabilir. Kare olmak için açıların da dik olması gerekir.',lv:2},
    {id:16,q:'Yamuk şeklinde...',opts:[
      {text:'En az bir çift kenar paraleldir',correct:true},
      {text:'Tüm kenarlar paralel olmalıdır',correct:false},
      {text:'4 kenarı vardır',correct:true},
      {text:'Her zaman simetri ekseni vardır',correct:false}
    ],explain:'Yamukta en az bir çift kenar paraleldir, 4 kenarı vardır ama her zaman simetrik olmak zorunda değildir.',lv:2},
    {id:17,q:'Bir paralelkenarın köşegenleri...',opts:[
      {text:'Birbirini ortalar',correct:true},
      {text:'Her zaman eşittir',correct:false},
      {text:'Birbirine dik olmak zorundadır',correct:false},
      {text:'Şekli 4 üçgene böler',correct:true}
    ],explain:'Paralelkenarın köşegenleri birbirini ortalar ve şekli 4 üçgene böler ama eşit ve dik olmak zorunda değildir.',lv:2},
    {id:18,q:'Dikdörtgenin köşegenleri...',opts:[
      {text:'Eş uzunluktadır',correct:true},
      {text:'Birbirini ortalar',correct:true},
      {text:'Birbirine diktir',correct:false},
      {text:'Kenarlardan uzundur',correct:true}
    ],explain:'Dikdörtgenin köşegenleri eşit ve birbirini ortalar. Kenarlardan uzundur ama birbirine dik değildir.',lv:2},
    // Düzey 3
    {id:5,q:'Bir üçgenin 2 kenarı eşse...',opts:[
      {text:'Bütün açıları da eş olur',correct:false},
      {text:'Sadece 2 açısı eş olur',correct:true},
      {text:'Eş kenarların karşı açıları eştir',correct:true},
      {text:'Bütün açıları farklı olabilir',correct:false}
    ],explain:'İkizkenar üçgende eş kenarların karşısındaki 2 açı birbirine eştir.',lv:3},
    {id:7,q:'Eğer bir şeklin kenar sayısı artarsa...',opts:[
      {text:'İç açıları toplamı da artar',correct:true},
      {text:'Köşe sayısı da artar',correct:true},
      {text:'Çembere daha çok benzer',correct:true},
      {text:'Kenar uzunlukları artar',correct:false}
    ],explain:'Kenar sayısı arttıkça köşe sayısı ve iç açı toplamı artar, şekil çembere yaklaşır.',lv:3},
    {id:8,q:'Tüm eşkenar üçgenler aynı zamanda...',opts:[
      {text:'İkizkenardır',correct:true},
      {text:'Dik açılıdır',correct:false},
      {text:'Düzgün çokgendir',correct:true},
      {text:'Eşit açılıdır',correct:true}
    ],explain:'Eşkenar üçgen hem ikizkenardır, hem düzgün çokgendir, hem de tüm açıları eşittir (60°).',lv:3},
    {id:19,q:'Bir üçgenin bir açısı 90° ise...',opts:[
      {text:'Dik üçgendir',correct:true},
      {text:'Diğer 2 açının toplamı 90°dir',correct:true},
      {text:'İkizkenar olamaz',correct:false},
      {text:'En uzun kenarı hipotenüstür',correct:true}
    ],explain:'Dik üçgende bir açı 90°, diğer ikisinin toplamı da 90° ve en uzun kenar hipotenüstür.',lv:3},
    {id:20,q:'Düzgün çokgenlerde...',opts:[
      {text:'Tüm kenarlar eştir',correct:true},
      {text:'Tüm açılar eştir',correct:true},
      {text:'Kenar sayısı kadar simetri ekseni vardır',correct:true},
      {text:'İç açılar her zaman 90°dir',correct:false}
    ],explain:'Düzgün çokgenlerde kenarlar ve açılar eşittir, simetri ekseni sayısı kenar sayısına eşittir.',lv:3},
    {id:21,q:'Eşkenar dörtgen (baklava) ile kare arasındaki fark...',opts:[
      {text:'Karenin açıları diktir',correct:true},
      {text:'Eşkenar dörtgenin açıları dik olmak zorunda değildir',correct:true},
      {text:'Kenar sayıları farklıdır',correct:false},
      {text:'Kare özel bir eşkenar dörtgendir',correct:true}
    ],explain:'Kare, tüm açıları dik olan özel bir eşkenar dörtgendir.',lv:3},
    // Düzey 4
    {id:9,q:'Bir dörtgenin köşegenleri birbirini ortalıyorsa...',opts:[
      {text:'Paralelkenardır',correct:true},
      {text:'Kesinlikle karedir',correct:false},
      {text:'Karşılıklı kenarları paraleldir',correct:true},
      {text:'Tüm açıları diktir',correct:false}
    ],explain:'Köşegenleri birbirini ortlayan dörtgen paralelkenardır ve karşılıklı kenarları paraleldir.',lv:4},
    {id:11,q:'Düzgün altıgenin...',opts:[
      {text:'Tüm kenarları eştir',correct:true},
      {text:'Tüm açıları eştir',correct:true},
      {text:'6 simetri ekseni vardır',correct:true},
      {text:'Açıları 90 derecedir',correct:false}
    ],explain:'Düzgün altıgenin kenarları ve açıları eştir, 6 simetri ekseni vardır. Açıları 120 derecedir.',lv:4},
    {id:12,q:'Her ikizkenar üçgen...',opts:[
      {text:'Eşkenardır',correct:false},
      {text:'Bir simetri ekseni vardır',correct:true},
      {text:'En az 2 eşit açısı vardır',correct:true},
      {text:'Dik açılı olabilir',correct:true}
    ],explain:'İkizkenar üçgenin 2 eşit açısı ve 1 simetri ekseni vardır. Eşkenar olmak zorunda değildir.',lv:4},
    {id:22,q:'Köşegenleri hem eş hem dik olan dörtgen...',opts:[
      {text:'Kesinlikle karedir',correct:true},
      {text:'Dikdörtgen olabilir',correct:false},
      {text:'Eşkenar dörtgen olabilir',correct:false},
      {text:'Tüm kenarları eştir',correct:true}
    ],explain:'Köşegenleri hem eş hem dik olan dörtgen karedir çünkü hem dikdörtgen hem eşkenar dörtgen özelliklerini taşır.',lv:4},
    {id:23,q:'Bir çokgenin iç açıları toplamı 720° ise...',opts:[
      {text:'6 kenarı vardır',correct:true},
      {text:'Altıgendir',correct:true},
      {text:'8 kenarı vardır',correct:false},
      {text:'Düzgün altıgen olabilir',correct:true}
    ],explain:'İç açılar toplamı (n-2)×180 formülünden: 720÷180=4, n=6. Yani altıgendir.',lv:4},
    {id:24,q:'Pisagor teoremine göre dik üçgende...',opts:[
      {text:'Hipotenüsün karesi diğer iki kenarın karelerinin toplamıdır',correct:true},
      {text:'En kısa kenar hipotenüstür',correct:false},
      {text:'3-4-5 kenar uzunlukları dik üçgen oluşturur',correct:true},
      {text:'Bu kural tüm üçgenlerde geçerlidir',correct:false}
    ],explain:'Pisagor teoremi sadece dik üçgenlerde geçerlidir: a²+b²=c² (c=hipotenüs). 3²+4²=5²=25.',lv:4},
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

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="İlişkiler ve Çıkarım" emoji="" description="Şekiller arasındaki ilişkileri keşfet! Doğru olan tüm seçenekleri işaretle." levels={['Düzey 3a (Temel)','Düzey 3b (Orta)','Düzey 3c (İleri)','Düzey 3d (Uzman)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="İlişkiler ve Çıkarım" emoji="" level={lv} instruction="Şekiller hakkında ifadeler gösterilecek. Doğru olan tüm ifadeleri seç! Dikkat: birden fazla doğru olabilir." colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  const correctIndices = p?.opts?.map((o,i)=>o.correct?i:-1).filter(i=>i>=0) || [];

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="İlişkiler ve Çıkarım" colors={colors}/>
      <div className="bg-white px-4 py-2 rounded-xl shadow mb-3 text-center"><span className="text-sm text-gray-500">Düzey 3: İnformel Çıkarım</span></div>

      <div className="bg-white px-4 py-3 rounded-xl shadow-xl mb-2 text-center max-w-sm">
        <div className="text-lg text-gray-700 font-medium leading-relaxed">{p?.q}</div>
        <div className="text-xs text-gray-600 mt-2">Doğru olan tüm seçenekleri işaretle</div>
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
              <span className="mr-2">{sub ? (o.correct ? '✓' : '○') : (selected.includes(i) ? '☑' : '☐')}</span>
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
          {'📋'} {p?.explain}
        </div>
      )}
    </div>
  );
};

export default IliskilerVeCikarim;

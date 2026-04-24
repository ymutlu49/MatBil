import React, { useState, useEffect, useRef } from 'react';
import { TOTAL_ROUNDS, playSound, encourage, useAdaptive } from '../../../utils';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const SayisalBellek = ({ onBack, colors, onGameComplete, rahatMod, prevBest, sesAcik }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);
  const [phase,setPhase]=useState('show'); // show | ask
  const [currentNum,setCurrentNum]=useState(null);
  const [history,setHistory]=useState([]);
  const [isMatch,setIsMatch]=useState(false);
  const [ua,setUa]=useState(null);
  const adaptive = useAdaptive();
  const timerRef = useRef(null);

  const cfg={
    1:{nBack:1,min:1,max:5,label:'1-geri (1-5)'},
    2:{nBack:1,min:1,max:9,label:'1-geri (1-9)'},
    3:{nBack:2,min:1,max:5,label:'2-geri (1-5)'},
    4:{nBack:2,min:1,max:9,label:'2-geri (1-9)'}
  };

  const randNum=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;

  // Yeni sayı üretimi — history yeterliyse %30 ihtimalle eşleşme, aksi halde setup
  const genTrial=(l,hist)=>{
    const c=cfg[l];
    const canAsk = hist.length >= c.nBack;
    if(!canAsk){
      // Setup turu: geçmiş yeterli değil, soru sorma
      return { num: randNum(c.min,c.max), match: false, isSetup: true };
    }
    const targetNum = hist[hist.length-c.nBack];
    const shouldMatch = Math.random()<0.3;
    let num;
    if(shouldMatch){
      num = targetNum;
    } else {
      let attempts=0;
      do { num=randNum(c.min,c.max); attempts++; }
      while(num===targetNum && attempts<20);
    }
    return { num, match: num===targetNum, isSetup: false };
  };

  const [isSetup, setIsSetup] = useState(false);

  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{
    setLv(l);setSc(0);setRd(1);setUa(null);adaptive.reset();
    // Boş geçmişle başla — ilk nBack tur kurulum (soru sorulmaz, oyuncu sayıları hatırlamaya başlar)
    const c=cfg[l];
    const num = randNum(c.min,c.max);
    setHistory([num]);
    setCurrentNum(num);
    setIsMatch(false);
    setIsSetup(c.nBack >= 1); // 1-geri için round 1 setup, 2-geri için round 1-2 setup
    setPhase('show');
    setGs('playing');
  };

  useEffect(()=>{
    if(gs==='playing' && phase==='show'){
      timerRef.current=setTimeout(()=>{
        if(isSetup){
          // Kurulum turu: soru sormadan sonraki tura geç
          if(rd<TOTAL_ROUNDS){
            const newRd=rd+1;
            // Bir sonraki turda geçmiş yeterli mi? (rd+1 >= nBack+1 olunca soru sorulabilir)
            setRd(newRd);
            // history'yi fonksiyonel güncelle ve yeni durum hesapla
            setHistory(prev => {
              const nextHist = [...prev];
              const trial = genTrial(lv, nextHist);
              setCurrentNum(trial.num);
              setIsMatch(trial.match);
              setIsSetup(trial.isSetup);
              return [...nextHist, trial.num];
            });
          } else setGs('results');
        } else {
          setPhase('ask');
        }
      },1500);
      return ()=>clearTimeout(timerRef.current);
    }
  },[gs,phase,rd,isSetup,lv]);

  const handle=(answer)=>{
    const correct=(answer==='evet')===isMatch;
    setUa(answer);
    adaptive.record(correct);
    if(correct){ playSound('correct'); setSc(s=>s+15*lv); }
    else playSound('wrong');
    setTimeout(()=>{
      if(rd<TOTAL_ROUNDS){
        const newRd=rd+1;
        setRd(newRd);
        setUa(null);
        // history'yi fonksiyonel güncelle — stale closure riski yok
        setHistory(prev => {
          const trial = genTrial(lv, prev);
          setCurrentNum(trial.num);
          setIsMatch(trial.match);
          setIsSetup(trial.isSetup);
          return [...prev, trial.num];
        });
        setPhase('show');
      } else setGs('results');
    },1500);
  };

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Sayısal Bellek" emoji="🧠" description="Sayıları hatırla! Şu anki sayı, N adım öncekiyle aynı mı? Çalışma belleğini geliştir." levels={['Seviye 1 (1-geri, 1-5)','Seviye 2 (1-geri, 1-9)','Seviye 3 (2-geri, 1-5)','Seviye 4 (2-geri, 1-9)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Sayısal Bellek" emoji="🧠" level={lv} instruction={`Ekrandaki sayıyı izle. ${cfg[lv].nBack} adım önceki sayıyla aynı mı? (${cfg[lv].label})`} colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  const nBack=cfg[lv].nBack;
  const prevNum=history.length>=nBack+1?history[history.length-1-nBack]:null;

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Sayısal Bellek" colors={colors}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">

        <div className="text-lg font-bold text-gray-700 mb-2">
          {nBack}-geri Bellek Oyunu
        </div>

        <div className="bg-white rounded-3xl shadow-2xl w-36 h-36 flex items-center justify-center mb-4 border-4 border-indigo-200">
          {phase==='show'?(
            <span className="text-6xl font-black text-indigo-600 animate-pulse">{currentNum}</span>
          ):(
            ua===null?(
              <span className="text-5xl font-black text-gray-400">?</span>
            ):(
              <span className={`text-6xl font-black ${(ua==='evet')===isMatch?'text-green-500':'text-orange-500'}`}>{currentNum}</span>
            )
          )}
        </div>

        {phase==='show' && (
          <div className={`${isSetup?'bg-amber-50':'bg-indigo-50'} px-4 py-2 rounded-xl text-center`}>
            <div className={`text-sm ${isSetup?'text-amber-600':'text-indigo-600'} font-medium`}>
              {isSetup ? `🔸 Hazırlık turu — bu sayıyı hatırla (henüz soru yok)` : 'Bu sayıyı hatırla...'}
            </div>
          </div>
        )}

        {phase==='ask' && ua===null && (
          <>
            <div className="bg-white px-4 py-2 rounded-xl shadow mb-4 text-center max-w-xs">
              <div className="text-sm text-gray-700 font-medium">
                Bu sayı {nBack} öncekiyle aynı mı?
              </div>
              {prevNum!==null && (
                <div className="text-xs text-gray-400 mt-1">({nBack} adım önce: {prevNum})</div>
              )}
            </div>
            <div className="flex gap-4">
              <button onClick={()=>handle('evet')} className="px-10 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl shadow-lg transition-all">
                Evet ✓
              </button>
              <button onClick={()=>handle('hayir')} className="px-10 py-4 bg-red-400 hover:bg-red-500 text-white rounded-xl font-bold text-xl shadow-lg transition-all">
                Hayır ✗
              </button>
            </div>
          </>
        )}

        {phase==='ask' && ua!==null && (
          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${(ua==='evet')===isMatch?'text-green-500':'text-orange-500'}`}>
              {(ua==='evet')===isMatch?'✓ Doğru!':`${encourage()} ${isMatch?'Eşleşiyordu!':'Eşleşmiyordu!'}`}
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700">
              {'💡'} Sayı: {currentNum} — {nBack} adım önce: {prevNum!==null?prevNum:'(henüz yok)'}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SayisalBellek;

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

const TahminKavanozlari = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);
  const [tc,setTc]=useState(0);const [ug,setUg]=useState('');const [sub,setSub]=useState(false);
  const [visible,setVisible]=useState(true);const [peekCount,setPeekCount]=useState(0);
  const [positions,setPositions]=useState([]);const [explained,setExplained]=useState(false);
  const cfg={1:{min:5,max:15},2:{min:10,max:25},3:{min:15,max:35},4:{min:20,max:50}};
  const bCols=['bg-red-500','bg-blue-500','bg-green-500','bg-yellow-400','bg-purple-500','bg-pink-500','bg-orange-500','bg-cyan-500'];

  // Ust uste binmeyen grid pozisyonlari olustur
  const genPositions = (count) => {
    const cols = Math.min(7, Math.ceil(Math.sqrt(count * 1.5)));
    const rows = Math.ceil(count / cols);
    const cellW = 140 / cols;
    const cellH = 190 / rows;
    const pos = [];
    for(let i=0; i<count; i++){
      const col = i % cols;
      const row = Math.floor(i / cols);
      const jitterX = (Math.random()-0.5) * (cellW * 0.3);
      const jitterY = (Math.random()-0.5) * (cellH * 0.3);
      pos.push({
        x: Math.max(2, Math.min(138, 8 + col * cellW + cellW/2 + jitterX)),
        y: Math.max(8, Math.min(198, 190 - (row+1) * cellH + cellH/2 + jitterY)),
        col: bCols[i % bCols.length]
      });
    }
    return pos;
  };

  const showTime = {1:3000,2:2500,3:2000,4:1500};

  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{
    setLv(l);setSc(0);setRd(1);setSub(false);setUg('');setPeekCount(0);
    const c=cfg[l];const count=Math.floor(Math.random()*(c.max-c.min+1))+c.min;
    setTc(count);setPositions(genPositions(count));
    setVisible(true);setGs('playing');
    setTimeout(()=>setVisible(false), showTime[l]);
  };

  const handlePeek = () => {
    setPeekCount(p=>p+1);
    setVisible(true);
    setTimeout(()=>setVisible(false), Math.max(1000, showTime[lv] - peekCount * 500));
  };

  const handleSub=()=>{
    const guess = parseInt(ug) || 0;
    const d=Math.abs(guess-tc);
    setSc(s=>s+(d===0?30:d<=2?25:d<=5?15:5)*lv);
    setSub(true);setVisible(true);setExplained(false);
  };
  const handleExplain=()=>{
    setExplained(true);
    setTimeout(()=>{
      if(rd<TOTAL_ROUNDS){
        const c=cfg[lv];setRd(r=>r+1);
        const count=Math.floor(Math.random()*(c.max-c.min+1))+c.min;
        setTc(count);setPositions(genPositions(count));
        setUg('');setSub(false);setPeekCount(0);setExplained(false);
        setVisible(true);
        setTimeout(()=>setVisible(false), showTime[lv]);
      } else setGs('results');
    },800);
  };

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Tahmin Kavanozlar\u0131" emoji="\uD83E\uDED9" description="Kavanozda ka\u00E7 bilye var? Tam isabet en y\u00FCksek puan\u0131 kazand\u0131r\u0131r. Yak\u0131n tahminler de puan verir!" levels={['Seviye 1 (5-15)','Seviye 2 (10-25)','Seviye 3 (15-35)','Seviye 4 (20-50)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Tahmin Kavanozlar\u0131" emoji="\uD83E\uDED9" level={lv} instruction="Kavanozdaki bilyelere bak ve ka\u00E7 tane oldu\u011Funu tahmin et. Art\u0131/eksi butonlar\u0131yla say\u0131n\u0131 ayarla ve g\u00F6nder!" colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={4} onNextLevel={startG} prevBest={prevBest}/>;

  const guess = parseInt(ug) || 0;
  const diff=Math.abs(guess-tc);

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Tahmin Kavanozlar\u0131" colors={colors}/>

      {/* Kavanoz */}
      <div className="w-48 h-60 bg-white/80 rounded-2xl border-4 border-amber-400 mb-3 relative overflow-hidden">
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-28 h-5 bg-amber-600 rounded-t-lg border-2 border-amber-700 z-10"/>
        <div className="absolute inset-2 top-6">
          {visible ? positions.map((p,i)=>(
            <div key={i} className={`absolute w-5 h-5 ${p.col} rounded-full shadow-md border border-white/50`}
              style={{left:p.x, top:p.y, transform:'translate(-50%,-50%)'}}/>
          )) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">{'\u2753'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tekrar goster butonu */}
      {!visible && !sub && (
        <button onClick={handlePeek} className="mb-3 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-bold hover:bg-amber-200 transition-colors">
          {'\uD83D\uDC41\uFE0F'} Tekrar G\u00F6ster {peekCount > 0 && `(${peekCount}. kullan\u0131m)`}
        </button>
      )}

      {!sub ? (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={()=>setUg(String(Math.max(1,(parseInt(ug)||0)-5)))} className="w-12 h-12 bg-gray-300 rounded-xl font-bold text-xl">-5</button>
            <button onClick={()=>setUg(String(Math.max(1,(parseInt(ug)||0)-1)))} className="w-14 h-14 bg-amber-300 rounded-xl font-bold text-2xl">{'\u2212'}</button>
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-amber-400">
              <input type="number" value={ug} onChange={e=>setUg(e.target.value)} placeholder="?"
                className="w-16 text-center text-4xl font-bold text-amber-600 outline-none bg-transparent" />
            </div>
            <button onClick={()=>setUg(String((parseInt(ug)||0)+1))} className="w-14 h-14 bg-amber-300 rounded-xl font-bold text-2xl">+</button>
            <button onClick={()=>setUg(String((parseInt(ug)||0)+5))} className="w-12 h-12 bg-gray-300 rounded-xl font-bold text-xl">+5</button>
          </div>
          <button onClick={handleSub} disabled={!ug || ug==='0'}
            className={`px-10 py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${ug && ug!=='0' ? `${colors?.button} text-white hover:scale-105` : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
            Tahmin Et
          </button>
        </div>
      ) : (
        <div className={`text-center ${diff===0?'anim-pop':'anim-fade'}`}>
          <div className="text-2xl font-bold text-gray-700 mb-2">Do\u011Fru cevap: {tc}</div>
          <div className={`text-xl font-bold ${diff===0?'text-green-500':diff<=2?'text-green-400':diff<=5?'text-amber-500':'text-orange-500'}`}>
            {diff===0?'\uD83C\uDFAF Tam isabet!':diff<=2?'\uD83D\uDC4F \u00C7ok yakla\u015Ft\u0131n!':diff<=5?`\uD83D\uDCAA Yak\u0131n tahmin! (Fark: ${diff})`:`Fark: ${diff}`}
          </div>
          <div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700 mt-2">
            {'\uD83D\uDCA1'} Kavanozda {tc} bilye vard\u0131. Senin tahminin: {guess}
          </div>
          {!explained && <ExplainStep type="quantity" onDone={handleExplain}/>}
          {explained && <div className="text-xs text-green-600 mt-2 font-medium anim-fade">{'\u2713'} Harika d\u00FC\u015F\u00FCnce!</div>}
        </div>
      )}
    </div>
  );
};

export default TahminKavanozlari;

import React, { useState } from 'react';

const TaramaTestiButton = ({ user, onComplete }) => {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState(0); // 0:intro, 1:dotEnum, 2:numComp, 3:arithmetic, 4:results
  const [qi, setQi] = useState(0);
  const [results, setResults] = useState({dotEnum:[],numComp:[],arith:[]});
  const [startTime, setStartTime] = useState(0);
  const [q, setQ] = useState(null);

  // Dot Enumeration (6 soru): kaç nokta?
  const genDotQ = () => {
    const count = Math.floor(Math.random()*7)+2; // 2-8
    const dots = Array.from({length:count},()=>({x:15+Math.random()*70,y:15+Math.random()*70}));
    const opts = [count]; while(opts.length<4){const o=Math.floor(Math.random()*8)+1;if(!opts.includes(o))opts.push(o);}
    return {type:'dot',count,dots,opts:opts.sort(()=>Math.random()-0.5)};
  };
  // Number Comparison (6 soru): hangisi büyük?
  const genNumQ = () => {
    const a=Math.floor(Math.random()*90)+10, diff=Math.floor(Math.random()*20)+1;
    const b=Math.random()>0.5?a+diff:a-diff;
    const answer=Math.max(a,b);
    return {type:'num',a,b:Math.max(1,b),answer,opts:[a,Math.max(1,b)]};
  };
  // Arithmetic (6 soru): basit toplama/çıkarma
  const genArithQ = () => {
    const a=Math.floor(Math.random()*15)+3, b=Math.floor(Math.random()*8)+1;
    const op=Math.random()>0.4?'+':'-';
    const answer=op==='+'?a+b:a-b;
    const opts=[answer]; while(opts.length<4){const o=answer+Math.floor(Math.random()*7)-3;if(o>0&&!opts.includes(o))opts.push(o);}
    return {type:'arith',a,b,op,answer,opts:opts.sort(()=>Math.random()-0.5)};
  };

  const startPhase = (ph) => {
    setPhase(ph); setQi(0);
    if(ph===1) setQ(genDotQ());
    else if(ph===2) setQ(genNumQ());
    else if(ph===3) setQ(genArithQ());
    setStartTime(Date.now());
  };

  const handleAnswer = (ans) => {
    const rt = Date.now() - startTime;
    const correct = q.type==='num' ? ans===q.answer : ans===q[q.type==='dot'?'count':'answer'];
    const key = q.type==='dot'?'dotEnum':q.type==='num'?'numComp':'arith';
    setResults(prev=>({...prev,[key]:[...prev[key],{correct,rt}]}));

    if(qi < 5) {
      setQi(qi+1);
      if(q.type==='dot') setQ(genDotQ());
      else if(q.type==='num') setQ(genNumQ());
      else setQ(genArithQ());
      setStartTime(Date.now());
    } else {
      if(phase < 3) startPhase(phase + 1);
      else setPhase(4);
    }
  };

  const saveResults = () => {
    const score = {
      dotEnum: {acc: Math.round(results.dotEnum.filter(r=>r.correct).length/6*100), avgRT: Math.round(results.dotEnum.reduce((s,r)=>s+r.rt,0)/6)},
      numComp: {acc: Math.round(results.numComp.filter(r=>r.correct).length/6*100), avgRT: Math.round(results.numComp.reduce((s,r)=>s+r.rt,0)/6)},
      arith: {acc: Math.round(results.arith.filter(r=>r.correct).length/6*100), avgRT: Math.round(results.arith.reduce((s,r)=>s+r.rt,0)/6)},
      date: new Date().toISOString(),
    };
    try {
      const key = `matbil_screening_${user?.name}`;
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      prev.push(score);
      localStorage.setItem(key, JSON.stringify(prev));
    } catch {}
    setActive(false);
    if(onComplete) onComplete(score);
  };

  if(!active) return (
    <button onClick={()=>{setActive(true);setPhase(0);setResults({dotEnum:[],numComp:[],arith:[]});}}
      className="w-full px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all">
      🔬 Sayısal Biliş Tarama Testi
    </button>
  );

  if(phase === 0) return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full text-center shadow-2xl">
        <div className="text-4xl mb-3">🔬</div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Sayısal Biliş Tarama Testi</h3>
        <p className="text-sm text-gray-600 mb-4">3 bölüm × 6 soru = 18 soru. Nokta sayma, sayı karşılaştırma ve basit aritmetik test edilecek. Hem doğruluk hem hız ölçülür.</p>
        <div className="flex gap-3">
          <button onClick={()=>setActive(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">İptal</button>
          <button onClick={()=>startPhase(1)} className="flex-1 py-3 bg-teal-500 text-white rounded-xl font-bold">Başla</button>
        </div>
      </div>
    </div>
  );

  if(phase === 4) return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl">
        <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">📊 Tarama Sonuçları</h3>
        <div className="space-y-2 mb-4">
          {[{key:'dotEnum',name:'Nokta Sayma',emoji:'🔵'},{key:'numComp',name:'Sayı Karşılaştırma',emoji:'⚖️'},{key:'arith',name:'Aritmetik',emoji:'➕'}].map(s=>{
            const d = results[s.key];
            const acc = Math.round(d.filter(r=>r.correct).length/6*100);
            const avgRT = Math.round(d.reduce((sum,r)=>sum+r.rt,0)/6);
            return (
              <div key={s.key} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                <span className="text-xl">{s.emoji}</span>
                <div className="flex-1"><div className="text-xs font-bold text-gray-700">{s.name}</div>
                  <div className="flex gap-3 text-[10px] text-gray-500"><span>Doğruluk: {acc}%</span><span>Ort. Süre: {avgRT}ms</span></div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold ${acc>=80?'bg-green-100 text-green-700':acc>=50?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>{acc>=80?'İyi':acc>=50?'Orta':'Risk'}</div>
              </div>
            );
          })}
        </div>
        <button onClick={saveResults} className="w-full py-3 bg-teal-500 text-white rounded-xl font-bold">✓ Kaydet ve Kapat</button>
      </div>
    </div>
  );

  // Active test phases (1-3)
  const phaseNames = {1:'Nokta Sayma (🔵)',2:'Sayı Karşılaştırma (⚖️)',3:'Aritmetik (➕)'};
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl text-center">
        <div className="text-xs text-gray-400 mb-1">Bölüm {phase}/3: {phaseNames[phase]} — Soru {qi+1}/6</div>
        <div className="h-1 bg-gray-100 rounded-full mb-3"><div className="h-full bg-teal-400 rounded-full transition-all" style={{width:`${((phase-1)*6+qi+1)/18*100}%`}}/></div>

        {q?.type==='dot' && (
          <div className="mb-3">
            <div className="w-40 h-40 bg-gray-50 rounded-xl mx-auto mb-2 relative border-2 border-gray-200">
              {q.dots.map((d,i)=><div key={i} className="absolute w-4 h-4 bg-indigo-500 rounded-full" style={{left:`${d.x}%`,top:`${d.y}%`,transform:'translate(-50%,-50%)'}}/>)}
            </div>
            <div className="text-sm font-bold text-gray-700 mb-2">Kaç nokta var?</div>
            <div className="grid grid-cols-4 gap-2">{q.opts.map((o,i)=><button key={i} onClick={()=>handleAnswer(o)} className="py-3 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-lg hover:bg-indigo-100">{o}</button>)}</div>
          </div>
        )}
        {q?.type==='num' && (
          <div className="mb-3">
            <div className="text-sm font-bold text-gray-700 mb-3">Hangisi daha büyük?</div>
            <div className="flex gap-4 justify-center">{q.opts.map((o,i)=><button key={i} onClick={()=>handleAnswer(o)} className="w-24 py-5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-3xl hover:bg-emerald-100 border-2 border-emerald-200">{o}</button>)}</div>
          </div>
        )}
        {q?.type==='arith' && (
          <div className="mb-3">
            <div className="text-2xl font-bold text-purple-700 mb-3">{q.a} {q.op} {q.b} = ?</div>
            <div className="grid grid-cols-2 gap-2">{q.opts.map((o,i)=><button key={i} onClick={()=>handleAnswer(o)} className="py-4 bg-purple-50 text-purple-700 rounded-lg font-bold text-xl hover:bg-purple-100">{o}</button>)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaramaTestiButton;

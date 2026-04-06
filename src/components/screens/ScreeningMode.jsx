import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playSound, vibrate, shuffle } from '../../utils';

/**
 * Tarama Modu - Hızlı Diskalkuli Risk Değerlendirmesi
 *
 * 4 alt test (toplam ~10-12 dakika):
 * 1. Sanbil (subitizing) - 8 trial
 * 2. Nokta Karşılaştırma (ANS/Weber) - 8 trial
 * 3. Sayı Doğrusu Tahmini - 6 trial
 * 4. Sembol-Miktar Eşleştirme - 8 trial
 *
 * Sonuç: Risk profili (Düşük/Orta/Yüksek) + alan bazlı analiz
 * Referanslar: Butterworth (2003), Halberda ve ark. (2008), Booth & Siegler (2006)
 */
const SCREENING_TESTS = [
  { id: 'subitizing', name: 'Sanbil', emoji: '👁️', trials: 8, desc: 'Noktaları saymadan tanı' },
  { id: 'ans', name: 'Sayı Karşılaştırma', emoji: '👀', trials: 8, desc: 'Hangisi daha çok?' },
  { id: 'numberline', name: 'Sayı Doğrusu', emoji: '📏', trials: 6, desc: 'Sayının yerini bul' },
  { id: 'symbolMapping', name: 'Sembol Eşleme', emoji: '🔗', trials: 8, desc: 'Sayı-miktar eşleştir' },
];

const ScreeningMode = ({ onBack, onComplete, user }) => {
  const [phase, setPhase] = useState('intro'); // intro, testing, results
  const [testIndex, setTestIndex] = useState(0);
  const [trialIndex, setTrialIndex] = useState(0);
  const [puzzle, setPuzzle] = useState(null);
  const [answered, setAnswered] = useState(null);
  const [results, setResults] = useState({});
  const startTime = useRef(null);
  const sessionStart = useRef(null);

  const currentTest = SCREENING_TESTS[testIndex];

  // ---- Sanbil test ----
  const genSubitizing = () => {
    const count = Math.floor(Math.random() * 6) + 2; // 2-7
    const dots = [];
    for (let i = 0; i < count; i++) {
      let x, y, att = 0;
      do {
        x = 15 + Math.random() * 70;
        y = 15 + Math.random() * 70;
        att++;
      } while (att < 20 && dots.some(d => Math.hypot(d.x - x, d.y - y) < 12));
      dots.push({ x, y });
    }
    const options = shuffle([count, count + 1, Math.max(1, count - 1), count + 2].slice(0, 4));
    if (!options.includes(count)) options[0] = count;
    return { type: 'subitizing', dots, answer: count, options: shuffle(options), showTime: 1500 };
  };

  // ---- ANS test ----
  const genANS = () => {
    const ratios = [0.6, 0.67, 0.71, 0.75, 0.8, 0.83];
    const ratio = ratios[Math.floor(Math.random() * ratios.length)];
    const big = Math.floor(Math.random() * 10) + 8;
    const small = Math.max(3, Math.round(big * ratio));
    if (small === big) return genANS();
    const bigLeft = Math.random() > 0.5;
    const n1 = bigLeft ? big : small;
    const n2 = bigLeft ? small : big;
    const isCongruent = Math.random() > 0.5;
    const baseArea = 600;
    const genDots = (count, area) => {
      const avgR = Math.sqrt(area / (count * Math.PI));
      const dots = [];
      for (let i = 0; i < count; i++) {
        let x, y, att = 0;
        const r = Math.max(2.5, avgR * (0.8 + Math.random() * 0.4));
        do { x = 12 + Math.random() * 76; y = 12 + Math.random() * 76; att++; }
        while (att < 25 && dots.some(d => Math.hypot(d.x - x, d.y - y) < (r + d.size + 1)));
        dots.push({ x, y, size: r });
      }
      return dots;
    };
    const aL = isCongruent ? (bigLeft ? baseArea * 1.1 : baseArea * 0.9) : (bigLeft ? baseArea * 0.85 : baseArea * 1.15);
    const aR = isCongruent ? (bigLeft ? baseArea * 0.9 : baseArea * 1.1) : (bigLeft ? baseArea * 1.15 : baseArea * 0.85);
    return { type: 'ans', n1, n2, answer: n1 > n2 ? 'left' : 'right', ratio, isCongruent, dotsLeft: genDots(n1, aL), dotsRight: genDots(n2, aR) };
  };

  // ---- Number Line test ----
  const genNumberLine = () => {
    const ranges = [{ min: 0, max: 10 }, { min: 0, max: 20 }, { min: 0, max: 100 }];
    const range = ranges[Math.min(Math.floor(trialIndex / 2), ranges.length - 1)];
    const target = Math.floor(Math.random() * (range.max - range.min - 2)) + range.min + 1;
    const pct = ((target - range.min) / (range.max - range.min)) * 100;
    // 4 seçenek oluştur
    const opts = [target];
    while (opts.length < 4) {
      const off = Math.floor(Math.random() * Math.ceil((range.max - range.min) * 0.3)) + 1;
      const candidate = target + (Math.random() > 0.5 ? off : -off);
      if (candidate >= range.min && candidate <= range.max && !opts.includes(candidate)) {
        opts.push(candidate);
      }
    }
    return { type: 'numberline', target, range, pct, answer: target, options: shuffle(opts) };
  };

  // ---- Symbol Mapping test ----
  const genSymbolMapping = () => {
    const num = Math.floor(Math.random() * 9) + 1;
    const modes = ['dots', 'fingers', 'word'];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const turkishWords = { 1: 'bir', 2: 'iki', 3: 'üç', 4: 'dört', 5: 'beş', 6: 'altı', 7: 'yedi', 8: 'sekiz', 9: 'dokuz' };
    const opts = [num];
    while (opts.length < 4) {
      const c = Math.floor(Math.random() * 9) + 1;
      if (!opts.includes(c)) opts.push(c);
    }
    return { type: 'symbolMapping', num, mode, word: turkishWords[num], answer: num, options: shuffle(opts) };
  };

  const genPuzzle = useCallback(() => {
    if (!currentTest) return null;
    switch (currentTest.id) {
      case 'subitizing': return genSubitizing();
      case 'ans': return genANS();
      case 'numberline': return genNumberLine();
      case 'symbolMapping': return genSymbolMapping();
      default: return null;
    }
  }, [testIndex, trialIndex]);

  const startScreening = () => {
    setPhase('testing');
    setTestIndex(0);
    setTrialIndex(0);
    setResults({});
    sessionStart.current = Date.now();
    const p = genSubitizing();
    setPuzzle(p);
    startTime.current = Date.now();
  };

  const [showDots, setShowDots] = useState(true);

  useEffect(() => {
    if (phase === 'testing' && puzzle?.type === 'subitizing') {
      setShowDots(true);
      const timer = setTimeout(() => setShowDots(false), puzzle.showTime);
      return () => clearTimeout(timer);
    }
  }, [puzzle, phase]);

  const handleAnswer = (ans) => {
    if (answered !== null) return;
    const rt = Date.now() - (startTime.current || Date.now());
    let correct = false;

    if (currentTest.id === 'ans') {
      correct = ans === puzzle.answer;
    } else {
      correct = ans === puzzle.answer;
    }

    setAnswered({ correct, rt });
    if (correct) playSound('correct');
    else playSound('wrong');

    // Sonucu kaydet
    const testId = currentTest.id;
    setResults(prev => {
      const trials = prev[testId]?.trials || [];
      return {
        ...prev,
        [testId]: {
          trials: [...trials, { correct, rt, ratio: puzzle.ratio, isCongruent: puzzle.isCongruent }],
        },
      };
    });

    setTimeout(() => {
      setAnswered(null);
      const nextTrial = trialIndex + 1;
      if (nextTrial < currentTest.trials) {
        setTrialIndex(nextTrial);
        const p = genPuzzle();
        setPuzzle(p);
        startTime.current = Date.now();
      } else {
        // Sonraki teste geç
        const nextTest = testIndex + 1;
        if (nextTest < SCREENING_TESTS.length) {
          setTestIndex(nextTest);
          setTrialIndex(0);
          // Sonraki testin ilk sorusunu oluştur
          const nextTestObj = SCREENING_TESTS[nextTest];
          let p;
          switch (nextTestObj.id) {
            case 'ans': p = genANS(); break;
            case 'numberline': p = genNumberLine(); break;
            case 'symbolMapping': p = genSymbolMapping(); break;
            default: p = genSubitizing();
          }
          setPuzzle(p);
          startTime.current = Date.now();
        } else {
          setPhase('results');
        }
      }
    }, 1000);
  };

  // ---- Risk hesaplama ----
  const calculateRisk = () => {
    const scores = {};
    let totalCorrect = 0, totalTrials = 0;

    SCREENING_TESTS.forEach(test => {
      const data = results[test.id];
      if (!data) { scores[test.id] = { accuracy: 0, avgRT: 0, risk: 'high' }; return; }
      const correct = data.trials.filter(t => t.correct).length;
      const total = data.trials.length;
      const accuracy = total > 0 ? correct / total : 0;
      const avgRT = total > 0 ? Math.round(data.trials.reduce((s, t) => s + t.rt, 0) / total) : 0;
      totalCorrect += correct;
      totalTrials += total;

      let risk = 'low';
      if (accuracy < 0.4) risk = 'high';
      else if (accuracy < 0.65) risk = 'medium';

      scores[test.id] = { accuracy, avgRT, risk, correct, total };
    });

    const overallAccuracy = totalTrials > 0 ? totalCorrect / totalTrials : 0;
    const highRiskCount = Object.values(scores).filter(s => s.risk === 'high').length;
    const mediumRiskCount = Object.values(scores).filter(s => s.risk === 'medium').length;

    let overallRisk = 'low';
    if (highRiskCount >= 2 || overallAccuracy < 0.4) overallRisk = 'high';
    else if (highRiskCount >= 1 || mediumRiskCount >= 2 || overallAccuracy < 0.6) overallRisk = 'medium';

    const duration = sessionStart.current ? Math.round((Date.now() - sessionStart.current) / 1000) : 0;

    return { scores, overallAccuracy, overallRisk, duration };
  };

  // ---- INTRO ----
  if (phase === 'intro') {
    return (
      <div className="h-screen bg-gradient-to-b from-teal-50 via-cyan-50 to-blue-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="text-5xl mb-3">{"🔍"}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Hızlı Tarama</h2>
            <p className="text-sm text-gray-500 mb-4">Diskalkuli risk değerlendirmesi (~10 dakika)</p>

            <div className="space-y-2 mb-4">
              {SCREENING_TESTS.map((test, i) => (
                <div key={test.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2.5 text-left">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-lg">{test.emoji}</div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-700 text-sm">{test.name}</div>
                    <div className="text-xs text-gray-400">{test.desc} ({test.trials} soru)</div>
                  </div>
                  <div className="text-xs text-gray-300 font-bold">{i + 1}/4</div>
                </div>
              ))}
            </div>

            <div className="bg-teal-50 rounded-xl p-3 mb-4 text-left">
              <div className="text-xs text-teal-700">
                <span className="font-bold">{"📋"} Not:</span> Bu tarama bir tanı aracı değildir. Diskalkuli riski hakkında ön bilgi sağlar. Kesin tanı için uzman değerlendirmesi gereklidir.
              </div>
            </div>

            <button onClick={startScreening}
              className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg bg-gradient-to-r from-teal-400 to-cyan-500 hover:opacity-90 active:scale-[0.97] transition-all">
              {"🚀"} Taramayı Başlat
            </button>
          </div>
          <button onClick={onBack} className="w-full mt-3 py-3 text-gray-500 font-medium text-base hover:text-gray-700 transition-colors">
            {"←"} Geri Dön
          </button>
        </div>
      </div>
    );
  }

  // ---- RESULTS ----
  if (phase === 'results') {
    const { scores, overallAccuracy, overallRisk, duration } = calculateRisk();
    const riskColors = { low: 'text-green-600 bg-green-50 border-green-200', medium: 'text-amber-600 bg-amber-50 border-amber-200', high: 'text-red-600 bg-red-50 border-red-200' };
    const riskLabels = { low: 'Düşük Risk', medium: 'Orta Risk', high: 'Yüksek Risk' };
    const riskEmojis = { low: '🟢', medium: '🟡', high: '🔴' };
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;

    // Sonuçları localStorage'a kaydet
    try {
      if (user?.id) {
        const key = `matbil_screening_${user.id}`;
        const prev = JSON.parse(localStorage.getItem(key) || '[]');
        prev.push({ date: new Date().toISOString(), scores, overallAccuracy, overallRisk, duration });
        localStorage.setItem(key, JSON.stringify(prev));
      }
    } catch {}

    return (
      <div className="h-screen bg-gradient-to-b from-teal-50 via-cyan-50 to-blue-50 flex flex-col overflow-y-auto">
        <div className="w-full max-w-sm mx-auto p-4">
          <div className="bg-white rounded-2xl shadow-xl p-5 mb-4">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{riskEmojis[overallRisk]}</div>
              <h2 className="text-xl font-bold text-gray-800">Tarama Sonuçları</h2>
              <div className={`inline-block mt-2 px-4 py-1.5 rounded-full text-sm font-bold border ${riskColors[overallRisk]}`}>
                {riskLabels[overallRisk]}
              </div>
              <div className="text-xs text-gray-400 mt-1">Genel doğruluk: {Math.round(overallAccuracy * 100)}% | Süre: {mins}dk {secs}sn</div>
            </div>

            <div className="space-y-2.5">
              {SCREENING_TESTS.map(test => {
                const s = scores[test.id];
                if (!s) return null;
                return (
                  <div key={test.id} className={`rounded-xl border p-3 ${riskColors[s.risk]}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{test.emoji}</span>
                        <span className="font-bold text-sm">{test.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">{Math.round(s.accuracy * 100)}%</span>
                        <span className="text-xs">{riskEmojis[s.risk]}</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-current transition-all" style={{ width: `${s.accuracy * 100}%` }} />
                    </div>
                    <div className="text-[10px] mt-1 opacity-75">{s.correct}/{s.total} doğru | Ort. {s.avgRT}ms</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-4 mb-4">
            <div className="text-sm font-bold text-gray-700 mb-2">{"📋"} Yorum</div>
            <div className="text-xs text-gray-600 leading-relaxed">
              {overallRisk === 'high' && 'Birden fazla alanda zorluk gözlemlendi. Uzman değerlendirmesi önerilir. Bu sonuç kesin tanı niteliği taşımaz; ancak ayrıntılı değerlendirme yapılmasını işaret etmektedir.'}
              {overallRisk === 'medium' && 'Bazı alanlarda geliştirilmesi gereken noktalar var. Düzenli uygulama ile iyileştirme mümkün. Zorlanan alanlardaki oyunlara öncelik verin.'}
              {overallRisk === 'low' && 'Tarama sonuçları olumlu. Temel sayısal beceriler yaşa uygun düzeyde görünüyor. Düzenli pratikle becerilerin pekiştirilmesi önerilir.'}
            </div>
            <div className="mt-2 text-[10px] text-gray-400 italic">
              Butterworth (2003); Halberda ve ark. (2008); Booth & Siegler (2006) tarama kriterleri referans alınmıştır.
            </div>
          </div>

          <div className="space-y-2">
            <button onClick={onBack} className="w-full py-3.5 bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-xl font-bold text-base active:scale-95 transition-transform">
              {"🏠"} Ana Menüye Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- TESTING ----
  const totalTrials = SCREENING_TESTS.reduce((s, t) => s + t.trials, 0);
  const completedTrials = SCREENING_TESTS.slice(0, testIndex).reduce((s, t) => s + t.trials, 0) + trialIndex;
  const overallPct = (completedTrials / totalTrials) * 100;

  return (
    <div className="h-screen bg-gradient-to-b from-teal-50 via-cyan-50 to-blue-50 flex flex-col items-center p-3 overflow-hidden">
      {/* Üst bar */}
      <div className="w-full max-w-md shrink-0 bg-white rounded-xl p-2.5 mb-2 shadow-md border border-teal-200">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentTest.emoji}</span>
            <span className="font-bold text-teal-700 text-sm">{currentTest.name}</span>
          </div>
          <div className="text-xs text-gray-500">{trialIndex + 1}/{currentTest.trials}</div>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 transition-all duration-500" style={{ width: `${overallPct}%` }} />
        </div>
        <div className="text-[10px] text-gray-400 mt-0.5 text-right">Alt test {testIndex + 1}/4</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-0 w-full max-w-md">
        {/* Sanbil */}
        {puzzle?.type === 'subitizing' && (
          <div>
            <div className="relative bg-white rounded-2xl shadow-lg border-2 border-gray-100 mb-4" style={{ width: 200, height: 200 }}>
              {showDots ? puzzle.dots.map((d, i) => (
                <div key={i} className="absolute w-5 h-5 bg-teal-500 rounded-full" style={{ left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%,-50%)' }} />
              )) : (
                <div className="flex items-center justify-center h-full text-4xl text-gray-200">{"?"}</div>
              )}
            </div>
            {!showDots && (
              <div className="grid grid-cols-2 gap-2.5 w-64">
                {puzzle.options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(opt)} disabled={answered !== null}
                    className={`py-4 rounded-xl font-bold text-xl transition-all ${
                      answered !== null
                        ? opt === puzzle.answer ? 'bg-green-100 text-green-600 border-2 border-green-300' : answered?.correct === false && opt !== puzzle.answer ? 'bg-gray-50 text-gray-300' : 'bg-gray-50 text-gray-300'
                        : 'bg-white shadow-md border-2 border-gray-100 hover:border-teal-300 active:scale-95'
                    }`}>{opt}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANS */}
        {puzzle?.type === 'ans' && (
          <div>
            <div className="text-base font-bold text-gray-600 mb-3 text-center">Hangisinde daha çok?</div>
            <div className="flex gap-4 mb-3">
              <button onClick={() => handleAnswer('left')} disabled={answered !== null}
                className={`relative rounded-2xl border-2 shadow-lg transition-all ${
                  answered !== null ? (puzzle.answer === 'left' ? 'border-green-400 bg-green-50' : 'border-gray-200 opacity-50') : 'border-gray-200 bg-white hover:border-teal-300 active:scale-95'
                }`} style={{ width: 140, height: 140 }}>
                {puzzle.dotsLeft.map((d, i) => (
                  <div key={i} className="absolute bg-teal-500 rounded-full" style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size * 2, height: d.size * 2, transform: 'translate(-50%,-50%)' }} />
                ))}
              </button>
              <div className="flex items-center"><span className="text-xl font-bold text-gray-300">VS</span></div>
              <button onClick={() => handleAnswer('right')} disabled={answered !== null}
                className={`relative rounded-2xl border-2 shadow-lg transition-all ${
                  answered !== null ? (puzzle.answer === 'right' ? 'border-green-400 bg-green-50' : 'border-gray-200 opacity-50') : 'border-gray-200 bg-white hover:border-cyan-300 active:scale-95'
                }`} style={{ width: 140, height: 140 }}>
                {puzzle.dotsRight.map((d, i) => (
                  <div key={i} className="absolute bg-cyan-500 rounded-full" style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size * 2, height: d.size * 2, transform: 'translate(-50%,-50%)' }} />
                ))}
              </button>
            </div>
          </div>
        )}

        {/* Number Line */}
        {puzzle?.type === 'numberline' && (
          <div className="w-full max-w-xs">
            <div className="mb-6">
              <div className="relative h-3 bg-gray-200 rounded-full mx-4">
                <div className="absolute top-1/2 -translate-y-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-teal-500" style={{ left: `${puzzle.pct}%`, transform: 'translateX(-50%)' }} />
                <div className="absolute -bottom-5 left-0 text-xs font-bold text-gray-500">{puzzle.range.min}</div>
                <div className="absolute -bottom-5 right-0 text-xs font-bold text-gray-500">{puzzle.range.max}</div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-400">{Math.round((puzzle.range.max - puzzle.range.min) / 2)}</div>
              </div>
            </div>
            <div className="text-center text-base font-bold text-gray-600 mb-4 mt-8">Okun gösterdiği sayı hangisi?</div>
            <div className="grid grid-cols-2 gap-2.5">
              {puzzle.options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(opt)} disabled={answered !== null}
                  className={`py-4 rounded-xl font-bold text-xl transition-all ${
                    answered !== null
                      ? opt === puzzle.answer ? 'bg-green-100 text-green-600 border-2 border-green-300' : 'bg-gray-50 text-gray-300'
                      : 'bg-white shadow-md border-2 border-gray-100 hover:border-teal-300 active:scale-95'
                  }`}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {/* Symbol Mapping */}
        {puzzle?.type === 'symbolMapping' && (
          <div>
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-4 text-center min-w-[200px]">
              {puzzle.mode === 'dots' && (
                <div className="flex flex-wrap justify-center gap-2">
                  {Array.from({ length: puzzle.num }, (_, i) => (
                    <div key={i} className="w-6 h-6 bg-teal-500 rounded-full" />
                  ))}
                </div>
              )}
              {puzzle.mode === 'fingers' && (
                <div className="text-5xl">
                  {puzzle.num <= 5 ? '🖐️' : '🖐️🖐️'}
                  <div className="text-lg text-gray-500 mt-1">{puzzle.num} parmak</div>
                </div>
              )}
              {puzzle.mode === 'word' && (
                <div className="text-3xl font-bold text-teal-700">{puzzle.word}</div>
              )}
            </div>
            <div className="text-center text-sm font-bold text-gray-600 mb-3">Bu kaç?</div>
            <div className="grid grid-cols-2 gap-2.5 w-64">
              {puzzle.options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(opt)} disabled={answered !== null}
                  className={`py-4 rounded-xl font-bold text-xl transition-all ${
                    answered !== null
                      ? opt === puzzle.answer ? 'bg-green-100 text-green-600 border-2 border-green-300' : 'bg-gray-50 text-gray-300'
                      : 'bg-white shadow-md border-2 border-gray-100 hover:border-teal-300 active:scale-95'
                  }`}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        {answered !== null && (
          <div className={`mt-3 text-center text-lg font-bold ${answered.correct ? 'text-green-500' : 'text-orange-500'}`}>
            {answered.correct ? '✓' : '✗'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreeningMode;

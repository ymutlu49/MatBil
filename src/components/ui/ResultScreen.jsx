import React, { useEffect } from 'react';
import { TOTAL_ROUNDS, playSound } from '../../utils';

const Confetti = () => (
  <div className="confetti-container absolute inset-0 pointer-events-none overflow-hidden">
    {Array.from({length: 20}, (_, i) => (
      <div key={i} className="confetti-piece" style={{
        left: `${5 + Math.random() * 90}%`,
        animationDelay: `${Math.random() * 1.5}s`,
        backgroundColor: ['#FF6B6B','#4ECDC4','#FFE66D','#A78BFA','#34D399','#F472B6','#60A5FA'][i % 7],
      }}/>
    ))}
  </div>
);

const ResultScreen = ({ score, onReplay, onBack, onLevelMenu, colors, onComplete, level, maxLevel, onNextLevel, prevBest }) => {
  useEffect(() => { if (onComplete) onComplete(score, level || 1); }, []);
  const maxScore = (TOTAL_ROUNDS * 30 * (level || 1));
  const pct = Math.min(100, Math.round((score / Math.max(maxScore, 1)) * 100));
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;
  const isNewRecord = prevBest > 0 && score > prevBest;
  const msg = isNewRecord ? 'Yeni Rekor!' : stars === 3 ? 'Mükemmel!' : stars === 2 ? 'Çok iyi!' : stars === 1 ? 'İyi başlangıç!' : 'Tekrar dene!';
  const canNext = stars >= 2 && level && maxLevel && level < maxLevel;

  useEffect(() => {
    if (stars === 3) playSound('correct');
  }, []);

  return (
    <div className={`h-screen ${colors?.bg || 'bg-gray-50'} flex flex-col items-center justify-center p-4 overflow-hidden anim-slide-up relative`}
      role="status" aria-live="polite" aria-label={`Sonuç: ${score} puan, ${stars} yıldız. ${msg}`}>
      {stars === 3 && <Confetti />}
      <div className="text-6xl mb-3 anim-pop">{isNewRecord ? '🏅' : stars >= 2 ? '🏆' : stars === 1 ? '💪' : '🎯'}</div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">{msg}</h2>
      <div className="flex gap-2 mb-4">{[1,2,3].map(i => <span key={i} className={`text-5xl transition-all duration-300 ${i <= stars ? 'scale-110' : 'opacity-30 scale-90'}`} style={{animationDelay: `${i*0.2}s`}}>{i <= stars ? '⭐' : '☆'}</span>)}</div>
      <div className="bg-yellow-100 px-10 py-4 rounded-2xl mb-4 border-4 border-yellow-300 shadow-lg">
        <span className="text-5xl font-bold text-yellow-600">{score}</span>
        <span className="text-yellow-600 text-xl ml-2">Puan</span>
      </div>
      {prevBest > 0 && <div className={`text-base mb-4 px-5 py-2 rounded-full ${isNewRecord ? 'bg-green-100 text-green-700 font-bold' : 'bg-gray-100 text-gray-500'}`}>
        {isNewRecord ? `Önceki: ${prevBest} → Yeni: ${score} 🎉` : `Kişisel rekorun: ${prevBest}`}
      </div>}
      <div className="space-y-2.5 w-72">
        {canNext && <button onClick={() => onNextLevel ? onNextLevel(level + 1) : null} className={`w-full py-4 ${colors?.button || 'bg-indigo-500'} text-white rounded-xl font-bold text-lg shadow-lg animate-pulse active:scale-95 transition-transform`}>▶ Sonraki Seviye</button>}
        <button onClick={onReplay} className={`w-full py-4 ${canNext ? 'bg-white border-2 border-gray-300 text-gray-700' : (colors?.button || 'bg-indigo-500') + ' text-white'} rounded-xl font-bold text-lg active:scale-95 transition-transform`}>🔄 Tekrar Oyna</button>
        {onLevelMenu && <button onClick={onLevelMenu} className="w-full py-4 bg-blue-100 text-blue-700 rounded-xl font-bold text-lg active:scale-95 transition-transform">📋 Düzey Menüsü</button>}
        <button onClick={onBack} className="w-full py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg active:scale-95 transition-transform">🏠 Ana Menü</button>
      </div>
    </div>
  );
};

export default ResultScreen;

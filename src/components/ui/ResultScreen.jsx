import React, { useEffect } from 'react';
import { TOTAL_ROUNDS } from '../../utils';

const ResultScreen = ({ score, onReplay, onBack, onLevelMenu, colors, onComplete, level, maxLevel, onNextLevel, prevBest }) => {
  useEffect(() => { if (onComplete) onComplete(score, level || 1); }, []);
  const maxScore = (TOTAL_ROUNDS * 30 * (level || 1));
  const pct = Math.min(100, Math.round((score / Math.max(maxScore, 1)) * 100));
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;
  const isNewRecord = prevBest > 0 && score > prevBest;
  const msg = isNewRecord ? 'Yeni Rekor! 🏅' : stars === 3 ? 'Mükemmel! 🌟' : stars === 2 ? 'Çok iyi! 👏' : stars === 1 ? 'İyi başlangıç! 💪' : 'Tekrar dene! 🔄';
  const canNext = stars >= 2 && level && maxLevel && level < maxLevel;
  return (
    <div className={`h-screen ${colors?.bg || 'bg-gray-50'} flex flex-col items-center justify-center p-3 overflow-hidden anim-slide-up`}>
      <div className="text-5xl mb-2 anim-pop">{isNewRecord ? '🏅' : stars >= 2 ? '🏆' : '🎯'}</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">{msg}</h2>
      <div className="flex gap-1 mb-3">{[1,2,3].map(i => <span key={i} className="text-3xl">{i <= stars ? '⭐' : '☆'}</span>)}</div>
      <div className="bg-yellow-100 px-8 py-3 rounded-2xl mb-3 border-4 border-yellow-300">
        <span className="text-5xl font-bold text-yellow-600">{score}</span>
        <span className="text-yellow-600 text-xl ml-2">Puan</span>
      </div>
      {prevBest > 0 && <div className={`text-sm mb-3 px-4 py-1.5 rounded-full ${isNewRecord ? 'bg-green-100 text-green-700 font-bold' : 'bg-gray-100 text-gray-500'}`}>
        {isNewRecord ? `Önceki rekor: ${prevBest} → Yeni: ${score} ` : `Kişisel rekorun: ${prevBest}`}
      </div>}
      <div className="space-y-2 w-64">
        {canNext && <button onClick={() => onNextLevel ? onNextLevel(level + 1) : null} className={`w-full py-3 ${colors?.button || 'bg-indigo-500'} text-white rounded-xl font-bold text-base shadow-lg animate-pulse`}>▶ Sonraki Seviye</button>}
        <button onClick={onReplay} className={`w-full py-3 ${canNext ? 'bg-white border-2 border-gray-300 text-gray-700' : (colors?.button || 'bg-indigo-500') + ' text-white'} rounded-xl font-bold text-base`}>🔄 Tekrar Oyna</button>
        {onLevelMenu && <button onClick={onLevelMenu} className="w-full py-3 bg-blue-100 text-blue-700 rounded-xl font-bold text-base">📋 Düzey Menüsü</button>}
        <button onClick={onBack} className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-bold text-base">🏠 Ana Menü</button>
      </div>
    </div>
  );
};

export default ResultScreen;

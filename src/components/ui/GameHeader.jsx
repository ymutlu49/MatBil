import React, { useState } from 'react';
import { TOTAL_ROUNDS } from '../../utils';
import { HELP_MAP } from '../../constants/helpMap';

const GameHeader = ({ onBack, onLevelMenu, round, score, title, colors, total, hideRound }) => {
  const [showHelp, setShowHelp] = useState(false);
  const t = total || TOTAL_ROUNDS;
  const pct = round > 0 ? (round / t) * 100 : 0;
  const helpKey = Object.keys(HELP_MAP).find(k => title?.includes(k));
  const help = helpKey ? HELP_MAP[helpKey] : null;
  return (
    <div className={`w-full shrink-0 ${colors?.light || 'bg-gray-100'} rounded-xl p-2.5 mb-2 shadow-md border ${colors?.border || 'border-gray-200'} relative`}>
      {showHelp && help && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 mx-1 bg-white rounded-xl shadow-2xl border-2 border-indigo-200 p-4 anim-fade">
          <div className="flex justify-between items-start mb-2">
            <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">🧠 {help.goal}</div>
            <button onClick={() => setShowHelp(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-lg hover:bg-gray-200">✕</button>
          </div>
          <div className="flex items-start gap-2">
            <p className="text-base text-gray-600 leading-relaxed flex-1">💡 {help.tip}</p>
            <button onClick={() => { try { const u = new SpeechSynthesisUtterance(help.tip); u.lang='tr-TR'; u.rate=0.85; u.pitch=1.1; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch{} }}
              className="shrink-0 w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 hover:bg-indigo-100 flex items-center justify-center" title="Sesli oku">🔊</button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          {onLevelMenu && <button onClick={onLevelMenu} className="px-3 py-2 bg-white text-gray-600 rounded-lg font-bold text-sm border border-gray-300 hover:bg-gray-50 active:scale-95 transition-all">← Düzey</button>}
          <button onClick={onBack} className="px-3 py-2 bg-gray-200 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-300 active:scale-95 transition-all">🏠</button>
        </div>
        <div className={`${colors?.text || 'text-gray-700'} font-bold text-base truncate max-w-[160px]`}>{title}</div>
        <div className="flex items-center gap-1.5">
          {help && <button onClick={() => setShowHelp(!showHelp)} className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-bold text-sm hover:bg-indigo-200 transition-colors flex items-center justify-center">?</button>}
          <div className="bg-yellow-100 px-3 py-1 rounded-full font-bold text-base text-yellow-700" role="status" aria-label={`Puan: ${score}`}>⭐{score}</div>
        </div>
      </div>
      {round > 0 && <div className="mt-1.5">
        <div className="flex justify-between text-sm text-gray-500 mb-0.5"><span>{hideRound ? '●●●' : `${round}/${t}`}</span><span>⭐ {score}</span></div>
        <div className="w-full h-2.5 bg-white rounded-full overflow-hidden shadow-inner"><div className={`h-full rounded-full bg-gradient-to-r ${colors?.gradient || 'from-indigo-400 to-purple-500'} transition-all duration-500`} style={{width:`${pct}%`}}/></div>
      </div>}
    </div>
  );
};

export default GameHeader;

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
    <div className={`w-full ${colors?.light || 'bg-gray-100'} rounded-xl p-2 mb-2 shadow-md border ${colors?.border || 'border-gray-200'} relative`}>
      {showHelp && help && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 mx-1 bg-white rounded-xl shadow-2xl border-2 border-indigo-200 p-3 anim-fade">
          <div className="flex justify-between items-start mb-2">
            <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">🧠 {help.goal}</div>
            <button onClick={() => setShowHelp(false)} className="text-gray-400 text-lg leading-none hover:text-gray-600">x</button>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">💡 {help.tip}</p>
        </div>
      )}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          {onLevelMenu && <button onClick={onLevelMenu} className="px-2 py-1.5 bg-white text-gray-600 rounded-lg font-bold text-xs border border-gray-300 hover:bg-gray-50">← Düzey</button>}
          <button onClick={onBack} className="px-2 py-1.5 bg-gray-200 text-gray-600 rounded-lg font-bold text-xs hover:bg-gray-300">🏠</button>
        </div>
        <div className={`${colors?.text || 'text-gray-700'} font-bold text-sm truncate max-w-[140px]`}>{title}</div>
        <div className="flex items-center gap-1">
          {help && <button onClick={() => setShowHelp(!showHelp)} className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full font-bold text-xs hover:bg-indigo-200 transition-colors">?</button>}
          <div className="bg-yellow-100 px-2 py-0.5 rounded-full font-bold text-sm text-yellow-700" role="status" aria-label={`Puan: ${score}`}>⭐{score}</div>
        </div>
      </div>
      {round > 0 && <div className="mt-1">
        <div className="flex justify-between text-xs text-gray-500 mb-0.5"><span>{hideRound ? '●●●' : `${round}/${t}`}</span><span>⭐ {score}</span></div>
        <div className="w-full h-1.5 bg-white rounded-full overflow-hidden"><div className={`h-full rounded-full bg-gradient-to-r ${colors?.gradient || 'from-indigo-400 to-purple-500'} transition-all duration-500`} style={{width:`${pct}%`}}/></div>
      </div>}
    </div>
  );
};

export default GameHeader;

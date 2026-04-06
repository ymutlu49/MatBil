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
    <div className={`w-full shrink-0 ${colors?.light || 'bg-gray-100'} rounded-2xl p-3 mb-3 shadow-lg border ${colors?.border || 'border-gray-200'} relative`}>
      {showHelp && help && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 mx-1 bg-white rounded-2xl shadow-2xl border-2 border-indigo-200 p-4 anim-fade">
          <div className="flex justify-between items-start mb-2">
            <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{"🧠"} {help.goal}</div>
            <button onClick={() => setShowHelp(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-lg hover:bg-gray-200">{"✕"}</button>
          </div>
          <div className="flex items-start gap-2">
            <p className="text-sm text-gray-600 leading-relaxed flex-1">{"💡"} {help.tip}</p>
            <button onClick={() => { try { const u = new SpeechSynthesisUtterance(help.tip); u.lang='tr-TR'; u.rate=0.85; u.pitch=1.1; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch{} }}
              className="shrink-0 w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 hover:bg-indigo-100 flex items-center justify-center" title="Sesli oku">{"🔊"}</button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {onLevelMenu && <button onClick={onLevelMenu} className="px-3 py-2 bg-white text-gray-600 rounded-xl font-bold text-sm border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all shadow-sm">{"←"} Düzey</button>}
          <button onClick={onBack} className="px-3 py-2 bg-white text-gray-600 rounded-xl font-bold text-sm border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all shadow-sm">{"🏠"}</button>
        </div>
        <div className={`${colors?.text || 'text-gray-700'} font-bold text-sm truncate max-w-[140px]`}>{title}</div>
        <div className="flex items-center gap-1.5">
          {help && <button onClick={() => setShowHelp(!showHelp)} className="w-8 h-8 bg-white text-indigo-600 rounded-full font-bold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center shadow-sm border border-indigo-100">{"?"}</button>}
          <div className="bg-gradient-to-r from-yellow-100 to-amber-100 px-3 py-1.5 rounded-full font-bold text-sm text-amber-700 shadow-sm border border-amber-200" role="status" aria-label={`Puan: ${score}`}>{"⭐"}{score}</div>
        </div>
      </div>
      {round > 0 && <div className="mt-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{hideRound ? '●●●' : `${round}/${t}`}</span><span>{"⭐"} {score}</span></div>
        <div className="w-full h-2.5 bg-white rounded-full overflow-hidden shadow-inner border border-gray-100"><div className={`h-full rounded-full bg-gradient-to-r ${colors?.gradient || 'from-indigo-400 to-purple-500'} transition-all duration-500`} style={{width:`${pct}%`}}/></div>
      </div>}
    </div>
  );
};

export default GameHeader;

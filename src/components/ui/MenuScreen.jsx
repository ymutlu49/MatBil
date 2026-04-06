import React from 'react';

const MenuScreen = ({ onBack, onStart, title, emoji, levels, colors, description }) => (
  <div className={`h-screen ${colors?.bg || 'bg-gray-50'} flex flex-col items-center justify-center p-4 overflow-hidden relative anim-slide-up`}>
    <button onClick={onBack} className={`absolute top-4 right-4 px-5 py-3 ${colors?.button || 'bg-indigo-500'} text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-transform`}>{"🏠"} Geri</button>
    <div className="text-6xl mb-4 drop-shadow-sm">{emoji}</div>
    <h1 className="text-2xl font-bold text-gray-800 mb-1">{title}</h1>
    {description && <p className="text-gray-500 text-sm text-center max-w-xs mb-5 leading-relaxed">{description}</p>}
    <div className="space-y-3 w-full max-w-sm">
      {levels.map((lvl, i) => (
        <button key={i} onClick={() => onStart(i + 1)}
          className={`w-full py-4 rounded-2xl text-white font-bold text-base bg-gradient-to-r ${colors?.gradient || 'from-indigo-400 to-purple-500'} shadow-lg hover:shadow-xl hover:opacity-95 active:scale-[0.97] transition-all border border-white/20`}>
          {lvl}
        </button>
      ))}
    </div>
  </div>
);

export default MenuScreen;

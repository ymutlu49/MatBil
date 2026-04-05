import React from 'react';

const MenuScreen = ({ onBack, onStart, title, emoji, levels, colors, description }) => (
  <div className={`h-screen ${colors?.bg || 'bg-gray-50'} flex flex-col items-center justify-center p-4 overflow-hidden relative anim-slide-up`}>
    <button onClick={onBack} className={`absolute top-4 right-4 px-5 py-3 ${colors?.button || 'bg-indigo-500'} text-white rounded-xl font-bold text-base active:scale-95 transition-transform`}>🏠 Geri</button>
    <div className="text-6xl mb-3">{emoji}</div>
    <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
    {description && <p className="text-gray-500 text-base text-center max-w-xs mb-4 leading-relaxed">{description}</p>}
    <div className="space-y-3 w-full max-w-sm">
      {levels.map((lvl, i) => (
        <button key={i} onClick={() => onStart(i + 1)} className={`w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r ${colors?.gradient || 'from-indigo-400 to-purple-500'} shadow-lg hover:opacity-90 active:scale-[0.97] transition-all`}>{lvl}</button>
      ))}
    </div>
  </div>
);

export default MenuScreen;

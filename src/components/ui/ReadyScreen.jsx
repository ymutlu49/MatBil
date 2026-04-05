import React from 'react';

const ReadyScreen = ({ title, emoji, level, levelLabel, instruction, colors, onStart, onBack }) => (
  <div className={`h-screen ${colors?.bg || 'bg-gray-50'} flex flex-col items-center justify-center p-3 overflow-hidden`}>
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl shadow-xl p-5 text-center">
        <div className="text-4xl mb-2">{emoji}</div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">{title}</h2>
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 bg-gradient-to-r ${colors?.gradient || 'from-indigo-400 to-purple-500'} text-white`}>
          {levelLabel || `Seviye ${level}`}
        </div>
        <div className={`${colors?.light || 'bg-gray-100'} rounded-xl p-2.5 mb-3`}>
          <p className="text-gray-600 text-sm leading-relaxed">{'��'} {instruction}</p>
        </div>
        <button onClick={onStart}
          className={`w-full py-3 rounded-xl text-white font-bold text-lg shadow-lg bg-gradient-to-r ${colors?.gradient || 'from-indigo-400 to-purple-500'} hover:opacity-90 active:scale-[0.98] transition-all`}>
          {'��'} Başla
        </button>
      </div>
      <button onClick={onBack} className="w-full mt-2 py-2 text-gray-500 font-medium text-sm hover:text-gray-700 transition-colors">
        ← Seviye Seçimine Dön
      </button>
    </div>
  </div>
);

export default ReadyScreen;

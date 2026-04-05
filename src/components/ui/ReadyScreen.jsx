import React from 'react';

const ReadyScreen = ({ title, emoji, level, levelLabel, instruction, colors, onStart, onBack }) => (
  <div className={`h-screen ${colors?.bg || 'bg-gray-50'} flex flex-col items-center justify-center p-4 overflow-hidden`}>
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
        <div className="text-5xl mb-3">{emoji}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4 bg-gradient-to-r ${colors?.gradient || 'from-indigo-400 to-purple-500'} text-white`}>
          {levelLabel || `Seviye ${level}`}
        </div>
        <div className={`${colors?.light || 'bg-gray-100'} rounded-xl p-4 mb-4`}>
          <p className="text-gray-600 text-base leading-relaxed">📋 {instruction}</p>
        </div>
        <button onClick={onStart}
          className={`w-full py-4 rounded-xl text-white font-bold text-xl shadow-lg bg-gradient-to-r ${colors?.gradient || 'from-indigo-400 to-purple-500'} hover:opacity-90 active:scale-[0.97] transition-all`}>
          🚀 Başla
        </button>
      </div>
      <button onClick={onBack} className="w-full mt-3 py-3 text-gray-500 font-medium text-base hover:text-gray-700 transition-colors">
        ← Seviye Seçimine Dön
      </button>
    </div>
  </div>
);

export default ReadyScreen;

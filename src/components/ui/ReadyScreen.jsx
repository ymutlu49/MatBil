import React, { useState, useCallback } from 'react';

const speakText = (text) => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'tr-TR';
      u.rate = 0.85;
      u.pitch = 1.1;
      window.speechSynthesis.speak(u);
    }
  } catch {}
};

const ReadyScreen = ({ title, emoji, level, levelLabel, instruction, colors, onStart, onBack }) => {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = useCallback(() => {
    setSpeaking(true);
    speakText(`${title}. ${instruction}`);
    setTimeout(() => setSpeaking(false), 3000);
  }, [title, instruction]);

  return (
    <div className={`h-screen ${colors?.bg || 'bg-gray-50'} flex flex-col items-center justify-center p-4 overflow-hidden`}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
          <div className="text-5xl mb-3">{emoji}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
          <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4 bg-gradient-to-r ${colors?.gradient || 'from-indigo-400 to-purple-500'} text-white`}>
            {levelLabel || `Seviye ${level}`}
          </div>
          <div className={`${colors?.light || 'bg-gray-100'} rounded-xl p-4 mb-4 relative`}>
            <p className="text-gray-600 text-base leading-relaxed pr-8">📋 {instruction}</p>
            <button onClick={handleSpeak}
              className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${speaking ? 'bg-indigo-500 text-white animate-pulse' : 'bg-white text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 shadow-sm'}`}
              title="Sesli oku" aria-label="Talimatı sesli oku">
              🔊
            </button>
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
};

export default ReadyScreen;

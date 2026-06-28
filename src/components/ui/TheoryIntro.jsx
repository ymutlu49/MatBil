import React from 'react';
import { CHAPTER_MAP } from '../../constants/skillGraph';
import { HELP_MAP } from '../../constants/helpMap';

/**
 * TheoryIntro - Oyun öncesi çocuk dostu "Biliyor muydun?" açıklaması
 * Önce HELP_MAP'ten oyuna özel childInfo kullanır.
 * Yoksa CHAPTER_MAP'ten kategoriye özgü childTheory'ye düşer.
 */
const TheoryIntro = ({ categoryId, gameName, gameEmoji, onStart, onSkip }) => {
  const chapter = CHAPTER_MAP[categoryId];
  const helpEntry = HELP_MAP[gameName];

  // Oyuna özel açıklama öncelikli, yoksa kategoriye özgü genel açıklama
  const childText = helpEntry?.childInfo || chapter?.childTheory;

  if (!childText) {
    onStart();
    return null;
  }

  return (
    <div className="h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl p-5 text-center">
          {/* Oyun başlığı */}
          <div className="text-4xl mb-2">{gameEmoji}</div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">{gameName}</h2>

          {/* Çocuk dostu teori açıklaması */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 text-left">
            <div className="flex items-start gap-2">
              <span className="text-xl shrink-0 mt-0.5">{"💡"}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-bold text-indigo-700">Biliyor muydun?</div>
                  <button onClick={() => { try { const u = new SpeechSynthesisUtterance(childText); u.lang='tr-TR'; u.rate=0.85; u.pitch=1.1; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch{} }}
                    className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-500 hover:bg-indigo-200 flex items-center justify-center text-xs" title="Sesli oku">{"🔊"}</button>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {childText}
                </p>
              </div>
            </div>
          </div>

          {/* Butonlar */}
          <button
            onClick={onStart}
            className="w-full py-3.5 rounded-xl text-white font-bold text-base shadow-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 active:scale-[0.97] transition-all mb-2"
          >
            {"🚀"} Oyuna Başla!
          </button>
          <button
            onClick={onSkip}
            className="w-full py-2 text-gray-500 text-xs font-medium hover:text-gray-700 transition-colors"
          >
            Doğrudan başla {"→"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TheoryIntro;

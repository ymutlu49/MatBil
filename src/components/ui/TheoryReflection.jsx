import React from 'react';
import { CHAPTER_MAP, GAME_CHAPTER_MAP } from '../../constants/skillGraph';

/**
 * TheoryReflection - Oyun sonrasi teori yansitma ekrani
 * Performansa gore childWeakMsg veya childStrongMsg gosterir.
 * "Teori -> Pratik -> Yansıtma" dongusunu kapatir.
 * "Kitabı Oku" butonu ile bolgesel derin okumaya yonlendirir.
 */
const TheoryReflection = ({ categoryId, gameId, gameName, stars, onContinue, onPlayAgain, onOpenBook }) => {
  const chapter = CHAPTER_MAP[categoryId];
  if (!chapter) return null;

  const isStrong = stars >= 2;
  const message = isStrong ? chapter.childStrongMsg : chapter.childWeakMsg;
  const gameChapter = gameId ? GAME_CHAPTER_MAP[gameId] : null;
  const chapterNum = gameChapter?.primary;
  const shortLabel = chapterNum
    ? `Bölüm ${chapterNum}`
    : (chapter.chapters[0]?.match(/Bölüm \d+/)?.[0] || 'Kitap');

  return (
    <div className="bg-white rounded-2xl shadow-xl p-5 max-w-sm mx-auto">
      {/* Baslik */}
      <div className="text-center mb-3">
        <div className="text-3xl mb-1">{isStrong ? '🌟' : '💪'}</div>
        <h3 className="text-base font-bold text-gray-800">{gameName} - Yansıtma</h3>
        <div className="flex justify-center gap-1 mt-1">
          {[1, 2, 3].map(i => (
            <span key={i} className="text-lg">{i <= stars ? '⭐' : '☆'}</span>
          ))}
        </div>
      </div>

      {/* Teori yansitma mesaji */}
      <div className={`rounded-xl p-3 mb-3 ${isStrong ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
        <div className="flex items-start gap-2">
          <span className="text-lg shrink-0">{isStrong ? '🎯' : '🌱'}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className={`text-xs font-bold ${isStrong ? 'text-green-700' : 'text-amber-700'}`}>
                {isStrong ? 'Harika gidiyorsun!' : 'Gelişmeye devam!'}
              </div>
              <button onClick={() => { try { const u = new SpeechSynthesisUtterance(message); u.lang='tr-TR'; u.rate=0.85; u.pitch=1.1; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch{} }}
                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${isStrong ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-amber-100 text-amber-600 hover:bg-amber-200'}`} title="Sesli oku">{"🔊"}</button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
          </div>
        </div>
      </div>

      {/* Bolum referansi - Tıklanabilir */}
      {onOpenBook && chapterNum ? (
        <button
          onClick={() => onOpenBook(chapterNum)}
          className="w-full bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 rounded-lg px-3 py-2.5 mb-3 flex items-center gap-2 border border-amber-200 active:scale-[0.98] transition-all"
        >
          <span className="text-lg">{"📖"}</span>
          <div className="flex-1 text-left">
            <div className="text-[10px] text-amber-700 font-medium">Daha fazla bilgi için:</div>
            <div className="text-xs font-bold text-amber-800">{shortLabel}{"'ü oku"}</div>
          </div>
          <span className="text-amber-500 text-lg">{"›"}</span>
        </button>
      ) : (
        <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
          <span className="text-sm">{"📖"}</span>
          <div className="text-[10px] text-gray-500">
            Bu beceriyi daha iyi anlamak için: <span className="font-bold text-amber-700">{shortLabel}</span>
          </div>
        </div>
      )}

      {/* Butonlar */}
      <div className="space-y-2">
        <button onClick={onContinue}
          className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-md bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 active:scale-[0.97] transition-all">
          {"✓"} Devam Et
        </button>
        <button onClick={onPlayAgain}
          className="w-full py-2.5 rounded-xl text-indigo-600 font-medium text-sm bg-indigo-50 hover:bg-indigo-100 active:scale-[0.97] transition-all">
          {"🔄"} Tekrar Oyna
        </button>
      </div>
    </div>
  );
};

export default TheoryReflection;

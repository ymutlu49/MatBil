import React, { useState } from 'react';
import { CHAPTER_MAP, GAME_CHAPTER_MAP } from '../../constants/skillGraph';

/**
 * ChapterBadge - Oyun ekranlarında kitap bölüm referansı gösteren rozet
 * Tıklanınca ilgili bölümün teori özetini açar.
 *
 * Props:
 *  - gameId: (opsiyonel) Oyun ID'si → spesifik bölüm numarası gösterir
 *  - categoryId: (opsiyonel) Kategori ID'si → kategori bölümleri gösterir
 *  - compact: Kısa biçim (sadece etiket)
 *  - onOpenBook: (opsiyonel) Kitap ekranına geçiş callback'i
 */
const ChapterBadge = ({ gameId, categoryId, compact = false, onOpenBook }) => {
  const [open, setOpen] = useState(false);

  // Önce oyuna özel bölüm bilgisi, yoksa kategori bazlı bilgi
  const gameChapter = gameId ? GAME_CHAPTER_MAP[gameId] : null;
  const category = categoryId || (gameId && gameChapter ? null : null);

  // Kategori bilgisini gameId üzerinden bul
  let catId = categoryId;
  if (!catId && gameId) {
    const gameIdFirstChar = gameId.charAt(0);
    if (['A', 'B', 'C', 'D', 'E', 'F'].includes(gameIdFirstChar)) catId = gameIdFirstChar;
  }

  const chapter = catId ? CHAPTER_MAP[catId] : null;
  if (!chapter) return null;

  // Spesifik bölüm numarası (oyuna özel) veya genel kategori bölümü
  const primaryChapterNum = gameChapter?.primary;
  const shortLabel = primaryChapterNum
    ? `Bölüm ${primaryChapterNum}`
    : (chapter.chapters[0]?.match(/Bölüm \d+/)?.[0] || 'Kitap');

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold border border-amber-200">
        {"📖"} {shortLabel}
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold border border-amber-200 hover:bg-amber-100 active:scale-95 transition-all"
      >
        {"📖"} {shortLabel}
        <span className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>{"▾"}</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-amber-200 p-3 min-w-[280px] anim-fade">
          <div className="text-xs font-bold text-gray-800 mb-2">{"📚"} Kitap Referansları</div>
          <div className="space-y-1.5 mb-2">
            {chapter.chapters.map((ch, i) => (
              <div key={i} className="text-[11px] text-gray-600 bg-amber-50/50 rounded-lg px-2 py-1.5 leading-snug">
                {ch}
              </div>
            ))}
          </div>
          {chapter.childTheory && (
            <div className="bg-blue-50 rounded-lg px-2 py-1.5 mb-2">
              <div className="flex items-start gap-1.5">
                <span className="text-sm shrink-0">{"💡"}</span>
                <p className="text-[10px] text-gray-700 leading-relaxed">{chapter.childTheory}</p>
              </div>
            </div>
          )}
          {onOpenBook && (
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onOpenBook(primaryChapterNum); }}
              className="w-full py-1.5 bg-amber-500 text-white rounded-lg text-[11px] font-bold hover:bg-amber-600 active:scale-95 transition-all mb-1.5"
            >
              {"📖"} Bölümü Aç
            </button>
          )}
          <div className="text-[10px] text-gray-400 italic border-t border-gray-100 pt-1.5">
            {chapter.refs}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterBadge;

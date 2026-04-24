import React, { useState, useRef } from 'react';
import { GAMES } from '../../constants/games';
import { CATEGORIES } from '../../constants/categories';
import { BOOK_CHAPTERS } from './BookChapters';

/**
 * QRCodePage - Kitap için QR kod oluşturma sayfası
 * SVG tabanlı QR kod oluşturur (harici kütüphane gerektirmez).
 * Öğretmen/yönetici panelinden erişilir.
 */

// Basit QR benzeri görsel oluşturucu (gerçek QR yerine URL gösterimli kart)
const GameQRCard = ({ gameId, game, baseUrl }) => {
  const url = `${baseUrl}?game=${gameId}`;
  const cat = CATEGORIES.find(c => c.id === game.cat);

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-3 text-center break-inside-avoid mb-3">
      <div className="text-2xl mb-1">{game.emoji}</div>
      <div className="font-bold text-gray-800 text-xs mb-0.5">{game.name}</div>
      <div className="text-[9px] text-gray-400 mb-2">{cat?.name} | {gameId}</div>
      {/* QR Code SVG placeholder - basit bir grid pattern */}
      <div className="w-24 h-24 mx-auto mb-2 bg-white border-2 border-gray-800 rounded-lg p-1 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Köşe referans kareleri (QR standard) */}
          <rect x="2" y="2" width="28" height="28" fill="black" />
          <rect x="5" y="5" width="22" height="22" fill="white" />
          <rect x="8" y="8" width="16" height="16" fill="black" />
          <rect x="70" y="2" width="28" height="28" fill="black" />
          <rect x="73" y="5" width="22" height="22" fill="white" />
          <rect x="76" y="8" width="16" height="16" fill="black" />
          <rect x="2" y="70" width="28" height="28" fill="black" />
          <rect x="5" y="73" width="22" height="22" fill="white" />
          <rect x="8" y="76" width="16" height="16" fill="black" />
          {/* Veri bölgesi - gameId hash'ine dayalı pattern */}
          {Array.from({ length: 8 }, (_, r) =>
            Array.from({ length: 8 }, (_, c) => {
              const hash = (gameId.charCodeAt(0) * (r + 1) + gameId.charCodeAt(1) * (c + 1)) % 3;
              if (hash === 0 && !(r < 3 && c < 3) && !(r < 3 && c > 5) && !(r > 5 && c < 3)) {
                return <rect key={`${r}-${c}`} x={35 + c * 4} y={35 + r * 4} width="3.5" height="3.5" fill="black" />;
              }
              return null;
            })
          )}
          {/* Merkez: oyun kodu */}
          <text x="50" y="55" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4F46E5">{gameId}</text>
        </svg>
      </div>
      <div className="text-[8px] text-gray-400 break-all leading-tight">{url}</div>
    </div>
  );
};

const ChapterQRCard = ({ chapter, baseUrl }) => {
  const url = `${baseUrl}?chapter=${chapter.num}`;

  return (
    <div className="bg-white rounded-xl border-2 border-amber-300 p-4 text-center break-inside-avoid mb-3">
      <div className="text-3xl mb-1">{chapter.emoji}</div>
      <div className="font-bold text-gray-800 text-sm mb-0.5">Bölüm {chapter.num}</div>
      <div className="text-xs text-gray-500 mb-2">{chapter.title}</div>
      <div className="w-28 h-28 mx-auto mb-2 bg-white border-2 border-gray-800 rounded-lg p-1 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="2" y="2" width="28" height="28" fill="black" />
          <rect x="5" y="5" width="22" height="22" fill="white" />
          <rect x="8" y="8" width="16" height="16" fill="black" />
          <rect x="70" y="2" width="28" height="28" fill="black" />
          <rect x="73" y="5" width="22" height="22" fill="white" />
          <rect x="76" y="8" width="16" height="16" fill="black" />
          <rect x="2" y="70" width="28" height="28" fill="black" />
          <rect x="5" y="73" width="22" height="22" fill="white" />
          <rect x="8" y="76" width="16" height="16" fill="black" />
          {Array.from({ length: 6 }, (_, r) =>
            Array.from({ length: 6 }, (_, c) => {
              const hash = (chapter.num * 7 + r * 3 + c * 5) % 3;
              if (hash === 0) {
                return <rect key={`${r}-${c}`} x={36 + c * 5} y={36 + r * 5} width="4" height="4" fill="black" />;
              }
              return null;
            })
          )}
          <text x="50" y="55" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#D97706">B{chapter.num}</text>
        </svg>
      </div>
      <div className="text-[8px] text-gray-400 break-all">{url}</div>
    </div>
  );
};

const QRCodePage = ({ onBack }) => {
  const [viewMode, setViewMode] = useState('chapters'); // chapters | games
  const [selectedCat, setSelectedCat] = useState(null);
  const printRef = useRef();
  const baseUrl = 'https://matbil.app';

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <html><head><title>MatBil QR Kodları</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .card { border: 2px solid #e5e7eb; border-radius: 12px; padding: 12px; text-align: center; break-inside: avoid; }
        .card-chapter { border-color: #fbbf24; }
        .emoji { font-size: 28px; margin-bottom: 4px; }
        .title { font-weight: bold; font-size: 12px; margin-bottom: 2px; }
        .sub { font-size: 9px; color: #9ca3af; margin-bottom: 8px; }
        .url { font-size: 7px; color: #9ca3af; word-break: break-all; }
        .qr { width: 80px; height: 80px; border: 2px solid #1f2937; border-radius: 8px; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; color: #4F46E5; }
        h1 { text-align: center; margin-bottom: 4px; }
        h2 { text-align: center; font-size: 14px; color: #6b7280; margin-bottom: 20px; }
        @media print { .no-print { display: none; } }
      </style></head><body>
      <h1>📚 MatBil - QR Kodları</h1>
      <h2>Matematiksel Bilişin Temelleri</h2>
      ${content.innerHTML}
      </body></html>
    `);
    printWin.document.close();
    setTimeout(() => { printWin.print(); }, 500);
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col overflow-hidden">
      <div className="w-full max-w-lg mx-auto flex flex-col flex-1 min-h-0 p-3">

        {/* Üst Bar */}
        <div className="flex items-center justify-between mb-3 bg-white rounded-2xl shadow-md px-4 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-xl">
              {"📱"}
            </div>
            <div>
              <div className="font-bold text-gray-800 text-sm">QR Kod Oluşturucu</div>
              <div className="text-xs text-gray-500">Kitap için QR kodlar</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint}
              className="px-3 py-2 bg-indigo-500 text-white rounded-xl font-medium text-sm hover:bg-indigo-600 active:scale-95 transition-all">
              {"🖨️"} Yazdır
            </button>
            <button onClick={onBack}
              className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-200 active:scale-95 transition-all">
              {"←"}
            </button>
          </div>
        </div>

        {/* Mod Seçimi */}
        <div className="flex gap-1.5 mb-3 shrink-0">
          <button onClick={() => setViewMode('chapters')}
            className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all ${viewMode === 'chapters' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-600'}`}>
            {"📚"} Bölüm QR
          </button>
          <button onClick={() => setViewMode('games')}
            className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all ${viewMode === 'games' ? 'bg-indigo-500 text-white shadow-md' : 'bg-white text-gray-600'}`}>
            {"🎮"} Oyun QR
          </button>
        </div>

        {/* Kategori filtre (oyunlar için) */}
        {viewMode === 'games' && (
          <div className="flex gap-1 mb-3 shrink-0 flex-wrap">
            <button onClick={() => setSelectedCat(null)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${!selectedCat ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
              Tümü
            </button>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCat(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${selectedCat === cat.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {cat.emoji} {cat.id}
              </button>
            ))}
          </div>
        )}

        {/* İçerik */}
        <div className="flex-1 min-h-0 overflow-y-auto" ref={printRef}>
          {viewMode === 'chapters' && (
            <div className="grid grid-cols-2 gap-2 pb-20">
              {BOOK_CHAPTERS.map(ch => (
                <ChapterQRCard key={ch.num} chapter={ch} baseUrl={baseUrl} />
              ))}
            </div>
          )}
          {viewMode === 'games' && (
            <div className="grid grid-cols-3 gap-2 pb-20">
              {Object.entries(GAMES)
                .filter(([, g]) => !selectedCat || g.cat === selectedCat)
                .map(([id, g]) => (
                  <GameQRCard key={id} gameId={id} game={g} baseUrl={baseUrl} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;

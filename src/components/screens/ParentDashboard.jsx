import React, { useState, useEffect } from 'react';
import { getParentChildren } from '../../utils/auth';
import { getProgress } from '../../utils/progress';
import { GAMES } from '../../constants/games';
import { CATEGORIES } from '../../constants/categories';
import { getXPFromProgress, getLevelFromXP } from '../../utils/avatar';

/**
 * Veli Paneli — Salt Okunur
 * Çocuğun ilerlemesini görüntüleme
 */
const ParentDashboard = ({ user, onLogout }) => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    const kids = getParentChildren(user.id);
    setChildren(kids);
    if (kids.length > 0) {
      setSelectedChild(kids[0]);
      setProgress(getProgress(kids[0].id));
    }
  }, [user.id]);

  const selectChild = (child) => {
    setSelectedChild(child);
    setProgress(getProgress(child.id));
  };

  const totalStars = Object.values(progress).reduce((s, g) => s + (g.stars || 0), 0);
  const played = Object.keys(progress).length;
  const totalGames = Object.keys(GAMES).length;
  const totalAttempts = Object.values(progress).reduce((s, g) => s + (g.attempts || 0), 0);
  const level = selectedChild ? getLevelFromXP(getXPFromProgress(progress)) : null;

  return (
    <div className="h-screen bg-gradient-to-b from-purple-50 via-fuchsia-50 to-pink-50 flex flex-col overflow-hidden">
      <div className="w-full max-w-md mx-auto flex flex-col flex-1 min-h-0 p-3">

        {/* Üst Bar */}
        <div className="flex items-center justify-between mb-3 bg-white rounded-2xl shadow-md px-4 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-full flex items-center justify-center text-white text-lg">{"👨‍👩‍👧"}</div>
            <div>
              <div className="font-bold text-gray-800 text-sm">{user.name}</div>
              <div className="text-xs text-purple-500">Veli</div>
            </div>
          </div>
          <button onClick={onLogout} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-200 active:scale-95 transition-all">
            {"🚪"} Çıkış
          </button>
        </div>

        {/* Çocuk Seçimi (birden fazla ise) */}
        {children.length > 1 && (
          <div className="shrink-0 mb-3 flex gap-2 overflow-x-auto pb-1">
            {children.map(c => (
              <button key={c.id} onClick={() => selectChild(c)}
                className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${selectedChild?.id === c.id ? 'bg-purple-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                {c.name}
              </button>
            ))}
          </div>
        )}

        {!selectedChild ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-3">{"👶"}</div>
              <div className="text-gray-500 text-sm">Henüz bağlı çocuk yok.</div>
              <div className="text-gray-400 text-xs mt-1">Öğretmenden çocuğunuzu sisteme eklemesini isteyin.</div>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
            {/* Çocuk Profil Kartı */}
            <div className="bg-white rounded-2xl shadow-md p-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-2 shadow-md">
                {selectedChild.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-lg font-bold text-gray-800">{selectedChild.name}</div>
              {selectedChild.age && <div className="text-sm text-gray-500">{selectedChild.age} yaş</div>}
              {level && (
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span>{level.emoji}</span>
                  <span className="text-sm font-medium text-indigo-600">{level.title}</span>
                </div>
              )}
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-xl shadow-sm p-3 text-center">
                <div className="text-lg font-bold text-yellow-600">{"⭐"} {totalStars}</div>
                <div className="text-[10px] text-gray-500">Yıldız</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-3 text-center">
                <div className="text-lg font-bold text-indigo-600">{played}</div>
                <div className="text-[10px] text-gray-500">Oyun</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-3 text-center">
                <div className="text-lg font-bold text-green-600">{totalAttempts}</div>
                <div className="text-[10px] text-gray-500">Deneme</div>
              </div>
            </div>

            {/* Genel İlerleme */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="text-sm font-bold text-gray-700 mb-2">{"📈"} Genel İlerleme</div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-1">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all" style={{ width: `${Math.round((played / totalGames) * 100)}%` }} />
              </div>
              <div className="text-xs text-gray-500 text-right">{played} / {totalGames} oyun keşfedildi</div>
            </div>

            {/* Kategori Bazlı */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="text-sm font-bold text-gray-700 mb-3">{"📊"} Kategoriler</div>
              <div className="space-y-2.5">
                {CATEGORIES.map(cat => {
                  const catGames = Object.entries(GAMES).filter(([, g]) => g.cat === cat.id);
                  const catStars = catGames.reduce((s, [id]) => s + (progress[id]?.stars || 0), 0);
                  const maxStars = catGames.length * 3;
                  const pct = maxStars > 0 ? Math.round((catStars / maxStars) * 100) : 0;
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{cat.emoji}</span>
                          <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">{"⭐"}{catStars}/{maxStars}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${cat.color.gradient} transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bilgilendirme */}
            <div className="bg-purple-50 rounded-2xl p-3 border border-purple-200">
              <div className="text-xs text-purple-700">
                {"📋"} Bu ekran salt okunurdur. Detaylı rapor için öğretmenle iletişime geçin.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;

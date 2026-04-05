import React, { useState, useEffect } from 'react';
import { GAMES } from '../../constants/games';
import { CATEGORIES } from '../../constants/categories';
import { CHAPTER_MAP } from '../../constants/skillGraph';
import { getUsers, getProgress } from '../../utils';

const AdminPanel = ({ onBack }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const ADMIN_PW = 'matbil2025';
  const [allUsers, setAllUsers] = useState([]);
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    // Tüm localStorage'daki kullanıcıları topla
    try {
      const usersRaw = localStorage.getItem('matbil_users');
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      setAllUsers(users);

      const data = users.map(u => {
        const prog = JSON.parse(localStorage.getItem(`matbil_progress_${u.id}`) || '{}');
        return { user: u, progress: prog };
      });
      setAllData(data);
    } catch(e) { console.error(e); }
  }, []);

  // CSV oluştur
  const exportCSV = () => {
    const headers = ['Öğrenci Adı','Yaş','Şehir','Oyun ID','Oyun Adı','Kategori','En İyi Puan','Son Puan','Maks Seviye','Yıldız','Deneme Sayısı','Son Oynama'];
    const rows = [];
    allData.forEach(({user, progress}) => {
      Object.entries(GAMES).forEach(([gid, g]) => {
        const p = progress[gid];
        rows.push([
          user.name, user.age || '', user.city || '',
          gid, g.name, CATEGORIES.find(c=>c.id===g.cat)?.name || '',
          p?.bestScore || 0, p?.lastScore || 0, p?.maxLevel || 0,
          p?.stars || 0, p?.attempts || 0, p?.lastPlayed || ''
        ].join(','));
      });
    });
    const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `matbil_istatistik_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // JSON oluştur
  const exportJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      appVersion: 'v14.0',
      totalStudents: allUsers.length,
      students: allData.map(({user, progress}) => ({
        name: user.name, age: user.age, city: user.city, id: user.id,
        gamesPlayed: Object.keys(progress).length,
        totalStars: Object.values(progress).reduce((s,g)=>s+(g.stars||0),0),
        totalAttempts: Object.values(progress).reduce((s,g)=>s+(g.attempts||0),0),
        categories: CATEGORIES.map(cat => {
          const cg = Object.entries(GAMES).filter(([,g])=>g.cat===cat.id);
          const cp = cg.filter(([id])=>progress[id]);
          return {
            id: cat.id, name: cat.name,
            played: cp.length, total: cg.length,
            stars: cp.reduce((s,[id])=>s+(progress[id]?.stars||0),0),
            avgScore: cp.length > 0 ? Math.round(cp.reduce((s,[id])=>s+(progress[id]?.bestScore||0),0)/cp.length) : 0
          };
        }),
        games: Object.entries(progress).map(([id, p]) => ({
          gameId: id, gameName: GAMES[id]?.name, category: GAMES[id]?.cat,
          bestScore: p?.bestScore, lastScore: p?.lastScore, maxLevel: p?.maxLevel,
          stars: p?.stars, attempts: p?.attempts, lastPlayed: p?.lastPlayed
        }))
      }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `matbil_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  // Toplu istatistikler
  const totalPlayed = allData.reduce((s,d) => s + Object.keys(d.progress).length, 0);
  const totalAttempts = allData.reduce((s,d) => s + Object.values(d.progress).reduce((a,g)=>a+(g.attempts||0),0), 0);
  const totalStarsAll = allData.reduce((s,d) => s + Object.values(d.progress).reduce((a,g)=>a+(g.stars||0),0), 0);

  // Kategori bazlı ortalamalar (tüm kullanıcılar)
  const catAggregates = CATEGORIES.map(cat => {
    const catGames = Object.entries(GAMES).filter(([,g])=>g.cat===cat.id);
    let totalScore = 0, totalCount = 0, totalStars = 0;
    allData.forEach(({progress}) => {
      catGames.forEach(([id]) => {
        if(progress[id]) {
          totalScore += progress[id].bestScore || 0;
          totalStars += progress[id].stars || 0;
          totalCount++;
        }
      });
    });
    return { ...cat, avgScore: totalCount > 0 ? Math.round(totalScore/totalCount) : 0, avgStars: totalCount > 0 ? (totalStars/totalCount).toFixed(1) : 0, playCount: totalCount };
  });

  // En çok oynanan oyunlar
  const gamePopularity = Object.entries(GAMES).map(([id, g]) => {
    let totalAttempts = 0, totalScore = 0, playerCount = 0;
    allData.forEach(({progress}) => {
      if(progress[id]) { totalAttempts += progress[id].attempts||0; totalScore += progress[id].bestScore||0; playerCount++; }
    });
    return { id, name: g.name, emoji: g.emoji, totalAttempts, avgScore: playerCount > 0 ? Math.round(totalScore/playerCount) : 0, playerCount };
  }).sort((a,b) => b.totalAttempts - a.totalAttempts);

  // Şifre doğrulama ekranı
  if (!authenticated) return (
    <div className="h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-5 max-w-sm w-full text-center">
        <div className="text-5xl mb-3">🔐</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Yönetici Girişi</h2>
        <p className="text-sm text-gray-500 mb-6">Bu alan sadece yetkili kişiler içindir.</p>
        <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setPwError(false);}} placeholder="Şifre giriniz..."
          className={`w-full p-3 border-2 rounded-xl text-center text-lg font-bold mb-3 outline-none ${pwError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-indigo-400'}`}
          onKeyDown={e=>{if(e.key==='Enter'){if(pw===ADMIN_PW)setAuthenticated(true);else setPwError(true);}}}/>
        {pwError && <p className="text-red-500 text-sm mb-3 font-medium">Hatalı şifre. Tekrar deneyin.</p>}
        <div className="flex gap-3">
          <button onClick={onBack} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200">← Geri</button>
          <button onClick={()=>{if(pw===ADMIN_PW)setAuthenticated(true);else setPwError(true);}} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Giriş</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex flex-col overflow-hidden">
      {/* Header (SABİT) */}
      <div className="shrink-0 p-3 pb-0">
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-2">
          <button onClick={onBack} className="px-3 py-1.5 bg-white text-gray-600 rounded-lg font-bold shadow text-sm">← Geri</button>
          <h2 className="text-base font-bold text-gray-700">🔐 Yönetici Paneli</h2>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="px-3 py-1.5 bg-green-600 text-white rounded-lg font-bold text-xs">📊 CSV</button>
            <button onClick={exportJSON} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs">🔧 JSON</button>
          </div>
        </div>
      </div>

      {/* İçerik (GİZLİ SCROLL) */}
      <div className="flex-1 min-h-0 overflow-y-auto scroll-area p-3 pt-1">
        <div className="max-w-2xl mx-auto">

        {/* Genel Özet */}
        <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
          <h3 className="font-bold text-gray-700 mb-2 text-sm">📊 Genel İstatistikler</h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-indigo-50 p-2 rounded-lg text-center"><div className="text-xl font-bold text-indigo-700">{allUsers.length}</div><div className="text-[10px] text-gray-500">Öğrenci</div></div>
            <div className="bg-green-50 p-2 rounded-lg text-center"><div className="text-xl font-bold text-green-700">{totalPlayed}</div><div className="text-[10px] text-gray-500">Oyun/Kişi</div></div>
            <div className="bg-amber-50 p-2 rounded-lg text-center"><div className="text-xl font-bold text-amber-700">{totalAttempts}</div><div className="text-[10px] text-gray-500">Top. Deneme</div></div>
            <div className="bg-purple-50 p-2 rounded-lg text-center"><div className="text-xl font-bold text-purple-700">⭐{totalStarsAll}</div><div className="text-[10px] text-gray-500">Top. Yıldız</div></div>
          </div>
        </div>

        {/* Kategori Performans Özeti */}
        <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
          <h3 className="font-bold text-gray-700 mb-2 text-sm">📈 Kategori Ortalamaları</h3>
          <div className="space-y-2">
            {catAggregates.map(cat => (
              <div key={cat.id} className="flex items-center gap-2">
                <span className="text-base w-6">{cat.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs"><span className="font-medium">{cat.name}</span><span className="text-gray-500">Ort: {cat.avgScore}p • ⭐{cat.avgStars}</span></div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-0.5">
                    <div className={`h-full rounded-full bg-gradient-to-r ${cat.color.gradient}`} style={{width:`${Math.min(100, cat.avgScore / 2)}%`}}/>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 w-8 text-right">{cat.playCount}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* Oyun Popülaritesi */}
        <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
          <h3 className="font-bold text-gray-700 mb-2 text-sm">🏆 En Çok Oynanan</h3>
          <div className="space-y-1">
            {gamePopularity.filter(g=>g.totalAttempts>0).slice(0,8).map((g,i) => (
              <div key={g.id} className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-lg text-xs">
                <span className="w-5 text-center font-bold text-gray-400">{i+1}</span>
                <span className="text-base">{g.emoji}</span>
                <span className="flex-1 font-medium text-gray-700">{g.name}</span>
                <span className="text-gray-500">{g.playerCount}kişi</span>
                <span className="text-gray-500">{g.totalAttempts}x</span>
                <span className="font-bold text-amber-600">{g.avgScore}p</span>
              </div>
            ))}
            {gamePopularity.filter(g=>g.totalAttempts>0).length === 0 && <p className="text-xs text-gray-400 text-center py-3">Henüz veri yok.</p>}
          </div>
        </div>

        {/* Öğrenci Listesi */}
        <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
          <h3 className="font-bold text-gray-700 mb-2 text-sm">👥 Öğrenciler ({allUsers.length})</h3>
          <div className="space-y-1">
            {allData.map(({user, progress}) => {
              const stars = Object.values(progress).reduce((s,g)=>s+(g.stars||0),0);
              const played = Object.keys(progress).length;
              return (
                <div key={user.id} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-lg text-xs">
                  <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">{user.name.charAt(0).toUpperCase()}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-700">{user.name}</div>
                    <div className="text-[10px] text-gray-400">{user.age ? `${user.age} yaş` : ''}{user.city ? ` • ${user.city}` : ''}</div>
                  </div>
                  <span className="text-gray-500">{played}/{Object.keys(GAMES).length}</span>
                  <span className="text-yellow-600 font-bold">⭐{stars}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🗺️ Öğrenci-Kategori Isı Haritası */}
        {allData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
          <h3 className="font-bold text-gray-700 mb-2 text-sm">🗺️ Sınıf Isı Haritası (Öğrenci × Kategori)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead><tr>
                <th className="text-left p-1 font-medium text-gray-500">Öğrenci</th>
                {CATEGORIES.map(c => <th key={c.id} className="p-1 text-center font-medium text-gray-500">{c.emoji}</th>)}
                <th className="p-1 text-center font-medium text-gray-500">Ort</th>
              </tr></thead>
              <tbody>
                {allData.map(({user, progress}) => {
                  const catPcts = CATEGORIES.map(cat => {
                    const cg = Object.entries(GAMES).filter(([,g])=>g.cat===cat.id);
                    const stars = cg.reduce((s,[id])=>s+(progress[id]?.stars||0),0);
                    const max = cg.length * 3;
                    return max > 0 ? Math.round((stars/max)*100) : 0;
                  });
                  const avg = catPcts.length > 0 ? Math.round(catPcts.reduce((s,v)=>s+v,0)/catPcts.length) : 0;
                  const heatColor = (pct) => pct >= 70 ? 'bg-green-200' : pct >= 40 ? 'bg-yellow-200' : pct > 0 ? 'bg-red-200' : 'bg-gray-100';
                  return (
                    <tr key={user.id} className="border-t border-gray-100">
                      <td className="p-1 font-medium text-gray-700 truncate max-w-[80px]">{user.name}</td>
                      {catPcts.map((pct,i) => <td key={i} className={`p-1 text-center font-bold ${heatColor(pct)}`}>{pct > 0 ? pct+'%' : '-'}</td>)}
                      <td className={`p-1 text-center font-bold ${heatColor(avg)}`}>{avg}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3 mt-2 text-[9px] text-gray-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-200 rounded"/>70%+</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-200 rounded"/>40-69%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-200 rounded"/>&lt;40%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-100 rounded"/>Veri yok</span>
          </div>
        </div>)}

        {/* 📋 Müdahale Önerileri */}
        {allData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
          <h3 className="font-bold text-gray-700 mb-2 text-sm">📋 Bireysel Müdahale Önerileri</h3>
          <div className="space-y-2">
            {allData.filter(({progress}) => Object.keys(progress).length >= 2).map(({user, progress}) => {
              const catScores = CATEGORIES.map(cat => {
                const cg = Object.entries(GAMES).filter(([,g])=>g.cat===cat.id);
                const avg = cg.reduce((s,[id])=>s+(progress[id]?.stars||0),0) / (cg.length||1);
                return {cat, avg, games: cg};
              });
              const weakest = catScores.filter(c=>c.avg<1.5).sort((a,b)=>a.avg-b.avg);
              if(weakest.length === 0) return null;
              const w = weakest[0];
              const lowGames = w.games.filter(([id])=>!progress[id]||(progress[id]?.stars||0)<=1).slice(0,2);
              return (
                <div key={user.id} className="bg-blue-50 rounded-lg p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-gray-700">{user.name}</span>
                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">{w.cat.emoji} {w.cat.name} zayıf</span>
                  </div>
                  <div className="text-[10px] text-gray-600">
                    Öneri: {lowGames.map(([id])=>GAMES[id]?.name).filter(Boolean).join(' ve ')} oyunlarına haftada 3×15dk odaklanılması önerilir.
                  </div>
                </div>
              );
            }).filter(Boolean)}
            {allData.filter(({progress}) => Object.keys(progress).length >= 2).length === 0 && <p className="text-xs text-gray-400 text-center py-2">Yeterli veri için en az 2 oyun oynanmalı.</p>}
          </div>
        </div>)}

        {/* Rehber */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
          <h3 className="font-bold text-amber-800 mb-1 text-sm">💡 Çoklu Cihaz Rehberi</h3>
          <div className="text-xs text-amber-700 space-y-1">
            <p><strong>1.</strong> Her cihazda öğrenciler kendi adlarıyla giriş yapıp oynar.</p>
            <p><strong>2.</strong> Her cihazdan CSV/JSON dışa aktarın.</p>
            <p><strong>3.</strong> Excel/SPSS'te birleştirin veya Python/R ile analiz edin.</p>
          </div>
        </div>

        <div className="text-center py-2">
          <p className="text-[10px] text-gray-400">Prof. Dr. Yılmaz Mutlu • Prof. Dr. Sinan Olkun • v14.0</p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

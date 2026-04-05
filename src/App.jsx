import React, { useState, useEffect, Suspense } from 'react';
import { TOTAL_ROUNDS, getProgress, saveProgress, checkBadges, downloadEtkinlikPDF } from './utils';
import { GAMES } from './constants/games';
import { CATEGORIES } from './constants/categories';
import { COLORS } from './constants/colors';
import { BADGES } from './constants/badges';
import LoginScreen from './components/screens/LoginScreen';
import ReportScreen from './components/screens/ReportScreen';
import PDFReportView from './components/screens/PDFReportView';
import AdminPanel from './components/screens/AdminPanel';
import Onboarding from './components/screens/Onboarding';

const App = () => {
  const [user, setUser] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => { try { return !localStorage.getItem('matbil_onboarded'); } catch { return true; } });
  const completeOnboarding = () => { setShowOnboarding(false); try { localStorage.setItem('matbil_onboarded','1'); } catch {} };
  const [view, setView] = useState('home');
  const [expandedCat, setExpandedCat] = useState(null);
  const [buyukYazi, setBuyukYazi] = useState(() => { try { return localStorage.getItem('matbil_buyuk_yazi') === 'true'; } catch { return false; } });
  const toggleYazi = () => { const v = !buyukYazi; setBuyukYazi(v); try { localStorage.setItem('matbil_buyuk_yazi', v ? 'true' : 'false'); } catch {} };
  const [sesAcik, setSesAcik] = useState(() => { try { return localStorage.getItem('matbil_ses') !== 'false'; } catch { return true; } });
  const toggleSes = () => { const v = !sesAcik; setSesAcik(v); try { localStorage.setItem('matbil_ses', v ? 'true' : 'false'); } catch {} };
  const [streak, setStreak] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem('matbil_streak') || '{}');
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now()-86400000).toISOString().split('T')[0];
      if(data.lastDate === today) return data;
      if(data.lastDate === yesterday) return {...data, count: (data.count||0)+1, lastDate: today};
      return {count: 1, lastDate: today, best: data.best || 0};
    } catch { return {count:1, lastDate:new Date().toISOString().split('T')[0], best:0}; }
  });
  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    if(streak.lastDate !== today) {
      const newStreak = {...streak, count: streak.count+1, lastDate: today, best: Math.max(streak.best||0, streak.count+1)};
      setStreak(newStreak);
      try { localStorage.setItem('matbil_streak', JSON.stringify(newStreak)); } catch {}
    }
  };
  const [rahatMod, setRahatMod] = useState(() => { try { return localStorage.getItem('matbil_rahat_mod') === 'true'; } catch { return false; } });
  const toggleRahat = () => { const v = !rahatMod; setRahatMod(v); try { localStorage.setItem('matbil_rahat_mod', v ? 'true' : 'false'); } catch {} };
  const [progress, setProgress] = useState({});

  useEffect(() => {
    if (user) setProgress(getProgress(user.id));
  }, [user]);

  useEffect(() => {
    try {
      const last = localStorage.getItem('matbil_current_user');
      if (last) setUser(JSON.parse(last));
    } catch {}
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('matbil_current_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentGame(null);
    setView('home');
    localStorage.removeItem('matbil_current_user');
  };

  const handleGameComplete = (gameId, score, level) => {
    updateStreak();
    if (!user) return;
    const prev = progress[gameId] || { attempts: 0, bestScore: 0, maxLevel: 0, stars: 0 };
    const maxPossible = TOTAL_ROUNDS * 30 * level;
    const pct = Math.min(100, Math.round((score / Math.max(maxPossible, 1)) * 100));
    const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;
    const updated = {
      ...prev,
      attempts: prev.attempts + 1,
      bestScore: Math.max(prev.bestScore, score),
      lastScore: score,
      maxLevel: Math.max(prev.maxLevel || 0, level),
      stars: Math.max(prev.stars || 0, stars),
      lastPlayed: new Date().toISOString(),
    };
    const newProgress = { ...progress, [gameId]: updated };
    setProgress(newProgress);
    saveProgress(user.id, newProgress);
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  if (showOnboarding) return <Onboarding onComplete={completeOnboarding} />;

  if (view === 'report') return <ReportScreen user={user} progress={progress} onBack={() => setView('home')} onPDF={() => setView('pdf')} />;
  if (view === 'pdf') return <PDFReportView user={user} progress={progress} onBack={() => setView('home')} />;
  if (view === 'admin') return <AdminPanel onBack={() => setView('home')} />;

  if (currentGame) {
    const game = GAMES[currentGame];
    const GameComp = game.comp;
    const prevBest = progress[currentGame]?.bestScore || 0;
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50"><div className="text-2xl animate-pulse">{"🧠"} Yükleniyor...</div></div>}>
        <GameComp onBack={() => setCurrentGame(null)} colors={COLORS[game.cat]}
          rahatMod={rahatMod} sesAcik={sesAcik} prevBest={prevBest}
          onGameComplete={(score, level) => handleGameComplete(currentGame, score, level)} />
      </Suspense>
    );
  }

  const toggleCat = (catId) => { setExpandedCat(expandedCat === catId ? null : catId); };
  const handleDownloadPDF = () => downloadEtkinlikPDF(import.meta.env.BASE_URL);

  return (
    <div className={`h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 flex flex-col overflow-hidden ${buyukYazi ? "text-lg" : ""}`} role="main" aria-label="Matematiksel Bilişin Temelleri Ana Menü">
      <div className="w-full max-w-md mx-auto flex flex-col flex-1 min-h-0 p-3">

        {/* Üst Bar */}
        <div className="flex items-center justify-between mb-2 bg-white rounded-xl shadow-md p-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">{user.name.charAt(0).toUpperCase()}</div>
            <div>
              <div className="font-bold text-gray-800 text-sm leading-tight">{user.name}</div>
              {(user.age || user.city) && <div className="text-[10px] text-gray-400">{user.age && `${user.age} yaş`}{user.age && user.city && ' · '}{user.city || ''}</div>}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setView('report')} className="px-2.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-xs hover:bg-indigo-100 transition-colors">{"📊"} Rapor</button>
            <button onClick={toggleYazi} aria-label={buyukYazi?'Büyük yazı aktif':'Normal yazı'} className={`px-2 py-1.5 rounded-lg font-bold text-xs transition-colors ${buyukYazi ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>{buyukYazi ? 'A+' : 'A'}</button>
            <button onClick={toggleSes} aria-label={sesAcik?'Ses açık':'Ses kapalı'} className={`px-2 py-1.5 rounded-lg font-bold text-xs transition-colors ${sesAcik ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>{sesAcik ? '🔊' : '🔇'}</button>
            <button onClick={toggleRahat} aria-label={rahatMod?'Rahat mod aktif':'Normal mod'} className={`px-2 py-1.5 rounded-lg font-bold text-xs transition-colors ${rahatMod ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-gray-400'}`}>{"🐢"}</button>
            <button onClick={() => setView('admin')} className="px-2 py-1.5 bg-slate-50 text-slate-500 rounded-lg font-bold text-xs hover:bg-slate-100 transition-colors">{"🔐"}</button>
            <button onClick={handleLogout} className="px-2 py-1.5 bg-gray-100 text-gray-500 rounded-lg font-bold text-xs hover:bg-gray-200 transition-colors">{"🚪"}</button>
          </div>
        </div>

        {/* Başlık + İlerleme */}
        <div className="shrink-0">
          <div className="text-center mb-2">
            <h1 className="text-lg font-bold text-gray-800">{"🧠"} Matematiksel Bilişin Temelleri</h1>
            <p className="text-indigo-700 font-semibold text-xs italic">Sayı Hissinden Şekil Algısına</p>
          </div>
          <div className="flex gap-2 mb-2">
            {(() => {
              const played = Object.keys(progress).length;
              const total = Object.keys(GAMES).length;
              const totalStars = Object.values(progress).reduce((s, g) => s + (g.stars || 0), 0);
              return (<>
                <div className="flex-1 bg-white rounded-lg shadow p-1.5 text-center">
                  <div className="text-sm font-bold text-indigo-600">{played}/{total}</div>
                  <div className="text-[10px] text-gray-500 font-medium">Oyun</div>
                </div>
                <div className="flex-1 bg-white rounded-lg shadow p-1.5 text-center">
                  <div className="text-sm font-bold text-yellow-600">{'⭐'}{totalStars}</div>
                  <div className="text-[10px] text-gray-500 font-medium">Yıldız</div>
                </div>
                <div className="flex-1 bg-white rounded-lg shadow p-1.5 text-center">
                  <div className="text-sm font-bold text-green-600">{Object.values(progress).reduce((s, g) => s + (g.attempts || 0), 0)}</div>
                  <div className="text-[10px] text-gray-500 font-medium">Deneme</div>
                </div>
              </>);
            })()}
          </div>
        </div>

        {/* Rozetler */}
        {(() => { const earned = checkBadges(progress, GAMES); return earned.length > 0 ? (
          <div className="shrink-0 mb-2 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 rounded-xl border border-amber-200 p-2">
            <div className="text-xs font-bold text-amber-700 mb-1">{"🏆"} Rozetlerin ({earned.length}/{BADGES.length})</div>
            <div className="flex gap-1.5 flex-wrap">{earned.map(b => (
              <div key={b.id} className="bg-white rounded-lg px-2 py-1 shadow-sm border border-amber-100 flex items-center gap-1" title={b.desc}>
                <span className="text-base">{b.emoji}</span>
                <span className="text-[10px] font-bold text-gray-700">{b.name}</span>
              </div>
            ))}</div>
          </div>
        ) : null; })()}

        {/* Streak */}
        {streak.count > 0 && (
          <div className="shrink-0 mb-2 bg-gradient-to-r from-orange-50 via-red-50 to-amber-50 rounded-xl border border-orange-200 p-2.5 flex items-center gap-3">
            <div className="text-3xl">{"🔥"}</div>
            <div className="flex-1">
              <div className="font-bold text-orange-700 text-sm">{streak.count} gün seri!</div>
              <div className="text-[10px] text-gray-500">{streak.best > streak.count ? `En iyi: ${streak.best} gün` : streak.count >= 7 ? 'Harika devam et!' : 'Her gün oyna, serini uzat!'}</div>
            </div>
            <div className="flex gap-0.5">{Array.from({length:Math.min(7,streak.count)},(_,i)=><div key={i} className="w-2 h-5 bg-orange-400 rounded-full"/>)}{Array.from({length:Math.max(0,7-streak.count)},(_,i)=><div key={i} className="w-2 h-5 bg-gray-200 rounded-full"/>)}</div>
          </div>
        )}

        {/* Günlük Hedef */}
        {(() => {
          const today = new Date().toISOString().split('T')[0];
          const todayPlays = Object.values(progress).filter(g => g.lastPlayed && g.lastPlayed.startsWith(today)).length;
          const dailyGoal = 3;
          const pct = Math.min(100, Math.round((todayPlays / dailyGoal) * 100));
          const done = todayPlays >= dailyGoal;
          return (
            <div className={`shrink-0 mb-2 rounded-xl border p-2.5 flex items-center gap-3 ${done ? 'bg-green-50 border-green-200' : 'bg-indigo-50 border-indigo-200'}`}>
              <div className="text-2xl">{done ? '🎉' : '🎯'}</div>
              <div className="flex-1">
                <div className={`font-bold text-sm ${done ? 'text-green-700' : 'text-indigo-700'}`}>{done ? 'Günlük hedefini tamamladın!' : `Bugünkü hedef: ${dailyGoal} oyun`}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-green-400' : 'bg-indigo-400'}`} style={{width:`${pct}%`}}/>
                  </div>
                  <span className="text-xs font-bold text-gray-500">{todayPlays}/{dailyGoal}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Accordion Kategoriler */}
        <div className="flex-1 min-h-0 overflow-y-auto scroll-area">
          <div className="space-y-1.5 pb-32">
            {CATEGORIES.map(cat => {
              const isOpen = expandedCat === cat.id;
              const catGames = Object.entries(GAMES).filter(([, g]) => g.cat === cat.id);
              const catPlayed = catGames.filter(([id]) => progress[id]).length;
              const catStars = catGames.reduce((s, [id]) => s + (progress[id]?.stars || 0), 0);

              return (
                <div key={cat.id} className="rounded-xl overflow-hidden shadow-lg">
                  <button onClick={() => toggleCat(cat.id)}
                    className={`w-full py-3 px-4 bg-gradient-to-r ${cat.color.gradient} text-white font-bold text-sm flex items-center gap-2 hover:opacity-95 transition-all`}>
                    <span className="text-xl">{cat.emoji}</span>
                    <div className="flex-1 text-left">
                      <div className="leading-tight">{cat.name}</div>
                      <div className="text-[11px] opacity-90 font-medium">{cat.desc}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {catPlayed > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">{catPlayed}/{catGames.length}</span>}
                      {catStars > 0 && <span className="text-[10px]">{'⭐'}{catStars}</span>}
                      <span className={`transition-transform duration-300 text-base ${isOpen ? 'rotate-180' : ''}`}>{'▾'}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className={`${cat.color.bg} border-x-2 border-b-2 ${cat.color.border} rounded-b-xl`}>
                      {catGames.map(([id, g]) => {
                        const gp = progress[id];
                        return (
                          <React.Fragment key={id}>
                            <div className="mx-1.5 mb-0.5">
                              <button onClick={() => setCurrentGame(id)}
                                className="w-full py-2 px-3 bg-white/80 hover:bg-white hover:shadow-md rounded-lg flex items-center gap-2 transition-all">
                                <span className="text-lg">{g.emoji}</span>
                                <span className="flex-1 text-left font-semibold text-gray-800 text-sm">{g.name}</span>
                                {gp && <div className="flex gap-0.5">{[1,2,3].map(i => <span key={i} className="text-xs">{i <= (gp.stars || 0) ? '⭐' : '☆'}</span>)}</div>}
                                <span className="text-gray-300 text-sm">{'›'}</span>
                              </button>
                            </div>
                          </React.Fragment>
                        );
                      })}
                      <div className="h-1"/>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Etkinlik Kitapçığı */}
            <div className="mt-4 mb-3">
              <button onClick={handleDownloadPDF}
                className="w-full bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-2.5 flex items-center gap-3 hover:shadow-lg hover:border-amber-300 transition-all group">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-lg shadow-md group-hover:scale-110 transition-transform">{"📝"}</div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-gray-800 text-sm">Kâğıt-Kalem Etkinlik Kitapçığı</div>
                  <div className="text-[10px] text-gray-500">27 etkinlik · 5 kategori · Yazdır & çöz</div>
                </div>
                <div className="px-2.5 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold shadow group-hover:bg-amber-600 transition-colors">{"📥"} İndir</div>
              </button>
            </div>

            <div className="text-center pt-2 pb-2">
              <p className="text-[10px] text-gray-400">Prof. Dr. Yılmaz Mutlu • Prof. Dr. Sinan Olkun</p>
              <p className="text-[10px] text-gray-300">v15.0 • {Object.keys(GAMES).length} Oyun</p>
              <p className="text-[10px] text-gray-300 mt-0.5">www.diskalkuli.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

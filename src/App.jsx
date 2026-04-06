import React, { useState, useEffect, Suspense } from 'react';
import { TOTAL_ROUNDS, getProgress, saveProgress, checkBadges, downloadEtkinlikPDF,
  useSessionTimer, getWeeklyStats, saveSessionData,
  MOOD_OPTIONS, saveMoodLog,
  getXPFromProgress, getLevelFromXP, getAvatar, saveAvatar, AVATARS, getLevelUpMessage
} from './utils';
import { GAMES } from './constants/games';
import { CATEGORIES } from './constants/categories';
import { COLORS } from './constants/colors';
import { BADGES } from './constants/badges';
import LoginScreen from './components/screens/LoginScreen';
import ReportScreen from './components/screens/ReportScreen';
import PDFReportView from './components/screens/PDFReportView';
import AdminPanel from './components/screens/AdminPanel';
import Onboarding from './components/screens/Onboarding';
import ScreeningMode from './components/screens/ScreeningMode';

/**
 * Ana Uygulama - v16.1 UI/UX İyileştirmeleri
 *
 * Araştırma bazlı tasarım kararları:
 * - Ekranda max 3-5 ana element (Ungrammary, 2024)
 * - Dokunma hedefleri 60-80pt (Apple HIG / çocuk uyarlaması)
 * - Sayısal göstergeler yerine görsel ilerleme (diskalkuli dostu)
 * - Bilişsel yük azaltma: progressive disclosure (Frontiers, 2024)
 * - Oturum sayacı gizli (zaman baskısı kaygı artırır)
 * - Flat navigasyon, max 2 seviye derinlik
 */
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

  // Oturum zamanlayıcı (arka planda, kullanıcıya gösterilmez)
  const session = useSessionTimer();

  // Ayarlar paneli
  const [showSettings, setShowSettings] = useState(false);

  // Ruh hali
  const [mood, setMood] = useState(null);

  // Avatar
  const [avatarId, setAvatarId] = useState(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [levelUpMsg, setLevelUpMsg] = useState(null);
  const prevLevelRef = React.useRef(null);

  useEffect(() => {
    if (user) {
      setProgress(getProgress(user.id));
      const savedAvatar = getAvatar(user.id);
      setAvatarId(savedAvatar);
    }
  }, [user]);

  useEffect(() => {
    try {
      const last = localStorage.getItem('matbil_current_user');
      if (last) setUser(JSON.parse(last));
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) return;
    const xp = getXPFromProgress(progress);
    const level = getLevelFromXP(xp);
    if (prevLevelRef.current && level.level > prevLevelRef.current) {
      setLevelUpMsg(getLevelUpMessage(level));
      setTimeout(() => setLevelUpMsg(null), 4000);
    }
    prevLevelRef.current = level.level;
  }, [progress, user]);

  useEffect(() => {
    if (user && !session.isActive) session.start();
  }, [user]);

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('matbil_current_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    if (user && session.elapsed > 30) {
      saveSessionData(user.id, session.elapsed, Object.keys(progress).length);
    }
    session.reset();
    setUser(null);
    setCurrentGame(null);
    setView('home');
    setMood(null);
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

  const handleAvatarSelect = (id) => {
    setAvatarId(id);
    if (user) saveAvatar(user.id, id);
    setShowAvatarPicker(false);
  };

  const handleMoodSelect = (m) => {
    setMood(m);
    if (user) saveMoodLog(user.id, m);
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;
  if (showOnboarding) return <Onboarding onComplete={completeOnboarding} />;
  if (view === 'report') return <ReportScreen user={user} progress={progress} onBack={() => setView('home')} onPDF={() => setView('pdf')} />;
  if (view === 'pdf') return <PDFReportView user={user} progress={progress} onBack={() => setView('home')} />;
  if (view === 'admin') return <AdminPanel onBack={() => setView('home')} />;
  if (view === 'screening') return <ScreeningMode onBack={() => setView('home')} user={user} />;

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

  // Hesaplamalar
  const xp = getXPFromProgress(progress);
  const level = getLevelFromXP(xp);
  const selectedAvatar = AVATARS.find(a => a.id === avatarId);
  const totalStars = Object.values(progress).reduce((s, g) => s + (g.stars || 0), 0);
  const played = Object.keys(progress).length;
  const total = Object.keys(GAMES).length;
  const playedPct = Math.round((played / Math.max(total, 1)) * 100);
  const today = new Date().toISOString().split('T')[0];
  const todayPlays = Object.values(progress).filter(g => g.lastPlayed && g.lastPlayed.startsWith(today)).length;
  const dailyGoal = 3;
  const dailyDone = todayPlays >= dailyGoal;
  const earned = checkBadges(progress, GAMES);

  return (
    <div className={`h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 flex flex-col overflow-hidden ${buyukYazi ? "text-lg" : ""}`} role="main" aria-label="MatBil Ana Menü">
      <div className="w-full max-w-md mx-auto flex flex-col flex-1 min-h-0 p-3">

        {/* Seviye atlama bildirimi */}
        {levelUpMsg && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-6 py-3 rounded-2xl shadow-2xl anim-pop text-center">
            <div className="text-2xl mb-1">{"🎉"} Seviye Atladın!</div>
            <div className="text-sm font-bold">{levelUpMsg}</div>
          </div>
        )}

        {/* Oturum mola hatırlatma (sayaç gizli, sadece mola uyarısı gelir) */}
        {session.showReminder && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white border-2 border-amber-300 px-5 py-3 rounded-2xl shadow-2xl max-w-sm anim-fade">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{session.showReminder === 'gentle' ? '⏰' : '🧘'}</span>
              <div className="flex-1">
                <div className="font-bold text-gray-700 text-sm">
                  {session.showReminder === 'gentle' ? 'Harika gidiyorsun!' : 'Mola zamanı!'}
                </div>
                <div className="text-xs text-gray-500">
                  {session.showReminder === 'gentle'
                    ? 'Biraz daha oynayabilirsin.'
                    : 'Kısa bir mola verimini artırır.'}
                </div>
              </div>
              <button onClick={session.dismissReminder} className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-bold hover:bg-amber-200 active:scale-95 transition-all">Tamam</button>
            </div>
          </div>
        )}

        {/* ═══════ ÜST BAR — Sadeleştirilmiş (max 4 element) ═══════ */}
        <div className="flex items-center justify-between mb-2 bg-white rounded-2xl shadow-md px-3 py-2.5 shrink-0">
          {/* Sol: Avatar + İsim + Seviye */}
          <button onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {selectedAvatar ? selectedAvatar.emoji : user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-gray-800 text-sm leading-tight">{user.name}</div>
              <div className="text-xs text-indigo-500 font-medium flex items-center gap-1">
                <span>{level.emoji}</span>
                <span>{level.title}</span>
              </div>
            </div>
          </button>

          {/* Sağ: 3 ana buton (büyük dokunma hedefleri) */}
          <div className="flex items-center gap-2">
            <button onClick={() => setView('report')}
              className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg hover:bg-indigo-100 active:scale-95 transition-all" title="Rapor">
              {"📊"}
            </button>
            <button onClick={() => setShowSettings(!showSettings)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg active:scale-95 transition-all ${showSettings ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} title="Ayarlar">
              {"⚙️"}
            </button>
            <button onClick={handleLogout}
              className="w-10 h-10 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center text-lg hover:bg-gray-200 active:scale-95 transition-all" title="Çıkış">
              {"🚪"}
            </button>
          </div>
        </div>

        {/* ═══════ AYARLAR PANELİ — Progressive disclosure ═══════ */}
        {showSettings && (
          <div className="shrink-0 mb-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-3 anim-fade">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={toggleSes}
                className={`flex items-center gap-2 p-3 rounded-xl font-medium text-sm transition-all ${sesAcik ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                <span className="text-xl">{sesAcik ? '🔊' : '🔇'}</span>
                <span>Ses {sesAcik ? 'Açık' : 'Kapalı'}</span>
              </button>
              <button onClick={toggleYazi}
                className={`flex items-center gap-2 p-3 rounded-xl font-medium text-sm transition-all ${buyukYazi ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                <span className="text-xl">{buyukYazi ? 'A+' : 'A'}</span>
                <span>Büyük Yazı</span>
              </button>
              <button onClick={toggleRahat}
                className={`flex items-center gap-2 p-3 rounded-xl font-medium text-sm transition-all ${rahatMod ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                <span className="text-xl">{"🐢"}</span>
                <span>Rahat Mod</span>
              </button>
              <button onClick={() => setView('admin')}
                className="flex items-center gap-2 p-3 rounded-xl font-medium text-sm bg-gray-50 text-gray-500 border border-gray-200 transition-all hover:bg-gray-100">
                <span className="text-xl">{"🔐"}</span>
                <span>Yönetici</span>
              </button>
            </div>
            {/* Ruh hali — ayarlar içinde */}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-1.5 font-medium">Bugün nasıl hissediyorsun?</div>
              <div className="flex gap-2 justify-center">
                {MOOD_OPTIONS.map(m => (
                  <button key={m.value} onClick={() => handleMoodSelect(m.value)}
                    className={`flex flex-col items-center px-4 py-2 rounded-xl transition-all ${mood === m.value ? 'bg-pink-100 ring-2 ring-pink-400 scale-105' : 'bg-gray-50 hover:bg-gray-100'}`}>
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[10px] text-gray-500 mt-0.5">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Avatar seçici */}
        {showAvatarPicker && (
          <div className="shrink-0 mb-2 bg-white rounded-2xl shadow-lg border border-indigo-200 p-3 anim-fade">
            <div className="text-xs font-bold text-gray-700 mb-2">{"🎭"} Avatar Seç</div>
            <div className="flex gap-2 flex-wrap justify-center">
              {AVATARS.map(a => (
                <button key={a.id} onClick={() => handleAvatarSelect(a.id)}
                  className={`flex flex-col items-center p-2.5 rounded-xl transition-all ${avatarId === a.id ? 'bg-indigo-100 ring-2 ring-indigo-400 scale-105' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <span className="text-2xl">{a.emoji}</span>
                  <span className="text-[9px] text-gray-500 font-medium">{a.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══════ KOMPAKT İLERLEME ÇUBUĞU — Tek satır ═══════ */}
        <div className="shrink-0 mb-2 bg-white rounded-2xl shadow-sm p-3">
          {/* XP Seviye Çubuğu */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{level.emoji}</span>
            <div className="flex-1">
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-700" style={{ width: `${level.progressToNext}%` }} />
              </div>
            </div>
            {level.nextLevel && <span className="text-[10px] text-gray-400 font-medium">{level.nextLevel.emoji}</span>}
          </div>
          {/* Streak + Yıldız + Günlük hedef — Görsel göstergeler */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1" title={`${streak.count} gün seri`}>
              <span className="text-sm">{"🔥"}</span>
              <span className="text-xs font-bold text-orange-600">{streak.count}</span>
            </div>
            <div className="flex items-center gap-1" title={`${totalStars} yıldız`}>
              <span className="text-sm">{"⭐"}</span>
              <span className="text-xs font-bold text-yellow-600">{totalStars}</span>
            </div>
            <div className="flex items-center gap-1" title={`${played} oyun keşfedildi`}>
              <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-indigo-400 transition-all" style={{ width: `${playedPct}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-0.5" title={`Bugün ${todayPlays}/${dailyGoal} oyun`}>
              {[1,2,3].map(i => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i <= todayPlays ? 'bg-green-400' : 'bg-gray-200'}`} />
              ))}
              {dailyDone && <span className="text-xs ml-0.5">{"✓"}</span>}
            </div>
            {earned.length > 0 && (
              <div className="flex items-center gap-0.5" title={`${earned.length} rozet`}>
                <span className="text-sm">{"🏆"}</span>
                <span className="text-xs font-bold text-amber-600">{earned.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* ═══════ KATEGORİLER — Ana içerik, hemen erişilebilir ═══════ */}
        <div className="flex-1 min-h-0 overflow-y-auto scroll-area">
          <div className="space-y-2 pb-32">
            {CATEGORIES.map(cat => {
              const isOpen = expandedCat === cat.id;
              const catGames = Object.entries(GAMES).filter(([, g]) => g.cat === cat.id);
              const catPlayed = catGames.filter(([id]) => progress[id]).length;
              const catStars = catGames.reduce((s, [id]) => s + (progress[id]?.stars || 0), 0);

              return (
                <div key={cat.id} className="rounded-2xl overflow-hidden shadow-lg">
                  <button onClick={() => toggleCat(cat.id)}
                    className={`w-full py-3.5 px-4 bg-gradient-to-r ${cat.color.gradient} text-white font-bold text-sm flex items-center gap-3 hover:opacity-95 transition-all active:scale-[0.99]`}>
                    <span className="text-2xl">{cat.emoji}</span>
                    <div className="flex-1 text-left">
                      <div className="text-base leading-tight">{cat.name}</div>
                      <div className="text-xs opacity-90 font-medium">{cat.desc}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {catPlayed > 0 && (
                        <div className="flex gap-0.5">
                          {catGames.map(([id], i) => (
                            <div key={i} className={`w-1.5 h-4 rounded-full ${progress[id]?.stars > 0 ? 'bg-white' : 'bg-white/30'}`} />
                          ))}
                        </div>
                      )}
                      <span className={`transition-transform duration-300 text-lg ${isOpen ? 'rotate-180' : ''}`}>{'▾'}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className={`${cat.color.bg} border-x-2 border-b-2 ${cat.color.border} rounded-b-2xl`}>
                      {catGames.map(([id, g]) => {
                        const gp = progress[id];
                        return (
                          <div key={id} className="mx-2 mb-1 first:mt-1">
                            <button onClick={() => setCurrentGame(id)}
                              className="w-full py-3 px-3.5 bg-white/80 hover:bg-white hover:shadow-md rounded-xl flex items-center gap-3 transition-all active:scale-[0.98]">
                              <span className="text-xl">{g.emoji}</span>
                              <span className="flex-1 text-left font-semibold text-gray-800 text-sm">{g.name}</span>
                              {gp ? (
                                <div className="flex gap-0.5">{[1,2,3].map(i => <span key={i} className="text-sm">{i <= (gp.stars || 0) ? '⭐' : '☆'}</span>)}</div>
                              ) : (
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Yeni</span>
                              )}
                              <span className="text-gray-300 text-lg">{'›'}</span>
                            </button>
                          </div>
                        );
                      })}
                      <div className="h-1.5"/>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Tarama Modu */}
            <button onClick={() => setView('screening')}
              className="w-full bg-white border-2 border-teal-200 rounded-2xl p-3.5 flex items-center gap-3 hover:shadow-lg hover:border-teal-300 transition-all active:scale-[0.98]">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-md">{"🔍"}</div>
              <div className="flex-1 text-left">
                <div className="font-bold text-gray-800">Hızlı Tarama</div>
                <div className="text-xs text-gray-500">Diskalkuli risk değerlendirmesi</div>
              </div>
              <span className="text-gray-300 text-lg">{'›'}</span>
            </button>

            {/* Etkinlik Kitapçığı */}
            <button onClick={handleDownloadPDF}
              className="w-full bg-white border-2 border-amber-200 rounded-2xl p-3.5 flex items-center gap-3 hover:shadow-lg hover:border-amber-300 transition-all active:scale-[0.98]">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-md">{"📝"}</div>
              <div className="flex-1 text-left">
                <div className="font-bold text-gray-800">Etkinlik Kitapçığı</div>
                <div className="text-xs text-gray-500">Kâğıt-kalem etkinlikleri</div>
              </div>
              <span className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold">{"📥"}</span>
            </button>

            <div className="text-center pt-3 pb-2">
              <p className="text-[10px] text-gray-400">Prof. Dr. Yılmaz Mutlu {' \u2022 '} Prof. Dr. Sinan Olkun</p>
              <p className="text-[10px] text-gray-300">v16.1 {' \u2022 '} {total} Oyun {' \u2022 '} {CATEGORIES.length} Kategori</p>
              <p className="text-[10px] text-gray-300 mt-0.5">www.diskalkuli.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

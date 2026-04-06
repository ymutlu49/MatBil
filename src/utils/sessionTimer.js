import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Oturum Zamanlayıcı
 *
 * Araştırma bazlı oturum rehberliği:
 * - Optimal süre: 15-20 dakika/oturum (Kucian ve ark., 2020)
 * - Optimal sıklık: haftada 3-4 gün
 * - 15 dk sonra nazik hatırlatma, 20 dk sonra mola önerisi
 */
export const useSessionTimer = () => {
  const [elapsed, setElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showReminder, setShowReminder] = useState(null); // null | 'gentle' | 'break'
  const intervalRef = useRef(null);
  const startRef = useRef(null);

  const start = useCallback(() => {
    if (!isActive) {
      startRef.current = Date.now() - elapsed * 1000;
      setIsActive(true);
    }
  }, [isActive, elapsed]);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
    setElapsed(0);
    setShowReminder(null);
    startRef.current = null;
  }, []);

  const dismissReminder = useCallback(() => {
    setShowReminder(null);
  }, []);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const secs = Math.floor((now - startRef.current) / 1000);
        setElapsed(secs);

        // 15 dakika → nazik hatırlatma
        if (secs >= 900 && secs < 905) {
          setShowReminder('gentle');
        }
        // 20 dakika → mola önerisi
        if (secs >= 1200 && secs < 1205) {
          setShowReminder('break');
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return {
    elapsed,
    isActive,
    showReminder,
    start,
    pause,
    reset,
    dismissReminder,
    formatTime: () => formatTime(elapsed),
  };
};

/**
 * Haftalık oturum takibi
 */
export const getWeeklySessionData = (userId) => {
  try {
    const key = `matbil_sessions_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch { return []; }
};

export const saveSessionData = (userId, durationSecs, gamesPlayed) => {
  try {
    const key = `matbil_sessions_${userId}`;
    const sessions = JSON.parse(localStorage.getItem(key) || '[]');
    sessions.push({
      date: new Date().toISOString(),
      duration: durationSecs,
      games: gamesPlayed,
    });
    // Son 90 günü tut
    const cutoff = Date.now() - 90 * 86400 * 1000;
    const filtered = sessions.filter(s => new Date(s.date).getTime() > cutoff);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch {}
};

export const getWeeklyStats = (userId) => {
  const sessions = getWeeklySessionData(userId);
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const thisWeek = sessions.filter(s => new Date(s.date) >= weekStart);
  const uniqueDays = new Set(thisWeek.map(s => new Date(s.date).toISOString().split('T')[0]));

  return {
    sessionsThisWeek: thisWeek.length,
    daysThisWeek: uniqueDays.size,
    totalMinutes: Math.round(thisWeek.reduce((s, sess) => s + (sess.duration || 0), 0) / 60),
    isOnTrack: uniqueDays.size >= 3, // haftada 3+ gün = yolunda
    recommendation: uniqueDays.size < 3
      ? `Bu hafta ${uniqueDays.size} gün çalıştın. Haftada 3-4 gün hedefle!`
      : uniqueDays.size >= 4
        ? 'Harika! Bu hafta düzenli çalışıyorsun.'
        : 'İyi gidiyorsun! Bir gün daha eklersen mükemmel olur.',
  };
};

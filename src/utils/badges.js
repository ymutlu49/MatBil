import { BADGES } from '../constants/badges';

export const checkBadges = (progress, GAMES) => {
  const earned = [];
  const games = Object.entries(GAMES);
  for (const b of BADGES) {
    if (b.cat === 'attempts') {
      const total = Object.values(progress).reduce((s, g) => s + (g.attempts || 0), 0);
      if (total >= b.minAttempts) earned.push(b);
    } else if (b.cat === '*') {
      const all = games.every(([id]) => (progress[id]?.stars || 0) >= b.minStars);
      if (all) earned.push(b);
    } else if (b.cat === 'weekly') {
      // Haftalık oynama günü kontrolü
      try {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const daysPlayed = new Set();
        Object.values(progress).forEach(g => {
          if (g.lastPlayed && new Date(g.lastPlayed) >= weekStart) {
            daysPlayed.add(new Date(g.lastPlayed).toISOString().split('T')[0]);
          }
        });
        if (daysPlayed.size >= b.minDays) earned.push(b);
      } catch {}
    } else if (b.cat === 'explorer') {
      // Tüm kategorilerde en az 1 oyun
      const catsPlayed = new Set();
      Object.entries(progress).forEach(([id, g]) => {
        if (g.attempts > 0 && GAMES[id]) catsPlayed.add(GAMES[id].cat);
      });
      if (catsPlayed.size >= b.minCats) earned.push(b);
    } else {
      const catGames = games.filter(([, g]) => g.cat === b.cat);
      const allDone = catGames.every(([id]) => (progress[id]?.stars || 0) >= b.minStars);
      if (allDone && catGames.length > 0) earned.push(b);
    }
  }
  return earned;
};

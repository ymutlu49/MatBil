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
    } else {
      const catGames = games.filter(([, g]) => g.cat === b.cat);
      const allDone = catGames.every(([id]) => (progress[id]?.stars || 0) >= b.minStars);
      if (allDone && catGames.length > 0) earned.push(b);
    }
  }
  return earned;
};

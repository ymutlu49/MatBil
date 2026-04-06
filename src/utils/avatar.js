/**
 * Avatar / Anlatı Katmanı
 *
 * Araştırma: Springer (2025) - Bütünleşik oyun elemanları
 * Basit bir avatar ve seviye sistemi ile motivasyonu artır
 */

export const AVATARS = [
  { id: 'explorer', emoji: '🧑‍🚀', name: 'Uzay Kaşifi', color: 'from-indigo-400 to-purple-500' },
  { id: 'scientist', emoji: '🧑‍🔬', name: 'Bilim İnsanı', color: 'from-teal-400 to-cyan-500' },
  { id: 'wizard', emoji: '🧙', name: 'Matematik Büyücüsü', color: 'from-amber-400 to-orange-500' },
  { id: 'detective', emoji: '🕵️', name: 'Sayı Dedektifi', color: 'from-rose-400 to-red-500' },
  { id: 'artist', emoji: '🎨', name: 'Şekil Sanatçısı', color: 'from-emerald-400 to-green-500' },
  { id: 'robot', emoji: '🤖', name: 'Robo Matematik', color: 'from-blue-400 to-indigo-500' },
];

// Deneyim puanı bazlı seviye sistemi
export const LEVELS = [
  { level: 1, title: 'Çaylak', minXP: 0, emoji: '🌱' },
  { level: 2, title: 'Öğrenci', minXP: 50, emoji: '📚' },
  { level: 3, title: 'Keşifçi', minXP: 150, emoji: '🔍' },
  { level: 4, title: 'Bilgin', minXP: 350, emoji: '🎓' },
  { level: 5, title: 'Uzman', minXP: 600, emoji: '⭐' },
  { level: 6, title: 'Usta', minXP: 1000, emoji: '🏆' },
  { level: 7, title: 'Efsane', minXP: 1500, emoji: '👑' },
];

export const getXPFromProgress = (progress) => {
  let xp = 0;
  Object.values(progress).forEach(g => {
    xp += (g.stars || 0) * 10;
    xp += (g.attempts || 0) * 2;
    xp += (g.maxLevel || 0) * 5;
  });
  return xp;
};

export const getLevelFromXP = (xp) => {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXP) current = lvl;
    else break;
  }
  const nextLvl = LEVELS.find(l => l.minXP > xp);
  const progressToNext = nextLvl
    ? ((xp - current.minXP) / (nextLvl.minXP - current.minXP)) * 100
    : 100;
  return { ...current, xp, progressToNext: Math.min(100, Math.round(progressToNext)), nextLevel: nextLvl };
};

export const getAvatar = (userId) => {
  try {
    const key = `matbil_avatar_${userId}`;
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch { return null; }
};

export const saveAvatar = (userId, avatarId) => {
  try {
    const key = `matbil_avatar_${userId}`;
    localStorage.setItem(key, JSON.stringify(avatarId));
  } catch {}
};

// Seviye atlama mesajları
export const getLevelUpMessage = (level) => {
  const messages = {
    2: 'Öğrenme yolculuğun başladı!',
    3: 'Harika ilerliyorsun, Keşifçi!',
    4: 'Bilgin seviyesine ulaştın!',
    5: 'Artık bir uzmansın!',
    6: 'Matematik ustası oldun!',
    7: 'Efsanevi seviyeye hoş geldin!',
  };
  return messages[level.level] || 'Tebrikler, yeni seviye!';
};

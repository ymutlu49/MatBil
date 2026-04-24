import { getGamesForChapter, GAME_CHAPTER_MAP } from '../constants/skillGraph';

/**
 * Bir kitap bölümünün tamamlanma istatistiklerini hesaplar.
 * @param {number} chapterNum - Kitap bölüm numarası (1-9)
 * @param {object} progress - Kullanıcı ilerleme objesi
 * @returns {object} { played, total, stars, maxStars, pct, isMastered }
 */
export const getChapterProgress = (chapterNum, progress) => {
  const gameIds = getGamesForChapter(chapterNum);
  const total = gameIds.length;
  const played = gameIds.filter(id => progress?.[id]).length;
  const stars = gameIds.reduce((s, id) => s + (progress?.[id]?.stars || 0), 0);
  const maxStars = total * 3;
  const pct = maxStars > 0 ? Math.round((stars / maxStars) * 100) : 0;
  const isMastered = pct >= 80 && played === total;
  const isCompleted = played === total;
  return { played, total, stars, maxStars, pct, isMastered, isCompleted };
};

/**
 * Tüm kitap bölümleri için ilerleme haritası döndürür.
 * @param {object} progress - Kullanıcı ilerleme objesi
 * @returns {object} { 1: {...}, 2: {...}, ... }
 */
export const getAllChaptersProgress = (progress) => {
  const result = {};
  for (let i = 1; i <= 9; i++) {
    result[i] = getChapterProgress(i, progress);
  }
  return result;
};

/**
 * Tamamlanmış (ustalaşılmış) bölüm sayısını döndürür.
 */
export const getMasteredChapterCount = (progress) => {
  const all = getAllChaptersProgress(progress);
  return Object.values(all).filter(c => c.isMastered).length;
};

/**
 * Genel kitap ilerlemesi (tüm bölümler boyunca ortalama %).
 */
export const getOverallBookProgress = (progress) => {
  const all = getAllChaptersProgress(progress);
  const vals = Object.values(all);
  if (vals.length === 0) return 0;
  const totalPct = vals.reduce((s, c) => s + c.pct, 0);
  return Math.round(totalPct / vals.length);
};

/**
 * Bir oyun bitince yeni bir bölüm ustalaştıysa bölüm numarasını döndürür.
 * Oyun hem primary hem de secondary bölümlere dahil olabilir, bu yüzden hepsi kontrol edilir.
 * Aynı oyun ile birden fazla bölüm ustalaştıysa ilkini döndürür (primary öncelikli).
 * Yoksa null.
 */
export const detectNewChapterMastery = (prevProgress, newProgress, gameId) => {
  const gameChapter = GAME_CHAPTER_MAP[gameId];
  if (!gameChapter) return null;
  const chaptersToCheck = [gameChapter.primary, ...(gameChapter.secondary || [])].filter(Boolean);
  for (const chNum of chaptersToCheck) {
    const prev = getChapterProgress(chNum, prevProgress);
    const curr = getChapterProgress(chNum, newProgress);
    if (!prev.isMastered && curr.isMastered) return chNum;
  }
  return null;
};

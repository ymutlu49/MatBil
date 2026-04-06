/**
 * longTermTracking.js - Long-term progress tracking and visualization data
 *
 * Provides computed data for charts and analytics in the MatBil
 * dyscalculia platform. All functions are pure (no side effects)
 * and work with the existing progress data format:
 *
 *   progress = {
 *     [gameId]: { attempts, bestScore, lastScore, maxLevel, stars, lastPlayed }
 *   }
 *
 * Game categories:
 *   A - Sanbil (Subitizing / Approximate Number Sense)
 *   B - Tahmin (Estimation)
 *   C - Sembolik (Symbolic / Number Representation)
 *   D - Geometri (Geometry / Spatial)
 *   E - Aritmetik (Arithmetic)
 */

// ---------------------------------------------------------------------------
// Category metadata
// ---------------------------------------------------------------------------

const CATEGORY_META = {
  A: { name: 'Sanbil', fullName: 'Sayısal Algı (Sanbil)' },
  B: { name: 'Tahmin', fullName: 'Tahmin Becerisi' },
  C: { name: 'Sembolik', fullName: 'Sembolik Temsil' },
  D: { name: 'Geometri', fullName: 'Geometri ve Uzamsal' },
  E: { name: 'Aritmetik', fullName: 'Aritmetik İşlemler' },
};

// ---------------------------------------------------------------------------
// Triple Code Model mappings
//
// Dehaene's Triple Code Model of number processing:
//   analog   - approximate magnitude / quantity sense  (mainly A, B games)
//   verbal   - number words, counting, sequences       (mainly C, E games)
//   symbolic - written numerals, place value            (mainly C, D games)
//
// Each game contributes to one or more codes with a weight (0-1).
// ---------------------------------------------------------------------------

const TRIPLE_CODE_WEIGHTS = {
  // Category A - Subitizing / ANS (primarily analog)
  A1: { analog: 1.0, verbal: 0.0, symbolic: 0.0 },
  A2: { analog: 0.8, verbal: 0.1, symbolic: 0.1 },
  A3: { analog: 0.4, verbal: 0.2, symbolic: 0.4 },
  A4: { analog: 0.7, verbal: 0.1, symbolic: 0.2 },
  A5: { analog: 1.0, verbal: 0.0, symbolic: 0.0 },
  A6: { analog: 0.8, verbal: 0.1, symbolic: 0.1 },
  A7: { analog: 1.0, verbal: 0.0, symbolic: 0.0 },
  A8: { analog: 0.8, verbal: 0.1, symbolic: 0.1 },

  // Category B - Estimation (analog + symbolic)
  B1: { analog: 0.8, verbal: 0.0, symbolic: 0.2 },
  B2: { analog: 0.5, verbal: 0.1, symbolic: 0.4 },
  B3: { analog: 0.6, verbal: 0.1, symbolic: 0.3 },
  B4: { analog: 0.7, verbal: 0.1, symbolic: 0.2 },
  B5: { analog: 0.4, verbal: 0.2, symbolic: 0.4 },

  // Category C - Symbolic representation (symbolic + verbal)
  C1: { analog: 0.2, verbal: 0.3, symbolic: 0.5 },
  C2: { analog: 0.3, verbal: 0.1, symbolic: 0.6 },
  C3: { analog: 0.2, verbal: 0.3, symbolic: 0.5 },
  C4: { analog: 0.0, verbal: 0.3, symbolic: 0.7 },
  C5: { analog: 0.2, verbal: 0.4, symbolic: 0.4 },

  // Category D - Geometry / Spatial (primarily symbolic + analog)
  D1: { analog: 0.4, verbal: 0.1, symbolic: 0.5 },
  D2: { analog: 0.2, verbal: 0.3, symbolic: 0.5 },
  D3: { analog: 0.2, verbal: 0.4, symbolic: 0.4 },
  D4: { analog: 0.5, verbal: 0.2, symbolic: 0.3 },
  D5: { analog: 0.6, verbal: 0.0, symbolic: 0.4 },
  D6: { analog: 0.5, verbal: 0.0, symbolic: 0.5 },

  // Category E - Arithmetic (verbal + symbolic)
  E1: { analog: 0.1, verbal: 0.5, symbolic: 0.4 },
  E2: { analog: 0.2, verbal: 0.3, symbolic: 0.5 },
  E3: { analog: 0.1, verbal: 0.4, symbolic: 0.5 },
  E4: { analog: 0.3, verbal: 0.3, symbolic: 0.4 },
  E5: { analog: 0.3, verbal: 0.3, symbolic: 0.4 },
  E6: { analog: 0.1, verbal: 0.4, symbolic: 0.5 },
  E7: { analog: 0.1, verbal: 0.4, symbolic: 0.5 },
  E8: { analog: 0.1, verbal: 0.6, symbolic: 0.3 },
  E9: { analog: 0.2, verbal: 0.4, symbolic: 0.4 },
};

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

/** Get the Monday of the week containing the given date. */
function _getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** Format a date as "DD.MM" (Turkish convention). */
function _formatShort(date) {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}`;
}

/** Clamp a value between min and max. */
function _clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Compute mastery percentage for a single game entry.
 * Uses a weighted combination of stars, maxLevel, and bestScore.
 *
 * @param {object} entry  { attempts, bestScore, lastScore, maxLevel, stars, lastPlayed }
 * @param {number} totalLevels  How many levels the game has
 * @returns {number} 0-100
 */
function _gameMastery(entry, totalLevels) {
  if (!entry || !entry.attempts) return 0;
  const starScore = Math.min((entry.stars || 0) / 3, 1) * 40;          // max 40 pts
  const levelScore = Math.min((entry.maxLevel || 0) / totalLevels, 1) * 35; // max 35 pts
  const accuracyScore = Math.min((entry.bestScore || 0) / 100, 1) * 25;    // max 25 pts
  return Math.round(starScore + levelScore + accuracyScore);
}

// ---------------------------------------------------------------------------
// getProgressTimeline
// ---------------------------------------------------------------------------

/**
 * Build weekly summary data suitable for a line/bar chart.
 * Returns the last 12 weeks of activity.
 *
 * @param {string} userId    Not currently used, reserved for session lookups
 * @param {object} progress  The progress object from storage
 * @returns {Array<{ week: string, totalStars: number, accuracy: number, gamesPlayed: number }>}
 */
export function getProgressTimeline(userId, progress) {
  if (!progress || typeof progress !== 'object') return [];

  const now = new Date();
  const WEEKS = 12;

  // Build empty week buckets (Monday-based)
  const buckets = [];
  for (let i = WEEKS - 1; i >= 0; i--) {
    const weekStart = _getWeekStart(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000));
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    buckets.push({
      week: `${_formatShort(weekStart)}-${_formatShort(weekEnd)}`,
      start: weekStart.getTime(),
      end: weekEnd.getTime() + 24 * 60 * 60 * 1000 - 1, // end of Sunday
      totalStars: 0,
      totalScore: 0,
      gamesPlayed: 0,
    });
  }

  // Fill buckets from progress entries based on lastPlayed timestamp
  for (const [, entry] of Object.entries(progress)) {
    if (!entry || !entry.lastPlayed) continue;
    const ts = new Date(entry.lastPlayed).getTime();
    for (const bucket of buckets) {
      if (ts >= bucket.start && ts <= bucket.end) {
        bucket.totalStars += entry.stars || 0;
        bucket.totalScore += entry.lastScore || 0;
        bucket.gamesPlayed += 1;
        break;
      }
    }
  }

  // Compute accuracy and clean up internal fields
  return buckets.map(({ week, totalStars, totalScore, gamesPlayed }) => ({
    week,
    totalStars,
    accuracy: gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0,
    gamesPlayed,
  }));
}

// ---------------------------------------------------------------------------
// getSkillRadarData
// ---------------------------------------------------------------------------

/**
 * Compute per-category mastery for a radar / spider chart.
 *
 * @param {object} progress  The progress object
 * @param {object} GAMES     The GAMES constant from constants/games.js
 * @returns {Array<{ category: string, name: string, mastery: number }>}
 *          mastery is 0-100
 */
export function getSkillRadarData(progress, GAMES) {
  if (!progress || !GAMES) return [];

  // Group games by category
  const catGames = { A: [], B: [], C: [], D: [], E: [] };
  for (const [id, game] of Object.entries(GAMES)) {
    const cat = game.cat;
    if (catGames[cat]) {
      catGames[cat].push({ id, levels: (game.levels || []).length });
    }
  }

  const result = [];
  for (const cat of ['A', 'B', 'C', 'D', 'E']) {
    const games = catGames[cat];
    if (games.length === 0) {
      result.push({ category: cat, name: CATEGORY_META[cat].name, mastery: 0 });
      continue;
    }

    let totalMastery = 0;
    for (const g of games) {
      totalMastery += _gameMastery(progress[g.id], g.levels);
    }
    const avg = Math.round(totalMastery / games.length);
    result.push({
      category: cat,
      name: CATEGORY_META[cat].name,
      mastery: _clamp(avg, 0, 100),
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// getCognitiveProfile
// ---------------------------------------------------------------------------

/**
 * Compute a Triple Code Model profile from game progress.
 * Returns scores for analog (magnitude), verbal (counting/words),
 * and symbolic (written numerals) processing.
 *
 * @param {object} progress
 * @returns {{ analog: number, verbal: number, symbolic: number }}
 *          Each value is 0-100
 */
export function getCognitiveProfile(progress) {
  const profile = { analog: 0, verbal: 0, symbolic: 0 };
  if (!progress || typeof progress !== 'object') return profile;

  let analogSum = 0, verbalSum = 0, symbolicSum = 0;
  let analogWeight = 0, verbalWeight = 0, symbolicWeight = 0;

  for (const [gameId, entry] of Object.entries(progress)) {
    const weights = TRIPLE_CODE_WEIGHTS[gameId];
    if (!weights || !entry || !entry.attempts) continue;

    // Use a simple mastery estimate: stars (0-3) mapped to 0-100
    const mastery = _clamp(((entry.stars || 0) / 3) * 100, 0, 100);

    if (weights.analog > 0) {
      analogSum += mastery * weights.analog;
      analogWeight += weights.analog;
    }
    if (weights.verbal > 0) {
      verbalSum += mastery * weights.verbal;
      verbalWeight += weights.verbal;
    }
    if (weights.symbolic > 0) {
      symbolicSum += mastery * weights.symbolic;
      symbolicWeight += weights.symbolic;
    }
  }

  profile.analog = analogWeight > 0 ? Math.round(analogSum / analogWeight) : 0;
  profile.verbal = verbalWeight > 0 ? Math.round(verbalSum / verbalWeight) : 0;
  profile.symbolic = symbolicWeight > 0 ? Math.round(symbolicSum / symbolicWeight) : 0;

  return profile;
}

// ---------------------------------------------------------------------------
// getGrowthMetrics
// ---------------------------------------------------------------------------

/**
 * Compare current week vs previous week performance.
 * Reads progress from localStorage (same source as the rest of the app).
 *
 * @param {string} userId
 * @returns {{ currentWeek: object, previousWeek: object, changes: object }}
 */
export function getGrowthMetrics(userId) {
  // Load progress from localStorage
  let progress = {};
  try {
    progress = JSON.parse(localStorage.getItem(`matbil_progress_${userId}`) || '{}');
  } catch { /* empty */ }

  const now = new Date();
  const thisWeekStart = _getWeekStart(now).getTime();
  const lastWeekStart = thisWeekStart - 7 * 24 * 60 * 60 * 1000;
  const thisWeekEnd = thisWeekStart + 7 * 24 * 60 * 60 * 1000 - 1;
  const lastWeekEnd = thisWeekStart - 1;

  const current = { stars: 0, gamesPlayed: 0, totalScore: 0 };
  const previous = { stars: 0, gamesPlayed: 0, totalScore: 0 };

  for (const [, entry] of Object.entries(progress)) {
    if (!entry || !entry.lastPlayed) continue;
    const ts = new Date(entry.lastPlayed).getTime();

    if (ts >= thisWeekStart && ts <= thisWeekEnd) {
      current.stars += entry.stars || 0;
      current.gamesPlayed += 1;
      current.totalScore += entry.lastScore || 0;
    } else if (ts >= lastWeekStart && ts <= lastWeekEnd) {
      previous.stars += entry.stars || 0;
      previous.gamesPlayed += 1;
      previous.totalScore += entry.lastScore || 0;
    }
  }

  current.accuracy = current.gamesPlayed > 0 ? Math.round(current.totalScore / current.gamesPlayed) : 0;
  previous.accuracy = previous.gamesPlayed > 0 ? Math.round(previous.totalScore / previous.gamesPlayed) : 0;

  // Compute deltas (positive = improvement)
  const changes = {
    starsDelta: current.stars - previous.stars,
    gamesPlayedDelta: current.gamesPlayed - previous.gamesPlayed,
    accuracyDelta: current.accuracy - previous.accuracy,
  };

  return { currentWeek: current, previousWeek: previous, changes };
}

// ---------------------------------------------------------------------------
// getRecommendedProgram
// ---------------------------------------------------------------------------

/**
 * Generate a weekly practice plan based on weak areas.
 * Prioritises categories with lowest mastery and schedules 2-3 games/day
 * across 5 weekdays (Mon-Fri).
 *
 * @param {object} progress
 * @param {object} GAMES  The GAMES constant
 * @returns {Array<{ day: string, games: Array<{ id: string, name: string, reason: string }> }>}
 */
export function getRecommendedProgram(progress, GAMES) {
  if (!GAMES) return [];
  const safeProgress = progress || {};

  const DAY_NAMES = ['Pazartesi', 'Sali', 'Carsamba', 'Persembe', 'Cuma'];

  // 1. Score every game by how much practice it needs (lower mastery = higher need)
  const gameScores = [];
  for (const [id, game] of Object.entries(GAMES)) {
    const entry = safeProgress[id];
    const totalLevels = (game.levels || []).length;
    const mastery = _gameMastery(entry, totalLevels);
    const attempts = entry ? (entry.attempts || 0) : 0;

    // Need score: higher = more practice needed
    // Unplayed games get a moderate boost, very weak games get high priority
    let need = 100 - mastery;
    if (attempts === 0) need = Math.max(need, 60); // ensure unplayed games appear
    // Slight recency penalty: games played recently need less repetition
    if (entry && entry.lastPlayed) {
      const daysSince = (Date.now() - new Date(entry.lastPlayed).getTime()) / (24 * 60 * 60 * 1000);
      if (daysSince < 1) need *= 0.5;
      else if (daysSince < 3) need *= 0.7;
    }

    gameScores.push({
      id,
      name: game.name,
      cat: game.cat,
      need: Math.round(need),
      mastery,
    });
  }

  // 2. Sort by need descending
  gameScores.sort((a, b) => b.need - a.need);

  // 3. Distribute top games across 5 days (2-3 per day)
  // Try to have category variety within each day
  const GAMES_PER_DAY = 3;
  const plan = DAY_NAMES.map(day => ({ day, games: [] }));

  const used = new Set();
  let dayIndex = 0;

  for (const g of gameScores) {
    if (used.size >= GAMES_PER_DAY * DAY_NAMES.length) break;
    if (used.has(g.id)) continue;

    // Find a day that doesn't already have a game from the same category
    let placed = false;
    for (let attempt = 0; attempt < DAY_NAMES.length; attempt++) {
      const di = (dayIndex + attempt) % DAY_NAMES.length;
      const dayPlan = plan[di];
      if (dayPlan.games.length >= GAMES_PER_DAY) continue;
      const hasSameCat = dayPlan.games.some(x => x.cat === g.cat);
      if (!hasSameCat || dayPlan.games.length === 0) {
        const reason = g.mastery === 0
          ? 'Henuz denenmedi'
          : g.mastery < 40
            ? 'Gelistirilmesi gereken alan'
            : 'Pekistirme';
        dayPlan.games.push({ id: g.id, name: g.name, reason });
        used.add(g.id);
        placed = true;
        dayIndex = (di + 1) % DAY_NAMES.length;
        break;
      }
    }

    // Fallback: place in any day with room
    if (!placed) {
      for (const dayPlan of plan) {
        if (dayPlan.games.length < GAMES_PER_DAY) {
          const reason = g.mastery === 0 ? 'Henuz denenmedi' : 'Tekrar';
          dayPlan.games.push({ id: g.id, name: g.name, reason });
          used.add(g.id);
          break;
        }
      }
    }
  }

  // Clean up internal cat field from output
  return plan.map(({ day, games }) => ({
    day,
    games: games.map(({ id, name, reason }) => ({ id, name, reason })),
  }));
}

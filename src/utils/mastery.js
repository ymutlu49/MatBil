import { SKILL_GRAPH } from '../constants/skillGraph';

export const calcMastery = (skillId, progress) => {
  const skill = SKILL_GRAPH[skillId];
  if (!skill) return 0;
  const played = skill.games.filter(id => progress[id]);
  if (played.length === 0) return 0;
  const avgStars = played.reduce((s, id) => s + (progress[id]?.stars || 0), 0) / (played.length * 3);
  return Math.min(1, avgStars);
};

export const prereqsMet = (skillId, progress) => {
  const skill = SKILL_GRAPH[skillId];
  if (!skill) return false;
  return skill.prereqs.every(p => calcMastery(p, progress) >= 0.3);
};

export const recommendNext = (progress, GAMES) => {
  let bestGame = null, bestScore = -1;
  Object.entries(SKILL_GRAPH).forEach(([skillId, skill]) => {
    const mastery = calcMastery(skillId, progress);
    const ready = prereqsMet(skillId, progress);
    if (!ready && skill.prereqs.length > 0) return;
    if (mastery >= 0.9) return;
    const priority = mastery < 0.3 ? 3 : mastery < 0.6 ? 5 : 2;
    if (priority > bestScore) {
      const leastPlayed = skill.games.sort((a, b) => (progress[a]?.attempts || 0) - (progress[b]?.attempts || 0))[0];
      if (leastPlayed && GAMES[leastPlayed]) { bestGame = leastPlayed; bestScore = priority; }
    }
  });
  return bestGame;
};

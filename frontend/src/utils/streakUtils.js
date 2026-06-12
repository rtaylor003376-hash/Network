export const LEVELS = [
  { name: 'Newcomer',   minMeetings: 0,  emoji: '🌱' },
  { name: 'Connector',  minMeetings: 3,  emoji: '🔗' },
  { name: 'Networker',  minMeetings: 8,  emoji: '⚡' },
  { name: 'Influencer', minMeetings: 20, emoji: '🌟' },
  { name: 'Ambassador', minMeetings: 40, emoji: '🏆' },
];

export function getLevel(totalMeetings) {
  let levelIdx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (totalMeetings >= LEVELS[i].minMeetings) levelIdx = i;
  }
  const current = LEVELS[levelIdx];
  const next = LEVELS[levelIdx + 1] ?? null;
  const progress = next
    ? (totalMeetings - current.minMeetings) / (next.minMeetings - current.minMeetings)
    : 1;
  return { current, next, progress: Math.min(1, Math.max(0, progress)) };
}

export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function computeNewStreak(lastActionDate, currentStreak) {
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (lastActionDate === today) return currentStreak;
  if (lastActionDate === yesterday) return currentStreak + 1;
  return 1;
}

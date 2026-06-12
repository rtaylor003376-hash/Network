import { updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.jsx';
import { userDocRef } from '../firebase/firestore.js';
import { computeNewStreak, getLevel, todayStr } from '../utils/streakUtils.js';

export function useStreak() {
  const { user, profile, refreshProfile } = useAuth();

  const streakDays = profile?.streakDays ?? 0;
  const lastActionDate = profile?.lastActionDate ?? null;
  const totalMeetingsScheduled = profile?.totalMeetingsScheduled ?? 0;
  const { current, next, progress } = getLevel(totalMeetingsScheduled);

  async function recordAction({ isMeeting = false } = {}) {
    if (!user) return;
    const newStreak = computeNewStreak(lastActionDate, streakDays);
    const update = {
      streakDays: newStreak,
      lastActionDate: todayStr(),
    };
    if (isMeeting) update.totalMeetingsScheduled = totalMeetingsScheduled + 1;
    await updateDoc(userDocRef(user.uid), update);
    await refreshProfile();
  }

  return {
    streakDays,
    totalMeetingsScheduled,
    level: current,
    nextLevel: next,
    levelProgress: progress,
    recordAction,
  };
}

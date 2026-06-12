import { useStreak } from '../../hooks/useStreak.js';
import styles from '../../styles/StreakWidget.module.css';

export default function StreakWidget() {
  const { streakDays, totalMeetingsScheduled, level, nextLevel, levelProgress } = useStreak();
  const meetingsToNext = nextLevel ? nextLevel.minMeetings - totalMeetingsScheduled : 0;

  return (
    <div className={styles.widget}>
      <div className={styles.left}>
        <span className={styles.flame}>🔥</span>
        <div>
          <span className={styles.streakNum}>{streakDays}</span>
          <span className={styles.streakLabel}>day streak</span>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.right}>
        <div className={styles.levelRow}>
          <span className={styles.levelEmoji}>{level.emoji}</span>
          <span className={styles.levelName}>{level.name}</span>
        </div>
        <div className={styles.xpBar}>
          <div className={styles.xpFill} style={{ width: `${levelProgress * 100}%` }} />
        </div>
        {nextLevel ? (
          <p className={styles.xpHint}>
            {meetingsToNext} meeting{meetingsToNext !== 1 ? 's' : ''} to {nextLevel.name}
          </p>
        ) : (
          <p className={styles.xpHint}>Max level reached!</p>
        )}
      </div>
    </div>
  );
}

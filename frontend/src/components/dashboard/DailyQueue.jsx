import { useDailyQueue } from '../../hooks/useDailyQueue.js';
import { useConnections } from '../../hooks/useConnections.js';
import SwipeableQueue from './SwipeableQueue.jsx';
import LoadingSpinner from '../shared/LoadingSpinner.jsx';
import EmptyState from '../shared/EmptyState.jsx';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/DailyQueue.module.css';

export default function DailyQueue({ onSchedule, onEmailAction }) {
  const { queue, loading } = useDailyQueue();
  const { dismissConnection, snoozeConnection } = useConnections();
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Today's Queue</h1>
            <p className={styles.date}>{today}</p>
          </div>
        </div>
        <div className={styles.spinnerWrap}><LoadingSpinner /></div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Today's Queue</h1>
          <p className={styles.date}>{today}</p>
        </div>
        {queue.length > 0 && (
          <span className={styles.count}>{queue.length} {queue.length === 1 ? 'person' : 'people'}</span>
        )}
      </div>

      {queue.length === 0 ? (
        <EmptyState
          icon="🎉"
          title="You're all caught up!"
          subtitle="No new connections to reach out to today. Import your LinkedIn network or check back tomorrow."
          action={
            <button className="btn-primary" onClick={() => navigate('/import')}>
              Import connections
            </button>
          }
        />
      ) : (
        <SwipeableQueue
          queue={queue}
          onSchedule={onSchedule}
          onSnooze={snoozeConnection}
          onDismiss={dismissConnection}
          onEmailAction={onEmailAction}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { useMeetings } from '../../hooks/useMeetings.js';
import MeetingPrepModal from './MeetingPrepModal.jsx';
import styles from '../../styles/UpcomingMeetings.module.css';

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function UpcomingMeetings() {
  const { meetings, loading } = useMeetings();
  const [prepFor, setPrepFor] = useState(null);

  const upcoming = meetings.filter((m) => new Date(m.scheduledAt) >= new Date());

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Upcoming calls</h2>

      {loading ? (
        <p className={styles.empty}>Loading…</p>
      ) : upcoming.length === 0 ? (
        <p className={styles.empty}>No calls scheduled yet. Schedule one from the queue above.</p>
      ) : (
        <ul className={styles.list}>
          {upcoming.map((m) => (
            <li key={m.id} className={styles.item}>
              <div className={styles.dateBlock}>
                <span className={styles.dateDay}>{new Date(m.scheduledAt).getDate()}</span>
                <span className={styles.dateMonth}>
                  {new Date(m.scheduledAt).toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </div>
              <div className={styles.meta}>
                <span className={styles.name}>{m.connectionName}</span>
                <span className={styles.sub}>
                  {m.connectionCompany && `${m.connectionCompany} · `}
                  {formatTime(m.scheduledAt)} · {m.durationMins} min
                </span>
                <div className={styles.links}>
                  {m.meetLink && (
                    <a
                      href={m.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.meetLink}
                    >
                      Join Meet ↗
                    </a>
                  )}
                  <button className={styles.prepBtn} onClick={() => setPrepFor(m)}>
                    ✦ Prep notes
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {prepFor && (
        <MeetingPrepModal meeting={prepFor} onClose={() => setPrepFor(null)} />
      )}
    </div>
  );
}

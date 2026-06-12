import { useState } from 'react';
import { CalendarService } from '../../services/serviceFactory.js';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from '../../styles/ScheduleModal.module.css';

function getMinDateTime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 30);
  return d.toISOString().slice(0, 16);
}

const DURATIONS = [15, 30, 45, 60];

export default function ScheduleModal({ connection, onClose, onScheduled }) {
  const { user, googleAccessToken } = useAuth();
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMins, setDurationMins] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const name = `${connection.firstName} ${connection.lastName}`;

  async function handleSchedule() {
    if (!scheduledAt) { setError('Please pick a date and time.'); return; }
    setLoading(true);
    setError('');
    try {
      const firebaseIdToken = await user.getIdToken();
      const result = await CalendarService.createMeeting({
        connection,
        scheduledAt,
        durationMins,
        userAccessToken: googleAccessToken,
        firebaseIdToken,
      });
      setDone(result);
      await onScheduled(connection, {
        scheduledAt,
        durationMins,
        meetLink: result.meetLink,
        calendarEventId: result.calendarEventId,
        inviteStatus: result.inviteStatus,
      });
    } catch (err) {
      setError(err.message || 'Failed to schedule. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        {!done ? (
          <>
            <div className={styles.header}>
              <h2>Schedule a call</h2>
              <p>with <strong>{name}</strong> · {connection.position}{connection.company && ` @ ${connection.company}`}</p>
            </div>

            <div className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label}>Date & time</label>
                <input
                  type="datetime-local"
                  className={styles.input}
                  min={getMinDateTime()}
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Duration</label>
                <div className={styles.durationRow}>
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`${styles.durationBtn} ${durationMins === d ? styles.durationActive : ''}`}
                      onClick={() => setDurationMins(d)}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              {connection.email && (
                <p className={styles.inviteNote}>
                  A Google Calendar invite will be sent to <strong>{connection.email}</strong>.
                </p>
              )}

              {!connection.email && (
                <p className={styles.noEmailNote}>
                  No email on file — you'll get a Meet link to share manually.
                </p>
              )}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
              <button className="btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn-primary" onClick={handleSchedule} disabled={loading || !scheduledAt}>
                {loading ? 'Scheduling…' : 'Confirm & create Meet link'}
              </button>
            </div>
          </>
        ) : (
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h2>Call scheduled!</h2>
            <p>Your call with <strong>{name}</strong> is confirmed.</p>
            <a
              href={done.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.meetLinkBox}
            >
              <span>📹</span>
              <div>
                <div className={styles.meetLinkLabel}>Google Meet link</div>
                <div className={styles.meetLinkUrl}>{done.meetLink}</div>
              </div>
              <span className={styles.meetLinkArrow}>↗</span>
            </a>
            <button className="btn-primary" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

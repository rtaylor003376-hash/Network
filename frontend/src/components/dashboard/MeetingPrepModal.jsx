import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { AiService } from '../../services/serviceFactory.js';
import styles from '../../styles/MeetingPrepModal.module.css';

const SECTIONS = [
  { key: 'talkingPoints',  label: 'Talking Points',   icon: '🗣' },
  { key: 'questionsToAsk', label: 'Questions to Ask',  icon: '❓' },
  { key: 'commonGround',   label: 'Common Ground',     icon: '🤝' },
  { key: 'icebreakers',    label: 'Icebreakers',       icon: '💬' },
];

function formatMeetingTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) +
    ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function MeetingPrepModal({ meeting, onClose }) {
  const { user, profile } = useAuth();
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPrep() {
      setLoading(true);
      setError('');
      try {
        const firebaseIdToken = await user.getIdToken();
        const result = await AiService.meetingPrep({
          connection: meeting,
          userProfile: profile,
          firebaseIdToken,
        });
        setNotes(result);
      } catch {
        setError('Failed to generate prep notes. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchPrep();
  }, [meeting.id]);

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        <div className={styles.header}>
          <p className={styles.eyebrow}>Call Prep</p>
          <h2 className={styles.name}>{meeting.connectionName}</h2>
          <p className={styles.meta}>
            {meeting.connectionPosition && <span>{meeting.connectionPosition}</span>}
            {meeting.connectionPosition && meeting.connectionCompany && <span className={styles.dot}>·</span>}
            {meeting.connectionCompany && <strong>{meeting.connectionCompany}</strong>}
          </p>
          <p className={styles.time}>📅 {formatMeetingTime(meeting.scheduledAt)}</p>
        </div>

        <div className={styles.body}>
          {loading && (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
              <p className={styles.loadingText}>Generating your prep notes…</p>
            </div>
          )}

          {error && !loading && (
            <div className={styles.errorWrap}>
              <p className={styles.errorText}>{error}</p>
              <button className="btn-primary" onClick={() => { setLoading(true); setError(''); }}>
                Retry
              </button>
            </div>
          )}

          {notes && !loading && (
            <div className={styles.sections}>
              {SECTIONS.map(({ key, label, icon }) => (
                notes[key]?.length > 0 && (
                  <div key={key} className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                      <span className={styles.sectionIcon}>{icon}</span>
                      {label}
                    </h3>
                    <ul className={styles.list}>
                      {notes[key].map((item, i) => (
                        <li key={i} className={styles.listItem}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {meeting.meetLink && (
          <div className={styles.footer}>
            <a href={meeting.meetLink} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Join Google Meet ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

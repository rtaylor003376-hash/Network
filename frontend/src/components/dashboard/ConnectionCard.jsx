import { useState } from 'react';
import ComposeEmailModal from '../email/ComposeEmailModal.jsx';
import styles from '../../styles/ConnectionCard.module.css';

function getInitials(firstName, lastName) {
  return `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`;
}

function getAvatarColor(name) {
  const colors = ['#6366f1', '#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0284c7'];
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + hash * 31;
  return colors[Math.abs(hash) % colors.length];
}

function MatchScore({ score }) {
  const pct = Math.round(score * 100);
  const fill = score >= 0.7 ? 'var(--color-success)' : score >= 0.4 ? 'var(--color-brand)' : 'var(--color-warning)';
  return (
    <div className={styles.score} title={`Match score: ${pct}%`}>
      <div className={styles.scoreBar}>
        <div className={styles.scoreFill} style={{ width: `${pct}%`, background: fill }} />
      </div>
      <span className={styles.scorePct} style={{ color: fill }}>{pct}%</span>
    </div>
  );
}

// Vertical layout used inside the swipeable deck
function DeckLayout({ connection, rank, onSchedule, onSnooze, onDismiss, onEmailAction }) {
  const [composing, setComposing] = useState(false);
  const name = `${connection.firstName} ${connection.lastName}`;
  const initials = getInitials(connection.firstName, connection.lastName);
  const avatarColor = getAvatarColor(name);

  return (
    <div className={styles.deckCard}>
      <div className={styles.deckTopRow}>
        <span className={styles.deckRank}>#{rank}</span>
        <MatchScore score={connection.matchScore} />
      </div>

      <div className={styles.deckAvatarWrap}>
        <div className={styles.deckAvatar} style={{ background: avatarColor }}>
          {initials}
        </div>
      </div>

      <div className={styles.deckInfo}>
        <h3 className={styles.deckName}>{name}</h3>
        <p className={styles.deckRole}>
          {connection.position}
          {connection.company && <> · <strong>{connection.company}</strong></>}
        </p>
        {connection.location && (
          <p className={styles.deckLocation}>📍 {connection.location}</p>
        )}
        <div className={styles.deckMatchReason}>
          <span className={styles.deckMatchIcon}>✦</span>
          {connection.matchReason}
        </div>
      </div>

      <div className={styles.deckActions}>
        <button className={`btn-primary ${styles.deckScheduleBtn}`} onClick={onSchedule}>
          Schedule a call
        </button>
        <div className={styles.deckSecondary}>
          <button className="btn-secondary" onClick={() => setComposing(true)}>
            Email
          </button>
          <button className="btn-ghost" onClick={onSnooze} title="Snooze 7 days">
            ⏱ Snooze
          </button>
          <button className="btn-ghost" onClick={onDismiss} title="Dismiss">
            ✕ Dismiss
          </button>
        </div>
      </div>

      {composing && (
        <ComposeEmailModal
          connection={connection}
          onClose={() => setComposing(false)}
          onEmailAction={onEmailAction}
        />
      )}
    </div>
  );
}

// Horizontal list layout (used elsewhere if needed)
export default function ConnectionCard({ connection, rank, onSchedule, onSnooze, onDismiss, onEmailAction, deck }) {
  const [composing, setComposing] = useState(false);

  if (deck) {
    return (
      <DeckLayout
        connection={connection}
        rank={rank}
        onSchedule={onSchedule}
        onSnooze={onSnooze}
        onDismiss={onDismiss}
        onEmailAction={onEmailAction}
      />
    );
  }

  const name = `${connection.firstName} ${connection.lastName}`;
  const initials = getInitials(connection.firstName, connection.lastName);
  const avatarColor = getAvatarColor(name);

  return (
    <div className={styles.card}>
      <div className={styles.rankBadge}>#{rank}</div>

      <div className={styles.avatar} style={{ background: avatarColor }}>
        {initials}
      </div>

      <div className={styles.info}>
        <div className={styles.nameRow}>
          <h3 className={styles.name}>{name}</h3>
          <MatchScore score={connection.matchScore} />
        </div>

        <p className={styles.role}>
          {connection.position}
          {connection.company && <> · <strong>{connection.company}</strong></>}
        </p>

        {connection.location && (
          <p className={styles.location}>
            <span className={styles.locationIcon}>📍</span>
            {connection.location}
          </p>
        )}

        <div className={styles.matchReason}>
          <span className={styles.matchIcon}>✦</span>
          {connection.matchReason}
        </div>
      </div>

      <div className={styles.actions}>
        <button className={`btn-primary ${styles.scheduleBtn}`} onClick={onSchedule}>
          Schedule a call
        </button>
        <button className="btn-secondary" onClick={() => setComposing(true)}>
          Email
        </button>
        <div className={styles.secondary}>
          <button className="btn-ghost" onClick={onSnooze} title="Snooze 7 days">
            <span>⏱</span> Snooze
          </button>
          <button className="btn-ghost" onClick={onDismiss} title="Dismiss">
            <span>✕</span> Dismiss
          </button>
        </div>
      </div>

      {composing && (
        <ComposeEmailModal
          connection={connection}
          onClose={() => setComposing(false)}
          onEmailAction={onEmailAction}
        />
      )}
    </div>
  );
}

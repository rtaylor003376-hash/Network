import { useState, useRef, useEffect } from 'react';
import ConnectionCard from './ConnectionCard.jsx';
import styles from '../../styles/SwipeableQueue.module.css';

export default function SwipeableQueue({ queue, onSchedule, onSnooze, onDismiss, onEmailAction }) {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const drag = useRef({ active: false, startX: 0 });

  // Clamp when queue shrinks after a dismiss/snooze
  useEffect(() => {
    if (queue.length > 0 && idx >= queue.length) {
      setIdx(queue.length - 1);
    }
  }, [queue.length]);

  const safeIdx = Math.min(idx, Math.max(0, queue.length - 1));

  function navigate(next) {
    if (fading || next === safeIdx || next < 0 || next >= queue.length) return;
    setFading(true);
    setTimeout(() => {
      setIdx(next);
      setFading(false);
    }, 180);
  }

  function handleDragStart(clientX) {
    drag.current = { active: true, startX: clientX };
  }

  function handleDragEnd(clientX) {
    if (!drag.current.active) return;
    drag.current.active = false;
    const delta = clientX - drag.current.startX;
    if (delta < -60) navigate(safeIdx + 1);
    else if (delta > 60) navigate(safeIdx - 1);
  }

  const conn = queue[safeIdx];
  if (!conn) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.deckOuter}>
        {queue[safeIdx + 2] && <div className={styles.ghost2} />}
        {queue[safeIdx + 1] && <div className={styles.ghost1} />}

        <div
          className={`${styles.activeCard} ${fading ? styles.fading : ''}`}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseUp={(e) => handleDragEnd(e.clientX)}
          onMouseLeave={(e) => { if (drag.current.active) handleDragEnd(e.clientX); }}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
        >
          <ConnectionCard
            deck
            connection={conn}
            rank={safeIdx + 1}
            onSchedule={() => onSchedule(conn)}
            onSnooze={() => onSnooze(conn.id)}
            onDismiss={() => onDismiss(conn.id)}
            onEmailAction={onEmailAction}
          />
        </div>
      </div>

      <div className={styles.nav}>
        <button
          className={styles.arrow}
          onClick={() => navigate(safeIdx - 1)}
          disabled={safeIdx === 0 || fading}
          aria-label="Previous connection"
        >
          ‹
        </button>
        <div className={styles.dots}>
          {queue.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === safeIdx ? styles.dotActive : ''}`}
              onClick={() => navigate(i)}
              aria-label={`Connection ${i + 1}`}
            />
          ))}
        </div>
        <button
          className={styles.arrow}
          onClick={() => navigate(safeIdx + 1)}
          disabled={safeIdx >= queue.length - 1 || fading}
          aria-label="Next connection"
        >
          ›
        </button>
      </div>
    </div>
  );
}

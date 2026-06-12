import { useState } from 'react';
import styles from '../../styles/ConnectionsTab.module.css';

function getAvatarColor(name) {
  const colors = ['#6366f1', '#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0284c7'];
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + hash * 31;
  return colors[Math.abs(hash) % colors.length];
}

export default function ConnectionGroup({ company, connections }) {
  const [collapsed, setCollapsed] = useState(false);

  // Sub-group by position within the company.
  const byPosition = connections.reduce((acc, c) => {
    const key = c.position || 'Unknown role';
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <div className={styles.group}>
      <button className={styles.groupHeader} onClick={() => setCollapsed((v) => !v)}>
        <div className={styles.companyBadge}>
          {company[0]?.toUpperCase() || '?'}
        </div>
        <span className={styles.companyName}>{company}</span>
        <span className={styles.groupCount}>{connections.length}</span>
        <span className={styles.chevron} style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
          ▾
        </span>
      </button>

      {!collapsed && (
        <div className={styles.groupBody}>
          {Object.entries(byPosition).sort(([a], [b]) => a.localeCompare(b)).map(([position, people]) => (
            <div key={position} className={styles.positionGroup}>
              <p className={styles.positionLabel}>{position}</p>
              <ul className={styles.personList}>
                {people.map((c) => {
                  const name = `${c.firstName} ${c.lastName}`;
                  const initials = `${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`.toUpperCase();
                  return (
                    <li key={c.id} className={styles.personRow}>
                      <div
                        className={styles.personAvatar}
                        style={{ background: getAvatarColor(name) }}
                      >
                        {initials}
                      </div>
                      <div className={styles.personInfo}>
                        <span className={styles.personName}>{name}</span>
                        {c.location && <span className={styles.personLoc}>{c.location}</span>}
                      </div>
                      <span className={`status-chip status-${c.status}`}>{c.status}</span>
                      {c.linkedinUrl && (
                        <a
                          href={c.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.linkedinLink}
                        >
                          ↗
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

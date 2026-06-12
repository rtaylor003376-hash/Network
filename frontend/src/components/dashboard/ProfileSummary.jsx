import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from '../../styles/ProfileSummary.module.css';

export default function ProfileSummary() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!profile) return null;

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Your targets</h2>
        <button className="btn-ghost" onClick={() => navigate('/onboarding')} style={{ fontSize: 'var(--font-size-xs)' }}>
          Edit
        </button>
      </div>

      {profile.desiredCareers?.length > 0 && (
        <div className={styles.group}>
          <p className={styles.groupLabel}>Careers</p>
          <div className={styles.chips}>
            {profile.desiredCareers.map((c) => (
              <span key={c} className={styles.chip}>{c}</span>
            ))}
          </div>
        </div>
      )}

      {profile.targetCompanies?.length > 0 && (
        <div className={styles.group}>
          <p className={styles.groupLabel}>Companies</p>
          <div className={styles.chips}>
            {profile.targetCompanies.map((c) => (
              <span key={c} className={styles.chip}>{c}</span>
            ))}
          </div>
        </div>
      )}

      {profile.desiredLocations?.length > 0 && (
        <div className={styles.group}>
          <p className={styles.groupLabel}>Locations</p>
          <div className={styles.chips}>
            {profile.desiredLocations.map((l) => (
              <span key={l} className={styles.chip}>{l}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

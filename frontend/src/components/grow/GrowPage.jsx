import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  buildGrowSearchLinks,
  getMissingGeoUrnLocations,
} from '../../services/linkedinSearchLinks.js';
import styles from '../../styles/GrowPage.module.css';

export default function GrowPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [uvaAlumniByCareer, setUvaAlumniByCareer] = useState({});

  const desiredCareers = profile?.desiredCareers || [];
  const desiredLocations = profile?.desiredLocations || [];

  const searchLinks = useMemo(
    () => buildGrowSearchLinks({ desiredCareers, desiredLocations, uvaAlumniByCareer }),
    [desiredCareers, desiredLocations, uvaAlumniByCareer],
  );

  const missingGeoUrnLocations = useMemo(
    () => getMissingGeoUrnLocations(desiredLocations),
    [desiredLocations],
  );

  if (desiredCareers.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🌱</span>
          <h1 className={styles.title}>Grow starts with your targets</h1>
          <p className={styles.subtitle}>
            Add at least one career interest so Netspand can create LinkedIn people searches for you.
          </p>
          <button className="btn-primary" onClick={() => navigate('/onboarding')}>
            Add career targets
          </button>
        </div>
      </div>
    );
  }

  const hasLocations = desiredLocations.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>LinkedIn discovery</p>
          <h1 className={styles.title}>Grow</h1>
          <p className={styles.subtitle}>
            Quick people searches generated from your current career and location targets.
          </p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/onboarding')}>
          Edit targets
        </button>
      </div>

      {!hasLocations && (
        <div className={styles.notice}>
          <div>
            <span className={styles.noticeTitle}>No locations selected yet</span>
            <p>These links search by career only. Add locations to narrow results by metro.</p>
          </div>
          <button className="btn-ghost" onClick={() => navigate('/onboarding')}>
            Add locations
          </button>
        </div>
      )}

      {missingGeoUrnLocations.length > 0 && (
        <div className={styles.notice}>
          <div>
            <span className={styles.noticeTitle}>Some locations need LinkedIn geo codes</span>
            <p>
              Grow is currently leaving out: {missingGeoUrnLocations.join(', ')}.
            </p>
          </div>
          <button className="btn-ghost" onClick={() => navigate('/onboarding')}>
            Review targets
          </button>
        </div>
      )}

      <div className={styles.searchGrid}>
        {searchLinks.map((link) => (
          <article key={link.career} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.icon}>↗</span>
              <div>
                <h2 className={styles.cardTitle}>{link.career}</h2>
                <p className={styles.cardSubtitle}>Search term: {link.searchTerm}</p>
              </div>
            </div>

            <div className={styles.metaGroup}>
              <span className={styles.metaLabel}>Locations</span>
              {link.locations.length > 0 ? (
                <div className={styles.chips}>
                  {link.locations.map((location) => (
                    <span key={location} className={styles.chip}>{location}</span>
                  ))}
                </div>
              ) : (
                <p className={styles.muted}>No location filter</p>
              )}
            </div>

            <div className={styles.cardFooter}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={link.uvaAlumniOnly}
                  onChange={(event) => {
                    setUvaAlumniByCareer((current) => ({
                      ...current,
                      [link.career]: event.target.checked,
                    }));
                  }}
                />
                <span>UVA alumni</span>
              </label>
              <a
                className="btn-primary"
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                Search LinkedIn
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

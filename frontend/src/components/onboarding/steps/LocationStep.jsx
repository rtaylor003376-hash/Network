import { useState } from 'react';
import { ANYWHERE_LOCATION, PRESET_LOCATIONS } from '../../../data/targetOptions.js';
import styles from '../../../styles/OnboardingWizard.module.css';

export default function LocationStep({ form, patch, onNext, onBack }) {
  const [custom, setCustom] = useState('');

  const isAnywhere = form.desiredLocations.includes(ANYWHERE_LOCATION);

  function toggleAnywhere() {
    if (isAnywhere) {
      patch({ desiredLocations: [] });
    } else {
      patch({ desiredLocations: [ANYWHERE_LOCATION] });
    }
  }

  function toggle(loc) {
    if (isAnywhere) return;
    const set = new Set(form.desiredLocations);
    if (set.has(loc)) set.delete(loc);
    else set.add(loc);
    patch({ desiredLocations: [...set] });
  }

  function addCustom() {
    const trimmed = custom.trim();
    if (!trimmed || form.desiredLocations.includes(trimmed)) { setCustom(''); return; }
    patch({ desiredLocations: [...form.desiredLocations.filter((l) => l !== ANYWHERE_LOCATION), trimmed] });
    setCustom('');
  }

  const canProceed = form.desiredLocations.length > 0;

  return (
    <div className={styles.step}>
      <h2>Where do you want to work?</h2>
      <p className={styles.stepSubtitle}>Select cities or metros you're open to.</p>

      <button
        type="button"
        className={`${styles.chip} ${isAnywhere ? styles.chipActive : ''}`}
        onClick={toggleAnywhere}
        style={{ marginBottom: 'var(--space-3)' }}
      >
        {ANYWHERE_LOCATION}
      </button>

      {!isAnywhere && (
        <>
          <div className={styles.chipGrid}>
            {PRESET_LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                className={`${styles.chip} ${form.desiredLocations.includes(loc) ? styles.chipActive : ''}`}
                onClick={() => toggle(loc)}
              >
                {loc}
              </button>
            ))}
            {form.desiredLocations.filter((l) => !PRESET_LOCATIONS.includes(l) && l !== ANYWHERE_LOCATION).map((l) => (
              <button
                key={l}
                type="button"
                className={`${styles.chip} ${styles.chipActive}`}
                onClick={() => toggle(l)}
              >
                {l} ×
              </button>
            ))}
          </div>

          <div className={styles.addRow}>
            <input
              className={styles.input}
              placeholder="Add a city or metro…"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustom()}
            />
            <button className="btn-secondary" type="button" onClick={addCustom} disabled={!custom.trim()}>
              Add
            </button>
          </div>
        </>
      )}

      <div className={styles.actions}>
        <button className="btn-ghost" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={onNext} disabled={!canProceed}>
          Continue
        </button>
      </div>
    </div>
  );
}

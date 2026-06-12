import { useState } from 'react';
import styles from '../../../styles/OnboardingWizard.module.css';

const PRESET_CAREERS = [
  'Strategy Consulting',
  'Software Engineering',
  'Product Management',
  'Investment Banking',
  'Data Science',
  'Marketing',
  'Venture Capital',
  'Private Equity',
  'Corporate Finance',
  'UX / Product Design',
];

export default function CareersStep({ form, patch, onNext, onBack }) {
  const [custom, setCustom] = useState('');

  function toggle(career) {
    const set = new Set(form.desiredCareers);
    if (set.has(career)) set.delete(career);
    else set.add(career);
    patch({ desiredCareers: [...set] });
  }

  function addCustom() {
    const trimmed = custom.trim();
    if (!trimmed || form.desiredCareers.includes(trimmed)) { setCustom(''); return; }
    patch({ desiredCareers: [...form.desiredCareers, trimmed] });
    setCustom('');
  }

  const canProceed = form.desiredCareers.length > 0;

  return (
    <div className={styles.step}>
      <h2>What careers are you targeting?</h2>
      <p className={styles.stepSubtitle}>Select all that apply — you can always change these later.</p>

      <div className={styles.chipGrid}>
        {PRESET_CAREERS.map((c) => (
          <button
            key={c}
            type="button"
            className={`${styles.chip} ${form.desiredCareers.includes(c) ? styles.chipActive : ''}`}
            onClick={() => toggle(c)}
          >
            {c}
          </button>
        ))}
        {form.desiredCareers.filter((c) => !PRESET_CAREERS.includes(c)).map((c) => (
          <button
            key={c}
            type="button"
            className={`${styles.chip} ${styles.chipActive}`}
            onClick={() => toggle(c)}
          >
            {c} ×
          </button>
        ))}
      </div>

      <div className={styles.addRow}>
        <input
          className={styles.input}
          placeholder="Add your own…"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustom()}
        />
        <button className="btn-secondary" type="button" onClick={addCustom} disabled={!custom.trim()}>
          Add
        </button>
      </div>

      <div className={styles.actions}>
        <button className="btn-ghost" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={onNext} disabled={!canProceed}>
          Continue
        </button>
      </div>
    </div>
  );
}

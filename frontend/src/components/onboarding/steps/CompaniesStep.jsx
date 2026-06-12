import { useState } from 'react';
import styles from '../../../styles/OnboardingWizard.module.css';

const PRESET_COMPANIES = [
  'McKinsey & Company', 'BCG', 'Bain & Company', 'Deloitte', 'Accenture',
  'Goldman Sachs', 'JPMorgan Chase', 'Morgan Stanley',
  'Google', 'Amazon', 'Apple', 'Microsoft', 'Meta', 'Netflix',
  'Stripe', 'Airbnb', 'Uber', 'Salesforce',
];

export default function CompaniesStep({ form, patch, onNext, onBack }) {
  const [custom, setCustom] = useState('');

  function toggle(company) {
    const set = new Set(form.targetCompanies);
    if (set.has(company)) set.delete(company);
    else set.add(company);
    patch({ targetCompanies: [...set] });
  }

  function addCustom() {
    const trimmed = custom.trim();
    if (!trimmed || form.targetCompanies.includes(trimmed)) { setCustom(''); return; }
    patch({ targetCompanies: [...form.targetCompanies, trimmed] });
    setCustom('');
  }

  const canProceed = form.targetCompanies.length > 0;

  return (
    <div className={styles.step}>
      <h2>Which companies are you targeting?</h2>
      <p className={styles.stepSubtitle}>
        Connections at these companies will be ranked higher in your daily queue.
      </p>

      <div className={styles.chipGrid}>
        {PRESET_COMPANIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`${styles.chip} ${form.targetCompanies.includes(c) ? styles.chipActive : ''}`}
            onClick={() => toggle(c)}
          >
            {c}
          </button>
        ))}
        {form.targetCompanies.filter((c) => !PRESET_COMPANIES.includes(c)).map((c) => (
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
          placeholder="Add a company…"
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

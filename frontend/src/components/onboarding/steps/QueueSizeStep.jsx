import styles from '../../../styles/OnboardingWizard.module.css';

const OPTIONS = [
  { value: 1, label: '1 person', description: 'Slow and focused' },
  { value: 2, label: '2 people', description: 'Steady pace' },
  { value: 3, label: '3 people', description: 'Recommended' },
  { value: 4, label: '4 people', description: 'Active networking' },
  { value: 5, label: '5 people', description: 'Full throttle' },
];

export default function QueueSizeStep({ form, patch, onBack, onFinish, saving }) {
  return (
    <div className={styles.step}>
      <h2>How many people per day?</h2>
      <p className={styles.stepSubtitle}>
        Each day, Nexus will surface this many high-fit connections from your network.
        You can always change this later.
      </p>

      <div className={styles.queueOptions}>
        {OPTIONS.map(({ value, label, description }) => (
          <button
            key={value}
            type="button"
            className={`${styles.queueOption} ${form.dailyQueueSize === value ? styles.queueOptionActive : ''}`}
            onClick={() => patch({ dailyQueueSize: value })}
          >
            <span className={styles.queueNumber}>{value}</span>
            <div>
              <div className={styles.queueLabel}>{label}</div>
              <div className={styles.queueDesc}>{description}</div>
            </div>
            {value === 3 && <span className={styles.badge}>Default</span>}
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button className="btn-ghost" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={onFinish} disabled={saving}>
          {saving ? 'Setting up…' : "Let's go →"}
        </button>
      </div>
    </div>
  );
}

import styles from '../../../styles/OnboardingWizard.module.css';

const COMMON_MAJORS = [
  'Accounting', 'Biology', 'Business Administration', 'Chemical Engineering',
  'Civil Engineering', 'Computer Science', 'Data Science', 'Economics',
  'Electrical Engineering', 'Finance', 'Information Systems', 'Marketing',
  'Mathematics', 'Mechanical Engineering', 'Political Science', 'Psychology',
  'Statistics', 'Supply Chain Management',
];

const GRAD_YEARS = ['2025', '2026', '2027', '2028', '2029'];

export default function MajorStep({ form, patch, onNext }) {
  const canProceed = form.major.trim().length > 0;

  return (
    <div className={styles.step}>
      <h2>What are you studying?</h2>
      <p className={styles.stepSubtitle}>We'll use this to surface relevant alumni and professionals.</p>

      <div className={styles.field}>
        <label className={styles.label}>Major *</label>
        <input
          className={styles.input}
          list="majors-list"
          placeholder="e.g. Computer Science"
          value={form.major}
          onChange={(e) => patch({ major: e.target.value })}
        />
        <datalist id="majors-list">
          {COMMON_MAJORS.map((m) => <option key={m} value={m} />)}
        </datalist>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Minor <span className={styles.optional}>(optional)</span></label>
        <input
          className={styles.input}
          placeholder="e.g. Statistics"
          value={form.minor}
          onChange={(e) => patch({ minor: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Graduation year <span className={styles.optional}>(optional)</span></label>
        <select
          className={styles.select}
          value={form.gradYear}
          onChange={(e) => patch({ gradYear: e.target.value })}
        >
          <option value="">Select year</option>
          {GRAD_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className={styles.actions}>
        <button className="btn-primary" onClick={onNext} disabled={!canProceed}>
          Continue
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { db } from '../../firebase/firestore.js';
import MajorStep from './steps/MajorStep.jsx';
import CareersStep from './steps/CareersStep.jsx';
import LocationStep from './steps/LocationStep.jsx';
import CompaniesStep from './steps/CompaniesStep.jsx';
import QueueSizeStep from './steps/QueueSizeStep.jsx';
import styles from '../../styles/OnboardingWizard.module.css';

const STEPS = ['Major', 'Careers', 'Locations', 'Companies', 'Queue'];

const defaultForm = {
  major: '',
  minor: '',
  gradYear: '',
  desiredCareers: [],
  desiredLocations: [],
  targetCompanies: [],
  dailyQueueSize: 3,
};

export default function OnboardingWizard() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function patch(updates) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function finish() {
    setSaving(true);
    setError('');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...form,
        onboardingComplete: true,
        updatedAt: serverTimestamp(),
      });
      await refreshProfile();
      navigate('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  }

  const stepProps = { form, patch, onNext: next, onBack: back, onFinish: finish, saving };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoRow}>
            <div className={styles.logoMark}>N</div>
            <span className={styles.logoText}>Nexus</span>
          </div>
          <p className={styles.stepLabel}>Step {step + 1} of {STEPS.length}</p>
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className={styles.body}>
          {step === 0 && <MajorStep {...stepProps} />}
          {step === 1 && <CareersStep {...stepProps} />}
          {step === 2 && <LocationStep {...stepProps} />}
          {step === 3 && <CompaniesStep {...stepProps} />}
          {step === 4 && <QueueSizeStep {...stepProps} />}
        </div>

        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}

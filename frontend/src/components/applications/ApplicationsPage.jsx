import { useState } from 'react';
import {
  APPLICATION_STATUSES,
  useApplications,
} from '../../hooks/useApplications.js';
import LoadingSpinner from '../shared/LoadingSpinner.jsx';
import styles from '../../styles/ApplicationsPage.module.css';

const EMPTY_FORM = {
  companyName: '',
  positionTitle: '',
  status: APPLICATION_STATUSES[0],
};

export default function ApplicationsPage() {
  const {
    applications,
    loading,
    addApplication,
    updateApplication,
    deleteApplication,
  } = useApplications();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function startNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  }

  function startEdit(application) {
    setEditingId(application.id);
    setForm({
      companyName: application.companyName || '',
      positionTitle: application.positionTitle || '',
      status: application.status || APPLICATION_STATUSES[0],
    });
    setError('');
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  async function handleSave() {
    if (!form.companyName.trim()) {
      setError('Company name is required.');
      return;
    }
    if (!form.positionTitle.trim()) {
      setError('Position or title is required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateApplication(editingId, {
          companyName: form.companyName.trim(),
          positionTitle: form.positionTitle.trim(),
          status: form.status,
        });
      } else {
        await addApplication(form);
      }
      cancelForm();
    } catch {
      setError('Failed to save application. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(applicationId, status) {
    await updateApplication(applicationId, { status });
  }

  async function handleDelete(applicationId) {
    if (!window.confirm('Delete this application?')) return;
    await deleteApplication(applicationId);
    if (editingId === applicationId) cancelForm();
  }

  if (loading) return <div className={styles.page}><LoadingSpinner /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Applications</h1>
          <p className={styles.subtitle}>Track roles you are pursuing and keep each status current.</p>
        </div>
        <button className="btn-primary" onClick={startNew} aria-label="Add application">
          <span className={styles.plusIcon}>+</span>
          Add application
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>{editingId ? 'Edit application' : 'New application'}</h2>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Company Name</label>
              <input
                className={styles.input}
                value={form.companyName}
                onChange={(event) => setForm((current) => ({
                  ...current,
                  companyName: event.target.value,
                }))}
                placeholder="e.g. Deloitte"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Position/Title</label>
              <input
                className={styles.input}
                value={form.positionTitle}
                onChange={(event) => setForm((current) => ({
                  ...current,
                  positionTitle: event.target.value,
                }))}
                placeholder="e.g. Strategy Analyst Intern"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <select
                className={styles.select}
                value={form.status}
                onChange={(event) => setForm((current) => ({
                  ...current,
                  status: event.target.value,
                }))}
              >
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formActions}>
            <button className="btn-ghost" onClick={cancelForm}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save application'}
            </button>
          </div>
        </div>
      )}

      <div className={styles.sheet}>
        <div className={styles.tableHeader}>
          <span>Company Name</span>
          <span>Position/Title</span>
          <span>Status</span>
          <span className={styles.actionsHeader}>Actions</span>
        </div>

        {applications.length === 0 ? (
          <div className={styles.empty}>Get an application out there!</div>
        ) : (
          <div className={styles.rows}>
            {applications.map((application) => (
              <div key={application.id} className={styles.row}>
                <span className={styles.cellText}>{application.companyName}</span>
                <span className={styles.cellText}>{application.positionTitle}</span>
                <select
                  className={styles.statusSelect}
                  value={application.status || APPLICATION_STATUSES[0]}
                  onChange={(event) => handleStatusChange(application.id, event.target.value)}
                  aria-label={`Status for ${application.companyName}`}
                >
                  {APPLICATION_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <div className={styles.rowActions}>
                  <button className="btn-ghost" onClick={() => startEdit(application)}>Edit</button>
                  <button
                    className={`btn-ghost ${styles.deleteBtn}`}
                    onClick={() => handleDelete(application.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

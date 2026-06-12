import { useState } from 'react';
import { useEmailTemplates } from '../../hooks/useEmailTemplates.js';
import LoadingSpinner from '../shared/LoadingSpinner.jsx';
import styles from '../../styles/EmailTemplatesPage.module.css';

const EMPTY_FORM = { title: '', subject: '', body: '' };

export default function EmailTemplatesPage() {
  const { templates, loading, addTemplate, updateTemplate, deleteTemplate } = useEmailTemplates();
  const [editingId, setEditingId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function startNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowNew(true);
  }

  function startEdit(tpl) {
    setShowNew(false);
    setEditingId(tpl.id);
    setForm({ title: tpl.title, subject: tpl.subject, body: tpl.body });
    setError('');
  }

  function cancelForm() {
    setShowNew(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.body.trim()) { setError('Body is required.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateTemplate(editingId, form);
      } else {
        await addTemplate(form);
      }
      cancelForm();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this template?')) return;
    await deleteTemplate(id);
    if (editingId === id) cancelForm();
  }

  if (loading) return <div className={styles.page}><LoadingSpinner /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Email Templates</h1>
          <p className={styles.subtitle}>Reusable drafts with auto-filled placeholders</p>
        </div>
        <button className="btn-primary" onClick={startNew}>+ New template</button>
      </div>

      <div className={styles.placeholderNote}>
        Use <code>{'{{firstName}}'}</code>, <code>{'{{lastName}}'}</code>, <code>{'{{company}}'}</code>, <code>{'{{position}}'}</code> — they are replaced automatically when you compose an email.
      </div>

      {(showNew || editingId) && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>{editingId ? 'Edit template' : 'New template'}</h2>

          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <input
              className={styles.input}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Coffee chat request"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Subject line</label>
            <input
              className={styles.input}
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="e.g. Coffee chat — {{firstName}}?"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Body</label>
            <textarea
              className={styles.textarea}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder={`Hi {{firstName}},\n\nI came across your profile and would love to learn more about your experience at {{company}}…`}
              rows={10}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formActions}>
            <button className="btn-ghost" onClick={cancelForm}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save template'}
            </button>
          </div>
        </div>
      )}

      {templates.length === 0 && !showNew ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>✉</span>
          <p>No templates yet. Create one to speed up your outreach.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {templates.map((tpl) => (
            <div key={tpl.id} className={`${styles.templateCard} ${editingId === tpl.id ? styles.editing : ''}`}>
              <div className={styles.templateInfo}>
                <span className={styles.templateTitle}>{tpl.title}</span>
                {tpl.subject && <span className={styles.templateSubject}>{tpl.subject}</span>}
                <p className={styles.templatePreview}>{tpl.body?.slice(0, 120)}{tpl.body?.length > 120 ? '…' : ''}</p>
              </div>
              <div className={styles.templateActions}>
                <button className="btn-ghost" onClick={() => startEdit(tpl)}>Edit</button>
                <button className={`btn-ghost ${styles.deleteBtn}`} onClick={() => handleDelete(tpl.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

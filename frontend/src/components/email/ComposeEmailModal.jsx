import { useState, useEffect } from 'react';
import { useEmailTemplates } from '../../hooks/useEmailTemplates.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { AiService } from '../../services/serviceFactory.js';
import styles from '../../styles/ComposeEmailModal.module.css';

function fillPlaceholders(text, connection) {
  return (text || '')
    .replace(/{{firstName}}/g, connection.firstName || '')
    .replace(/{{lastName}}/g, connection.lastName || '')
    .replace(/{{company}}/g, connection.company || '')
    .replace(/{{position}}/g, connection.position || '');
}

export default function ComposeEmailModal({ connection, onClose, onEmailAction }) {
  const { user, profile } = useAuth();
  const { templates, loading } = useEmailTemplates();
  const [selectedId, setSelectedId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiInstructions, setAiInstructions] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const name = `${connection.firstName} ${connection.lastName}`;

  useEffect(() => {
    if (selectedId === '') { setSubject(''); setBody(''); return; }
    const tpl = templates.find((t) => t.id === selectedId);
    if (tpl) {
      setSubject(fillPlaceholders(tpl.subject, connection));
      setBody(fillPlaceholders(tpl.body, connection));
    }
  }, [selectedId, templates]);

  function handleOpenInGmail() {
    const to = connection.email || '';
    const url = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
    onEmailAction?.(connection.id);
  }

  async function handleCopy() {
    const text = `Subject: ${subject}\n\n${body}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onEmailAction?.(connection.id);
  }

  async function handleAiDraft() {
    setAiLoading(true);
    setAiError('');
    try {
      const firebaseIdToken = await user.getIdToken();
      const draft = await AiService.draftEmail({
        connection,
        userProfile: profile,
        instructions: aiInstructions.trim(),
        firebaseIdToken,
      });
      setSubject(draft.subject || '');
      setBody(draft.body || '');
      setSelectedId('');
      setAiOpen(false);
      setAiInstructions('');
    } catch {
      setAiError('Failed to generate draft. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        <div className={styles.header}>
          <h2>Email {name}</h2>
          {connection.email
            ? <p>{connection.email}</p>
            : <p className={styles.noEmail}>No email on file — compose and copy to send manually.</p>
          }
        </div>

        <div className={styles.templateRow}>
          <label className={styles.label}>Template</label>
          <select
            className={styles.select}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={loading}
          >
            <option value="">— Write from scratch —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>

        {/* AI drafting section */}
        <div className={styles.aiSection}>
          <button
            className={styles.aiToggle}
            onClick={() => setAiOpen((o) => !o)}
            type="button"
          >
            <span className={styles.aiIcon}>✦</span>
            Draft with AI
            <span className={styles.aiChevron}>{aiOpen ? '▲' : '▼'}</span>
          </button>

          {aiOpen && (
            <div className={styles.aiBody}>
              <textarea
                className={styles.aiInput}
                value={aiInstructions}
                onChange={(e) => setAiInstructions(e.target.value)}
                placeholder={`Optional: describe what you want (e.g. "focus on their consulting work, mention I'm a rising junior interested in strategy")`}
                rows={3}
              />
              {aiError && <p className={styles.aiError}>{aiError}</p>}
              <button
                className="btn-primary"
                onClick={handleAiDraft}
                disabled={aiLoading}
              >
                {aiLoading ? 'Generating…' : 'Generate draft'}
              </button>
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Subject</label>
          <input
            className={styles.input}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject line…"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Body</label>
          <textarea
            className={styles.textarea}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message…"
            rows={10}
          />
          <p className={styles.hint}>
            Placeholders: <code>{'{{firstName}}'}</code> <code>{'{{lastName}}'}</code> <code>{'{{company}}'}</code> <code>{'{{position}}'}</code>
          </p>
        </div>

        <div className={styles.actions}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-secondary" onClick={handleCopy} disabled={!body && !subject}>
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </button>
          {connection.email && (
            <button className="btn-primary" onClick={handleOpenInGmail} disabled={!subject && !body}>
              Open in Gmail ↗
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnections } from '../../hooks/useConnections.js';
import { ConnectionsImporter } from '../../services/serviceFactory.js';
import styles from '../../styles/ImportFlow.module.css';

const STATE = { IDLE: 'idle', PARSING: 'parsing', PREVIEW: 'preview', SAVING: 'saving', DONE: 'done', ERROR: 'error' };

export default function ImportFlow() {
  const { connections: existing, importConnections } = useConnections();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [state, setState] = useState(STATE.IDLE);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleFile(file) {
    if (!file) return;
    setState(STATE.PARSING);
    try {
      const parsed = await ConnectionsImporter.parseFile(file, existing);
      setPreview(parsed);
      setState(STATE.PREVIEW);
    } catch (err) {
      setErrorMsg(err.message || 'Could not parse the file. Make sure it is a LinkedIn Connections.csv export.');
      setState(STATE.ERROR);
    }
  }

  async function handleMockImport() {
    setState(STATE.PARSING);
    try {
      const parsed = await ConnectionsImporter.import();
      setPreview(parsed);
      setState(STATE.PREVIEW);
    } catch (err) {
      setErrorMsg(err.message || 'Import failed.');
      setState(STATE.ERROR);
    }
  }

  async function confirmImport() {
    if (!preview) return;
    setState(STATE.SAVING);
    try {
      const res = await importConnections(preview.connections);
      setResult(res || { added: preview.connections.length, duplicates: preview.duplicates || 0 });
      setState(STATE.DONE);
    } catch (err) {
      setErrorMsg('Failed to save connections. Please try again.');
      setState(STATE.ERROR);
    }
  }

  function reset() {
    setState(STATE.IDLE);
    setPreview(null);
    setResult(null);
    setErrorMsg('');
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const isMock = import.meta.env.VITE_USE_MOCKS !== 'false';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Import your network</h1>
          <p className={styles.subtitle}>
            Export your connections from LinkedIn and upload the CSV here.
            Your data never leaves your account.
          </p>
        </div>

        {state === STATE.IDLE && (
          <>
            <div
              className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={styles.dropIcon}>📂</div>
              <p className={styles.dropText}>
                Drop your <strong>Connections.csv</strong> here or <span className={styles.dropLink}>click to browse</span>
              </p>
              <p className={styles.dropHint}>
                Export from LinkedIn: Me → Settings & Privacy → Data privacy → Get a copy of your data
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className={styles.fileInput}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>

            {isMock && (
              <div className={styles.mockSection}>
                <div className={styles.divider}><span>or</span></div>
                <button className="btn-secondary" onClick={handleMockImport} style={{ width: '100%' }}>
                  Load 25 sample connections (demo)
                </button>
              </div>
            )}
          </>
        )}

        {state === STATE.PARSING && (
          <div className={styles.status}>
            <div className={styles.spinner} />
            <p>Parsing your connections…</p>
          </div>
        )}

        {state === STATE.PREVIEW && preview && (
          <div className={styles.preview}>
            <div className={styles.previewStat}>
              <span className={styles.statNumber}>{preview.total}</span>
              <span className={styles.statLabel}>connections found</span>
            </div>
            {preview.duplicates > 0 && (
              <p className={styles.dupeNote}>
                {preview.duplicates} duplicate{preview.duplicates > 1 ? 's' : ''} will be skipped.
              </p>
            )}
            <div className={styles.previewSample}>
              <p className={styles.sampleLabel}>Preview (first 5):</p>
              <ul className={styles.sampleList}>
                {preview.connections.slice(0, 5).map((c, i) => (
                  <li key={i} className={styles.sampleItem}>
                    <strong>{c.firstName} {c.lastName}</strong>
                    {c.position && ` · ${c.position}`}
                    {c.company && ` @ ${c.company}`}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.previewActions}>
              <button className="btn-ghost" onClick={reset}>Cancel</button>
              <button className="btn-primary" onClick={confirmImport}>
                Import {preview.connections.length - (preview.duplicates || 0)} connections
              </button>
            </div>
          </div>
        )}

        {state === STATE.SAVING && (
          <div className={styles.status}>
            <div className={styles.spinner} />
            <p>Saving to your network…</p>
          </div>
        )}

        {state === STATE.DONE && result && (
          <div className={styles.done}>
            <div className={styles.doneIcon}>✓</div>
            <h2>Import complete!</h2>
            <p>
              Added <strong>{result.added}</strong> new connection{result.added !== 1 ? 's' : ''}.
              {result.duplicates > 0 && ` ${result.duplicates} duplicate${result.duplicates > 1 ? 's' : ''} skipped.`}
            </p>
            <div className={styles.doneActions}>
              <button className="btn-secondary" onClick={reset}>Import more</button>
              <button className="btn-primary" onClick={() => navigate('/dashboard')}>
                View today's queue →
              </button>
            </div>
          </div>
        )}

        {state === STATE.ERROR && (
          <div className={styles.error}>
            <p className={styles.errorText}>{errorMsg}</p>
            <button className="btn-secondary" onClick={reset}>Try again</button>
          </div>
        )}
      </div>

      {state === STATE.IDLE && (
        <div className={styles.instructions}>
          <h3>How to export from LinkedIn</h3>
          <ol className={styles.steps}>
            <li>Go to <strong>linkedin.com</strong> and click your profile photo → Settings & Privacy</li>
            <li>Under <strong>Data privacy</strong>, click "Get a copy of your data"</li>
            <li>Select <strong>Connections</strong> only and request the archive</li>
            <li>LinkedIn emails you a download link — open it and save <code>Connections.csv</code></li>
            <li>Upload that file above</li>
          </ol>
        </div>
      )}
    </div>
  );
}

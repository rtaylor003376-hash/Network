import styles from '../../styles/ReplyAlert.module.css';

export default function ReplyAlert({ alerts, onMarkReplied, onDismiss }) {
  if (!alerts.length) return null;

  return (
    <div className={styles.container}>
      {alerts.map((alert) => (
        <div key={alert.connectionId} className={styles.alert}>
          <span className={styles.icon}>📬</span>
          <div className={styles.body}>
            <strong className={styles.name}>{alert.connectionName}</strong>
            <span className={styles.message}> replied to your email!</span>
          </div>
          <button
            className={styles.matchBtn}
            onClick={() => onMarkReplied(alert.connectionId)}
          >
            Mark as Matched →
          </button>
          <button
            className={styles.dismissBtn}
            onClick={() => onDismiss(alert.connectionId)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

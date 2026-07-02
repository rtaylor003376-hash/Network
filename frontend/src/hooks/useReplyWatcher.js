import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false';
const MOCK_REPLY_DELAY_MS = 30_000; // 30 seconds for local testing
const POLL_INTERVAL_MS = 60_000;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Module-level store so alerts persist across component re-mounts.
const replyStore = {
  alerts: [],
  timerIds: {}, // connectionId → timeoutId
  listeners: new Set(),
  set(next) {
    this.alerts = next;
    this.listeners.forEach((fn) => fn(next));
  },
  add(alert) {
    if (this.alerts.find((a) => a.connectionId === alert.connectionId)) return;
    this.set([...this.alerts, alert]);
  },
  remove(connectionId) {
    this.set(this.alerts.filter((a) => a.connectionId !== connectionId));
  },
};

export function useReplyWatcher(connections) {
  const [alerts, setAlerts] = useState(replyStore.alerts);
  const { googleAccessToken, user } = useAuth();

  useEffect(() => {
    const fn = (a) => setAlerts([...a]);
    replyStore.listeners.add(fn);
    return () => replyStore.listeners.delete(fn);
  }, []);

  // Mock mode: simulate a reply after MOCK_REPLY_DELAY_MS for each queued connection.
  useEffect(() => {
    if (!useMocks) return;

    const queuedIds = new Set(
      connections.filter((c) => c.status === 'queued').map((c) => c.id)
    );

    // Cancel timers for connections no longer queued.
    for (const [id, timerId] of Object.entries(replyStore.timerIds)) {
      if (!queuedIds.has(id)) {
        clearTimeout(timerId);
        delete replyStore.timerIds[id];
      }
    }

    // Start a timer for each newly-queued connection that doesn't have one yet.
    for (const c of connections) {
      if (c.status !== 'queued') continue;
      if (replyStore.timerIds[c.id]) continue;
      if (replyStore.alerts.find((a) => a.connectionId === c.id)) continue;

      replyStore.timerIds[c.id] = setTimeout(() => {
        replyStore.add({
          connectionId: c.id,
          connectionName: `${c.firstName} ${c.lastName}`,
          email: c.email,
        });
        delete replyStore.timerIds[c.id];
      }, MOCK_REPLY_DELAY_MS);
    }
  }, [connections]);

  // Real mode: poll /api/gmail/check-replies every minute.
  useEffect(() => {
    if (useMocks || !googleAccessToken || !user) return;

    async function checkReplies() {
      const queued = connections.filter(
        (c) => c.status === 'queued' && c.email && c.lastInteractionAt
      );
      if (!queued.length) return;

      try {
        const idToken = await user.getIdToken();
        const res = await fetch(`${BACKEND_URL}/api/gmail/check-replies`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${idToken}`,
            'x-google-access-token': googleAccessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            connections: queued.map((c) => ({
              id: c.id,
              email: c.email,
              since: c.lastInteractionAt,
              name: `${c.firstName} ${c.lastName}`,
            })),
          }),
        });
        if (!res.ok) return;
        const { replies } = await res.json();
        for (const r of replies) replyStore.add(r);
      } catch {
        // Silently swallow polling errors — non-critical background check.
      }
    }

    checkReplies();
    const interval = setInterval(checkReplies, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [connections, googleAccessToken, user]);

  function dismissAlert(connectionId) {
    replyStore.remove(connectionId);
  }

  return { alerts, dismissAlert };
}

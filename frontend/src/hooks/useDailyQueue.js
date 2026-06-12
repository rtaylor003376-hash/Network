import { useMemo, useEffect } from 'react';
import { buildDailyQueue } from '../services/ranking/rankConnections.js';
import { useConnections } from './useConnections.js';
import { useAuth } from '../context/AuthContext.jsx';

export function useDailyQueue() {
  const { profile } = useAuth();
  const { connections, loading, markShownToday } = useConnections();

  const queue = useMemo(() => {
    if (!profile || !connections.length) return [];
    return buildDailyQueue(connections, profile);
  }, [connections, profile]);

  // Mark surfaced connections as shown when the queue is first computed.
  useEffect(() => {
    if (queue.length === 0) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const toMark = queue.filter((c) => c.shownOn !== todayStr).map((c) => c.id);
    if (toMark.length > 0) markShownToday(toMark);
  }, [queue.map((c) => c.id).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return { queue, loading };
}

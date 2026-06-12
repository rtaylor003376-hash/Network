import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db, connectionsRef, connectionDocRef } from '../firebase/firestore.js';
import { useAuth } from '../context/AuthContext.jsx';

export function useConnections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setConnections([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(connectionsRef(user.uid), (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setConnections(docs);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  async function importConnections(newConnections) {
    if (!user) return;
    const batch = writeBatch(db);
    const ref = connectionsRef(user.uid);
    const existingIds = new Set(connections.map((c) => c.linkedinUrl).filter(Boolean));
    let added = 0;
    let duplicates = 0;

    for (const conn of newConnections) {
      if (conn.linkedinUrl && existingIds.has(conn.linkedinUrl)) {
        duplicates++;
        continue;
      }
      const newRef = doc(ref);
      batch.set(newRef, { ...conn, createdAt: serverTimestamp() });
      added++;
    }
    await batch.commit();
    return { added, duplicates };
  }

  async function updateConnection(connId, updates) {
    if (!user) return;
    await updateDoc(connectionDocRef(user.uid, connId), updates);
  }

  async function dismissConnection(connId) {
    await updateConnection(connId, { dismissed: true });
  }

  async function snoozeConnection(connId, days = 7) {
    const snoozedUntil = new Date();
    snoozedUntil.setDate(snoozedUntil.getDate() + days);
    await updateConnection(connId, { snoozedUntil: snoozedUntil.toISOString() });
  }

  async function markShownToday(connIds) {
    if (!user || !connIds.length) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const batch = writeBatch(db);
    for (const id of connIds) {
      batch.update(connectionDocRef(user.uid, id), { shownOn: todayStr, status: 'queued' });
    }
    await batch.commit();
  }

  return { connections, loading, importConnections, updateConnection, dismissConnection, snoozeConnection, markShownToday };
}

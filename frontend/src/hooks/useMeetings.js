import { useState, useEffect } from 'react';
import { onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { meetingsRef } from '../firebase/firestore.js';
import { useAuth } from '../context/AuthContext.jsx';

const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false';

// Shared in-memory store so all useMeetings() instances stay in sync in mock mode.
const mockStore = {
  meetings: [],
  listeners: new Set(),
  set(meetings) {
    this.meetings = meetings;
    this.listeners.forEach((fn) => fn(meetings));
  },
  add(meeting) {
    const updated = [...this.meetings, meeting].sort(
      (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)
    );
    this.set(updated);
  },
};

export function useMeetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState(useMocks ? mockStore.meetings : []);
  const [loading, setLoading] = useState(!useMocks);

  useEffect(() => {
    if (useMocks) {
      // Subscribe to the shared mock store.
      setMeetings([...mockStore.meetings]);
      mockStore.listeners.add(setMeetings);
      return () => mockStore.listeners.delete(setMeetings);
    }
    if (!user) {
      setMeetings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(meetingsRef(user.uid), (snap) => {
      const docs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
      setMeetings(docs);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  async function addMeeting(meetingData) {
    if (useMocks) {
      const newMeeting = {
        id: `mock_meeting_${Date.now()}`,
        ...meetingData,
        createdAt: new Date().toISOString(),
      };
      mockStore.add(newMeeting);
      return newMeeting.id;
    }
    if (!user) return;
    const ref = await addDoc(meetingsRef(user.uid), {
      ...meetingData,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }

  return { meetings, loading, addMeeting };
}

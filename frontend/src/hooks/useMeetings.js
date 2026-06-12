import { useState, useEffect } from 'react';
import { onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { meetingsRef } from '../firebase/firestore.js';
import { useAuth } from '../context/AuthContext.jsx';

export function useMeetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    if (!user) return;
    const ref = await addDoc(meetingsRef(user.uid), {
      ...meetingData,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }

  return { meetings, loading, addMeeting };
}

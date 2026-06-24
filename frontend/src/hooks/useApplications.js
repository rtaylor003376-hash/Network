import { useEffect, useState } from 'react';
import {
  addDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.jsx';
import { applicationDocRef, applicationsRef } from '../firebase/firestore.js';

export const APPLICATION_STATUSES = [
  'Not applied yet',
  'Applied',
  'Interview',
  'Offer',
  'No offer',
];

export function useApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setApplications([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const q = query(applicationsRef(user.uid), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setApplications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsub;
  }, [user]);

  async function addApplication({ companyName, positionTitle, status }) {
    if (!user) return;
    await addDoc(applicationsRef(user.uid), {
      companyName: companyName.trim(),
      positionTitle: positionTitle.trim(),
      status: status || APPLICATION_STATUSES[0],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async function updateApplication(applicationId, updates) {
    if (!user) return;
    await updateDoc(applicationDocRef(user.uid, applicationId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  async function deleteApplication(applicationId) {
    if (!user) return;
    await deleteDoc(applicationDocRef(user.uid, applicationId));
  }

  return {
    applications,
    loading,
    addApplication,
    updateApplication,
    deleteApplication,
  };
}

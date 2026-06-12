import { useState, useEffect } from 'react';
import { onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.jsx';
import { emailTemplatesRef, emailTemplateDocRef } from '../firebase/firestore.js';

export function useEmailTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(emailTemplatesRef(user.uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setTemplates(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  async function addTemplate({ title, subject, body }) {
    await addDoc(emailTemplatesRef(user.uid), {
      title, subject, body,
      createdAt: serverTimestamp(),
    });
  }

  async function updateTemplate(templateId, { title, subject, body }) {
    await updateDoc(emailTemplateDocRef(user.uid, templateId), { title, subject, body });
  }

  async function deleteTemplate(templateId) {
    await deleteDoc(emailTemplateDocRef(user.uid, templateId));
  }

  return { templates, loading, addTemplate, updateTemplate, deleteTemplate };
}

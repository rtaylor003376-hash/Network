import { getFirestore, collection, doc } from 'firebase/firestore';
import { app } from './config.js';

export const db = getFirestore(app);

// Typed collection helpers — keep all path strings here, never scattered in components.
export const userDocRef = (uid) => doc(db, 'users', uid);
export const connectionsRef = (uid) => collection(db, 'users', uid, 'connections');
export const connectionDocRef = (uid, connId) => doc(db, 'users', uid, 'connections', connId);
export const meetingsRef = (uid) => collection(db, 'users', uid, 'meetings');
export const meetingDocRef = (uid, meetingId) => doc(db, 'users', uid, 'meetings', meetingId);
export const emailTemplatesRef = (uid) => collection(db, 'users', uid, 'emailTemplates');
export const emailTemplateDocRef = (uid, templateId) => doc(db, 'users', uid, 'emailTemplates', templateId);

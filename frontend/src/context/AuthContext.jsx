import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../firebase/config.js';
import { db, userDocRef } from '../firebase/firestore.js';

const auth = getAuth(app);
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [googleAccessToken, setGoogleAccessToken] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Load profile — create stub if first sign-in.
        const ref = userDocRef(firebaseUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          const stub = {
            displayName: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            major: '',
            gradYear: '',
            desiredCareers: [],
            targetCompanies: [],
            desiredLocations: [],
            dailyQueueSize: 3,
            onboardingComplete: false,
            createdAt: serverTimestamp(),
          };
          await setDoc(ref, stub);
          setProfile(stub);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar.events');
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    setGoogleAccessToken(credential?.accessToken || null);
  }

  async function signOutUser() {
    await signOut(auth);
    setGoogleAccessToken(null);
  }

  async function refreshProfile() {
    if (!user) return;
    const snap = await getDoc(userDocRef(user.uid));
    if (snap.exists()) setProfile(snap.data());
  }

  return (
    <AuthContext.Provider value={{ user, profile, authLoading, googleAccessToken, signInWithGoogle, signOutUser, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

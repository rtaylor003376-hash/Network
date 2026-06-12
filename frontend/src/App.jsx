import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoginScreen from './components/auth/LoginScreen.jsx';
import OnboardingWizard from './components/onboarding/OnboardingWizard.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import ConnectionsTab from './components/connections/ConnectionsTab.jsx';
import ImportFlow from './components/import/ImportFlow.jsx';
import EmailTemplatesPage from './components/email/EmailTemplatesPage.jsx';
import NavBar from './components/shared/NavBar.jsx';
import ChatPanel from './components/chat/ChatPanel.jsx';
import LoadingSpinner from './components/shared/LoadingSpinner.jsx';
import styles from './styles/App.module.css';

function AuthGate({ children }) {
  const { user, profile, authLoading } = useAuth();
  if (authLoading) return <LoadingSpinner fullPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (user && profile && !profile.onboardingComplete) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  const { user, profile, authLoading } = useAuth();

  if (authLoading) return <LoadingSpinner fullPage />;

  return (
    <div className={styles.appShell}>
      {user && profile?.onboardingComplete && <NavBar />}
      <ChatPanel />
      <main className={styles.mainContent}>
        <Routes>
          <Route
            path="/login"
            element={!user ? <LoginScreen /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/onboarding"
            element={
              user && profile && !profile.onboardingComplete
                ? <OnboardingWizard />
                : <Navigate to={user ? '/dashboard' : '/login'} replace />
            }
          />
          <Route
            path="/dashboard"
            element={<AuthGate><Dashboard /></AuthGate>}
          />
          <Route
            path="/connections"
            element={<AuthGate><ConnectionsTab /></AuthGate>}
          />
          <Route
            path="/import"
            element={<AuthGate><ImportFlow /></AuthGate>}
          />
          <Route
            path="/templates"
            element={<AuthGate><EmailTemplatesPage /></AuthGate>}
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from '../../styles/NavBar.module.css';

export default function NavBar() {
  const { user, profile, signOutUser } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOutUser();
    navigate('/login');
  }

  const initials = (profile?.displayName || user?.displayName || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <NavLink to="/dashboard" className={styles.logo}>
          <span className={styles.logoMark}>N</span>
          <span className={styles.logoText}>Netspand</span>
        </NavLink>

        <nav className={styles.links}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            Today
          </NavLink>
          <NavLink
            to="/connections"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            Network
          </NavLink>
          <NavLink
            to="/grow"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            Grow
          </NavLink>
          <NavLink
            to="/applications"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            Applications
          </NavLink>
          <NavLink
            to="/resources"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            Resources
          </NavLink>
          <NavLink
            to="/import"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            Import
          </NavLink>
          <NavLink
            to="/templates"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            Templates
          </NavLink>
        </nav>

        <div className={styles.userArea}>
          <div className={styles.avatar} title={profile?.displayName || user?.email || ''}>
            {initials}
          </div>
          <button className={`btn-ghost ${styles.signOut}`} onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

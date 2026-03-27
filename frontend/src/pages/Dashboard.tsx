import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Footer } from '../components/Footer';
import '../styles/Dashboard.css';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    navigate('/exams/categories');
  };

  const handleAdminDashboard = () => {
    navigate('/admin');
  };

  // Close menu when clicking outside
  const handleMenuBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!menuRef.current?.contains(e.relatedTarget as Node)) {
      setMenuOpen(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="app-title">Exam Prep</h1>
          <div className="header-actions">
            {user?.role === 'admin' && (
              <button className="btn-admin" onClick={handleAdminDashboard}>
                Admin Dashboard
              </button>
            )}

            {/* ── Avatar dropdown ── */}
            <div className="avatar-menu-wrap" ref={menuRef} onBlur={handleMenuBlur} tabIndex={-1}>
              <button
                className="avatar-btn"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Open user menu"
                aria-expanded={menuOpen}
              >
                {(user as { avatar?: string } & typeof user)?.avatar ? (
                  <img
                    src={(user as { avatar?: string } & typeof user).avatar}
                    alt="Avatar"
                    className="avatar-img"
                  />
                ) : (
                  <span className="avatar-initials">
                    {getInitials(user?.name || '?')}
                  </span>
                )}
                <span className="avatar-caret">{menuOpen ? '▲' : '▼'}</span>
              </button>

              {menuOpen && (
                <div className="avatar-dropdown">
                  <div className="avatar-dropdown-header">
                    <p className="avatar-dropdown-name">{user?.name}</p>
                    <p className="avatar-dropdown-email">{user?.email}</p>
                  </div>
                  <button
                    className="avatar-menu-item"
                    onMouseDown={() => { setMenuOpen(false); navigate('/profile'); }}
                  >
                    👤 My Profile
                  </button>
                  <button
                    className="avatar-menu-item"
                    onMouseDown={() => { setMenuOpen(false); navigate('/profile?tab=settings'); }}
                  >
                    ⚙️ Settings
                  </button>
                  <div className="avatar-dropdown-divider" />
                  <button
                    className="avatar-menu-item danger"
                    onMouseDown={() => { setMenuOpen(false); logout(); }}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>

            <button className="btn-logout" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">Welcome to Exam Prep, {user?.name}! 🎓</h1>
            <p className="welcome-subtitle">
              Practice exam questions online and track your progress. Choose from various categories
              and improve your skills with instant feedback.
            </p>
            <button className="btn-get-started" onClick={handleGetStarted}>
              Get Started
            </button>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Multiple Categories</h3>
              <p>Access exams across Science, Humanities, and more</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏱️</div>
              <h3>Timed Practice</h3>
              <p>Simulate real exam conditions with time limits</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>Instant Feedback</h3>
              <p>Get immediate results with detailed explanations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Track Progress</h3>
              <p>Monitor your improvement over time</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

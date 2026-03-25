/**
 * Home Page Component
 *
 * Landing page for the Exam Prep application. Displays different content
 * based on authentication status:
 * - Authenticated users see navigation links (Dashboard, Browse Exams,
 *   Admin Panel for admins) and a logout button.
 * - Unauthenticated users see login and register links.
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export function Home() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Exam Prep</h1>

        {/* Navigation bar — adapts based on whether the user is logged in */}
        <nav>
          {isAuthenticated ? (
            <>
              <span className="user-name">Hello, {user?.name}</span>
              <Link to="/dashboard" className="btn-nav">Dashboard</Link>
              <Link to="/exams/categories" className="btn-nav">Browse Exams</Link>

              {/* Only show Admin Panel link for users with the admin role */}
              {user?.role === 'admin' && (
                <Link to="/admin" className="btn-nav">Admin Panel</Link>
              )}
              <button type="button" onClick={logout} className="btn-logout">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      {/* Main content area — CTA buttons for logged-in users, or auth prompts for guests */}
      <main className="home-main">
        {isAuthenticated ? (
          <div>
            <p>Welcome back, {user?.name}! Ready to practice?</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/dashboard" style={{ padding: '0.75rem 1.5rem', background: '#667eea', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
                Go to Dashboard
              </Link>
              <Link to="/exams/categories" style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
                Browse Exam Categories
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p>Log in or register to practice exams and track your progress.</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <Link to="/login" style={{ padding: '0.75rem 1.5rem', background: '#667eea', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
                Log in
              </Link>
              <Link to="/register" style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
                Register
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

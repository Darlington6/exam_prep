import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Exam Prep</h1>
        <nav>
          {isAuthenticated ? (
            <>
              <span className="user-name">Hello, {user?.name}</span>
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
      <main className="home-main">
        {isAuthenticated ? (
          <p>You’re logged in. Practice exams and more will be available here.</p>
        ) : (
          <p>Log in or register to practice exams and track your progress.</p>
        )}
      </main>
    </div>
  );
}

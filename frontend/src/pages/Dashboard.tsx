import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/exams/categories');
  };

  const handleAdminDashboard = () => {
    navigate('/admin');
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
    </div>
  );
}

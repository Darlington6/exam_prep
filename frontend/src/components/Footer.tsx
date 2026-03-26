import { Link } from 'react-router-dom';
import '../styles/Footer.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">Exam Prep</span>
          <p className="footer-tagline">Practice smarter, score higher.</p>
        </div>

        <nav className="footer-nav" aria-label="Footer navigation">
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/dashboard" className="footer-link">Dashboard</Link>
          <Link to="/exams/categories" className="footer-link">Browse Exams</Link>
          <Link to="/login" className="footer-link">Log in</Link>
          <Link to="/register" className="footer-link">Register</Link>
        </nav>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">© {year} Exam Prep. All rights reserved.</p>
      </div>
    </footer>
  );
}

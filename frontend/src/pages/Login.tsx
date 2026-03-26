/**
 * Login Page Component
 *
 * Provides a login form for existing users. On successful authentication,
 * redirects the user to the page they originally tried to visit (or home).
 * Displays user-friendly error messages for network issues and invalid credentials.
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export function Login() {
  // Form field state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target — defaults to '/' if no prior protected route triggered the login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  /**
   * Handle form submission: call the auth context login method,
   * then navigate on success or display an error message on failure.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      // Parse Axios error to provide a helpful message
      const ax = err as { code?: string; response?: { data?: { message?: string } } } | null;
      let msg = 'Login failed.';
      if (ax?.code === 'ERR_NETWORK' || !ax?.response) {
        msg = ax?.code === 'ECONNABORTED'
          ? 'Request timed out. Check that the backend is running.'
          : "Can't reach the backend. In exam-prep/backend run: npm run dev (server runs on port 5001).";
      } else if (ax.response?.data?.message) {
        msg = ax.response.data.message;
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Log in</h1>
        <p className="auth-subtitle">Exam Prep</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

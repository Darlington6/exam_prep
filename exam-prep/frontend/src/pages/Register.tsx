import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      let msg = 'Registration failed.';
      const ax = err as { code?: string; response?: { data?: { message?: string }; status?: number } } | null;
      if (ax?.code === 'ERR_NETWORK' || !ax?.response) {
        msg = "Can't reach the backend. In exam-prep/backend run: npm run dev (server runs on port 5001).";
      } else if (ax.response?.data?.message) {
        msg = String(ax.response.data.message);
      } else if (ax.response?.status === 409) {
        msg = 'Email already registered.';
      } else if (ax.response?.status && ax.response.status >= 400) {
        msg = `Registration failed (${ax.response.status}). Check the backend terminal for details.`;
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="auth-subtitle">Exam Prep</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Your name"
            />
          </label>
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
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { Footer } from '../components/Footer';

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
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
        msg = "Can't reach the backend. In backend directory run: npm run dev (server runs on port 5001).";
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
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-8">
        <h1 className="auth-title">Create account</h1>
        <p className="mb-6 text-sm text-[#888]">Exam Prep</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-white/80">
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Your name"
              className="w-full rounded-lg border border-white/20 bg-black/20 px-3.5 py-2.5 text-base placeholder:text-white/35 focus:border-[#646cff] focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-white/80">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/20 bg-black/20 px-3.5 py-2.5 text-base placeholder:text-white/35 focus:border-[#646cff] focus:outline-none"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-white/80">Password</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-white/20 bg-black/20 px-3.5 py-2.5 pr-11 text-base placeholder:text-white/35 focus:border-[#646cff] focus:outline-none"
              />
              <button
                type="button"
                className="auth-toggle absolute inset-y-0 right-0 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-white/80">Confirm Password</span>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Re-enter password"
                className="w-full rounded-lg border border-white/20 bg-black/20 px-3.5 py-2.5 pr-11 text-base placeholder:text-white/35 focus:border-[#646cff] focus:outline-none"
              />
              <button
                type="button"
                className="auth-toggle absolute inset-y-0 right-0 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="auth-submit mt-1 rounded-lg text-base font-medium transition-colors"
          >
            {submitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-5 text-sm text-[#888]">
          Already have an account?{' '}
          <Link to="/login">Log in</Link>
        </p>
      </div>
      </div>
      <Footer />
    </div>
  );
}

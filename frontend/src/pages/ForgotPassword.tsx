import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSubmitting(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      void response;
      setSuccess(true);
      setEmail('');
    } catch (err: unknown) {
      const ax = err as { code?: string; response?: { data?: { message?: string }; status?: number } } | null;
      let msg = "We couldn\u2019t send the reset email right now. Please try again in a few moments, or contact support if the issue persists.";

      if (ax?.code === 'ERR_NETWORK' || !ax?.response) {
        msg = "Unable to connect to the server. Please check your internet connection and try again.";
      } else if (ax?.code === 'ECONNABORTED') {
        msg = "The request timed out. Please check your connection and try again.";
      } else if (ax.response?.status === 500) {
        msg = "We're experiencing technical difficulties. Please try again in a few moments.";
      } else if (ax.response?.status === 400 && ax.response?.data?.message) {
        msg = ax.response.data.message;
      } else if (ax.response?.data?.message) {
        msg = ax.response.data.message;
      }
      
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-8">
        <h1 className="auth-title">Reset Password</h1>
        <p className="mb-6 text-sm text-[#888]">Exam Prep</p>

        {error && <div className="auth-error">{error}</div>}
        {success && (
          <div className="auth-success">
            If that email is registered, a password reset link has been sent. Please check your email (and spam folder).
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-white/80">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              disabled={success}
              className="w-full rounded-lg border border-white/20 bg-black/20 px-3.5 py-2.5 text-base placeholder:text-white/35 focus:border-[#646cff] focus:outline-none disabled:opacity-60"
            />
          </label>

          <button
            type="submit"
            disabled={submitting || success}
            className="auth-submit mt-1 rounded-lg text-base font-medium transition-colors"
          >
            {submitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-5 text-sm text-[#888]">
          Remember your password?{' '}
          <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

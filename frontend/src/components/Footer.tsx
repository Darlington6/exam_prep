import { Link } from 'react-router-dom';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900">
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pb-8 border-b border-slate-800">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <circle cx="4" cy="4" r="2" />
                  <circle cx="12" cy="4" r="2" />
                  <circle cx="4" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <span className="text-white font-semibold text-base">Exam Prep</span>
            </div>
            <p className="text-slate-400 text-sm">Practice smarter, score higher.</p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Platform</h3>
            <Link to="/exams/categories" className="text-sm text-slate-400 hover:text-white transition-colors block mb-2">Browse Exams</Link>
            <Link to="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors block mb-2">Dashboard</Link>
            <Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors block mb-2">Home</Link>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Account</h3>
            <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors block mb-2">Log in</Link>
            <Link to="/register" className="text-sm text-slate-400 hover:text-white transition-colors block mb-2">Register</Link>
          </div>
        </div>

        <div className="pt-6">
          <p className="text-xs text-slate-600 text-center">© {year} Exam Prep. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

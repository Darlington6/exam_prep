import { Link } from 'react-router-dom';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 pt-12 pb-6 px-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between flex-wrap gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <circle cx="4" cy="4" r="2" />
                  <circle cx="12" cy="4" r="2" />
                  <circle cx="4" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <span className="text-base font-bold text-slate-100">Exam Prep</span>
            </div>
            <p className="text-sm text-slate-500 max-w-[180px] leading-relaxed">Practice smarter, score higher.</p>
          </div>

          {/* Link columns */}
          <div className="flex gap-12 flex-wrap">

            {/* Platform */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3">Platform</p>
              <Link to="/exams/categories" className="block text-sm text-slate-400 hover:text-slate-100 mb-2 transition-colors">Browse Exams</Link>
              <Link to="/dashboard" className="block text-sm text-slate-400 hover:text-slate-100 mb-2 transition-colors">Dashboard</Link>
              <Link to="/" className="block text-sm text-slate-400 hover:text-slate-100 mb-2 transition-colors">Home</Link>
            </div>

            {/* Account */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3">Account</p>
              <Link to="/login" className="block text-sm text-slate-400 hover:text-slate-100 mb-2 transition-colors">Log in</Link>
              <Link to="/register" className="block text-sm text-slate-400 hover:text-slate-100 mb-2 transition-colors">Register</Link>
            </div>

            {/* Support */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3">Support</p>
              <a href="#help" className="block text-sm text-slate-400 hover:text-slate-100 mb-2 transition-colors cursor-pointer">Help Centre</a>
              <a href="#contact" className="block text-sm text-slate-400 hover:text-slate-100 mb-2 transition-colors cursor-pointer">Contact us</a>
              <a href="#privacy" className="block text-sm text-slate-400 hover:text-slate-100 mb-2 transition-colors cursor-pointer">Privacy Policy</a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-5 text-center">
          <p className="text-xs text-slate-600">© {year} Exam Prep. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

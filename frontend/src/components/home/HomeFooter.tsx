import { Link } from 'react-router-dom';

export function HomeFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-800 text-gray-400 pt-14 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Top row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pb-10 border-b border-slate-600">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <circle cx="4" cy="4" r="2" />
                  <circle cx="12" cy="4" r="2" />
                  <circle cx="4" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <span className="font-bold text-white text-base">Exam Prep</span>
            </div>
            <p className="text-sm text-gray-500">Practice smarter, score higher.</p>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-300 tracking-widest uppercase mb-4">
              Platform
            </h3>
            <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
              <li>
                <Link to="/exams/categories" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Browse Exams
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-300 tracking-widest uppercase mb-4">
              Support
            </h3>
            <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
              <li>
                <a href="#help" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Help Centre
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Contact us
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 text-center">
          <p className="text-sm text-gray-600">
            © {year} Exam Prep. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

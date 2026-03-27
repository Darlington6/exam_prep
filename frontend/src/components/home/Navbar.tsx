import { useState } from 'react';
import { Link } from 'react-router-dom';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <circle cx="4" cy="4" r="2" />
                <circle cx="12" cy="4" r="2" />
                <circle cx="4" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">Exam Prep</span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            <li>
              <Link
                to="/exams/categories"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Browse Exams
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
            </li>
          </ul>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-gray-700 font-medium text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-white text-navy-900 font-semibold text-sm px-4 py-2.5 rounded-lg border border-gray-200 text-blue-900 hover:bg-blue-900 hover:text-green-400 hover:border-blue-900 transition-all duration-200"
            >
              Get started free
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 flex flex-col gap-1">
            <Link
              to="/exams/categories"
              className="text-gray-700 font-medium text-sm px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Browse Exams
            </Link>
            <Link
              to="/dashboard"
              className="text-gray-700 font-medium text-sm px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
            <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-gray-100">
              <Link
                to="/login"
                className="text-center text-gray-700 font-medium text-sm px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-center bg-white text-blue-900 font-semibold text-sm px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-blue-900 hover:text-green-400 hover:border-blue-900 transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                Get started free
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

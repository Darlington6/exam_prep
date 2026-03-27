import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Footer } from '../components/Footer';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const features = [
  { icon: '📚', title: 'Multiple categories', desc: 'Access exams across Science, Humanities, Languages, and more.' },
  { icon: '⏱️', title: 'Timed practice', desc: 'Simulate real exam conditions with countdown timers.' },
  { icon: '✅', title: 'Instant feedback', desc: 'Get immediate results with detailed answer explanations.' },
  { icon: '📊', title: 'Track progress', desc: 'Monitor your improvement and weak areas over time.' },
];

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    navigate('/exams/categories');
  };

  const handleBrowse = () => {
    navigate('/exams/categories');
  };

  const handleAdminDashboard = () => {
    navigate('/admin');
  };

  // Close menu when clicking outside
  const handleMenuBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!menuRef.current?.contains(e.relatedTarget as Node)) {
      setMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-slate-200 px-10 h-16 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <circle cx="4" cy="4" r="2" />
              <circle cx="12" cy="4" r="2" />
              <circle cx="4" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <span className="text-base font-bold text-indigo-950 tracking-tight">Exam Prep</span>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <button
              onClick={handleAdminDashboard}
              className="text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-1.5 rounded-lg border-none cursor-pointer transition-colors"
            >
              Admin Dashboard
            </button>
          )}

          {/* ── Avatar dropdown ── */}
          <div className="relative" ref={menuRef} onBlur={handleMenuBlur} tabIndex={-1}>
            <button
              className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-600 cursor-pointer"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Open user menu"
              aria-expanded={menuOpen}
            >
              {(user as { avatar?: string } & typeof user)?.avatar ? (
                <img
                  src={(user as { avatar?: string } & typeof user).avatar}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                getInitials(user?.name || '?')
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <button
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onMouseDown={() => { setMenuOpen(false); navigate('/profile'); }}
                >
                  👤 My Profile
                </button>
                <button
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onMouseDown={() => { setMenuOpen(false); navigate('/profile?tab=settings'); }}
                >
                  ⚙️ Settings
                </button>
                <div className="border-t border-slate-100" />
                <button
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onMouseDown={() => { setMenuOpen(false); logout(); }}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="text-sm font-medium text-slate-500 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="bg-white pt-20 pb-20 px-10 text-center border-b border-slate-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,#EEF2FF,transparent)] pointer-events-none" />

          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            Trusted by 40,000+ students
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight max-w-2xl mx-auto mb-5">
            Welcome back, <span className="text-indigo-600">{user?.name}!</span>
          </h1>

          <p className="text-lg text-slate-500 max-w-lg mx-auto mb-10 leading-relaxed">
            Pick up where you left off or explore a new category.
            Your next exam is one click away.
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={handleGetStarted}
              className="text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-8 py-3.5 rounded-xl transition-colors"
            >
              Get Started
            </button>
            <button
              onClick={handleBrowse}
              className="text-base font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-7 py-3.5 rounded-xl transition-colors"
            >
              Browse Categories
            </button>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <section className="bg-slate-50 border-y border-slate-100 py-8 px-10">
          <div className="flex justify-center flex-wrap gap-0 max-w-3xl mx-auto">
            {[
              { num: '500+', label: 'Practice exams' },
              { num: '40k', label: 'Students' },
              { num: '94%', label: 'Pass rate' },
              { num: '12', label: 'Subject areas' },
            ].map((stat, i) => (
              <div key={i} className={`text-center px-12 ${i > 0 ? 'border-l border-slate-200' : ''}`}>
                <div className="text-3xl font-extrabold text-indigo-950 tracking-tight">{stat.num}</div>
                <div className="text-xs text-slate-400 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section className="bg-white py-20 px-10">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Why Exam Prep</p>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Everything you need to pass</h2>
            <p className="text-base text-slate-500 max-w-md mx-auto leading-relaxed">
              From timed mock exams to detailed answer explanations — built for students who want results.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-xl mb-4">
                  {feat.icon}
                </div>
                <div className="text-sm font-semibold text-slate-900 mb-1.5">{feat.title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="bg-slate-50 border-t border-slate-100 py-20 px-10">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 text-center mb-2">How it works</p>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight text-center mb-12">Start in three steps</h2>
          <div className="flex max-w-3xl mx-auto relative">
            {[
              { n: 1, title: 'Choose a category', desc: 'Browse subjects and pick the one you want to practise' },
              { n: 2, title: 'Take the exam', desc: 'Answer questions under timed conditions, just like the real thing' },
              { n: 3, title: 'Review results', desc: 'See correct answers, explanations, and your score breakdown' },
            ].map((step, i) => (
              <div key={step.n} className="flex-1 text-center px-5 relative">
                {i < 2 && <div className="absolute top-5 left-1/2 right-0 h-px bg-indigo-200" style={{ zIndex: 0 }} />}
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white text-base font-bold flex items-center justify-center mx-auto mb-4 relative" style={{ zIndex: 1 }}>
                  {step.n}
                </div>
                <div className="text-sm font-semibold text-slate-900 mb-1.5">{step.title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA band ── */}
        <section className="bg-indigo-950 py-20 px-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Ready to ace your next exam?</h2>
          <p className="text-base text-indigo-400 mb-8">Join thousands of students already improving their scores every day.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={handleGetStarted}
              className="text-base font-semibold text-indigo-950 bg-white hover:bg-slate-100 px-8 py-3.5 rounded-xl transition-colors"
            >
              Start practising free
            </button>
            <button
              onClick={handleBrowse}
              className="text-base font-medium text-indigo-300 border border-indigo-800 hover:bg-indigo-900 px-7 py-3.5 rounded-xl transition-colors"
            >
              Browse categories
            </button>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

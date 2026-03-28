import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/LogoutConfirmModal.css';

interface NavbarProps {
  /** Page title shown after the back button + divider */
  title?: string;
  /** If set, shows a "← {backLabel}" button that navigates to this path */
  backTo?: string;
  /** Label for the back button. Defaults to "Back" */
  backLabel?: string;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Navbar({ title, backTo, backLabel = 'Back' }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMenuBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!menuRef.current?.contains(e.relatedTarget as Node)) {
      setMenuOpen(false);
    }
  };

  const avatarSrc = (user as { avatar?: string } | null)?.avatar;

  return (
    <>
      <nav className="bg-white border-b border-slate-200 px-8 h-16 flex items-center justify-between sticky top-0 z-10">

        {/* ── Left side ── */}
        <div className="flex items-center gap-3">
          {backTo ? (
            <>
              <button
                onClick={() => navigate(backTo)}
                className="text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
              >
                ← {backLabel}
              </button>
              {title && (
                <>
                  <div className="w-px h-5 bg-slate-200" />
                  <span className="text-base font-semibold text-slate-900">{title}</span>
                </>
              )}
            </>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <circle cx="4" cy="4" r="2" />
                  <circle cx="12" cy="4" r="2" />
                  <circle cx="4" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <span className="text-base font-bold text-indigo-950 tracking-tight">Exam Prep</span>
            </button>
          )}
        </div>

        {/* ── Right side ── */}
        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-1.5 rounded-lg transition-colors"
            >
              Admin Dashboard
            </button>
          )}

          {/* Avatar dropdown */}
          <div className="relative" ref={menuRef} onBlur={handleMenuBlur} tabIndex={-1}>
            <button
              className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-600 cursor-pointer"
              style={avatarSrc ? {
                backgroundImage: `url(${JSON.stringify(avatarSrc)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : undefined}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Open user menu"
              aria-expanded={menuOpen}
            >
              {!avatarSrc && getInitials(user?.name || '?')}
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
                  onMouseDown={() => { setMenuOpen(false); setShowLogoutConfirm(true); }}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Logout confirmation modal ── */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-slate-900 font-semibold text-base mb-1">Log out of Exam Prep?</h3>
            <p className="text-slate-500 text-sm mb-5">You'll need to sign in again to access your account.</p>
            <div className="flex gap-2 justify-end">
              <button
                className="text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                onClick={() => { setShowLogoutConfirm(false); logout(); }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

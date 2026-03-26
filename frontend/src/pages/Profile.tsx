import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userApi, type ExamHistoryEntry, type User } from '../api/client';
import '../styles/Profile.css';

// ── Mini SVG line chart for score progression ─────────────────────────────────
function ScoreChart({ entries }: { entries: ExamHistoryEntry[] }) {
  if (entries.length < 2) {
    return (
      <p className="chart-placeholder">
        Complete at least 2 exams to see your score progression.
      </p>
    );
  }

  const W = 500;
  const H = 160;
  const PAD = { top: 16, right: 20, bottom: 32, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  // Keep chronological order (oldest first)
  const sorted = [...entries].reverse();
  const scores = sorted.map((e) => e.score);
  const minScore = Math.max(0, Math.min(...scores) - 10);
  const maxScore = Math.min(100, Math.max(...scores) + 10);

  const xOf = (i: number) => PAD.left + (i / (sorted.length - 1)) * innerW;
  const yOf = (s: number) =>
    PAD.top + innerH - ((s - minScore) / (maxScore - minScore)) * innerH;

  const polyline = scores.map((s, i) => `${xOf(i)},${yOf(s)}`).join(' ');

  return (
    <div className="score-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="score-chart-svg" aria-label="Score progression chart">
        {/* Y-axis grid lines */}
        {[0, 25, 50, 75, 100].map((v) => {
          if (v < minScore || v > maxScore) return null;
          const y = yOf(v);
          return (
            <g key={v}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#e2e8f0" strokeWidth="1" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{v}%</text>
            </g>
          );
        })}

        {/* Filled area under line */}
        <polygon
          points={`${xOf(0)},${PAD.top + innerH} ${polyline} ${xOf(sorted.length - 1)},${PAD.top + innerH}`}
          fill="url(#chartGrad)"
          opacity="0.25"
        />
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Line */}
        <polyline points={polyline} fill="none" stroke="#667eea" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Data points */}
        {scores.map((s, i) => (
          <circle key={i} cx={xOf(i)} cy={yOf(s)} r="4" fill="white" stroke="#667eea" strokeWidth="2.5">
            <title>{`Attempt ${i + 1}: ${s}%`}</title>
          </circle>
        ))}

        {/* X labels */}
        {sorted.map((_, i) => (
          <text key={i} x={xOf(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#94a3b8">
            #{i + 1}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ── Initials avatar fallback ──────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ── Main Profile page ─────────────────────────────────────────────────────────
export function Profile() {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [profile, setProfile] = useState<User | null>(null);
  const [history, setHistory] = useState<ExamHistoryEntry[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Active section tab — supports ?tab=settings deep-link
  const initialTab = (['overview', 'history', 'progress', 'settings'].includes(searchParams.get('tab') || '')
    ? searchParams.get('tab')
    : 'overview') as 'overview' | 'history' | 'progress' | 'settings';
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'progress' | 'settings'>(initialTab);

  // Profile edit mode
  const [editMode, setEditMode] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editAvatarPreview, setEditAvatarPreview] = useState<string>('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings
  const [notifications, setNotifications] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

  // Dark mode — read from localStorage, fall back to system pref
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const loadProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const { data } = await userApi.getProfile();
      setProfile(data.user);
      setEditUsername(data.user.username || data.user.name);
      setEditAvatarPreview(data.user.avatar || '');
      setNotifications(data.user.notifications ?? true);
    } catch (err: unknown) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const { data } = await userApi.getExamHistory();
      setHistory(data.history);
    } catch (err: unknown) {
      console.error('Failed to load exam history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
    void loadHistory();
  }, [loadProfile, loadHistory]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileError('Please select an image file.');
      return;
    }
    if (file.size > 1_000_000) {
      setProfileError('Image must be under 1 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setEditAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    setProfileError('');
  };

  const handleSaveProfile = async () => {
    setProfileError('');
    setProfileSuccess('');
    const trimmed = editUsername.trim();
    if (trimmed.length < 3) {
      setProfileError('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_ ]+$/.test(trimmed)) {
      setProfileError('Username may only contain letters, numbers, underscores, and spaces.');
      return;
    }
    try {
      setSavingProfile(true);
      const { data } = await userApi.updateProfile({
        username: trimmed,
        avatar: editAvatarPreview,
      });
      setProfile(data.user);
      setProfileSuccess('Profile updated successfully!');
      setEditMode(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setProfileError(e.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsMsg('');
    try {
      await userApi.updateSettings({ notifications });
      setSettingsMsg('Settings saved.');
    } catch {
      setSettingsMsg('Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // ── Stats from history ────────────────────────────────────────
  const totalAttempts = history.length;
  const avgScore = totalAttempts
    ? Math.round(history.reduce((s, e) => s + e.score, 0) / totalAttempts)
    : 0;
  const passRate = totalAttempts
    ? Math.round((history.filter((e) => e.passed).length / totalAttempts) * 100)
    : 0;

  // Category stats: average score per category
  const categoryMap: Record<string, number[]> = {};
  history.forEach((e) => {
    const cat = e.examCategory || 'Other';
    (categoryMap[cat] = categoryMap[cat] || []).push(e.score);
  });
  const categoryStats = Object.entries(categoryMap).map(([cat, scores]) => ({
    cat,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }));
  categoryStats.sort((a, b) => b.avg - a.avg);
  const strongest = categoryStats[0];
  const weakest = categoryStats[categoryStats.length - 1];

  const displayName = profile?.username || profile?.name || authUser?.name || '';
  const avatarSrc = profile?.avatar || editAvatarPreview;

  if (loadingProfile) {
    return <div className="loading">Loading profile…</div>;
  }

  return (
    <div className="profile-page">
      {/* ── Top nav ── */}
      <header className="profile-header">
        <div className="profile-header-content">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </button>
          <h1 className="profile-header-title">My Profile</h1>
          <button className="btn-logout-sm" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="profile-body">
        {/* ── Sidebar avatar + tabs ── */}
        <aside className="profile-sidebar">
          <div className="profile-avatar-wrap">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-initials">{getInitials(displayName)}</div>
            )}
          </div>
          <p className="profile-display-name">{displayName}</p>
          <p className="profile-email">{profile?.email}</p>

          <nav className="profile-tabs">
            {(['overview', 'history', 'progress', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                className={`profile-tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'overview' && '👤 '}
                {tab === 'history' && '📋 '}
                {tab === 'progress' && '📊 '}
                {tab === 'settings' && '⚙️ '}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className="profile-content">

          {/* ── A: Profile Overview ── */}
          {activeTab === 'overview' && (
            <section className="profile-section">
              <div className="section-header">
                <h2>Profile Overview</h2>
                {!editMode && (
                  <button className="btn-edit" onClick={() => { setEditMode(true); setProfileError(''); setProfileSuccess(''); }}>
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

              {profileSuccess && <div className="alert-success">{profileSuccess}</div>}
              {profileError && <div className="alert-error">{profileError}</div>}

              {editMode ? (
                <div className="profile-edit-form">
                  {/* Avatar upload */}
                  <div className="edit-avatar-row">
                    <div className="edit-avatar-preview">
                      {editAvatarPreview ? (
                        <img src={editAvatarPreview} alt="Preview" className="profile-avatar-img" />
                      ) : (
                        <div className="profile-avatar-initials">{getInitials(editUsername || displayName)}</div>
                      )}
                    </div>
                    <div className="edit-avatar-actions">
                      <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
                        📷 Upload Photo
                      </button>
                      {editAvatarPreview && (
                        <button className="btn-ghost" onClick={() => setEditAvatarPreview('')}>
                          Remove Photo
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleAvatarUpload}
                      />
                      <p className="hint">Max 1 MB. JPG, PNG, GIF, WEBP.</p>
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="edit-username">Display Username</label>
                    <input
                      id="edit-username"
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      maxLength={30}
                      placeholder="Min 3 characters"
                    />
                  </div>

                  <div className="form-field">
                    <label>Email</label>
                    <input type="email" value={profile?.email || ''} disabled />
                    <span className="hint">Email cannot be changed.</span>
                  </div>

                  <div className="edit-actions">
                    <button className="btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>
                      {savingProfile ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button className="btn-secondary" onClick={() => { setEditMode(false); setProfileError(''); }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-info-list">
                  <div className="info-row">
                    <span className="info-label">Display Name</span>
                    <span className="info-value">{displayName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span className="info-value">{profile?.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Role</span>
                    <span className="info-value role-badge">{profile?.role}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Member since</span>
                    <span className="info-value">
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString()
                        : '—'}
                    </span>
                  </div>

                  <div className="profile-quick-stats">
                    <div className="quick-stat">
                      <span className="quick-stat-value">{totalAttempts}</span>
                      <span className="quick-stat-label">Exams Taken</span>
                    </div>
                    <div className="quick-stat">
                      <span className="quick-stat-value">{avgScore}%</span>
                      <span className="quick-stat-label">Avg Score</span>
                    </div>
                    <div className="quick-stat">
                      <span className="quick-stat-value">{passRate}%</span>
                      <span className="quick-stat-label">Pass Rate</span>
                    </div>
                  </div>

                  <div className="profile-password-shortcut">
                    <p>Need to change your password?</p>
                    <button className="btn-secondary" onClick={() => navigate('/forgot-password')}>
                      🔒 Reset Password
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── B: Exam History ── */}
          {activeTab === 'history' && (
            <section className="profile-section">
              <div className="section-header">
                <h2>Exam History</h2>
                <span className="section-count">{totalAttempts} attempt{totalAttempts !== 1 ? 's' : ''}</span>
              </div>

              {loadingHistory ? (
                <div className="loading">Loading history…</div>
              ) : history.length === 0 ? (
                <div className="empty-section">
                  <div className="empty-icon">📋</div>
                  <p>You haven't taken any exams yet.</p>
                  <button className="btn-primary" onClick={() => navigate('/exams/categories')}>
                    Browse Exams
                  </button>
                </div>
              ) : (
                <div className="history-list">
                  {history.map((entry) => (
                    <div key={entry._id} className="history-card">
                      <div className="history-card-main">
                        <div className="history-card-title">
                          <h3>{entry.examTitle}</h3>
                          <span className={`pass-badge ${entry.passed ? 'pass' : 'fail'}`}>
                            {entry.passed ? '✓ Pass' : '✗ Fail'}
                          </span>
                        </div>
                        <div className="history-card-meta">
                          <span>🗂️ {entry.examCategory || 'Uncategorized'}</span>
                          <span>📅 {new Date(entry.completedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                          <span>🕐 {new Date(entry.completedAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}</span>
                          <span>✅ {entry.correctAnswers}/{entry.totalQuestions} correct</span>
                        </div>
                      </div>
                      <div className="history-card-score">
                        <div className={`score-circle-sm ${entry.passed ? 'pass' : 'fail'}`}>
                          {entry.score}%
                        </div>
                        <button
                          className="btn-view-results"
                          onClick={() => navigate(`/exam/${entry.examId}/results`, {
                            state: {
                              attempt: {
                                _id: entry._id,
                                examId: entry.examId,
                                score: entry.score,
                                totalQuestions: entry.totalQuestions,
                                correctAnswers: entry.correctAnswers,
                                passed: entry.passed,
                                completedAt: entry.completedAt,
                                answers: {},
                              }
                            }
                          })}
                        >
                          View Results
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── C: Progress Report ── */}
          {activeTab === 'progress' && (
            <section className="profile-section">
              <div className="section-header">
                <h2>Progress Report</h2>
              </div>

              {loadingHistory ? (
                <div className="loading">Loading progress…</div>
              ) : (
                <>
                  {/* Summary cards */}
                  <div className="progress-stats-grid">
                    <div className="progress-stat-card">
                      <span className="progress-stat-icon">🎯</span>
                      <span className="progress-stat-value">{totalAttempts}</span>
                      <span className="progress-stat-label">Total Exams</span>
                    </div>
                    <div className="progress-stat-card">
                      <span className="progress-stat-icon">📈</span>
                      <span className="progress-stat-value">{avgScore}%</span>
                      <span className="progress-stat-label">Average Score</span>
                    </div>
                    <div className="progress-stat-card">
                      <span className="progress-stat-icon">✅</span>
                      <span className="progress-stat-value">{passRate}%</span>
                      <span className="progress-stat-label">Pass Rate</span>
                    </div>
                    <div className="progress-stat-card">
                      <span className="progress-stat-icon">🏆</span>
                      <span className="progress-stat-value">{history.filter((e) => e.passed).length}</span>
                      <span className="progress-stat-label">Passed</span>
                    </div>
                  </div>

                  {/* Score progression chart */}
                  <div className="progress-chart-section">
                    <h3>Score Progression</h3>
                    <ScoreChart entries={history} />
                  </div>

                  {/* Category breakdown */}
                  {categoryStats.length > 0 && (
                    <div className="progress-categories">
                      <h3>Performance by Category</h3>
                      {strongest && weakest && strongest.cat !== weakest.cat && (
                        <div className="strength-summary">
                          <div className="strength-card best">
                            <span>💪 Strongest</span>
                            <strong>{strongest.cat}</strong>
                            <span>{strongest.avg}% avg</span>
                          </div>
                          <div className="strength-card weak">
                            <span>📖 Needs Work</span>
                            <strong>{weakest.cat}</strong>
                            <span>{weakest.avg}% avg</span>
                          </div>
                        </div>
                      )}
                      <div className="category-bars">
                        {categoryStats.map(({ cat, avg }) => (
                          <div key={cat} className="category-bar-row">
                            <span className="category-bar-label">{cat}</span>
                            <div className="category-bar-track">
                              <div
                                className={`category-bar-fill ${avg >= 70 ? 'good' : avg >= 50 ? 'ok' : 'poor'}`}
                                style={{ width: `${avg}%` }}
                              />
                            </div>
                            <span className="category-bar-pct">{avg}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {totalAttempts === 0 && (
                    <div className="empty-section">
                      <div className="empty-icon">📊</div>
                      <p>Take some exams to see your progress here.</p>
                      <button className="btn-primary" onClick={() => navigate('/exams/categories')}>
                        Browse Exams
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* ── D: Settings ── */}
          {activeTab === 'settings' && (
            <section className="profile-section">
              <div className="section-header">
                <h2>Settings</h2>
              </div>

              {settingsMsg && (
                <div className={settingsMsg.includes('Failed') ? 'alert-error' : 'alert-success'}>
                  {settingsMsg}
                </div>
              )}

              <div className="settings-list">
                {/* Dark / Light mode */}
                <div className="settings-row">
                  <div className="settings-row-info">
                    <span className="settings-icon">{darkMode ? '🌙' : '☀️'}</span>
                    <div>
                      <p className="settings-label">Theme</p>
                      <p className="settings-desc">{darkMode ? 'Dark mode' : 'Light mode'} — saved to browser</p>
                    </div>
                  </div>
                  <button
                    className={`toggle-btn ${darkMode ? 'on' : ''}`}
                    onClick={() => setDarkMode((d) => !d)}
                    aria-label="Toggle dark mode"
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>

                {/* Notifications */}
                <div className="settings-row">
                  <div className="settings-row-info">
                    <span className="settings-icon">🔔</span>
                    <div>
                      <p className="settings-label">In-app Notifications</p>
                      <p className="settings-desc">Exam reminders and new exam alerts</p>
                    </div>
                  </div>
                  <button
                    className={`toggle-btn ${notifications ? 'on' : ''}`}
                    onClick={() => setNotifications((n) => !n)}
                    aria-label="Toggle notifications"
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>

                {/* Username shortcut to overview */}
                <div className="settings-row">
                  <div className="settings-row-info">
                    <span className="settings-icon">✏️</span>
                    <div>
                      <p className="settings-label">Username</p>
                      <p className="settings-desc">
                        {profile?.username || profile?.name || '—'}
                      </p>
                    </div>
                  </div>
                  <button
                    className="btn-secondary"
                    onClick={() => { setActiveTab('overview'); setEditMode(true); }}
                  >
                    Change
                  </button>
                </div>

                {/* Password reset shortcut */}
                <div className="settings-row">
                  <div className="settings-row-info">
                    <span className="settings-icon">🔒</span>
                    <div>
                      <p className="settings-label">Password</p>
                      <p className="settings-desc">Update your account password</p>
                    </div>
                  </div>
                  <button className="btn-secondary" onClick={() => navigate('/forgot-password')}>
                    Reset
                  </button>
                </div>
              </div>

              <div className="settings-save-row">
                <button className="btn-primary" onClick={handleSaveSettings} disabled={savingSettings}>
                  {savingSettings ? 'Saving…' : 'Save Settings'}
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

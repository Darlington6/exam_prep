import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { examApi, type Exam } from '../api/client';
import '../styles/ExamSelection.css';

const categoryNames: Record<string, string> = {
  science: 'Science',
  humanities: 'Humanities',
  languages: 'Languages',
  business: 'Business & Economics',
  professional: 'Professional Certifications',
  general: 'General Knowledge'
};

const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'] as const;

export function ExamSelection() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const loadExams = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await examApi.getByCategory(categoryId || '');
      setExams(data.exams);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  // Derived filtered list — all on the frontend, no extra API calls
  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || exam.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const handleStartExam = (examId: string) => {
    navigate(`/exam/${examId}`);
  };

  const handleBack = () => {
    navigate('/exams/categories');
  };

  return (
    <div className="exam-selection-container">
      <header className="selection-header">
        <div className="header-content">
          <div className="header-left">
            <button className="btn-back" onClick={handleBack}>
              ← Back to Categories
            </button>
            <h1>{categoryNames[categoryId || ''] || 'Exams'}</h1>
          </div>
          <div className="header-actions">
            {user?.role === 'admin' && (
              <button className="btn-admin" onClick={() => navigate('/admin')}>
                Admin Dashboard
              </button>
            )}
            <button className="btn-logout" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="selection-main">
        {loading ? (
          <div className="loading">Loading exams...</div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button className="btn-primary" onClick={loadExams}>
              Try Again
            </button>
          </div>
        ) : exams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h2>No Exams Available Yet</h2>
            <p>Check back later for exams in this category.</p>
            <button className="btn-primary" onClick={handleBack}>
              Browse Other Categories
            </button>
          </div>
        ) : (
          <>
            {/* ── Search & Filter bar ── */}
            <div className="exam-search-bar">
              <div className="exam-search-input-wrap">
                <span className="exam-search-icon">🔍</span>
                <input
                  type="text"
                  className="exam-search-input"
                  placeholder="Search exams by name or description…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="exam-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                    ✕
                  </button>
                )}
              </div>

              <div className="exam-difficulty-filters">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    className={`difficulty-chip ${difficultyFilter === d ? 'active' : ''} ${d !== 'all' ? d : ''}`}
                    onClick={() => setDifficultyFilter(d)}
                  >
                    {d === 'all' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {filteredExams.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h2>No exams found</h2>
                <p>Try a different search or difficulty level.</p>
                <button className="btn-primary" onClick={() => { setSearchQuery(''); setDifficultyFilter('all'); }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <p className="selection-subtitle">
                  {filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''} found
                </p>
                <div className="exams-grid">
                  {filteredExams.map((exam) => (
                    <div key={exam._id} className="exam-card-selection">
                      <div className="exam-card-header">
                        <h3>{exam.title}</h3>
                        <span className={`difficulty-badge ${exam.difficulty}`}>
                          {exam.difficulty}
                        </span>
                      </div>
                      
                      <p className="exam-card-description">{exam.description}</p>
                      
                      <div className="exam-card-meta">
                        <div className="meta-item">
                          <span className="meta-icon">⏱️</span>
                          <span>{exam.duration} minutes</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-icon">📊</span>
                          <span>{exam.passingScore}% to pass</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-icon">📚</span>
                          <span>{exam.category}</span>
                        </div>
                      </div>

                      <button
                        className="btn-start-exam"
                        onClick={() => handleStartExam(exam._id)}
                      >
                        Start Exam
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

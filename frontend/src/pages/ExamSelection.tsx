import { useEffect, useState } from 'react';
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

export function ExamSelection() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadExams();
  }, [categoryId]);

  const loadExams = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await examApi.getByCategory(categoryId || '');
      setExams(data.exams);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

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
            <p className="selection-subtitle">
              {exams.length} exam{exams.length !== 1 ? 's' : ''} available
            </p>
            
            <div className="exams-grid">
              {exams.map((exam) => (
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
      </main>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { adminExamApi, type Exam } from '../../api/client';
import { QuestionManager } from './QuestionManager';
import '../../styles/ExamList.css';

interface ExamListProps {
  onEdit: (examId: string) => void;
  onCreate: () => void;
}

export function ExamList({ onEdit, onCreate }: ExamListProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [managingExamId, setManagingExamId] = useState<string | null>(null);

  const loadExams = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await adminExamApi.getAll();
      setExams(data.exams);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const handleDelete = async (examId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will also delete all associated questions.`)) {
      return;
    }

    try {
      await adminExamApi.delete(examId);
      setExams(exams.filter(e => e._id !== examId));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to delete exam');
    }
  };

  const handleToggleActive = async (examId: string) => {
    try {
      const { data } = await adminExamApi.toggleActive(examId);
      setExams(exams.map(e => e._id === examId ? data.exam : e));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to update exam status');
    }
  };

  const handleManageQuestions = (examId: string) => {
    setManagingExamId(examId);
  };

  const handleCloseQuestionManager = () => {
    setManagingExamId(null);
  };

  if (loading) {
    return <div className="loading">Loading exams...</div>;
  }

  if (managingExamId) {
    const exam = exams.find(e => e._id === managingExamId);
    return (
      <QuestionManager
        exam={exam!}
        onClose={handleCloseQuestionManager}
      />
    );
  }

  return (
    <div className="exam-list">
      <div className="exam-list-header">
        <h2>All Exams</h2>
        <button className="btn-primary" onClick={onCreate}>
          + Create New Exam
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {exams.length === 0 ? (
        <div className="empty-state">
          <p>No exams created yet.</p>
          <button className="btn-primary" onClick={onCreate}>
            Create Your First Exam
          </button>
        </div>
      ) : (
        <div className="exam-grid">
          {exams.map((exam) => (
            <div key={exam._id} className="exam-card">
              <div className="exam-card-header">
                <h3>{exam.title}</h3>
                <span className={`status-badge ${exam.isActive ? 'active' : 'inactive'}`}>
                  {exam.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <p className="exam-description">{exam.description}</p>
              
              <div className="exam-meta">
                <span className="meta-item">
                  <strong>Category:</strong> {exam.category}
                </span>
                <span className="meta-item">
                  <strong>Difficulty:</strong> {exam.difficulty}
                </span>
                <span className="meta-item">
                  <strong>Duration:</strong> {exam.duration} min
                </span>
                <span className="meta-item">
                  <strong>Passing:</strong> {exam.passingScore}%
                </span>
              </div>

              <div className="exam-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => handleManageQuestions(exam._id)}
                >
                  Manage Questions
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => onEdit(exam._id)}
                >
                  Edit
                </button>
                <button 
                  className="btn-toggle"
                  onClick={() => handleToggleActive(exam._id)}
                >
                  {exam.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  className="btn-danger"
                  onClick={() => handleDelete(exam._id, exam.title)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

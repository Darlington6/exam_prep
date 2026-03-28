import { useCallback, useEffect, useState } from 'react';
import { adminExamApi, type Exam } from '../../api/client';
import { QuestionManager } from './QuestionManager';
import '../../styles/ExamList.css';
import '../../styles/AdminDashboard.css';

interface ExamListProps {
  onEdit: (examId: string) => void;
  onCreate: () => void;
  managingExamId: string | null;
  onManageQuestions: (examId: string) => void;
  onCloseQuestions: () => void;
}

export function ExamList({ onEdit, onCreate, managingExamId, onManageQuestions, onCloseQuestions }: ExamListProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminExamApi.delete(deleteTarget.id);
      setExams((prev) => prev.filter((e) => e._id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to delete exam');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
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
    onManageQuestions(examId);
  };

  const handleCloseQuestionManager = () => {
    onCloseQuestions();
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
                  onClick={() => setDeleteTarget({ id: exam._id, title: exam.title })}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {deleteTarget && (
        <div className="confirm-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Exam?</h3>
            <p>
              Are you sure you want to permanently delete <strong>"{deleteTarget.title}"</strong>?
              This will also delete all associated questions and cannot be undone.
            </p>
            <div className="confirm-modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { adminQuestionApi, type Question, type Exam } from '../../api/client';
import { QuestionForm } from './QuestionForm';
import '../../styles/QuestionManager.css';

interface QuestionManagerProps {
  exam: Exam;
  onClose: () => void;
}

export function QuestionManager({ exam, onClose }: QuestionManagerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await adminQuestionApi.getByExam(exam._id);
      setQuestions(data.questions.sort((a: Question, b: Question) => a.order - b.order));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [exam._id]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleCreateNew = () => {
    setEditingQuestionId(null);
    setShowForm(true);
  };

  const handleEdit = (questionId: string) => {
    setEditingQuestionId(questionId);
    setShowForm(true);
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await adminQuestionApi.delete(questionId);
      setQuestions(questions.filter(q => q._id !== questionId));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to delete question');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingQuestionId(null);
    loadQuestions();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingQuestionId(null);
  };

  if (showForm) {
    return (
      <QuestionForm
        examId={exam._id}
        questionId={editingQuestionId}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="question-manager">
      <div className="question-manager-header">
        <div>
          <button className="btn-back" onClick={onClose}>
            ← Back to Exams
          </button>
          <h2>Manage Questions: {exam.title}</h2>
          <p className="exam-info">
            {exam.category} • {exam.difficulty} • {exam.duration} minutes
          </p>
        </div>
        <button className="btn-primary" onClick={handleCreateNew}>
          + Add Question
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="empty-state">
          <p>No questions added yet.</p>
          <button className="btn-primary" onClick={handleCreateNew}>
            Add Your First Question
          </button>
        </div>
      ) : (
        <div className="questions-list">
          <div className="questions-count">
            Total Questions: {questions.length}
          </div>
          
          {questions.map((question, index) => (
            <div key={question._id} className="question-card">
              <div className="question-header">
                <span className="question-number">Question {index + 1}</span>
                <span className="question-points">{question.points} point(s)</span>
              </div>
              
              <p className="question-text">{question.questionText}</p>
              
              <div className="question-options">
                {question.options.map((option: { text: string; isCorrect: boolean }, optIndex: number) => (
                  <div
                    key={optIndex}
                    className={`option ${option.isCorrect ? 'correct' : ''}`}
                  >
                    <span className="option-label">{String.fromCharCode(65 + optIndex)}.</span>
                    <span className="option-text">{option.text}</span>
                    {option.isCorrect && <span className="correct-badge">✓ Correct</span>}
                  </div>
                ))}
              </div>

              {question.explanation && (
                <div className="question-explanation">
                  <strong>Explanation:</strong> {question.explanation}
                </div>
              )}

              <div className="question-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => handleEdit(question._id)}
                >
                  Edit
                </button>
                <button 
                  className="btn-danger"
                  onClick={() => handleDelete(question._id)}
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

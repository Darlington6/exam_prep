import { useEffect, useState } from 'react';
import { adminExamApi, type CreateExamData } from '../../api/client';
import '../../styles/ExamForm.css';

interface ExamFormProps {
  examId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ExamForm({ examId, onSuccess, onCancel }: ExamFormProps) {
  const [formData, setFormData] = useState<CreateExamData>({
    title: '',
    description: '',
    category: '',
    difficulty: 'medium',
    duration: 30,
    passingScore: 50,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingExam, setLoadingExam] = useState(false);

  useEffect(() => {
    if (examId) {
      loadExam();
    }
  }, [examId]);

  const loadExam = async () => {
    if (!examId) return;
    
    try {
      setLoadingExam(true);
      const { data } = await adminExamApi.getById(examId);
      setFormData({
        title: data.exam.title,
        description: data.exam.description,
        category: data.exam.category,
        difficulty: data.exam.difficulty,
        duration: data.exam.duration,
        passingScore: data.exam.passingScore,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load exam');
    } finally {
      setLoadingExam(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.category.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      if (examId) {
        await adminExamApi.update(examId, formData);
      } else {
        await adminExamApi.create(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${examId ? 'update' : 'create'} exam`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: CreateExamData) => ({
      ...prev,
      [name]: name === 'duration' || name === 'passingScore' 
        ? Number(value) 
        : value,
    }));
  };

  if (loadingExam) {
    return <div className="loading">Loading exam...</div>;
  }

  return (
    <div className="exam-form">
      <h2>{examId ? 'Edit Exam' : 'Create New Exam'}</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">
            Exam Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Mathematics Final Exam"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of the exam..."
            rows={4}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">
              Category <span className="required">*</span>
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Mathematics, Science"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="duration">
              Duration (minutes) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              max="300"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="passingScore">
              Passing Score (%) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="passingScore"
              name="passingScore"
              value={formData.passingScore}
              onChange={handleChange}
              min="0"
              max="100"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : examId ? 'Update Exam' : 'Create Exam'}
          </button>
        </div>
      </form>
    </div>
  );
}

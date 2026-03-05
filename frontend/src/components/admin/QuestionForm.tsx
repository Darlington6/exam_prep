import { useEffect, useState } from 'react';
import { adminQuestionApi, type CreateQuestionData } from '../../api/client';
import '../../styles/QuestionForm.css';

interface QuestionFormProps {
  examId: string;
  questionId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Option {
  text: string;
  isCorrect: boolean;
}

export function QuestionForm({ examId, questionId, onSuccess, onCancel }: QuestionFormProps) {
  const [formData, setFormData] = useState({
    questionText: '',
    explanation: '',
    points: 1,
    order: 0,
  });
  const [options, setOptions] = useState<Option[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  useEffect(() => {
    if (questionId) {
      loadQuestion();
    }
  }, [questionId]);

  const loadQuestion = async () => {
    if (!questionId) return;

    try {
      setLoadingQuestion(true);
      const { data } = await adminQuestionApi.getById(questionId);
      setFormData({
        questionText: data.question.questionText,
        explanation: data.question.explanation || '',
        points: data.question.points,
        order: data.question.order,
      });
      setOptions(data.question.options);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load question');
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.questionText.trim()) {
      setError('Question text is required');
      return;
    }

    const filledOptions = options.filter(opt => opt.text.trim());
    if (filledOptions.length < 2) {
      setError('At least 2 options are required');
      return;
    }

    const hasCorrectAnswer = filledOptions.some(opt => opt.isCorrect);
    if (!hasCorrectAnswer) {
      setError('At least one option must be marked as correct');
      return;
    }

    const submitData: CreateQuestionData = {
      examId,
      questionText: formData.questionText,
      options: filledOptions,
      explanation: formData.explanation || undefined,
      points: formData.points,
      order: formData.order,
    };

    try {
      setLoading(true);
      if (questionId) {
        await adminQuestionApi.update(questionId, submitData);
      } else {
        await adminQuestionApi.create(submitData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${questionId ? 'update' : 'create'} question`);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index: number, field: keyof Option, value: string | boolean) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { text: '', isCorrect: false }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  if (loadingQuestion) {
    return <div className="loading">Loading question...</div>;
  }

  return (
    <div className="question-form">
      <h2>{questionId ? 'Edit Question' : 'Add New Question'}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="questionText">
            Question Text <span className="required">*</span>
          </label>
          <textarea
            id="questionText"
            value={formData.questionText}
            onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
            placeholder="Enter your question here..."
            rows={4}
            required
          />
        </div>

        <div className="options-section">
          <label>
            Answer Options <span className="required">*</span>
            <span className="hint">(Check the correct answer)</span>
          </label>
          
          {options.map((option, index) => (
            <div key={index} className="option-input-group">
              <span className="option-label">{String.fromCharCode(65 + index)}.</span>
              <input
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                placeholder={`Option ${index + 1}`}
              />
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={option.isCorrect}
                  onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                />
                Correct
              </label>
              {options.length > 2 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeOption(index)}
                  title="Remove option"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {options.length < 6 && (
            <button
              type="button"
              className="btn-add-option"
              onClick={addOption}
            >
              + Add Another Option
            </button>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="explanation">
            Explanation (Optional)
            <span className="hint">Provide context or reasoning for the correct answer</span>
          </label>
          <textarea
            id="explanation"
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            placeholder="Explain why this is the correct answer..."
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="points">Points</label>
            <input
              type="number"
              id="points"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
              min="1"
              max="10"
            />
          </div>

          <div className="form-group">
            <label htmlFor="order">
              Order
              <span className="hint">(for sorting questions)</span>
            </label>
            <input
              type="number"
              id="order"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
              min="0"
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
            {loading ? 'Saving...' : questionId ? 'Update Question' : 'Add Question'}
          </button>
        </div>
      </form>
    </div>
  );
}

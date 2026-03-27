import { useState } from 'react';
import { adminExternalApi } from '../../api/client';
import '../../styles/ExternalAPIFetch.css';

interface ExternalAPIFetchProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ExternalAPIFetch({ onSuccess, onCancel }: ExternalAPIFetchProps) {
  const [apiUrl, setApiUrl] = useState('');
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!apiUrl.trim()) {
      setError('API URL is required');
      return;
    }

    try {
      setLoading(true);
      const { data } = await adminExternalApi.fetchFromAPI({
        apiUrl,
        category: category || undefined,
        limit,
      });
      
      setSuccess(
        `Successfully imported ${data.exams.length} exam(s) with ${data.questions.length} question(s)!`
      );
      
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch exams from external API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="external-api-fetch">
      <h2>Fetch Exams from External API</h2>
      <p className="fetch-description">
        Import exams and questions from external educational platforms and APIs to expand your question bank.
      </p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="apiUrl">
            API URL <span className="required">*</span>
          </label>
          <input
            type="url"
            id="apiUrl"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://api.example.com/exams"
            required
            disabled={loading || !!success}
          />
          <small className="form-hint">
            Enter the URL of the external API endpoint that provides exam data
          </small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category (Optional)</label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., science, biology"
              disabled={loading || !!success}
            />
            <small className="form-hint">
              Filter exams by category if the API supports it
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="limit">Limit</label>
            <input
              type="number"
              id="limit"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              min="1"
              max="100"
              disabled={loading || !!success}
            />
            <small className="form-hint">
              Maximum number of exams to import
            </small>
          </div>
        </div>

        <div className="api-info-box">
          <h4>📌 Supported API Formats</h4>
          <ul>
            <li>
              <strong>Open Trivia DB</strong> —{' '}
              <code>https://opentdb.com/api.php?amount=10&amp;type=multiple</code>
            </li>
            <li>
              <strong>QuizAPI</strong> —{' '}
              <code>https://quizapi.io/api/v1/questions?limit=10&amp;apiKey=YOUR_KEY</code>
            </li>
            <li>
              <strong>Custom format</strong> — a JSON array (or <code>{'{"exams":[...]}'}</code>) where each object has a <code>title</code> field and optionally a <code>questions</code> array
            </li>
          </ul>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={loading || !!success}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !!success}
          >
            {loading ? 'Fetching...' : 'Fetch Exams'}
          </button>
        </div>
      </form>
    </div>
  );
}

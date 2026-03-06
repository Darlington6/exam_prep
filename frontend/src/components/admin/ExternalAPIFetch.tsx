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
          <h4>📌 API Requirements</h4>
          <ul>
            <li>The API should return exam data in JSON format</li>
            <li>Expected structure includes exam metadata and questions</li>
            <li>Questions should have multiple-choice options</li>
            <li>Each question should indicate the correct answer(s)</li>
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

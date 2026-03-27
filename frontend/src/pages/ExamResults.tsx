import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { examApi, type Question } from '../api/client';
import '../styles/ExamResults.css';

interface ExamAttempt {
  _id: string;
  examId: string;
  userId: string;
  answers: Record<string, number>;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  completedAt: string;
}

export function ExamResults() {
  const { examId } = useParams<{ examId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [attempt] = useState<ExamAttempt | null>(
    location.state?.attempt || null
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);

  const loadResults = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await examApi.getReviewQuestions(examId || '');
      setQuestions(data.questions);
    } catch (err: unknown) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const handleRetakeExam = () => {
    navigate(`/exam/${examId}`);
  };

  const handleBackToCategories = () => {
    navigate('/exams/categories');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading || !attempt) {
    return <div className="loading">Loading results...</div>;
  }

  const percentage = attempt.score;
  const isPassed = attempt.passed;

  return (
    <div className="exam-results-container">
      <div className="results-card">
        <div className={`results-header ${isPassed ? 'passed' : 'failed'}`}>
          <div className="result-icon">
            {isPassed ? '🎉' : '📚'}
          </div>
          <h1>{isPassed ? 'Congratulations!' : 'Keep Practicing!'}</h1>
          <p>
            {isPassed
              ? "You've passed the exam!"
              : "Don't give up! Review and try again."}
          </p>
        </div>

        <div className="score-display">
          <div className="score-circle">
            <svg viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="20"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={isPassed ? '#22c55e' : '#ef4444'}
                strokeWidth="20"
                strokeDasharray={`${(percentage / 100) * 502.4} 502.4`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div className="score-text">
              <span className="score-number">{percentage}%</span>
            </div>
          </div>
        </div>

        <div className="results-summary">
          <div className="summary-item">
            <span className="summary-label">Total Questions</span>
            <span className="summary-value">{attempt.totalQuestions}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Correct Answers</span>
            <span className="summary-value correct">{attempt.correctAnswers}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Wrong Answers</span>
            <span className="summary-value wrong">
              {attempt.totalQuestions - attempt.correctAnswers}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Your Score</span>
            <span className="summary-value">{percentage}%</span>
          </div>
        </div>

        <button
          className="btn-toggle-answers"
          onClick={() => setShowAnswers(!showAnswers)}
        >
          {showAnswers ? 'Hide' : 'Show'} Detailed Answers
        </button>

        {showAnswers && (
          <div className="detailed-answers">
            <h3>Review Your Answers</h3>
            {questions.map((question, index) => {
              const userAnswer = attempt.answers[question._id];
              const correctAnswer = question.options.findIndex(opt => opt.isCorrect);
              const isCorrect = userAnswer === correctAnswer;

              return (
                <div key={question._id} className="answer-review-card">
                  <div className="review-header">
                    <span className="review-number">Question {index + 1}</span>
                    <span className={`review-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>

                  <p className="review-question">{question.questionText}</p>

                  <div className="review-options">
                    {question.options.map((option, optIndex) => {
                      const isUserAnswer = userAnswer === optIndex;
                      const isCorrectOption = option.isCorrect;

                      return (
                        <div
                          key={optIndex}
                          className={`review-option ${
                            isCorrectOption ? 'correct-answer' : ''
                          } ${isUserAnswer && !isCorrectOption ? 'wrong-answer' : ''}`}
                        >
                          <span className="option-letter">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span className="option-text">{option.text}</span>
                          {isUserAnswer && (
                            <span className="user-badge">Your answer</span>
                          )}
                          {isCorrectOption && (
                            <span className="correct-badge">✓</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {question.explanation && (
                    <div className="explanation-box">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="results-actions">
          <button className="btn-secondary" onClick={handleBackToDashboard}>
            Back to Dashboard
          </button>
          <button className="btn-secondary" onClick={handleBackToCategories}>
            Browse Exams
          </button>
          <button className="btn-primary" onClick={handleRetakeExam}>
            Retake Exam
          </button>
        </div>
      </div>
    </div>
  );
}

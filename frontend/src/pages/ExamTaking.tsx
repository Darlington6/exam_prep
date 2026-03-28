import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { examApi, type Exam, type Question } from '../api/client';
import { Footer } from '../components/Footer';
import '../styles/ExamTaking.css';

const WARN_THRESHOLDS = [
  { at: 300, msg: '⚠️ 5 minutes remaining — the exam will auto-submit when time runs out.' },
  { at: 120, msg: '⚠️ 2 minutes remaining — finish up soon!' },
  { at: 60,  msg: '⚠️ 1 minute remaining — auto-submitting in 60 seconds!' },
];

export function ExamTaking() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWarning, setShowWarning] = useState(false);     // incomplete submit warning
  const [showExitConfirm, setShowExitConfirm] = useState(false); // back button confirm
  const [timerAlert, setTimerAlert] = useState<string | null>(null); // countdown warnings
  const shownWarningsRef = useRef<Set<number>>(new Set());

  const loadExam = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [examRes, questionsRes] = await Promise.all([
        examApi.getById(examId || ''),
        examApi.getQuestions(examId || '')
      ]);
      setExam(examRes.data.exam);
      setQuestions(questionsRes.data.questions);
      setTimeRemaining(examRes.data.exam.duration * 60);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to load exam');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  // Force-submit: bypasses unanswered-question check (used on timer expiry)
  const forceSubmit = useCallback(async () => {
    try {
      const { data } = await examApi.submitAttempt(examId || '', answers);
      navigate(`/exam/${examId}/results`, { state: { attempt: data.attempt } });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Failed to submit exam');
    }
  }, [answers, examId, navigate]);

  // Regular submit: warns if questions unanswered
  const handleSubmit = useCallback(async () => {
    if (Object.keys(answers).length < questions.length) {
      setShowWarning(true);
      return;
    }
    await forceSubmit();
  }, [answers, questions.length, forceSubmit]);

  useEffect(() => {
    loadExam();
  }, [loadExam]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0 || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          forceSubmit();
          return 0;
        }
        const next = prev - 1;
        for (const { at, msg } of WARN_THRESHOLDS) {
          if (next <= at && !shownWarningsRef.current.has(at)) {
            shownWarningsRef.current.add(at);
            setTimerAlert(msg);
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, forceSubmit, questions.length]);

  // Auto-dismiss timer alert after 8 s
  useEffect(() => {
    if (!timerAlert) return;
    const id = setTimeout(() => setTimerAlert(null), 8000);
    return () => clearTimeout(id);
  }, [timerAlert]);

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers({ ...answers, [questions[currentQuestion]._id]: optionIndex });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="loading">Loading exam...</div>;

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button className="btn-primary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="error-state">
        <p>This exam has no questions yet. Please check back later.</p>
        <button className="btn-primary" onClick={() => navigate('/exams/categories')}>
          Back to Categories
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion] ?? questions[0];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="exam-taking-container">

      {/* Timer warning banner */}
      {timerAlert && (
        <div className="timer-warning-banner">
          {timerAlert}
          <button className="timer-warning-close" onClick={() => setTimerAlert(null)}>×</button>
        </div>
      )}

      <header className="exam-header">
        <div className="exam-header-left">
          <button
            className="btn-exit-exam"
            onClick={() => setShowExitConfirm(true)}
            title="Exit exam"
          >
            ← Exit
          </button>
          <div className="exam-info">
            <h1>{exam?.title}</h1>
            <span className="question-progress">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
        </div>
        <div className="exam-timer">
          <span className="timer-icon">⏱️</span>
          <span className={`timer-value ${timeRemaining < 300 ? 'warning' : ''}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </header>

      <div className="exam-content">
        <aside className="question-palette">
          <h3>Questions</h3>
          <div className="palette-grid">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`palette-btn ${index === currentQuestion ? 'active' : ''} ${
                  answers[questions[index]._id] !== undefined ? 'answered' : ''
                }`}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="palette-legend">
            <div className="legend-item">
              <span className="legend-dot answered" />
              <span>Answered</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" />
              <span>Not Answered</span>
            </div>
          </div>
        </aside>

        <main className="question-area">
          <div className="question-content">
            <h2 className="question-text">{question.questionText}</h2>
            <div className="options-list">
              {question.options.map((option, index) => (
                <label
                  key={index}
                  className={`option-label ${answers[question._id] === index ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${question._id}`}
                    checked={answers[question._id] === index}
                    onChange={() => handleAnswerSelect(index)}
                  />
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option.text}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="question-navigation">
            <button className="btn-nav" onClick={handlePrevious} disabled={currentQuestion === 0}>
              ← Previous
            </button>
            <div className="nav-info">{answeredCount} / {questions.length} answered</div>
            {currentQuestion < questions.length - 1 ? (
              <button className="btn-nav" onClick={handleNext}>Next →</button>
            ) : (
              <button className="btn-submit" onClick={handleSubmit}>Submit Exam</button>
            )}
          </div>
        </main>
      </div>

      {/* Incomplete-submit warning modal */}
      {showWarning && (
        <div className="modal-overlay" onClick={() => setShowWarning(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Incomplete Exam</h3>
            <p>
              You have answered {answeredCount} out of {questions.length} questions.
              Are you sure you want to submit?
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowWarning(false)}>
                Continue Exam
              </button>
              <button className="btn-danger" onClick={forceSubmit}>
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit confirmation modal */}
      {showExitConfirm && (
        <div className="modal-overlay" onClick={() => setShowExitConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Exit Exam?</h3>
            <p>
              Your progress will be lost and this attempt will not be recorded.
              Are you sure you want to leave?
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowExitConfirm(false)}>
                Stay in Exam
              </button>
              <button className="btn-danger" onClick={() => navigate(-1)}>
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

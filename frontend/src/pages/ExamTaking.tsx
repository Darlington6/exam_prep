import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { examApi, type Exam, type Question } from '../api/client';
import '../styles/ExamTaking.css';

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
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    loadExam();
  }, [examId]);

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const loadExam = async () => {
    try {
      setLoading(true);
      setError('');
      const [examRes, questionsRes] = await Promise.all([
        examApi.getById(examId || ''),
        examApi.getQuestions(examId || '')
      ]);
      setExam(examRes.data.exam);
      setQuestions(questionsRes.data.questions);
      setTimeRemaining(examRes.data.exam.duration * 60); // Convert to seconds
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion]._id]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuestionNavigate = (index: number) => {
    setCurrentQuestion(index);
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      setShowWarning(true);
      return;
    }

    try {
      const { data } = await examApi.submitAttempt(examId || '', answers);
      navigate(`/exam/${examId}/results`, { state: { attempt: data.attempt } });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit exam');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="loading">Loading exam...</div>;
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button className="btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="exam-taking-container">
      <header className="exam-header">
        <div className="exam-info">
          <h1>{exam?.title}</h1>
          <span className="question-progress">
            Question {currentQuestion + 1} of {questions.length}
          </span>
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
                onClick={() => handleQuestionNavigate(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="palette-legend">
            <div className="legend-item">
              <span className="legend-dot answered"></span>
              <span>Answered</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot"></span>
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
                  className={`option-label ${
                    answers[question._id] === index ? 'selected' : ''
                  }`}
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
            <button
              className="btn-nav"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              ← Previous
            </button>
            
            <div className="nav-info">
              {answeredCount} / {questions.length} answered
            </div>

            {currentQuestion < questions.length - 1 ? (
              <button className="btn-nav" onClick={handleNext}>
                Next →
              </button>
            ) : (
              <button className="btn-submit" onClick={handleSubmit}>
                Submit Exam
              </button>
            )}
          </div>
        </main>
      </div>

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
              <button className="btn-danger" onClick={handleSubmit}>
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

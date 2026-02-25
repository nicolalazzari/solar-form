import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts';
import styles from './EligibilityQuestionsPage.module.css';

const QUESTIONS = [
  {
    id: 'isOver75',
    question: 'Are you over 75 years old?',
    tooltip: 'This helps us arrange the most suitable appointment for your circumstances',
    disqualifyingAnswer: true,
  },
  {
    id: 'roofWorksPlanned',
    question: 'Do you have any roof works planned in the next 12 months?',
    disqualifyingAnswer: true,
  },
  {
    id: 'incomeOver15k',
    question: 'Is your annual household income over £15,000?',
    disqualifyingAnswer: false,
  },
  {
    id: 'likelyToPassCreditCheck',
    question: 'Do you think you would pass a credit check?',
    disqualifyingAnswer: false,
  },
];

export default function EligibilityQuestionsPage() {
  const navigate = useNavigate();
  const { setEligibilityData, updateBookingData, setJourneyStatus } = useBooking();

  const [answers, setAnswers] = useState({
    isOver75: null,
    roofWorksPlanned: null,
    incomeOver15k: null,
    likelyToPassCreditCheck: null,
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestionTooltip, setShowQuestionTooltip] = useState(false);

  useEffect(() => {
    setShowQuestionTooltip(false);
  }, [currentQuestionIndex]);

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));

    // Move to next question or check eligibility
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const checkEligibility = () => {
    for (const question of QUESTIONS) {
      const answer = answers[question.id];
      if (answer === question.disqualifyingAnswer) {
        return { eligible: false, reason: question.question };
      }
    }
    return { eligible: true, reason: '' };
  };

  const allQuestionsAnswered = Object.values(answers).every(a => a !== null);

  const handleContinue = () => {
    if (!allQuestionsAnswered) return;

    const { eligible, reason } = checkEligibility();

    setEligibilityData(answers);

    if (!eligible) {
      setJourneyStatus('disqualified_eligibility');
      updateBookingData({
        currentPage: '/confirmation',
        lastAction: 'eligibility_disqualified',
        lastActionPage: '/eligibility-questions',
      });
      navigate('/confirmation');
      return;
    }

    updateBookingData({
      currentPage: '/slot-selection',
      lastAction: 'eligibility_passed',
      lastActionPage: '/eligibility-questions',
    });

    navigate('/slot-selection');
  };

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + (answers[currentQuestion.id] !== null ? 1 : 0)) / QUESTIONS.length) * 100;

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      navigate('/solar-assessment');
    }
  };

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.backButton}
        onClick={handleBack}
      >
        <span className={styles.backIcon}>&#8592;</span>
        Back
      </button>

      <h1 className={styles.title}>A few quick questions</h1>

      <p className={styles.description}>
        We need to check a few things to ensure you're eligible for a solar installation.
      </p>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.questionCard}>
        <span className={styles.questionNumber}>
          Question {currentQuestionIndex + 1} of {QUESTIONS.length}
        </span>

        <div className={styles.questionRow}>
          <h2 className={styles.question}>{currentQuestion.question}</h2>
          {currentQuestion.tooltip && (
            <div className={styles.questionTooltipWrapper}>
              <button
                type="button"
                className={styles.questionInfoButton}
                onClick={() => setShowQuestionTooltip(!showQuestionTooltip)}
                onMouseEnter={() => setShowQuestionTooltip(true)}
                onMouseLeave={() => setShowQuestionTooltip(false)}
                aria-label={currentQuestion.tooltip}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M8 7V11M8 5V5.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              {showQuestionTooltip && (
                <div className={styles.questionTooltip}>
                  {currentQuestion.tooltip}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.answerButtons}>
          <button
            type="button"
            className={`${styles.answerButton} ${answers[currentQuestion.id] === true ? styles.selected : ''}`}
            onClick={() => handleAnswer(currentQuestion.id, true)}
          >
            Yes
          </button>

          <button
            type="button"
            className={`${styles.answerButton} ${answers[currentQuestion.id] === false ? styles.selected : ''}`}
            onClick={() => handleAnswer(currentQuestion.id, false)}
          >
            No
          </button>
        </div>
      </div>

      <div className={styles.answeredQuestions}>
        {QUESTIONS.slice(0, currentQuestionIndex).map((q, index) => (
          <div key={q.id} className={styles.answeredQuestion}>
            <span className={styles.answeredText}>{q.question}</span>
            <span className={styles.answeredValue}>
              {answers[q.id] ? 'Yes' : 'No'}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={styles.continueButton}
        onClick={handleContinue}
        disabled={!allQuestionsAnswered}
      >
        Continue
      </button>
    </div>
  );
}

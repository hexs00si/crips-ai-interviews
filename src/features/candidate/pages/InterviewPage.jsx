import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GridBackground } from '@/components/ui/aceternity/grid-background';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { InterviewQuestionView } from '../components/InterviewQuestionView';
import { TabSwitchWarningModal } from '../components/TabSwitchWarningModal';
import { Loader2, AlertCircle } from 'lucide-react';
import useCandidateStore from '@/stores/candidateStore';
import { useTabVisibility } from '@/hooks/useTabVisibility';

export function InterviewPage() {
  const navigate = useNavigate();
  const {
    session,
    interview,
    currentQuestion,
    setCurrentQuestion,
    updateSessionStatus,
    timerState,
    setTimerState,
    isTabActive,
    tabSwitchCount
  } = useCandidateStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Enable tab visibility tracking
  useTabVisibility();

  // Redirect if no session or check status
  useEffect(() => {
    if (!session || !interview) {
      navigate('/candidate');
      return;
    }

    console.log('[InterviewPage] Session status:', session.status);

    // If already completed, redirect to results
    if (session.status === 'completed') {
      console.log('[InterviewPage] → Interview completed, redirecting to results');
      navigate('/candidate/results', { replace: true });
      return;
    }

    // Update status to in_progress if not already
    if (session.status !== 'in_progress') {
      updateSessionStatus('in_progress');
    }
  }, [session, interview, navigate, updateSessionStatus]);

  // Pause timer when tab is not active
  useEffect(() => {
    if (!isTabActive && currentQuestion) {
      setShowTabWarning(true);
    }
  }, [isTabActive, currentQuestion]);

  // Load first question or resume from current question
  useEffect(() => {
    if (session && interview) {
      const startQuestionNumber = session.current_question_index || 0;
      setCurrentQuestionNumber(startQuestionNumber + 1);
      loadQuestion(startQuestionNumber + 1);
    }
  }, []);

  const loadQuestion = async (questionNumber) => {
    if (questionNumber > 6) {
      // Interview complete - navigate to results
      navigate('/candidate/results');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Determine difficulty based on question number
      let difficulty = 'easy';
      if (questionNumber <= 2) difficulty = 'easy';
      else if (questionNumber <= 4) difficulty = 'medium';
      else difficulty = 'hard';

      const response = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          questionNumber,
          difficulty
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load question');
      }

      setCurrentQuestion(data.question);
      setTimeRemaining(data.question.time_limit);
      setIsLoading(false);
    } catch (error) {
      console.error('Load question error:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (selectedAnswer, timeTaken, moveNext = false) => {
    // If moveNext is true, just load next question
    if (moveNext) {
      const nextQuestionNumber = currentQuestionNumber + 1;
      setCurrentQuestionNumber(nextQuestionNumber);
      await loadQuestion(nextQuestionNumber);
      return { success: true };
    }

    try {
      const response = await fetch('/api/ai/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responseId: currentQuestion.id,
          selectedAnswer,
          timeTaken
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit answer');
      }

      return {
        success: true,
        isCorrect: data.isCorrect,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation || currentQuestion.explanation,
        feedback: data.feedback
      };
    } catch (error) {
      console.error('Submit answer error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const handleResumeFromTabSwitch = () => {
    setShowTabWarning(false);
  };

  if (!session || !interview) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background with Grid and Beams */}
      <GridBackground className="absolute inset-0">
        <BackgroundBeams />
      </GridBackground>

      {/* Content Container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center space-y-4"
              >
                <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl p-12 text-center">
                  <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900">
                    Loading Question {currentQuestionNumber}...
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Generating AI-powered question for you
                  </p>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl p-8"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <h3 className="text-xl font-bold text-gray-900">Error Loading Question</h3>
                  <p className="text-gray-600">{error}</p>
                  <button
                    onClick={() => loadQuestion(currentQuestionNumber)}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            ) : currentQuestion ? (
              <motion.div
                key={`question-${currentQuestion.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <InterviewQuestionView
                  question={currentQuestion}
                  onSubmit={handleSubmitAnswer}
                  timeRemaining={timeRemaining}
                  onTimeUpdate={setTimeRemaining}
                  isTabActive={isTabActive}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Progress Indicator */}
          {!isLoading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center"
            >
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full">
                <span className="text-sm font-medium text-gray-700">
                  Question {currentQuestionNumber} of 6
                </span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-600">
                  {tabSwitchCount > 0 && `${tabSwitchCount} tab switch${tabSwitchCount > 1 ? 'es' : ''}`}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tab Switch Warning Modal */}
      <TabSwitchWarningModal
        isOpen={showTabWarning && !isTabActive}
        onResume={handleResumeFromTabSwitch}
      />
    </div>
  );
}
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { candidateInterview } from '@/data/candidateInterview';

export function InterviewQuestionView({ question, onSubmit, timeRemaining, onTimeUpdate }) {
  const { questionView } = candidateInterview;
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      onTimeUpdate(timeRemaining - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleAutoSubmit = async () => {
    if (isSubmitting || showFeedback) return;

    // Auto-submit with no answer selected
    await handleSubmit(selectedAnswer || 'A');
  };

  const handleSubmit = async (answer) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await onSubmit(answer, question.time_limit - timeRemaining);

      if (result.success) {
        setFeedback({
          isCorrect: result.isCorrect,
          correctAnswer: result.correctAnswer,
          explanation: result.explanation,
          feedback: result.feedback
        });
        setShowFeedback(true);
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSelect = (option) => {
    if (!showFeedback && !isSubmitting) {
      setSelectedAnswer(option);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percentage = (timeRemaining / question.time_limit) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium">
                {questionView.questionLabel} {question.question_number}/6
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.question_difficulty)} bg-white/20`}>
                {question.question_difficulty.toUpperCase()}
              </span>
            </div>

            {/* Timer */}
            <div className={`flex items-center space-x-2 ${getTimerColor()} bg-white px-4 py-2 rounded-full`}>
              <Clock className="w-5 h-5" />
              <span className="text-lg font-bold font-mono">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                timeRemaining / question.time_limit > 0.2 ? 'bg-white' : 'bg-red-300'
              }`}
              style={{
                width: `${(timeRemaining / question.time_limit) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 leading-relaxed">
            {question.question_text}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {Object.entries(question.options).map(([key, value]) => {
              const isSelected = selectedAnswer === key;
              const isCorrect = showFeedback && feedback?.correctAnswer === key;
              const isWrong = showFeedback && selectedAnswer === key && !feedback?.isCorrect;

              return (
                <motion.button
                  key={key}
                  onClick={() => handleAnswerSelect(key)}
                  disabled={showFeedback || isSubmitting}
                  whileHover={!showFeedback ? { scale: 1.02 } : {}}
                  whileTap={!showFeedback ? { scale: 0.98 } : {}}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isCorrect
                      ? 'border-green-500 bg-green-50'
                      : isWrong
                      ? 'border-red-500 bg-red-50'
                      : isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  } ${showFeedback || isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                        isCorrect
                          ? 'border-green-500 bg-green-500 text-white'
                          : isWrong
                          ? 'border-red-500 bg-red-500 text-white'
                          : isSelected
                          ? 'border-primary-500 bg-primary-500 text-white'
                          : 'border-gray-300 text-gray-600'
                      }`}
                    >
                      {key}
                    </div>
                    <span className="flex-1 text-gray-900">{value}</span>
                    {isCorrect && <CheckCircle className="w-6 h-6 text-green-500" />}
                    {isWrong && <XCircle className="w-6 h-6 text-red-500" />}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-lg border-2 ${
                feedback.isCorrect
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                {feedback.isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h4
                    className={`font-bold mb-2 ${
                      feedback.isCorrect ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {feedback.isCorrect ? questionView.correctLabel : questionView.incorrectLabel}
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">{feedback.feedback}</p>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">{questionView.explanationLabel}</p>
                    <p className="text-sm text-gray-900">{feedback.explanation}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          {!showFeedback && (
            <button
              onClick={() => handleSubmit(selectedAnswer || 'A')}
              disabled={!selectedAnswer || isSubmitting}
              className="w-full mt-6 px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? questionView.buttons.submitting : questionView.buttons.submit}
            </button>
          )}

          {/* Next Button */}
          {showFeedback && (
            <button
              onClick={() => onSubmit(null, null, true)} // Signal to move to next question
              className="w-full mt-6 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              {questionView.buttons.next}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
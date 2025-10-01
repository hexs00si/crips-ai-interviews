import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { PlayCircle, RefreshCw } from 'lucide-react';
import { candidateInterview } from '@/data/candidateInterview';

export function WelcomeBackModal({ isOpen, session, onResume, onRestart }) {
  const { welcomeBack } = candidateInterview;

  if (!session) return null;

  const completedQuestions = session.current_question_index || 0;
  const totalQuestions = 6;
  const progressPercentage = (completedQuestions / totalQuestions) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <PlayCircle className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {welcomeBack.title}
                </h2>
                <p className="text-gray-600">
                  {welcomeBack.subtitle.replace('{name}', session.candidate_name || 'there')}
                </p>
              </div>

              {/* Progress Info */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {welcomeBack.progressLabel}
                  </span>
                  <span className="text-sm font-bold text-primary-600">
                    {completedQuestions}/{totalQuestions} {welcomeBack.questionsLabel}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {/* Session Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{welcomeBack.labels.score}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {session.total_score || 0}/60
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{welcomeBack.labels.status}</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">
                      {session.status.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Message */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-sm text-blue-700">
                  {welcomeBack.infoMessage}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={onResume}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  <PlayCircle className="w-5 h-5" />
                  <span>{welcomeBack.buttons.resume}</span>
                </button>

                {completedQuestions === 0 && (
                  <button
                    onClick={onRestart}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>{welcomeBack.buttons.restart}</span>
                  </button>
                )}
              </div>

              {/* Help Text */}
              <p className="mt-4 text-xs text-center text-gray-500">
                {welcomeBack.helpText}
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
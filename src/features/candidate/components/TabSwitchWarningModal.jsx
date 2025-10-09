import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { AlertTriangle } from 'lucide-react';

export function TabSwitchWarningModal({ isOpen, onResume, tabSwitchCount = 0 }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Prevent clicks */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center pointer-events-auto"
            >
              {/* Icon with pulse animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-100 to-yellow-100 rounded-full mb-6 relative"
              >
                <AlertTriangle className="w-12 h-12 text-red-600" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-red-200 rounded-full opacity-30"
                />
              </motion.div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Interview Paused
              </h2>

              {/* Subtitle */}
              <p className="text-lg text-gray-700 font-medium mb-4">
                Tab Switch Detected
              </p>

              {/* Message */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                You switched away from the interview tab. The timer has been paused to ensure fairness.
              </p>

              {/* Tab Switch Counter */}
              {tabSwitchCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-red-700">
                    <span className="font-bold">Warning:</span> You have switched tabs{' '}
                    <span className="font-bold text-red-800">{tabSwitchCount}</span> time
                    {tabSwitchCount !== 1 ? 's' : ''} during this interview.
                  </p>
                </div>
              )}

              {/* Warning Note */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left rounded">
                <p className="text-sm text-yellow-800 leading-relaxed">
                  <span className="font-semibold block mb-1">⚠️ Important:</span>
                  Multiple tab switches may be flagged for review. Please stay focused on the interview tab to avoid any issues.
                </p>
              </div>

              {/* Resume Button with Icon */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onResume}
                className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span>Resume Interview</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </motion.button>

              {/* Help Text */}
              <p className="mt-6 text-xs text-gray-500 leading-relaxed">
                Click the button above to continue your interview. The timer will resume from where it was paused.
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

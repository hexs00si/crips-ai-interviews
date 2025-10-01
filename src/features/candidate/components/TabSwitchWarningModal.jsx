import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { AlertTriangle } from 'lucide-react';
import { candidateInterview } from '@/data/candidateInterview';

export function TabSwitchWarningModal({ isOpen, onResume }) {
  const { tabSwitchWarning } = candidateInterview;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
                <AlertTriangle className="w-10 h-10 text-yellow-600" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {tabSwitchWarning.title}
              </h2>

              {/* Message */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {tabSwitchWarning.message}
              </p>

              {/* Warning Note */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
                <p className="text-sm text-yellow-700">
                  <span className="font-semibold">{tabSwitchWarning.warningLabel}</span>{' '}
                  {tabSwitchWarning.warningText}
                </p>
              </div>

              {/* Resume Button */}
              <button
                onClick={onResume}
                className="w-full px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                {tabSwitchWarning.resumeButton}
              </button>

              {/* Help Text */}
              <p className="mt-4 text-xs text-gray-500">
                {tabSwitchWarning.helpText}
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
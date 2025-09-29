import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { profileData } from '@/data/profile';
import useAuth from '@/features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function ProfileActions() {
  const { deleteAccount, isLoading } = useAuth();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const navigate = useNavigate();

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmText.toLowerCase() !== 'delete') {
      return;
    }

    try {
      const result = await deleteAccount();

      if (result.success) {
        // Redirect to home page
        navigate('/');
      }
    } catch (err) {
      console.error('Account deletion error:', err);
    }
  };

  return (
    <>
      <div className="bg-red-50/50 backdrop-blur-sm rounded-xl shadow-lg border-2 border-red-200 p-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {profileData.sections.dangerZone.title}
          </h3>
          <p className="text-gray-600 mb-4">
            {profileData.sections.dangerZone.deleteWarning}
          </p>

          <button
            onClick={handleDeleteClick}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            {profileData.sections.dangerZone.deleteButton}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Delete Account
                </h3>
                <p className="text-gray-600 text-sm">
                  {profileData.messages.deleteConfirm}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="Type DELETE"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleConfirmDelete}
                  disabled={confirmText.toLowerCase() !== 'delete' || isLoading}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete Account</span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmText('');
                  }}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
import { motion } from 'framer-motion';
import { Users, Share2, Mail } from 'lucide-react';
import { interviewData } from '@/data/interviews';

export function InterviewDetailsEmpty({ interview }) {
  const { details } = interviewData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-12"
    >
      <div className="text-center max-w-2xl mx-auto">
        {/* Icon */}
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-10 h-10 text-gray-400" />
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {details.sessions.emptyState.title}
        </h2>
        <p className="text-gray-600 mb-8">
          {details.sessions.emptyState.message}
        </p>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to invite candidates:</h3>
          <div className="space-y-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  <strong>Copy the access code</strong> from the interview header above
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  <strong>Share the code</strong> with your candidates via email or messaging
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  <strong>Candidates enter the code</strong> on the interview platform to start their session
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                4
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  <strong>Track progress here</strong> as candidates complete their interviews
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-primary-500 transition-colors">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-6 h-6 text-primary-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Share Access Code</h4>
            <p className="text-sm text-gray-600">
              Copy and share the access code directly with candidates
            </p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-primary-500 transition-colors">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Email Invitations</h4>
            <p className="text-sm text-gray-600">
              Send automated email invitations with the access code
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
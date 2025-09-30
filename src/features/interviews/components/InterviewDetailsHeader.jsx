import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Briefcase, Calendar } from 'lucide-react';
import { interviewData } from '@/data/interviews';

export function InterviewDetailsHeader({ interview }) {
  const { details } = interviewData;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(interview.access_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusConfig = interviewData.card.statusBadges[interview.status] || interviewData.card.statusBadges.active;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-8 mb-8"
    >
      {/* Title and Status */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {interview.title}
            </h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                statusConfig.color === 'green'
                  ? 'bg-green-100 text-green-700'
                  : statusConfig.color === 'blue'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Created Date */}
        <div className="flex items-center text-gray-600 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Created on {formatDate(interview.created_at)}</span>
        </div>
      </div>

      {/* Access Code */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">{details.overview.accessCode}</p>
        <div className="flex items-center justify-between bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4">
          <code className="text-2xl font-bold text-primary-600">
            {interview.access_code}
          </code>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">{details.overview.copyCode}</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {details.overview.shareDescription}
        </p>
      </div>

      {/* Roles */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">{details.overview.rolesTitle}</p>
        <div className="flex flex-wrap gap-2">
          {interview.roles.map((role, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
            >
              <Briefcase className="w-4 h-4 mr-1" />
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* Custom Questions (if any) */}
      {interview.custom_questions && interview.custom_questions.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">{details.overview.customQuestionsTitle}</p>
          <div className="space-y-2">
            {interview.custom_questions.map((q, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <p className="text-sm text-gray-800 flex-1">{q.question}</p>
                  <span className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
                    q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    q.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
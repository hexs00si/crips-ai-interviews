import { useState } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import {
  Copy,
  Check,
  MoreVertical,
  Users,
  Calendar,
  Briefcase,
  Archive,
  ArchiveRestore,
  Trash2,
  Eye
} from 'lucide-react';
import { interviewData } from '@/data/interviews';

export function InterviewCard({ interview, onCopy, onView, onArchive, onUnarchive, onDelete }) {
  const { card } = interviewData;
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    const result = await onCopy(interview.access_code);
    if (result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMenuAction = (e, action) => {
    e.stopPropagation();
    setShowMenu(false);
    action();
  };

  const statusConfig = card.statusBadges[interview.status] || card.statusBadges.active;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 cursor-pointer"
      onClick={() => onView(interview.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
            {interview.title}
          </h3>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
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

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={handleMenuToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20"
              >
                <button
                  onClick={(e) => handleMenuAction(e, () => onView(interview.id))}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>{card.actions.view}</span>
                </button>
                {interview.status === 'archived' ? (
                  <button
                    onClick={(e) => handleMenuAction(e, () => onUnarchive(interview.id))}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ArchiveRestore className="w-4 h-4" />
                    <span>{card.actions.unarchive}</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleMenuAction(e, () => onArchive(interview.id))}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                    <span>{card.actions.archive}</span>
                  </button>
                )}
                <button
                  onClick={(e) => handleMenuAction(e, () => onDelete(interview.id))}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{card.actions.delete}</span>
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Access Code */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1">{card.labels.accessCode}</p>
        <div className="flex items-center justify-between bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-3">
          <code className="text-lg font-bold text-primary-600">
            {interview.access_code}
          </code>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-3 py-1 bg-white hover:bg-gray-50 rounded-md transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-600">
                  {card.actions.copied}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">
                  {card.actions.copy}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Roles */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">{card.labels.roles}</p>
        <div className="flex flex-wrap gap-2">
          {interview.roles.slice(0, 3).map((role, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
            >
              <Briefcase className="w-3 h-3 mr-1" />
              {role}
            </span>
          ))}
          {interview.roles.length > 3 && (
            <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              +{interview.roles.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">{card.labels.sessions}</p>
            <p className="text-lg font-bold text-gray-900">
              {interview.sessionCount || 0}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">{card.labels.created}</p>
            <p className="text-sm font-medium text-gray-700">
              {formatDate(interview.created_at)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
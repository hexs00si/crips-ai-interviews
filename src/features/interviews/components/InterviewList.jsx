import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { InterviewCard } from './InterviewCard';
import { interviewData } from '@/data/interviews';
import useInterviews from '@/features/interviews/hooks/useInterviews';

export function InterviewList({ interviews, onInterviewClick }) {
  const {
    copyAccessCode,
    archiveInterview,
    unarchiveInterview,
    deleteInterview
  } = useInterviews();

  const { list } = interviewData;

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Filter interviews
  const filteredInterviews = useMemo(() => {
    let filtered = [...interviews];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (interview) =>
          interview.title.toLowerCase().includes(query) ||
          interview.access_code.toLowerCase().includes(query) ||
          interview.roles.some((role) => role.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((interview) => interview.status === statusFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'sessions':
        filtered.sort((a, b) => (b.sessionCount || 0) - (a.sessionCount || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [interviews, searchQuery, sortBy, statusFilter]);

  const handleCopy = async (accessCode) => {
    return await copyAccessCode(accessCode);
  };

  const handleArchive = async (interviewId) => {
    await archiveInterview(interviewId);
  };

  const handleUnarchive = async (interviewId) => {
    await unarchiveInterview(interviewId);
  };

  const handleDeleteClick = (interviewId) => {
    setShowDeleteConfirm(interviewId);
  };

  const handleDeleteConfirm = async () => {
    if (showDeleteConfirm) {
      await deleteInterview(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{list.title}</h2>
        <p className="text-gray-600">{list.subtitle}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={list.searchPlaceholder}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            {list.sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            <option value="all">{list.filters.all}</option>
            <option value="active">{list.filters.active}</option>
            <option value="completed">{list.filters.completed}</option>
            <option value="archived">{list.filters.archived}</option>
          </select>
        </div>
      </div>

      {/* Interview Grid */}
      {filteredInterviews.length === 0 ? (
        <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100">
          <p className="text-xl font-semibold text-gray-900 mb-2">
            {list.emptySearch.title}
          </p>
          <p className="text-gray-600">{list.emptySearch.message}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInterviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              onCopy={handleCopy}
              onView={onInterviewClick}
              onArchive={handleArchive}
              onUnarchive={handleUnarchive}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleDeleteCancel}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {interviewData.card.confirmDelete.title}
            </h3>
            <p className="text-gray-600 mb-6">
              {interviewData.card.confirmDelete.message}
            </p>

            <div className="flex space-x-4">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
              >
                {interviewData.card.confirmDelete.cancel}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                {interviewData.card.confirmDelete.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
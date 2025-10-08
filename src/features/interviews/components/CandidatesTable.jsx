import { useState, useMemo } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Search, Filter, ChevronDown, Mail, Calendar, Award, FileText, Eye, EyeOff } from 'lucide-react';
import { interviewData } from '@/data/interviews';

export function CandidatesTable({ sessions }) {
  const { details } = interviewData;
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedSummaries, setExpandedSummaries] = useState({});

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (session) =>
          session.candidate_name?.toLowerCase().includes(query) ||
          session.candidate_email?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((session) => session.status === statusFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'score':
        filtered.sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
        break;
      case 'name':
        filtered.sort((a, b) => (a.candidate_name || '').localeCompare(b.candidate_name || ''));
        break;
      default:
        break;
    }

    return filtered;
  }, [sessions, searchQuery, sortBy, statusFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
      in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
      not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-700' }
    };
    return statusMap[status] || statusMap.not_started;
  };

  const getScoreBadge = (totalScore) => {
    if (totalScore == null) return { color: 'text-gray-400', label: 'N/A' };
    // Convert total_score (0-60) to percentage for color coding
    const percentage = Math.round((totalScore / 60) * 100);
    if (percentage >= 80) return { color: 'text-green-600', label: `${totalScore}/60` };
    if (percentage >= 60) return { color: 'text-yellow-600', label: `${totalScore}/60` };
    return { color: 'text-red-600', label: `${totalScore}/60` };
  };

  const toggleSummary = (sessionId) => {
    setExpandedSummaries(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{details.sessions.title}</h2>
        <p className="text-gray-600">View and manage candidate interview sessions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={details.sessions.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            {details.sessions.sortOptions.map((option) => (
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            <option value="all">{details.sessions.statusFilter.all}</option>
            <option value="completed">{details.sessions.statusFilter.completed}</option>
            <option value="in_progress">{details.sessions.statusFilter.inProgress}</option>
            <option value="not_started">{details.sessions.statusFilter.notStarted}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No sessions match your filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  {details.sessions.columns.candidate}
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  {details.sessions.columns.email}
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  {details.sessions.columns.status}
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  {details.sessions.columns.score}
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  {details.sessions.columns.started}
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  {details.sessions.columns.completed}
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  {details.sessions.columns.aiSummary}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSessions.map((session) => {
                const statusBadge = getStatusBadge(session.status);
                const scoreBadge = getScoreBadge(session.total_score);
                const isExpanded = expandedSummaries[session.id];
                const hasSummary = session.ai_summary && session.ai_summary.trim().length > 0;

                return (
                  <tr
                    key={session.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                          {session.candidate_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{session.candidate_name || 'Anonymous'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{session.candidate_email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span className={`text-lg font-bold ${scoreBadge.color}`}>
                          {scoreBadge.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(session.created_at)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">
                        {formatDate(session.completed_at)}
                      </span>
                    </td>
                    <td className="py-4 px-4 max-w-md">
                      {hasSummary ? (
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <FileText className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {isExpanded ? session.ai_summary : truncateText(session.ai_summary, 100)}
                              </p>
                              {session.ai_summary.length > 100 && (
                                <button
                                  onClick={() => toggleSummary(session.id)}
                                  className="mt-1 text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                                >
                                  {isExpanded ? (
                                    <>
                                      <EyeOff className="w-3 h-3" />
                                      <span>Show Less</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-3 h-3" />
                                      <span>Show More</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Not available</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Results Count */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
        Showing {filteredSessions.length} of {sessions.length} session{sessions.length !== 1 ? 's' : ''}
      </div>
    </motion.div>
  );
}
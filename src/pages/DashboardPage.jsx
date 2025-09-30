import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Briefcase, Activity, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { GridBackground } from '@/components/ui/aceternity/grid-background';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { DashboardEmpty } from '@/features/interviews/components/DashboardEmpty';
import { InterviewList } from '@/features/interviews/components/InterviewList';
import { CreateInterviewModal } from '@/features/interviews/components/CreateInterviewModal';
import useInterviews from '@/features/interviews/hooks/useInterviews';
import { dashboardData } from '@/data/dashboard';

export function DashboardPage() {
  const navigate = useNavigate();
  const { interviews, hasInterviews, isLoading, getInterviewStats, error, loadInterviews } = useInterviews();
  const { header, stats } = dashboardData;

  const [showCreateModal, setShowCreateModal] = useState(false);

  const interviewStats = getInterviewStats();

  // Load interviews once on mount only - no re-renders on tab switch
  useEffect(() => {
    if (interviews.length === 0 && !isLoading) {
      loadInterviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount


  const iconMap = {
    briefcase: Briefcase,
    activity: Activity,
    users: Users,
    checkCircle: CheckCircle
  };

  const statsValues = {
    total: interviewStats.total,
    active: interviewStats.active,
    sessions: interviewStats.totalSessions,
    completed: interviewStats.totalCompleted
  };

  const handleInterviewClick = (interviewId) => {
    navigate(`/dashboard/interview/${interviewId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state - Check if it's a "table not found" error
  if (error && error.includes('table')) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <GridBackground className="absolute inset-0">
          <BackgroundBeams />
        </GridBackground>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-sm border-2 border-yellow-200 rounded-xl p-8 max-w-2xl shadow-2xl"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Database Setup Required</h2>
                <p className="text-gray-700 mb-4">
                  The interview database tables haven't been created yet. Please run the SQL schema script to set up your database.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Quick Setup:</p>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                    <li>Open your Supabase Dashboard</li>
                    <li>Go to SQL Editor</li>
                    <li>Copy and paste the contents of <code className="bg-gray-200 px-1 rounded">/database/schema.sql</code></li>
                    <li>Click "Run" to execute the script</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>

                <div className="flex space-x-3">
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center font-semibold"
                  >
                    Open Supabase Dashboard
                  </a>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show generic error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <GridBackground className="absolute inset-0">
        <BackgroundBeams />
      </GridBackground>

      {/* Content */}
      <div className="relative z-10 min-h-screen pt-40 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!hasInterviews ? (
            /* Empty State */
            <DashboardEmpty onCreateClick={() => setShowCreateModal(true)} />
          ) : (
            /* Dashboard with Interviews */
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
              >
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {header.title}
                  </h1>
                  <p className="text-gray-600">{header.subtitle}</p>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 md:mt-0"
                >
                  <RainbowButton
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>{header.createButton}</span>
                  </RainbowButton>
                </motion.div>
              </motion.div>

              {/* Stats Cards */}
              {stats.enabled && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                  {stats.cards.map((card, index) => {
                    const Icon = iconMap[card.icon];
                    const value = statsValues[card.id];

                    return (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">{card.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{value}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Interview List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <InterviewList
                  interviews={interviews}
                  onInterviewClick={handleInterviewClick}
                />
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Create Interview Modal */}
      <CreateInterviewModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
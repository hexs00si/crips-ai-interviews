import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { interviewData } from '@/data/interviews';

export function InterviewStats({ interview, sessions }) { // eslint-disable-line no-unused-vars
  const { details } = interviewData;

  // Calculate statistics
  const totalSessions = sessions?.length || 0;
  const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0;
  const inProgressSessions = sessions?.filter(s => s.status === 'in_progress').length || 0;

  // Calculate average score from completed sessions
  const completedWithScores = sessions?.filter(s => s.status === 'completed' && s.total_score != null) || [];
  const averageScore = completedWithScores.length > 0
    ? Math.round(completedWithScores.reduce((sum, s) => sum + s.total_score, 0) / completedWithScores.length)
    : 0;

  const stats = [
    {
      id: 'total',
      label: details.overview.stats.totalSessions,
      value: totalSessions,
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'completed',
      label: details.overview.stats.completed,
      value: completedSessions,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'inProgress',
      label: details.overview.stats.inProgress,
      value: inProgressSessions,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'average',
      label: details.overview.stats.averageScore,
      value: averageScore > 0 ? `${averageScore}%` : 'N/A',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-8"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{details.overview.statsTitle}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 truncate">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
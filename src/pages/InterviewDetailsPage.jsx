import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { GridBackground } from '@/components/ui/aceternity/grid-background';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { InterviewDetailsHeader } from '@/features/interviews/components/InterviewDetailsHeader';
import { InterviewStats } from '@/features/interviews/components/InterviewStats';
import { CandidatesTable } from '@/features/interviews/components/CandidatesTable';
import { InterviewDetailsEmpty } from '@/features/interviews/components/InterviewDetailsEmpty';
import useInterviews from '@/features/interviews/hooks/useInterviews';

export function InterviewDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentInterview, sessions, isLoading, error, loadInterview, loadSessions } = useInterviews();

  // Load interview and sessions on mount
  useEffect(() => {
    if (id) {
      loadInterview(id);
      loadSessions(id);
    }
  }, [id, loadInterview, loadSessions]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (error || !currentInterview) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">Interview Not Found</h2>
          <p className="text-red-700 mb-4">{error || 'This interview does not exist or you do not have access to it.'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const hasSessions = sessions && sessions.length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <GridBackground className="absolute inset-0">
        <BackgroundBeams />
      </GridBackground>

      {/* Content */}
      <div className="relative z-10 min-h-screen pt-40 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          {/* Interview Header */}
          <InterviewDetailsHeader interview={currentInterview} />

          {/* Statistics */}
          <InterviewStats interview={currentInterview} sessions={sessions} />

          {/* Candidates Section */}
          {hasSessions ? (
            <CandidatesTable sessions={sessions} />
          ) : (
            <InterviewDetailsEmpty interview={currentInterview} />
          )}
        </div>
      </div>
    </div>
  );
}
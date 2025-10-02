import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { GridBackground } from '@/components/ui/aceternity/grid-background';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { InterviewResults } from '../components/InterviewResults';
import { Loader2, AlertCircle, Home } from 'lucide-react';
import useCandidateStore from '@/stores/candidateStore';
import { supabase } from '@/lib/supabase';

export function ResultsPage() {
  const navigate = useNavigate();
  const { session, interview } = useCandidateStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [metrics, setMetrics] = useState(null);

  // Redirect if no session
  useEffect(() => {
    console.log('[ResultsPage] Mounted with session:', session?.id);

    if (!session || !interview) {
      console.log('[ResultsPage] No session, redirecting to /candidate');
      navigate('/candidate');
      return;
    }

    loadResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, interview, navigate]);

  const loadResults = async () => {
    console.log('[ResultsPage] Loading results for session:', session?.id);
    setIsLoading(true);
    setError(null);

    try {
      // First, get all responses for this session
      console.log('[ResultsPage] Fetching responses from database...');
      const { data: responsesData, error: responsesError } = await supabase
        .from('interview_responses')
        .select('*')
        .eq('session_id', session.id)
        .order('question_number', { ascending: true });

      if (responsesError) {
        console.error('[ResultsPage] Responses query error:', responsesError);
        throw responsesError;
      }

      console.log('[ResultsPage] Found', responsesData?.length, 'responses');

      // Parse JSON fields if they are strings
      const parsedResponses = responsesData.map(response => {
        try {
          return {
            ...response,
            question_metadata: typeof response.question_metadata === 'string'
              ? JSON.parse(response.question_metadata)
              : response.question_metadata
          };
        } catch (_e) {
          console.warn('[ResultsPage] Could not parse question_metadata for response:', response.id);
          return response;
        }
      });

      console.log('[ResultsPage] Parsed responses:', parsedResponses);
      setResponses(parsedResponses);

      // Check if all questions are answered
      const answeredCount = responsesData.filter(r => r.candidate_answer).length;

      if (answeredCount < 6) {
        throw new Error(`Interview incomplete. Only ${answeredCount}/6 questions answered.`);
      }

      // Generate AI summary if not already generated
      if (!session.ai_summary) {
        console.log('[ResultsPage] Generating AI summary...');
        const summaryResponse = await fetch('/api/ai/generate-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session.id
          })
        });

        const summaryData = await summaryResponse.json();

        console.log('[ResultsPage] Summary response:', summaryData);

        if (!summaryData.success) {
          throw new Error(summaryData.error || 'Failed to generate summary');
        }

        setSummary(summaryData.summary);
        setMetrics(summaryData.metrics);

        // Update session with completion
        await useCandidateStore.getState().updateSessionStatus('completed');
      } else {
        console.log('[ResultsPage] Using existing summary from session');
        // Use existing summary
        setSummary(session.ai_summary);

        // Calculate metrics from responses
        const totalScore = responsesData.reduce((sum, r) => sum + (r.ai_score || 0), 0);
        const maxScore = 60;
        const percentage = Math.round((totalScore / maxScore) * 100);

        const easyQuestions = responsesData.filter(r => r.question_difficulty === 'easy');
        const mediumQuestions = responsesData.filter(r => r.question_difficulty === 'medium');
        const hardQuestions = responsesData.filter(r => r.question_difficulty === 'hard');

        const avgTimeTaken = Math.round(
          responsesData.reduce((sum, r) => sum + (r.time_taken || 0), 0) / responsesData.length
        );

        setMetrics({
          totalScore,
          maxScore,
          percentage,
          breakdown: {
            easy: {
              correct: easyQuestions.filter(r => r.ai_score === 10).length,
              score: easyQuestions.reduce((sum, r) => sum + (r.ai_score || 0), 0),
              total: 20
            },
            medium: {
              correct: mediumQuestions.filter(r => r.ai_score === 10).length,
              score: mediumQuestions.reduce((sum, r) => sum + (r.ai_score || 0), 0),
              total: 20
            },
            hard: {
              correct: hardQuestions.filter(r => r.ai_score === 10).length,
              score: hardQuestions.reduce((sum, r) => sum + (r.ai_score || 0), 0),
              total: 20
            }
          },
          avgTimeTaken
        });
      }

      console.log('[ResultsPage] ========== RESULTS LOADED SUCCESSFULLY ==========');
      console.log('[ResultsPage] Final state:', {
        responsesCount: parsedResponses.length,
        metricsCalculated: !!metrics,
        summaryGenerated: !!summary,
        sessionStatus: session.status
      });
      setIsLoading(false);
    } catch (error) {
      console.error('[ResultsPage] ========== LOAD RESULTS ERROR ==========');
      console.error('[ResultsPage] Error:', error);
      console.error('[ResultsPage] Error message:', error.message);
      console.error('[ResultsPage] Error stack:', error.stack);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleBackHome = () => {
    // Clear session and go to landing
    useCandidateStore.getState().clearSession();
    navigate('/');
  };

  if (!session || !interview) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background with Grid and Beams */}
      <GridBackground className="absolute inset-0">
        <BackgroundBeams />
      </GridBackground>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl p-12 text-center">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900">
                  Generating Your Results...
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Our AI is analyzing your performance
                </p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl p-8 max-w-2xl mx-auto"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h3 className="text-xl font-bold text-gray-900">Error Loading Results</h3>
                <p className="text-gray-600">{error}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={loadResults}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleBackHome}
                    className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    <Home className="w-5 h-5 inline mr-2" />
                    Back to Home
                  </button>
                </div>
              </div>
            </motion.div>
          ) : responses && metrics ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <InterviewResults
                session={session}
                responses={responses}
                summary={summary}
                metrics={metrics}
              />

              {/* Back to Home Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-8"
              >
                <button
                  onClick={handleBackHome}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-white/80 hover:bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold transition-colors shadow-lg"
                >
                  <Home className="w-5 h-5" />
                  <span>Back to Home</span>
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl p-8 max-w-2xl mx-auto text-center"
            >
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Results Not Ready</h3>
              <p className="text-gray-600 mb-6">
                Your interview results are still being processed. Please wait a moment and refresh.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
              >
                Refresh Page
              </button>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12"
          >
            <p className="text-sm text-white/80">
              Powered by{' '}
              <span className="font-semibold text-primary-400">
                Crisp AI Interviews
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
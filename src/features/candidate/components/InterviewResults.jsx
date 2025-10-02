import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Trophy, CheckCircle, XCircle, Clock, TrendingUp, Download } from 'lucide-react';
import { candidateInterview } from '@/data/candidateInterview';

export function InterviewResults({ session, responses, summary, metrics }) {
  const { results } = candidateInterview;

  console.log('[InterviewResults] Rendering with props:', {
    session: !!session,
    responsesCount: responses?.length,
    summary: !!summary,
    metrics: !!metrics,
    metricsData: metrics
  });

  // Defensive checks
  if (!results) {
    console.error('[InterviewResults] Results config missing from candidateInterview data');
    return <div>Configuration error: Results data missing</div>;
  }

  if (!session) {
    console.error('[InterviewResults] Session prop is missing');
    return <div>Error: Session data missing</div>;
  }

  if (!responses || responses.length === 0) {
    console.error('[InterviewResults] Responses prop is missing or empty');
    return <div>Error: No responses found</div>;
  }

  if (!metrics) {
    console.error('[InterviewResults] Metrics prop is missing');
    return <div>Error: Metrics data missing</div>;
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 55) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (percentage) => {
    if (percentage >= 85) return 'bg-green-50 border-green-200';
    if (percentage >= 70) return 'bg-blue-50 border-blue-200';
    if (percentage >= 55) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const percentage = metrics?.percentage || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-5xl mx-auto space-y-6"
    >
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
          <Trophy className="w-10 h-10 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {results.title}
        </h1>
        <p className="text-gray-600 mb-6">
          {results.subtitle.replace('{name}', session?.candidate_name || 'Candidate')}
        </p>

        {/* Score Display */}
        <div className={`inline-block p-8 rounded-xl border-2 ${getScoreBg(percentage)}`}>
          <p className="text-sm text-gray-600 mb-2">{results.labels.finalScore}</p>
          <p className={`text-6xl font-bold ${getScoreColor(percentage)}`}>
            {metrics?.totalScore || 0}/{metrics?.maxScore || 60}
          </p>
          <p className={`text-2xl font-semibold mt-2 ${getScoreColor(percentage)}`}>
            {percentage}%
          </p>
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {results.breakdown.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Easy */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-green-900">
                {results.breakdown.easy}
              </h3>
              <span className="text-2xl font-bold text-green-600">
                {metrics?.breakdown?.easy?.correct || 0}/2
              </span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{
                  width: `${((metrics?.breakdown?.easy?.correct || 0) / 2) * 100}%`
                }}
              />
            </div>
            <p className="text-sm text-green-700 mt-2">
              {metrics?.breakdown?.easy?.score || 0}/{metrics?.breakdown?.easy?.total || 20} points
            </p>
          </div>

          {/* Medium */}
          <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-yellow-900">
                {results.breakdown.medium}
              </h3>
              <span className="text-2xl font-bold text-yellow-600">
                {metrics?.breakdown?.medium?.correct || 0}/2
              </span>
            </div>
            <div className="w-full bg-yellow-200 rounded-full h-3">
              <div
                className="bg-yellow-600 h-3 rounded-full transition-all"
                style={{
                  width: `${((metrics?.breakdown?.medium?.correct || 0) / 2) * 100}%`
                }}
              />
            </div>
            <p className="text-sm text-yellow-700 mt-2">
              {metrics?.breakdown?.medium?.score || 0}/{metrics?.breakdown?.medium?.total || 20} points
            </p>
          </div>

          {/* Hard */}
          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-red-900">
                {results.breakdown.hard}
              </h3>
              <span className="text-2xl font-bold text-red-600">
                {metrics?.breakdown?.hard?.correct || 0}/2
              </span>
            </div>
            <div className="w-full bg-red-200 rounded-full h-3">
              <div
                className="bg-red-600 h-3 rounded-full transition-all"
                style={{
                  width: `${((metrics?.breakdown?.hard?.correct || 0) / 2) * 100}%`
                }}
              />
            </div>
            <p className="text-sm text-red-700 mt-2">
              {metrics?.breakdown?.hard?.score || 0}/{metrics?.breakdown?.hard?.total || 20} points
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {responses?.filter(r => r.ai_score === 10).length || 0}
            </p>
            <p className="text-sm text-gray-600">{results.stats.correct}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {responses?.filter(r => r.ai_score === 0).length || 0}
            </p>
            <p className="text-sm text-gray-600">{results.stats.incorrect}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {metrics?.avgTimeTaken || 0}s
            </p>
            <p className="text-sm text-gray-600">{results.stats.avgTime}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
            <p className="text-sm text-gray-600">{results.stats.accuracy}</p>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      {summary && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {results.summary.title}
          </h2>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {summary}
          </div>
        </div>
      )}

      {/* Question Review */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {results.review.title}
        </h2>
        <div className="space-y-4">
          {responses?.map((response, index) => {
            const isCorrect = response.ai_score === 10;
            const options = response.question_metadata?.options || {};
            const correctAnswer = response.question_metadata?.correct_answer;

            return (
              <div
                key={response.id}
                className={`border rounded-lg p-6 ${
                  isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-semibold text-gray-600">
                        Question {response.question_number}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          response.question_difficulty === 'easy'
                            ? 'bg-green-100 text-green-700'
                            : response.question_difficulty === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {response.question_difficulty.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 mb-2">
                      {response.question_text}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                        {results.review.yourAnswer}: <span className="font-semibold">{response.candidate_answer}</span>
                      </span>
                      {!isCorrect && (
                        <span className="text-green-700">
                          {results.review.correctAnswer}: <span className="font-semibold">{correctAnswer}</span>
                        </span>
                      )}
                      <span className="text-gray-600">
                        {response.time_taken}s
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {isCorrect ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-600" />
                    )}
                  </div>
                </div>

                {response.ai_feedback && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-700">{response.ai_feedback}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-600 mb-6">
          {results.completion.message}
        </p>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
        >
          <Download className="w-5 h-5" />
          <span>{results.completion.downloadButton}</span>
        </button>
        <p className="mt-4 text-xs text-gray-500">
          {results.completion.nextSteps}
        </p>
      </div>
    </motion.div>
  );
}
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * API Route: Generate Interview Summary
 * POST /api/ai/generate-summary
 *
 * Creates comprehensive AI assessment summary for completed interview
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: sessionId'
    });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  try {
    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*, interview:interviews(*)')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Get all responses
    const { data: responses, error: responsesError } = await supabase
      .from('interview_responses')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_number', { ascending: true });

    if (responsesError) {
      throw responsesError;
    }

    // Check if all questions are answered
    const totalQuestions = 6;
    const answeredQuestions = responses.filter(r => r.candidate_answer).length;

    if (answeredQuestions < totalQuestions) {
      return res.status(400).json({
        success: false,
        error: `Interview incomplete. ${answeredQuestions}/${totalQuestions} questions answered.`
      });
    }

    // Calculate performance metrics
    const easyQuestions = responses.filter(r => r.question_difficulty === 'easy');
    const mediumQuestions = responses.filter(r => r.question_difficulty === 'medium');
    const hardQuestions = responses.filter(r => r.question_difficulty === 'hard');

    const easyScore = easyQuestions.reduce((sum, r) => sum + (r.ai_score || 0), 0);
    const mediumScore = mediumQuestions.reduce((sum, r) => sum + (r.ai_score || 0), 0);
    const hardScore = hardQuestions.reduce((sum, r) => sum + (r.ai_score || 0), 0);

    const easyCorrect = easyQuestions.filter(r => r.ai_score === 10).length;
    const mediumCorrect = mediumQuestions.filter(r => r.ai_score === 10).length;
    const hardCorrect = hardQuestions.filter(r => r.ai_score === 10).length;

    const totalScore = session.total_score || 0;
    const maxScore = 60; // 6 questions × 10 points each
    const percentage = Math.round((totalScore / maxScore) * 100);

    // Calculate average time taken
    const avgTimeTaken = Math.round(
      responses.reduce((sum, r) => sum + (r.time_taken || 0), 0) / responses.length
    );

    // Generate detailed summary using Gemini
    const roles = session.interview?.roles?.join(', ') || 'Full Stack Developer';

    const summaryPrompt = `You are an expert technical interviewer providing a comprehensive assessment summary.

Candidate: ${session.candidate_name || 'Candidate'}
Position: ${roles}
Total Score: ${totalScore}/${maxScore} (${percentage}%)

Performance Breakdown:
- Easy Questions (2): ${easyCorrect}/2 correct, ${easyScore}/20 points
- Medium Questions (2): ${mediumCorrect}/2 correct, ${mediumScore}/20 points
- Hard Questions (2): ${hardCorrect}/2 correct, ${hardScore}/20 points

Average Time Per Question: ${avgTimeTaken} seconds

Individual Question Performance:
${responses.map((r, i) =>
  `${i + 1}. ${r.question_difficulty.toUpperCase()} - ${r.ai_score}/10 points (${r.time_taken}s)`
).join('\n')}

Provide a comprehensive assessment with:

1. **Overall Assessment** (3-4 sentences)
   - Evaluate the candidate's technical competency for the ${roles} position
   - Comment on their performance across different difficulty levels
   - Mention their time management and problem-solving approach

2. **Key Strengths** (2-3 bullet points)
   - Highlight specific areas where the candidate performed well
   - Be specific about technical concepts they demonstrated mastery of

3. **Areas for Improvement** (2-3 bullet points)
   - Identify knowledge gaps or concepts needing reinforcement
   - Be constructive and specific about what to study

4. **Final Recommendation**
   - Choose one: "Highly Recommended" (85%+), "Recommended" (70-84%), "Recommended with Reservations" (55-69%), or "Not Recommended" (<55%)
   - Provide a one-sentence justification

Keep the tone professional, balanced, and constructive. Format with clear markdown sections.`;

    const result = await model.generateContent(summaryPrompt);
    const response = await result.response;
    const aiSummary = response.text().trim();

    // Update session with completion status
    const { data: updatedSession, error: updateError } = await supabase
      .from('interview_sessions')
      .update({
        status: 'completed',
        ai_summary: aiSummary,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({
      success: true,
      session: updatedSession,
      summary: aiSummary,
      metrics: {
        totalScore,
        maxScore,
        percentage,
        breakdown: {
          easy: { correct: easyCorrect, score: easyScore, total: 20 },
          medium: { correct: mediumCorrect, score: mediumScore, total: 20 },
          hard: { correct: hardCorrect, score: hardScore, total: 20 }
        },
        avgTimeTaken
      }
    });
  } catch (error) {
    console.error('Generate summary error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate summary',
      details: error.message
    });
  }
}
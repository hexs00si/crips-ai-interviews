import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * API Route: Submit Answer and Get AI Evaluation
 * POST /api/ai/submit-answer
 *
 * Evaluates candidate's answer and provides feedback using Gemini AI
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { responseId, selectedAnswer, timeTaken } = req.body;

  if (!responseId || !selectedAnswer) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: responseId, selectedAnswer'
    });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  try {
    // Get the question details
    const { data: response, error: responseError } = await supabase
      .from('interview_responses')
      .select('*')
      .eq('id', responseId)
      .single();

    if (responseError || !response) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // Parse question data from JSON string
    let questionData;
    try {
      questionData = JSON.parse(response.question_text);
    } catch (parseError) {
      console.error('Failed to parse question data:', parseError);
      return res.status(500).json({
        success: false,
        error: 'Question data is corrupted'
      });
    }

    // Extract correct answer from parsed data
    const correctAnswer = questionData.correct_answer;
    const options = questionData.options;
    const explanation = questionData.explanation;
    const questionText = questionData.question;

    if (!correctAnswer || !options) {
      return res.status(500).json({
        success: false,
        error: 'Question metadata is incomplete'
      });
    }

    // Calculate if answer is correct
    const isCorrect = selectedAnswer.toUpperCase() === correctAnswer;
    const aiScore = isCorrect ? 10 : 0;

    // Generate AI feedback using Gemini
    const feedbackPrompt = `You are a technical interviewer providing constructive feedback.

Question: ${questionText}
Difficulty: ${response.question_difficulty}

Options:
A: ${options.A}
B: ${options.B}
C: ${options.C}
D: ${options.D}

Correct Answer: ${correctAnswer}
Candidate's Answer: ${selectedAnswer}

The candidate's answer is ${isCorrect ? 'CORRECT' : 'INCORRECT'}.

Provide brief, constructive feedback (2-3 sentences) that:
1. ${isCorrect ? 'Confirms why the answer is correct and reinforces the concept' : 'Explains why the answer is incorrect and what the correct approach should be'}
2. ${isCorrect ? 'Mentions one key insight or best practice related to this concept' : 'Helps the candidate understand the correct concept without being discouraging'}

Keep the tone professional, educational, and encouraging.`;

    const feedbackResult = await model.generateContent(feedbackPrompt);
    const feedbackResponse = await feedbackResult.response;
    const aiFeedback = feedbackResponse.text().trim();

    // Update response in database
    const { data: updatedResponse, error: updateError } = await supabase
      .from('interview_responses')
      .update({
        candidate_answer: selectedAnswer.toUpperCase(),
        time_taken: timeTaken || 0,
        ai_score: aiScore,
        ai_feedback: aiFeedback,
        answered_at: new Date().toISOString()
      })
      .eq('id', responseId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    // Update session total score
    const { data: allResponses } = await supabase
      .from('interview_responses')
      .select('ai_score')
      .eq('session_id', response.session_id)
      .not('ai_score', 'is', null);

    const totalScore = allResponses?.reduce((sum, r) => sum + (r.ai_score || 0), 0) || 0;

    await supabase
      .from('interview_sessions')
      .update({
        total_score: totalScore,
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
      })
      .eq('id', response.session_id);

    return res.status(200).json({
      success: true,
      response: updatedResponse,
      isCorrect,
      score: aiScore,
      feedback: aiFeedback,
      correctAnswer,
      explanation,
      totalScore
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit answer',
      details: error.message
    });
  }
}
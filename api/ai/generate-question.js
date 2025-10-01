import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * API Route: Generate Interview Question using Gemini AI
 * POST /api/ai/generate-question
 *
 * Generates a multiple-choice question based on session context and difficulty
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const { sessionId, questionNumber, difficulty } = req.body;

  if (!sessionId || !questionNumber || !difficulty) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: sessionId, questionNumber, difficulty'
    });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  try {
    // Verify session and get interview details
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*, interview:interviews(*)')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        error: 'Invalid session ID'
      });
    }

    // Check if question already exists (for session recovery)
    const { data: existingQuestion } = await supabase
      .from('interview_responses')
      .select('*')
      .eq('session_id', sessionId)
      .eq('question_number', questionNumber)
      .maybeSingle();

    if (existingQuestion) {
      // Return existing question from cache
      return res.status(200).json({
        success: true,
        question: existingQuestion,
        fromCache: true
      });
    }

    // Time allocation based on difficulty
    const timeAllocation = {
      easy: 20,
      medium: 60,
      hard: 120
    };

    // Get roles from interview
    const roles = session.interview?.roles?.join(', ') || 'Full Stack Developer (React/Node.js)';

    // Generate question using Gemini
    const prompt = `You are an expert technical interviewer. Generate a ${difficulty} level multiple-choice question for a ${roles} position.

Guidelines:
- For EASY: Basic concepts, syntax, definitions (fundamental knowledge)
- For MEDIUM: Problem-solving, best practices, intermediate concepts (practical application)
- For HARD: Advanced topics, edge cases, performance, architecture (expert-level thinking)

Return ONLY valid JSON in this exact format (no markdown, no code blocks, no extra text):
{
  "question": "Clear, concise question text",
  "option_a": "First option",
  "option_b": "Second option",
  "option_c": "Third option",
  "option_d": "Fourth option",
  "correct_answer": "A",
  "explanation": "Brief explanation of why the answer is correct"
}

Make it practical and relevant to real-world ${roles} development.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean response (remove markdown code blocks if present)
    const cleanText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let questionData;
    try {
      questionData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate response structure
    if (
      !questionData.question ||
      !questionData.option_a ||
      !questionData.option_b ||
      !questionData.option_c ||
      !questionData.option_d ||
      !questionData.correct_answer
    ) {
      throw new Error('Invalid question format from AI');
    }

    // Validate correct answer
    const correctAnswer = questionData.correct_answer.toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      throw new Error('Invalid correct answer format');
    }

    // Save question to database
    const { data: savedQuestion, error: saveError } = await supabase
      .from('interview_responses')
      .insert({
        session_id: sessionId,
        question_number: questionNumber,
        question_text: questionData.question,
        question_difficulty: difficulty,
        time_limit: timeAllocation[difficulty],
        // Store metadata as JSONB
        question_metadata: {
          options: {
            A: questionData.option_a,
            B: questionData.option_b,
            C: questionData.option_c,
            D: questionData.option_d
          },
          correct_answer: correctAnswer,
          explanation: questionData.explanation
        }
      })
      .select()
      .single();

    if (saveError) {
      console.error('Database save error:', saveError);
      throw saveError;
    }

    // Return question with options
    return res.status(200).json({
      success: true,
      question: {
        id: savedQuestion.id,
        session_id: savedQuestion.session_id,
        question_number: savedQuestion.question_number,
        question_text: savedQuestion.question_text,
        question_difficulty: savedQuestion.question_difficulty,
        time_limit: savedQuestion.time_limit,
        options: {
          A: questionData.option_a,
          B: questionData.option_b,
          C: questionData.option_c,
          D: questionData.option_d
        },
        correct_answer: correctAnswer,
        explanation: questionData.explanation
      },
      fromCache: false
    });
  } catch (error) {
    console.error('Question generation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate question. Please try again.',
      code: 'AI_ERROR',
      details: error.message
    });
  }
}
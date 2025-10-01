import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * API Route: Generate Interview Question using Gemini AI
 * POST /api/ai/generate-question
 *
 * Generates a multiple-choice question based on session context and difficulty
 */
export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const { sessionId, questionNumber, difficulty } = req.body;

  console.log('[generate-question] Request received:', { sessionId, questionNumber, difficulty });

  if (!sessionId || !questionNumber || !difficulty) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: sessionId, questionNumber, difficulty'
    });
  }

  // Environment variable fallback - check both prefixed and non-prefixed versions
  // Vercel serverless functions use non-prefixed, but local might use VITE_ prefix
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || process.env.VITE_GOOGLE_GEMINI_API_KEY;

  // Detailed environment variable validation
  const missingVars = [];
  if (!SUPABASE_URL) missingVars.push('SUPABASE_URL');
  if (!SUPABASE_ANON_KEY) missingVars.push('SUPABASE_ANON_KEY');
  if (!GEMINI_API_KEY) missingVars.push('GOOGLE_GEMINI_API_KEY');

  if (missingVars.length > 0) {
    const errorMsg = `Missing environment variables: ${missingVars.join(', ')}`;
    console.error('[generate-question]', errorMsg);
    console.error('[generate-question] Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('GEMINI')));

    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
      code: 'CONFIG_ERROR',
      details: errorMsg,
      hint: 'Please check Vercel environment variables dashboard'
    });
  }

  console.log('[generate-question] Environment variables validated successfully');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  try {
    // Verify session and get interview details
    console.log('[generate-question] Fetching session:', sessionId);

    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*, interviews!interview_id(*)')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('[generate-question] Session query error:', sessionError);
      return res.status(404).json({
        success: false,
        error: 'Invalid session ID',
        details: sessionError.message
      });
    }

    if (!session) {
      console.error('[generate-question] No session found');
      return res.status(404).json({
        success: false,
        error: 'Invalid session ID'
      });
    }

    console.log('[generate-question] Session found:', {
      sessionId: session.id,
      hasInterview: !!session.interviews
    });

    // Check if question already exists (for session recovery)
    const { data: existingQuestion } = await supabase
      .from('interview_responses')
      .select('*')
      .eq('session_id', sessionId)
      .eq('question_number', questionNumber)
      .maybeSingle();

    if (existingQuestion) {
      console.log('[generate-question] Returning cached question');
      // Parse the stored JSON data
      let parsedData;
      try {
        parsedData = JSON.parse(existingQuestion.question_text);
      } catch (e) {
        console.error('[generate-question] Failed to parse cached question:', e);
        // If parsing fails, fall through to generate new question
        parsedData = null;
      }

      if (parsedData) {
        // Return existing question from cache
        return res.status(200).json({
          success: true,
          question: {
            id: existingQuestion.id,
            session_id: existingQuestion.session_id,
            question_number: existingQuestion.question_number,
            question_text: parsedData.question,
            question_difficulty: existingQuestion.question_difficulty,
            time_limit: existingQuestion.time_limit,
            options: parsedData.options,
            correct_answer: parsedData.correct_answer,
            explanation: parsedData.explanation
          },
          fromCache: true
        });
      }
    }

    // Time allocation based on difficulty
    const timeAllocation = {
      easy: 20,
      medium: 60,
      hard: 120
    };

    // Get roles from interview
    const roles = session.interviews?.roles?.join(', ') || 'Full Stack Developer (React/Node.js)';

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
    // Note: We'll store the full question data in ai_feedback temporarily
    // and store options/correct answer in the question_text as JSON for now
    // This is a workaround until question_metadata column is added
    const questionFullData = {
      question: questionData.question,
      options: {
        A: questionData.option_a,
        B: questionData.option_b,
        C: questionData.option_c,
        D: questionData.option_d
      },
      correct_answer: correctAnswer,
      explanation: questionData.explanation
    };

    console.log('[generate-question] Saving question to database');

    const { data: savedQuestion, error: saveError } = await supabase
      .from('interview_responses')
      .insert({
        session_id: sessionId,
        question_number: questionNumber,
        question_text: JSON.stringify(questionFullData), // Store full data as JSON string
        question_difficulty: difficulty,
        time_limit: timeAllocation[difficulty]
      })
      .select()
      .single();

    if (saveError) {
      console.error('[generate-question] Database save error:', saveError);
      throw saveError;
    }

    console.log('[generate-question] Question saved successfully');

    // Return question with options
    return res.status(200).json({
      success: true,
      question: {
        id: savedQuestion.id,
        session_id: savedQuestion.session_id,
        question_number: savedQuestion.question_number,
        question_text: questionData.question,
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
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate question. Please try again.',
      code: 'AI_ERROR',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
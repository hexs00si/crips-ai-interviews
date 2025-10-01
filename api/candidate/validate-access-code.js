import { createClient } from '@supabase/supabase-js';

/**
 * API Route: Validate Candidate Access Code
 * POST /api/candidate/validate-access-code
 *
 * Validates the access code and creates/retrieves candidate session
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const { accessCode } = req.body;

  // Validate input
  if (!accessCode || typeof accessCode !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Access code is required'
    });
  }

  // Format access code
  const formattedCode = accessCode.toUpperCase().trim();

  // Validate format (CRISP-XXXX-XXXX)
  const codePattern = /^CRISP-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (!codePattern.test(formattedCode)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid access code format. Expected: CRISP-XXXX-XXXX'
    });
  }

  // Initialize Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  try {
    // Find interview with this access code
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select('*')
      .eq('access_code', formattedCode)
      .eq('status', 'active')
      .single();

    if (interviewError || !interview) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired access code. Please check with your interviewer.'
      });
    }

    // Check if session already exists for this interview
    const { data: existingSession, error: sessionCheckError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('interview_id', interview.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sessionCheckError && sessionCheckError.code !== 'PGRST116') {
      throw sessionCheckError;
    }

    // If session exists and completed, don't allow restart
    if (existingSession && existingSession.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'This interview has already been completed.',
        sessionId: existingSession.id
      });
    }

    // Create or return existing session
    let session;

    if (existingSession && existingSession.status !== 'expired') {
      // Return existing session
      session = existingSession;
    } else {
      // Create new session
      const { data: newSession, error: createError } = await supabase
        .from('interview_sessions')
        .insert({
          interview_id: interview.id,
          status: 'not_started',
          current_question_index: 0,
          total_score: 0,
          last_activity_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      session = newSession;
    }

    // Return success with session and interview details
    return res.status(200).json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        candidate_name: session.candidate_name,
        candidate_email: session.candidate_email,
        candidate_phone: session.candidate_phone,
        current_question_index: session.current_question_index,
        total_score: session.total_score,
        resume_data: session.resume_data,
        created_at: session.created_at,
        last_activity_at: session.last_activity_at
      },
      interview: {
        id: interview.id,
        title: interview.title,
        roles: interview.roles,
        custom_questions: interview.custom_questions,
        status: interview.status
      },
      message: existingSession
        ? 'Welcome back! You have an existing session.'
        : 'Access code validated successfully.'
    });
  } catch (error) {
    console.error('Access code validation error:', error);

    return res.status(500).json({
      success: false,
      error: 'An error occurred while validating your access code. Please try again.',
      code: 'INTERNAL_ERROR'
    });
  }
}
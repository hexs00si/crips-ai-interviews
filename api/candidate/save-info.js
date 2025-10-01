import { createClient } from '@supabase/supabase-js';

/**
 * API Route: Save Candidate Information
 * POST /api/candidate/save-info
 *
 * Updates session with candidate's name, email, and phone
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { sessionId, name, email, phone } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Missing sessionId'
    });
  }

  // Validate required fields
  if (!name || !email || !phone) {
    return res.status(400).json({
      success: false,
      error: 'Name, email, and phone are required'
    });
  }

  // Validate email format
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }

  // Validate phone format (basic validation)
  const phonePattern = /^[\d\s\+\-\(\)]{10,20}$/;
  if (!phonePattern.test(phone)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid phone number format'
    });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  try {
    // Verify session exists
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        error: 'Invalid session ID'
      });
    }

    // Update session with candidate info
    const { data: updatedSession, error: updateError } = await supabase
      .from('interview_sessions')
      .update({
        candidate_name: name.trim(),
        candidate_email: email.trim().toLowerCase(),
        candidate_phone: phone.trim(),
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
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
      message: 'Candidate information saved successfully'
    });
  } catch (error) {
    console.error('Save info error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save candidate information',
      details: error.message
    });
  }
}
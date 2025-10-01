import { supabase } from './supabase';
import { parseResume } from './resumeParserBrowser';

/**
 * Candidate Service - Handles candidate access code validation and session management
 * Uses Supabase client directly from frontend (follows same pattern as UserSyncService)
 */
export class CandidateService {
  /**
   * Validate access code and get interview details
   * @param {string} accessCode - Access code in format CRISP-XXXX-XXXX
   * @returns {Promise<{success: boolean, interview?: object, error?: string}>}
   */
  static async validateAccessCode(accessCode) {
    try {
      if (!accessCode || typeof accessCode !== 'string') {
        return {
          success: false,
          error: 'Access code is required'
        };
      }

      // Format and validate code
      const formattedCode = accessCode.toUpperCase().trim();
      const codePattern = /^CRISP-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

      if (!codePattern.test(formattedCode)) {
        return {
          success: false,
          error: 'Invalid access code format. Expected: CRISP-XXXX-XXXX'
        };
      }

      // Query interviews table directly
      console.log('[CandidateService] Validating access code:', formattedCode);

      const { data: interview, error: interviewError } = await supabase
        .from('interviews')
        .select('*')
        .eq('access_code', formattedCode)
        .eq('status', 'active')
        .single();

      if (interviewError) {
        console.error('[CandidateService] Interview lookup error:', interviewError);

        // PGRST116 means no rows returned
        if (interviewError.code === 'PGRST116') {
          return {
            success: false,
            error: `No active interview found with code: ${formattedCode}. Please check with your interviewer or create an interview first.`
          };
        }

        return {
          success: false,
          error: `Database error: ${interviewError.message}`
        };
      }

      if (!interview) {
        console.error('[CandidateService] No interview data returned');
        return {
          success: false,
          error: 'Invalid or expired access code. Please check with your interviewer.'
        };
      }

      console.log('[CandidateService] Interview found:', interview.id);

      return {
        success: true,
        interview: {
          id: interview.id,
          title: interview.title,
          roles: interview.roles || [],
          custom_questions: interview.custom_questions || [],
          interviewer_id: interview.interviewer_id,
          access_code: formattedCode,
          status: interview.status
        }
      };
    } catch (error) {
      console.error('Access code validation error:', error);
      return {
        success: false,
        error: 'An error occurred while validating your access code. Please try again.'
      };
    }
  }

  /**
   * Create or retrieve existing interview session
   * @param {string} interviewId - Interview ID
   * @returns {Promise<{success: boolean, session?: object, isNewSession?: boolean, error?: string}>}
   */
  static async createOrGetSession(interviewId) {
    try {
      if (!interviewId) {
        return {
          success: false,
          error: 'Interview ID is required'
        };
      }

      // Check for existing session
      const { data: existingSession, error: sessionCheckError } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('interview_id', interviewId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sessionCheckError && sessionCheckError.code !== 'PGRST116') {
        throw sessionCheckError;
      }

      // If session exists and is completed, don't allow restart
      if (existingSession && existingSession.status === 'completed') {
        return {
          success: false,
          error: 'This interview has already been completed.',
          session: existingSession
        };
      }

      // Return existing session if found and not expired
      if (existingSession && existingSession.status !== 'expired') {
        return {
          success: true,
          session: existingSession,
          isNewSession: false,
          message: 'Welcome back! You have an existing session.'
        };
      }

      // Create new session
      const { data: newSession, error: createError } = await supabase
        .from('interview_sessions')
        .insert({
          interview_id: interviewId,
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

      return {
        success: true,
        session: newSession,
        isNewSession: true,
        message: 'Session created successfully.'
      };
    } catch (error) {
      console.error('Session creation error:', error);
      return {
        success: false,
        error: 'Failed to create interview session. Please try again.'
      };
    }
  }

  /**
   * Update session with candidate information
   * @param {string} sessionId - Session ID
   * @param {object} candidateInfo - Candidate information (name, email, phone, resume_data)
   * @returns {Promise<{success: boolean, session?: object, error?: string}>}
   */
  static async updateSessionInfo(sessionId, candidateInfo) {
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .update({
          candidate_name: candidateInfo.name,
          candidate_email: candidateInfo.email,
          candidate_phone: candidateInfo.phone || null,
          resume_data: candidateInfo.resume_data || null,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        session: data
      };
    } catch (error) {
      console.error('Session update error:', error);
      return {
        success: false,
        error: 'Failed to update session information.'
      };
    }
  }

  /**
   * Update session status (not_started, in_progress, completed, expired)
   * @param {string} sessionId - Session ID
   * @param {string} status - New status
   * @returns {Promise<{success: boolean, session?: object, error?: string}>}
   */
  static async updateSessionStatus(sessionId, status) {
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .update({
          status,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        session: data
      };
    } catch (error) {
      console.error('Status update error:', error);
      return {
        success: false,
        error: 'Failed to update session status.'
      };
    }
  }

  /**
   * Complete validation and session setup in one call
   * @param {string} accessCode - Access code
   * @returns {Promise<{success: boolean, interview?: object, session?: object, error?: string}>}
   */
  static async validateAndCreateSession(accessCode) {
    try {
      // Step 1: Validate access code
      const validationResult = await this.validateAccessCode(accessCode);
      if (!validationResult.success) {
        return validationResult;
      }

      // Step 2: Create or get session
      const sessionResult = await this.createOrGetSession(validationResult.interview.id);
      if (!sessionResult.success) {
        return sessionResult;
      }

      return {
        success: true,
        interview: validationResult.interview,
        session: sessionResult.session,
        isNewSession: sessionResult.isNewSession,
        message: sessionResult.message
      };
    } catch (error) {
      console.error('Validation and session creation error:', error);
      return {
        success: false,
        error: 'An error occurred. Please try again.'
      };
    }
  }

  /**
   * Process resume file and save extracted data
   * @param {File} file - Resume file (PDF or DOCX)
   * @param {string} sessionId - Interview session ID
   * @returns {Promise<{success: boolean, extractedFields?: object, missingFields?: array, error?: string}>}
   */
  static async processAndSaveResume(file, sessionId) {
    try {
      console.log('[CandidateService] Processing resume file:', file.name);

      // Parse resume using resumeParser
      const parseResult = await parseResume(file);

      if (!parseResult.success) {
        return {
          success: false,
          error: parseResult.error || 'Failed to parse resume'
        };
      }

      console.log('[CandidateService] Resume parsed successfully');
      console.log('[CandidateService] Extracted fields:', parseResult.fields);

      // Determine which fields are missing
      const missingFields = [];
      if (!parseResult.fields.name) missingFields.push('name');
      if (!parseResult.fields.email) missingFields.push('email');
      if (!parseResult.fields.phone) missingFields.push('phone');

      console.log('[CandidateService] Missing fields:', missingFields);

      // Save resume data and extracted fields to database
      const { data, error } = await supabase
        .from('interview_sessions')
        .update({
          resume_data: {
            text: parseResult.text,
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date().toISOString()
          },
          candidate_name: parseResult.fields.name || null,
          candidate_email: parseResult.fields.email || null,
          candidate_phone: parseResult.fields.phone || null,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      console.log('[CandidateService] Resume data saved to session');

      return {
        success: true,
        extractedFields: parseResult.fields,
        missingFields: missingFields,
        session: data
      };
    } catch (error) {
      console.error('[CandidateService] Resume processing error:', error);
      return {
        success: false,
        error: 'Failed to process resume. Please try again.'
      };
    }
  }

  /**
   * Save candidate information manually (without resume)
   * @param {string} sessionId - Session ID
   * @param {object} candidateInfo - {name, email, phone}
   * @returns {Promise<{success: boolean, session?: object, error?: string}>}
   */
  static async saveCandidateInfo(sessionId, candidateInfo) {
    try {
      console.log('[CandidateService] Saving candidate info:', candidateInfo);

      const { data, error } = await supabase
        .from('interview_sessions')
        .update({
          candidate_name: candidateInfo.name,
          candidate_email: candidateInfo.email,
          candidate_phone: candidateInfo.phone || null,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      console.log('[CandidateService] Candidate info saved successfully');

      return {
        success: true,
        session: data
      };
    } catch (error) {
      console.error('[CandidateService] Save candidate info error:', error);
      return {
        success: false,
        error: 'Failed to save candidate information.'
      };
    }
  }
}

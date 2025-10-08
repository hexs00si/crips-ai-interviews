import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

/**
 * Interview Store - Manages interview creation, listing, and session tracking
 */
const useInterviewStore = create(
  persist(
    (set, get) => ({
      // State
      interviews: [],
      currentInterview: null,
      sessions: [],
      isLoading: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      setCurrentInterview: (interview) => set({ currentInterview: interview }),

      /**
       * Generate unique access code in format CRISP-XXXX-XXXX
       */
      generateAccessCode: () => {
        const random1 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const random2 = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `CRISP-${random1}-${random2}`;
      },

      /**
       * Create a new interview
       */
      createInterview: async (interviewData) => {
        try {
          set({ isLoading: true, error: null });

          // Generate unique access code
          const accessCode = get().generateAccessCode();

          // Prepare data
          const insertData = {
            interviewer_id: interviewData.interviewerId,
            title: interviewData.title,
            roles: interviewData.roles || [],
            custom_questions: interviewData.customQuestions || [],
            access_code: accessCode,
            status: 'active'
          };

          const { data, error } = await supabase
            .from('interviews')
            .insert(insertData)
            .select()
            .single();

          if (error) throw error;

          // Add to local state
          set((state) => ({
            interviews: [data, ...state.interviews],
            isLoading: false
          }));

          return { success: true, data, accessCode };
        } catch (error) {
          console.error('Error creating interview:', error);
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Fetch all interviews for a user
       */
      fetchInterviews: async (userId) => {
        try {
          set({ isLoading: true, error: null });

          console.log('Fetching interviews for user:', userId);

          // Check if interviews table exists by attempting to query it
          const { data, error } = await supabase
            .from('interviews')
            .select('*')
            .eq('interviewer_id', userId)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Supabase error:', error);

            // Check if table doesn't exist
            if (error.code === '42P01' || error.message.includes('does not exist')) {
              throw new Error('Interviews table not found. Please run the database schema script.');
            }

            throw error;
          }

          console.log('Fetched interviews:', data);

          // Optimize: Fetch all sessions in a single query instead of N+1 queries
          let interviewsWithStats = [];

          if (data && data.length > 0) {
            // Get all interview IDs
            const interviewIds = data.map(i => i.id);

            // Fetch ALL sessions for ALL interviews in ONE query
            const { data: allSessions, error: sessionsError } = await supabase
              .from('interview_sessions')
              .select('id, interview_id, status')
              .in('interview_id', interviewIds);

            if (sessionsError) {
              console.error('Error fetching sessions:', sessionsError);
              // Fallback to 0 counts if session fetch fails
              interviewsWithStats = data.map(interview => ({
                ...interview,
                sessionCount: 0,
                completedCount: 0
              }));
            } else {
              // Group sessions by interview_id and calculate counts client-side
              const sessionsByInterview = (allSessions || []).reduce((acc, session) => {
                if (!acc[session.interview_id]) {
                  acc[session.interview_id] = { total: 0, completed: 0 };
                }
                acc[session.interview_id].total += 1;
                if (session.status === 'completed') {
                  acc[session.interview_id].completed += 1;
                }
                return acc;
              }, {});

              // Map interviews with their session counts
              interviewsWithStats = data.map(interview => ({
                ...interview,
                sessionCount: sessionsByInterview[interview.id]?.total || 0,
                completedCount: sessionsByInterview[interview.id]?.completed || 0
              }));
            }
          } else {
            interviewsWithStats = [];
          }

          set({ interviews: interviewsWithStats, isLoading: false });
          return { success: true, data: interviewsWithStats };
        } catch (error) {
          console.error('Error fetching interviews:', error);
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Fetch a single interview by ID
       */
      fetchInterview: async (interviewId) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase
            .from('interviews')
            .select('*')
            .eq('id', interviewId)
            .single();

          if (error) throw error;

          set({ currentInterview: data, isLoading: false });
          return { success: true, data };
        } catch (error) {
          console.error('Error fetching interview:', error);
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Update an interview
       */
      updateInterview: async (interviewId, updates) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase
            .from('interviews')
            .update(updates)
            .eq('id', interviewId)
            .select()
            .single();

          if (error) throw error;

          // Update local state
          set((state) => ({
            interviews: state.interviews.map((i) =>
              i.id === interviewId ? { ...i, ...data } : i
            ),
            currentInterview:
              state.currentInterview?.id === interviewId
                ? { ...state.currentInterview, ...data }
                : state.currentInterview,
            isLoading: false
          }));

          return { success: true, data };
        } catch (error) {
          console.error('Error updating interview:', error);
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Archive an interview
       */
      archiveInterview: async (interviewId) => {
        return get().updateInterview(interviewId, { status: 'archived' });
      },

      /**
       * Unarchive an interview
       */
      unarchiveInterview: async (interviewId) => {
        return get().updateInterview(interviewId, { status: 'active' });
      },

      /**
       * Delete an interview
       */
      deleteInterview: async (interviewId) => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await supabase
            .from('interviews')
            .delete()
            .eq('id', interviewId);

          if (error) throw error;

          // Remove from local state
          set((state) => ({
            interviews: state.interviews.filter((i) => i.id !== interviewId),
            isLoading: false
          }));

          return { success: true };
        } catch (error) {
          console.error('Error deleting interview:', error);
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Fetch sessions for a specific interview
       */
      fetchSessions: async (interviewId) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase
            .from('interview_sessions')
            .select('*')
            .eq('interview_id', interviewId)
            .order('created_at', { ascending: false });

          if (error) throw error;

          set({ sessions: data, isLoading: false });
          return { success: true, data };
        } catch (error) {
          console.error('Error fetching sessions:', error);
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Send invitations to candidates
       */
      sendInvitations: async (interviewId, emails) => {
        try {
          set({ isLoading: true, error: null });

          // Get interview details including access code
          const { data: interview, error: fetchError } = await supabase
            .from('interviews')
            .select('access_code, title')
            .eq('id', interviewId)
            .single();

          if (fetchError) throw fetchError;

          // Prepare invitations
          const invitations = emails.map((email) => ({
            interview_id: interviewId,
            email: email.trim().toLowerCase()
          }));

          // Insert invitations
          const { error } = await supabase
            .from('interview_invitations')
            .insert(invitations);

          if (error) throw error;

          set({ isLoading: false });
          return {
            success: true,
            accessCode: interview.access_code,
            interviewTitle: interview.title
          };
        } catch (error) {
          console.error('Error sending invitations:', error);
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Validate access code
       */
      validateAccessCode: async (accessCode) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase
            .from('interviews')
            .select('id, title, roles, status')
            .eq('access_code', accessCode.toUpperCase())
            .eq('status', 'active')
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              set({ isLoading: false });
              return { success: false, error: 'Invalid access code' };
            }
            throw error;
          }

          set({ isLoading: false });
          return { success: true, data };
        } catch (error) {
          console.error('Error validating access code:', error);
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Search interviews
       */
      searchInterviews: (query) => {
        const { interviews } = get();
        if (!query || query.trim() === '') return interviews;

        const lowerQuery = query.toLowerCase();
        return interviews.filter(
          (interview) =>
            interview.title.toLowerCase().includes(lowerQuery) ||
            interview.access_code.toLowerCase().includes(lowerQuery) ||
            interview.roles.some((role) => role.toLowerCase().includes(lowerQuery))
        );
      },

      /**
       * Sort interviews
       */
      sortInterviews: (interviews, sortBy) => {
        const sorted = [...interviews];

        switch (sortBy) {
          case 'newest':
            return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          case 'oldest':
            return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          case 'title':
            return sorted.sort((a, b) => a.title.localeCompare(b.title));
          case 'sessions':
            return sorted.sort((a, b) => (b.sessionCount || 0) - (a.sessionCount || 0));
          default:
            return sorted;
        }
      },

      /**
       * Clear all data (logout)
       */
      clearStore: () => {
        set({
          interviews: [],
          currentInterview: null,
          sessions: [],
          isLoading: false,
          error: null
        });
      }
    }),
    {
      name: 'interview-storage',
      partialize: (state) => ({
        interviews: state.interviews,
        currentInterview: state.currentInterview
      })
    }
  )
);

export default useInterviewStore;
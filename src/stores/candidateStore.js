import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

/**
 * Candidate Store - Manages candidate interview session state
 * Uses existing database: interview_sessions and interview_responses tables
 * Persists to localStorage for session recovery
 */
const useCandidateStore = create(
  persist(
    (set, get) => ({
      // State
      session: null, // interview_sessions record
      interview: null, // interviews record
      currentQuestion: null, // current interview_responses record
      questionHistory: [],
      answers: [],
      isLoading: false,
      error: null,

      // Timer state
      timerState: {
        remaining: 0,
        total: 0,
        isPaused: false,
        questionNumber: 0
      },

      // Tab visibility tracking
      isTabActive: true,
      tabSwitchCount: 0,
      lastTabSwitchTime: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      /**
       * Initialize candidate session
       * Accepts data from CandidateService.validateAndCreateSession
       */
      initializeSession: (data) => {
        set({
          session: data.session,
          interview: data.interview,
          error: null
        });
      },

      /**
       * Update session status
       */
      updateSessionStatus: async (status) => {
        const { session } = get();
        if (!session?.id) return { success: false, error: 'No active session' };

        try {
          const { data, error } = await supabase
            .from('interview_sessions')
            .update({
              status,
              last_activity_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', session.id)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            session: { ...state.session, ...data }
          }));

          return { success: true, data };
        } catch (error) {
          console.error('Error updating session status:', error);
          set({ error: error.message });
          return { success: false, error: error.message };
        }
      },

      /**
       * Update candidate information
       */
      updateCandidateInfo: async (updates) => {
        const { session } = get();
        if (!session?.id) return { success: false, error: 'No active session' };

        try {
          const { data, error } = await supabase
            .from('interview_sessions')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', session.id)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            session: { ...state.session, ...data }
          }));

          return { success: true, data };
        } catch (error) {
          console.error('Error updating candidate info:', error);
          set({ error: error.message });
          return { success: false, error: error.message };
        }
      },

      /**
       * Start interview
       */
      startInterview: async () => {
        const { session } = get();
        if (!session?.id) return { success: false, error: 'No active session' };

        try {
          const { data, error } = await supabase
            .from('interview_sessions')
            .update({
              status: 'in_progress',
              started_at: new Date().toISOString(),
              current_question_index: 1,
              last_activity_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', session.id)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            session: { ...state.session, ...data }
          }));

          return { success: true, data };
        } catch (error) {
          console.error('Error starting interview:', error);
          set({ error: error.message });
          return { success: false, error: error.message };
        }
      },

      /**
       * Load current question
       */
      setCurrentQuestion: (question) => {
        if (!question) {
          set({ currentQuestion: null });
          return;
        }

        // Initialize timer - use time_limit from interview_responses table
        set({
          currentQuestion: question,
          timerState: {
            remaining: question.time_limit,
            total: question.time_limit,
            isPaused: false,
            questionNumber: question.question_number
          }
        });
      },

      /**
       * Update timer
       */
      updateTimer: (remaining) => {
        set((state) => ({
          timerState: {
            ...state.timerState,
            remaining
          }
        }));
      },

      /**
       * Pause timer
       */
      pauseTimer: () => {
        set((state) => ({
          timerState: {
            ...state.timerState,
            isPaused: true
          }
        }));
      },

      /**
       * Resume timer
       */
      resumeTimer: () => {
        set((state) => ({
          timerState: {
            ...state.timerState,
            isPaused: false
          }
        }));
      },

      /**
       * Submit answer for current question
       */
      submitAnswer: async (selectedAnswer) => {
        const { session, currentQuestion, timerState } = get();
        if (!session?.id || !currentQuestion) {
          return { success: false, error: 'No active question' };
        }

        try {
          const timeTaken = timerState.total - timerState.remaining;

          const { data, error } = await supabase
            .from('interview_responses')
            .update({
              candidate_answer: selectedAnswer,
              time_taken: timeTaken,
              answered_at: new Date().toISOString()
            })
            .eq('id', currentQuestion.id)
            .select()
            .single();

          if (error) throw error;

          // Add to answer history
          set((state) => ({
            answers: [...state.answers, data],
            questionHistory: [...state.questionHistory, currentQuestion]
          }));

          // Update session's current question index
          await supabase
            .from('interview_sessions')
            .update({
              current_question_index: currentQuestion.question_number + 1,
              last_activity_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', session.id);

          return { success: true, data };
        } catch (error) {
          console.error('Error submitting answer:', error);
          set({ error: error.message });
          return { success: false, error: error.message };
        }
      },

      /**
       * Complete interview and calculate final score
       */
      completeInterview: async () => {
        const { session, answers } = get();
        if (!session?.id) return { success: false, error: 'No active session' };

        try {
          // Calculate total score from ai_score (0-10 scale per question)
          const totalScore = answers.reduce((sum, a) => sum + (a.ai_score || 0), 0);

          const { data, error } = await supabase
            .from('interview_sessions')
            .update({
              status: 'completed',
              total_score: totalScore,
              completed_at: new Date().toISOString(),
              last_activity_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', session.id)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            session: { ...state.session, ...data }
          }));

          return {
            success: true,
            data,
            score: totalScore,
            maxScore: answers.length * 10,
            totalQuestions: answers.length
          };
        } catch (error) {
          console.error('Error completing interview:', error);
          set({ error: error.message });
          return { success: false, error: error.message };
        }
      },

      /**
       * Tab visibility management
       */
      setTabActive: (isActive) => {
        const state = get();

        if (!isActive && state.session?.status === 'in_progress') {
          // Tab became inactive during interview
          set({
            isTabActive: false,
            tabSwitchCount: state.tabSwitchCount + 1,
            lastTabSwitchTime: new Date().toISOString()
          });

          // Pause timer
          get().pauseTimer();

          // Update session status to paused
          get().updateSessionStatus('paused');
        } else if (isActive && state.session?.status === 'paused') {
          // Tab became active again
          set({
            isTabActive: true
          });
        } else {
          set({ isTabActive: isActive });
        }
      },

      /**
       * Resume from paused state
       */
      resumeFromPause: async () => {
        const state = get();
        if (state.session?.status !== 'paused') return;

        await get().updateSessionStatus('in_progress');
        get().resumeTimer();
      },

      /**
       * Log AI interaction
       */
      logAIInteraction: async (interactionType, messageRole, messageContent) => {
        const { session } = get();
        if (!session?.session_id) return;

        try {
          const { error } = await supabase.from('ai_interactions').insert({
            session_id: session.session_id,
            interaction_type: interactionType,
            message_role: messageRole,
            message_content: messageContent
          });

          if (error) throw error;
        } catch (error) {
          console.error('Error logging AI interaction:', error);
        }
      },

      /**
       * Get AI interactions for review
       */
      getAIInteractions: async (interactionType) => {
        const { session } = get();
        if (!session?.session_id) return [];

        try {
          let query = supabase
            .from('ai_interactions')
            .select('*')
            .eq('session_id', session.session_id)
            .order('created_at', { ascending: true });

          if (interactionType) {
            query = query.eq('interaction_type', interactionType);
          }

          const { data, error } = await query;

          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('Error fetching AI interactions:', error);
          return [];
        }
      },

      /**
       * Get all questions for review
       */
      getAllQuestions: async () => {
        const { session } = get();
        if (!session?.session_id) return [];

        try {
          const { data, error } = await supabase
            .from('interview_questions')
            .select('*')
            .eq('session_id', session.session_id)
            .order('question_number', { ascending: true });

          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('Error fetching questions:', error);
          return [];
        }
      },

      /**
       * Clear store (logout)
       */
      clearStore: () => {
        set({
          session: null,
          interview: null,
          currentQuestion: null,
          questionHistory: [],
          answers: [],
          isLoading: false,
          error: null,
          timerState: {
            remaining: 0,
            total: 0,
            isPaused: false,
            questionNumber: 0
          },
          isTabActive: true,
          tabSwitchCount: 0,
          lastTabSwitchTime: null
        });
      },

      // Alias for clearStore
      clearSession: function() {
        this.clearStore();
      }
    }),
    {
      name: 'candidate-storage',
      partialize: (state) => ({
        session: state.session,
        interview: state.interview,
        currentQuestion: state.currentQuestion,
        questionHistory: state.questionHistory,
        answers: state.answers,
        timerState: state.timerState,
        tabSwitchCount: state.tabSwitchCount,
        lastTabSwitchTime: state.lastTabSwitchTime
      })
    }
  )
);

export default useCandidateStore;
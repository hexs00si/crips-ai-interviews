import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { UserSyncService } from '@/lib/userSync';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Initialize auth state with user sync
      initialize: async () => {
        try {
          set({ isLoading: true, error: null });

          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('Session error:', sessionError);
            set({ isLoading: false, error: sessionError.message });
            return;
          }

          if (session) {
            const { data: { user } } = await supabase.auth.getUser();
            
            // Always ensure user exists in public.users
            if (user) {
              const syncResult = await UserSyncService.ensureUser(user);
              if (!syncResult.success) {
                console.warn('User sync warning:', syncResult.error);
                // Continue anyway - don't block auth initialization
              }
            }

            set({
              user,
              session,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({
            isLoading: false,
            error: 'Failed to initialize authentication',
            user: null,
            session: null,
            isAuthenticated: false
          });
        }
      },

      // Sign up using our sync service
      signUp: async (email, password, metadata = {}) => {
        try {
          set({ isLoading: true, error: null });

          const result = await UserSyncService.createUserOnSignup({
            email,
            password,
            metadata
          });

          if (!result.success) {
            set({ isLoading: false, error: result.error });
            return { success: false, error: result.error };
          }

          if (result.user && result.session) {
            set({
              user: result.user,
              session: result.session,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else if (result.user && !result.session) {
            // Email confirmation required
            set({ isLoading: false, error: null });
          }

          return {
            success: true,
            user: result.user,
            requiresConfirmation: result.requiresConfirmation,
            message: result.requiresConfirmation 
              ? 'Please check your email to confirm your account.'
              : 'Account created successfully!'
          };

        } catch (error) {
          console.error('Signup error:', error);
          const errorMessage = error.message || 'An unexpected error occurred during signup.';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Sign in with user sync
      signIn: async (email, password) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          // Sync user to public.users after sign in
          if (data.user) {
            const syncResult = await UserSyncService.ensureUser(data.user);
            if (!syncResult.success) {
              console.warn('User sync warning after signin:', syncResult.error);
            }
          }

          set({
            user: data.user,
            session: data.session,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          return { success: true, user: data.user };

        } catch (error) {
          console.error('Sign in error:', error);
          const errorMessage = error.message || 'An unexpected error occurred during sign in.';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Sign out
      signOut: async () => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await supabase.auth.signOut();

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });

          return { success: true };

        } catch (error) {
          console.error('Sign out error:', error);
          const errorMessage = error.message || 'An unexpected error occurred during sign out.';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Update profile using sync service
      updateProfile: async (updates) => {
        try {
          set({ isLoading: true, error: null });

          const { user } = get();
          if (!user) {
            set({ isLoading: false, error: 'No user logged in' });
            return { success: false, error: 'No user logged in' };
          }

          const result = await UserSyncService.updateProfile(user.id, updates);

          if (!result.success) {
            set({ isLoading: false, error: result.error });
            return { success: false, error: result.error };
          }

          // Refresh user data
          const { data: { user: updatedUser } } = await supabase.auth.getUser();
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null
          });

          return { success: true, user: updatedUser };

        } catch (error) {
          console.error('Profile update error:', error);
          const errorMessage = error.message || 'An unexpected error occurred during profile update.';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Delete user account (frontend-only - deactivates in public.users)
      deleteAccount: async () => {
        try {
          set({ isLoading: true, error: null });

          const { user } = get();
          if (!user) {
            set({ isLoading: false, error: 'No user logged in' });
            return { success: false, error: 'No user logged in' };
          }

          const result = await UserSyncService.deleteUser(user.id);

          if (!result.success) {
            set({ isLoading: false, error: result.error });
            return { success: false, error: result.error };
          }

          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });

          return { success: true, message: result.message };

        } catch (error) {
          console.error('Account deletion error:', error);
          const errorMessage = error.message || 'An unexpected error occurred during account deletion.';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Reset password
      resetPassword: async (email) => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
          });

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }

          set({ isLoading: false, error: null });
          return {
            success: true,
            message: 'Password reset email sent. Please check your inbox.'
          };

        } catch (error) {
          console.error('Password reset error:', error);
          const errorMessage = error.message || 'An unexpected error occurred during password reset.';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Utility methods
      isInterviewer: () => {
        const { user } = get();
        return user?.user_metadata?.role === 'interviewer';
      },

      isAdmin: () => {
        const { user } = get();
        return user?.user_metadata?.role === 'admin';
      },

      getUserMetadata: () => {
        const { user } = get();
        return user?.user_metadata || {};
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);

// Auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.email);

  const store = useAuthStore.getState();

  switch (event) {
    case 'SIGNED_IN':
    case 'USER_UPDATED':
    case 'TOKEN_REFRESHED':
      store.initialize(); // This will trigger user sync
      break;
    case 'SIGNED_OUT':
      useAuthStore.setState({
        user: null,
        session: null,
        isAuthenticated: false,
        error: null
      });
      break;
  }
});

export default useAuthStore;
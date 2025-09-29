import { supabase } from './supabase';

// API Base Configuration
const API_CONFIG = {
  timeout: 10000,
  retries: 3,
  retryDelay: 1000
};

/**
 * Generic API error handler
 */
const handleApiError = (error, operation) => {
  console.error(`API Error [${operation}]:`, error);

  if (!navigator.onLine) {
    return {
      success: false,
      error: 'No internet connection. Please check your network and try again.',
      code: 'NETWORK_ERROR'
    };
  }

  if (error.name === 'AbortError') {
    return {
      success: false,
      error: 'Request timed out. Please try again.',
      code: 'TIMEOUT_ERROR'
    };
  }

  // Supabase specific errors
  if (error.message) {
    const supabaseErrorMap = {
      'Invalid login credentials': 'Invalid email or password.',
      'Email not confirmed': 'Please check your email and confirm your account.',
      'User already registered': 'An account with this email already exists.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters.',
      'Unable to validate email address: invalid format': 'Please enter a valid email address.',
      'Signup requires a valid password': 'Please enter a valid password.',
      'Email address not confirmed': 'Please check your email and confirm your account.',
      'Database error saving new user': 'There was a problem creating your account. Please try again.',
      'Database error granting user': 'There was a problem signing you in. Please try again.'
    };

    const userFriendlyMessage = supabaseErrorMap[error.message] || error.message;

    return {
      success: false,
      error: userFriendlyMessage,
      code: error.status || 'UNKNOWN_ERROR',
      originalError: error
    };
  }

  return {
    success: false,
    error: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    originalError: error
  };
};

/**
 * Retry wrapper for API calls
 */
const withRetry = async (apiCall, retries = API_CONFIG.retries, delay = API_CONFIG.retryDelay) => {
  try {
    return await apiCall();
  } catch (error) {
    if (retries > 0 && (error.name === 'AbortError' || error.status >= 500)) {
      console.log(`Retrying API call... ${retries} attempts remaining`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(apiCall, retries - 1, delay * 1.5);
    }
    throw error;
  }
};

/**
 * Authentication API endpoints
 */
export const authApi = {
  /**
   * Sign up a new user - Simplified approach
   */
  signUp: async (userData) => {
    try {
      const { email, password, metadata = {} } = userData;

      const apiCall = async () => {
        // Just use Supabase Auth - let triggers handle the users table
        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
          options: {
            data: {
              role: 'interviewer',
              first_name: metadata.first_name?.trim() || '',
              last_name: metadata.last_name?.trim() || '',
              company: metadata.company?.trim() || null,
              ...metadata
            }
          }
        });

        if (error) throw error;
        return data;
      };

      const data = await withRetry(apiCall);

      // Handle signup scenarios
      if (data.user && !data.session) {
        return {
          success: true,
          requiresConfirmation: true,
          message: 'Please check your email to confirm your account.',
          user: data.user
        };
      }

      if (data.user && data.session) {
        return {
          success: true,
          requiresConfirmation: false,
          user: data.user,
          session: data.session
        };
      }

      return {
        success: false,
        error: 'Signup failed. Please try again.',
        code: 'SIGNUP_FAILED'
      };

    } catch (error) {
      return handleApiError(error, 'signUp');
    }
  },

  /**
   * Sign in existing user
   */
  signIn: async (credentials) => {
    try {
      const { email, password } = credentials;

      const apiCall = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password
        });

        if (error) throw error;
        return data;
      };

      const data = await withRetry(apiCall);

      return {
        success: true,
        user: data.user,
        session: data.session
      };

    } catch (error) {
      return handleApiError(error, 'signIn');
    }
  },

  /**
   * Sign out current user
   */
  signOut: async () => {
    try {
      const apiCall = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      };

      await withRetry(apiCall);

      return {
        success: true,
        message: 'Successfully signed out'
      };

    } catch (error) {
      return handleApiError(error, 'signOut');
    }
  },

  /**
   * Reset user password
   */
  resetPassword: async (email) => {
    try {
      const apiCall = async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.toLowerCase().trim(),
          {
            redirectTo: `${window.location.origin}/reset-password`
          }
        );

        if (error) throw error;
      };

      await withRetry(apiCall);

      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.'
      };

    } catch (error) {
      return handleApiError(error, 'resetPassword');
    }
  },

  /**
   * Update user password
   */
  updatePassword: async (newPassword) => {
    try {
      const apiCall = async () => {
        const { data, error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) throw error;
        return data;
      };

      const data = await withRetry(apiCall);

      return {
        success: true,
        message: 'Password updated successfully',
        user: data.user
      };

    } catch (error) {
      return handleApiError(error, 'updatePassword');
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates) => {
    try {
      const apiCall = async () => {
        const { data, error } = await supabase.auth.updateUser({
          data: updates
        });

        if (error) throw error;
        return data;
      };

      const data = await withRetry(apiCall);

      return {
        success: true,
        message: 'Profile updated successfully',
        user: data.user
      };

    } catch (error) {
      return handleApiError(error, 'updateProfile');
    }
  },

  /**
   * Get user profile from users table
   */
  getUserProfile: async (userId) => {
    try {
      const apiCall = async () => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        return data;
      };

      const data = await withRetry(apiCall);

      return {
        success: true,
        profile: data
      };

    } catch (error) {
      return handleApiError(error, 'getUserProfile');
    }
  },

  /**
   * Get current session
   */
  getSession: async () => {
    try {
      const apiCall = async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data;
      };

      const data = await withRetry(apiCall);

      return {
        success: true,
        session: data.session,
        user: data.session?.user || null
      };

    } catch (error) {
      return handleApiError(error, 'getSession');
    }
  },

  /**
   * Get current user
   */
  getUser: async () => {
    try {
      const apiCall = async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        return data;
      };

      const data = await withRetry(apiCall);

      return {
        success: true,
        user: data.user
      };

    } catch (error) {
      return handleApiError(error, 'getUser');
    }
  },

  /**
   * Refresh session
   */
  refreshSession: async () => {
    try {
      const apiCall = async () => {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        return data;
      };

      const data = await withRetry(apiCall);

      return {
        success: true,
        session: data.session,
        user: data.user
      };

    } catch (error) {
      return handleApiError(error, 'refreshSession');
    }
  }
};

/**
 * Database API endpoints
 */
export const dbApi = {
  /**
   * Update user profile directly
   */
  updateUserProfile: async (userId, updates) => {
    try {
      const apiCall = async () => {
        const { data, error } = await supabase
          .from('users')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      };

      const data = await withRetry(apiCall);

      return {
        success: true,
        user: data
      };

    } catch (error) {
      return handleApiError(error, 'updateUserProfile');
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    try {
      const apiCall = async () => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        return data;
      };

      const data = await withRetry(apiCall);

      return {
        success: true,
        user: data
      };

    } catch (error) {
      return handleApiError(error, 'getUserById');
    }
  },

  /**
   * Validate access code
   */
  validateAccessCode: async (accessCode) => {
    try {
      const apiCall = async () => {
        const { data, error } = await supabase
          .from('interview_sessions')
          .select('id, candidate_name, candidate_email, status, interviewer_id')
          .eq('access_code', accessCode.toUpperCase())
          .eq('status', 'pending')
          .single();

        if (error) throw error;
        return data;
      };

      const data = await withRetry(apiCall);

      return {
        success: true,
        session: data
      };

    } catch (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'Invalid or expired access code.',
          code: 'INVALID_ACCESS_CODE'
        };
      }
      return handleApiError(error, 'validateAccessCode');
    }
  },

  /**
   * Test database connection
   */
  testConnection: async () => {
    try {
      const apiCall = async () => {
        const { data, error } = await supabase
          .from('users')
          .select('count', { count: 'exact', head: true });

        if (error) throw error;
        return data;
      };

      const data = await withRetry(apiCall);

      return {
        success: true,
        message: 'Database connection successful',
        userCount: data || 0
      };

    } catch (error) {
      return handleApiError(error, 'testConnection');
    }
  }
};

/**
 * Utility functions
 */
export const apiUtils = {
  isOnline: () => navigator.onLine,

  createTimeoutController: (timeout = API_CONFIG.timeout) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller;
  },

  formatError: (error) => {
    if (typeof error === 'string') return error;
    return error.error || error.message || 'An unexpected error occurred';
  },

  isRetryableError: (error) => {
    const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT_ERROR'];
    const retryableStatuses = [500, 502, 503, 504];

    return (
      retryableCodes.includes(error.code) ||
      retryableStatuses.includes(error.status) ||
      error.name === 'AbortError'
    );
  }
};

export default {
  auth: authApi,
  db: dbApi,
  utils: apiUtils
};
import { useCallback } from 'react';
import useAuthStore from '@/stores/authStore';
import { validateSignupForm, validateLoginForm, checkRateLimit } from '@/lib/auth';

/**
 * Custom hook for authentication operations
 * Updated with complete user sync functionality
 */
const useAuth = () => {
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    error,
    signUp: storeSignUp,
    signIn: storeSignIn,
    signOut: storeSignOut,
    initialize,
    resetPassword: storeResetPassword,
    updateProfile: storeUpdateProfile,
    deleteAccount: storeDeleteAccount,
    setError,
    clearError,
    isInterviewer,
    isAdmin,
    getUserMetadata
  } = useAuthStore();

  // Enhanced sign up with validation and user sync
  const signUp = useCallback(async (formData) => {
    clearError();

    // Rate limiting check
    const rateLimitCheck = checkRateLimit('signup', 3, 15 * 60 * 1000);
    if (!rateLimitCheck.allowed) {
      setError(rateLimitCheck.error);
      return { success: false, error: rateLimitCheck.error };
    }

    // Validate form data
    const validation = validateSignupForm(formData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      setError(firstError);
      return { success: false, error: firstError, fieldErrors: validation.errors };
    }

    // Prepare metadata for user sync
    const metadata = {
      first_name: formData.firstName?.trim(),
      last_name: formData.lastName?.trim(),
      company: formData.company?.trim() || null,
      role: 'interviewer'
    };

    // Use the enhanced store signup that handles user sync
    const result = await storeSignUp(
      formData.email.toLowerCase().trim(), 
      formData.password, 
      metadata
    );

    if (!result.success && result.error) {
      setError(result.error);
    }

    return result;
  }, [storeSignUp, clearError, setError]);

  // Enhanced sign in with user sync
  const signIn = useCallback(async (formData) => {
    clearError();

    // Rate limiting check
    const rateLimitCheck = checkRateLimit('signin', 5, 15 * 60 * 1000);
    if (!rateLimitCheck.allowed) {
      setError(rateLimitCheck.error);
      return { success: false, error: rateLimitCheck.error };
    }

    // Validate form data
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      setError(firstError);
      return { success: false, error: firstError, fieldErrors: validation.errors };
    }

    // Use the enhanced store signin that handles user sync
    const result = await storeSignIn(
      formData.email.toLowerCase().trim(), 
      formData.password
    );

    return result;
  }, [storeSignIn, clearError, setError]);

  // Enhanced sign out
  const signOut = useCallback(async () => {
    clearError();
    const result = await storeSignOut();

    // Clear rate limit data on successful sign out
    if (result.success) {
      localStorage.removeItem('rateLimit_signin');
      localStorage.removeItem('rateLimit_signup');
      localStorage.removeItem('rateLimit_resetPassword');
    }

    return result;
  }, [storeSignOut, clearError]);

  // Enhanced password reset
  const resetPassword = useCallback(async (email) => {
    clearError();

    // Rate limiting check
    const rateLimitCheck = checkRateLimit('resetPassword', 3, 60 * 60 * 1000);
    if (!rateLimitCheck.allowed) {
      setError(rateLimitCheck.error);
      return { success: false, error: rateLimitCheck.error };
    }

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const error = 'Please enter a valid email address';
      setError(error);
      return { success: false, error };
    }

    const result = await storeResetPassword(email.toLowerCase().trim());
    return result;
  }, [storeResetPassword, clearError, setError]);

  // Enhanced profile update - handles both auth and users table sync
  const updateProfile = useCallback(async (updates) => {
    clearError();

    // Validate updates if they contain specific fields
    const errors = {};

    if (updates.first_name !== undefined) {
      if (!updates.first_name || updates.first_name.trim().length < 2) {
        errors.first_name = 'First name must be at least 2 characters';
      }
    }

    if (updates.last_name !== undefined) {
      if (!updates.last_name || updates.last_name.trim().length < 2) {
        errors.last_name = 'Last name must be at least 2 characters';
      }
    }

    if (updates.company !== undefined && updates.company) {
      if (updates.company.trim().length < 2) {
        errors.company = 'Company name must be at least 2 characters';
      }
    }

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      setError(firstError);
      return { success: false, error: firstError, fieldErrors: errors };
    }

    // Use the enhanced store updateProfile that handles user sync
    const result = await storeUpdateProfile(updates);

    if (!result.success && result.error) {
      setError(result.error);
    }

    return result;
  }, [storeUpdateProfile, clearError, setError]);

  // Delete user account (deactivates in public.users table)
  const deleteAccount = useCallback(async () => {
    clearError();

    // Confirm deletion
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) {
      return { success: false, error: 'Account deletion cancelled' };
    }

    const result = await storeDeleteAccount();

    if (!result.success && result.error) {
      setError(result.error);
    } else if (result.success) {
      // Clear all local storage on successful account deletion
      localStorage.clear();
    }

    return result;
  }, [storeDeleteAccount, clearError, setError]);

  // Get user profile data (from public.users table)
  const getUserProfile = useCallback(async () => {
    if (!user?.id) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const { authApi } = await import('@/lib/api');
      const result = await authApi.getUserProfile(user.id);
      
      if (!result.success) {
        console.warn('Failed to get user profile:', result.error);
      }

      return result;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { success: false, error: 'Failed to get user profile' };
    }
  }, [user]);

  // Refresh user data and sync
  const refreshUser = useCallback(async () => {
    clearError();
    await initialize();
    return { success: true };
  }, [initialize, clearError]);

  // Utility functions
  const getFullName = useCallback(() => {
    const metadata = getUserMetadata();
    const firstName = metadata.first_name || '';
    const lastName = metadata.last_name || '';
    return `${firstName} ${lastName}`.trim() || user?.email || 'User';
  }, [user, getUserMetadata]);

  const getInitials = useCallback(() => {
    const metadata = getUserMetadata();
    const firstName = metadata.first_name || '';
    const lastName = metadata.last_name || '';

    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return 'U';
  }, [user, getUserMetadata]);

  const hasCompleteProfile = useCallback(() => {
    const metadata = getUserMetadata();
    return !!(metadata.first_name && metadata.last_name);
  }, [getUserMetadata]);

  // Check if user needs to complete onboarding
  const needsOnboarding = useCallback(() => {
    return isAuthenticated && !hasCompleteProfile();
  }, [isAuthenticated, hasCompleteProfile]);

  // Check if user email is verified
  const isEmailVerified = useCallback(() => {
    return user?.email_confirmed_at !== null;
  }, [user]);

  // Get user role
  const getUserRole = useCallback(() => {
    const metadata = getUserMetadata();
    return metadata.role || 'interviewer';
  }, [getUserMetadata]);

  return {
    // State
    user,
    session,
    isLoading,
    isAuthenticated,
    error,

    // Actions
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    deleteAccount,
    getUserProfile,
    refreshUser,
    initialize,
    clearError,

    // Role checks
    isInterviewer,
    isAdmin,
    getUserRole,

    // Utility functions
    getUserMetadata,
    getFullName,
    getInitials,
    hasCompleteProfile,
    needsOnboarding,
    isEmailVerified
  };
};

export default useAuth;
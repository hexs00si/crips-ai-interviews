import { useCallback, useEffect } from 'react';
import useInterviewStore from '@/stores/interviewStore';
import useAuth from '@/features/auth/hooks/useAuth';

/**
 * Custom hook for interview operations
 * Provides simplified interface to interview store with auth integration
 */
const useInterviews = () => {
  const { user } = useAuth();

  const {
    interviews,
    currentInterview,
    sessions,
    isLoading,
    error,
    clearError,
    createInterview: storeCreateInterview,
    fetchInterviews: storeFetchInterviews,
    fetchInterview: storeFetchInterview,
    updateInterview: storeUpdateInterview,
    archiveInterview: storeArchiveInterview,
    unarchiveInterview: storeUnarchiveInterview,
    deleteInterview: storeDeleteInterview,
    fetchSessions: storeFetchSessions,
    sendInvitations: storeSendInvitations,
    validateAccessCode: storeValidateAccessCode,
    searchInterviews: storeSearchInterviews,
    sortInterviews: storeSortInterviews
  } = useInterviewStore();

  /**
   * Create a new interview
   */
  const createInterview = useCallback(
    async (title, rolesString, customQuestions = []) => {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      // Parse roles from comma-separated string
      const roles = rolesString
        .split(',')
        .map((role) => role.trim())
        .filter((role) => role.length > 0);

      if (roles.length === 0) {
        return { success: false, error: 'At least one role is required' };
      }

      const interviewData = {
        interviewerId: user.id,
        title: title.trim(),
        roles,
        customQuestions
      };

      return await storeCreateInterview(interviewData);
    },
    [user, storeCreateInterview]
  );

  /**
   * Load all interviews for current user
   */
  const loadInterviews = useCallback(async () => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    return await storeFetchInterviews(user.id);
  }, [user, storeFetchInterviews]);

  /**
   * Load a specific interview by ID
   */
  const loadInterview = useCallback(
    async (interviewId) => {
      return await storeFetchInterview(interviewId);
    },
    [storeFetchInterview]
  );

  /**
   * Update interview details
   */
  const updateInterview = useCallback(
    async (interviewId, updates) => {
      return await storeUpdateInterview(interviewId, updates);
    },
    [storeUpdateInterview]
  );

  /**
   * Archive an interview
   */
  const archiveInterview = useCallback(
    async (interviewId) => {
      return await storeArchiveInterview(interviewId);
    },
    [storeArchiveInterview]
  );

  /**
   * Unarchive an interview
   */
  const unarchiveInterview = useCallback(
    async (interviewId) => {
      return await storeUnarchiveInterview(interviewId);
    },
    [storeUnarchiveInterview]
  );

  /**
   * Delete an interview
   */
  const deleteInterview = useCallback(
    async (interviewId) => {
      return await storeDeleteInterview(interviewId);
    },
    [storeDeleteInterview]
  );

  /**
   * Load sessions for an interview
   */
  const loadSessions = useCallback(
    async (interviewId) => {
      return await storeFetchSessions(interviewId);
    },
    [storeFetchSessions]
  );

  /**
   * Send email invitations
   */
  const sendInvitations = useCallback(
    async (interviewId, emailsString) => {
      // Parse emails from comma-separated string
      const emails = emailsString
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0 && email.includes('@'));

      if (emails.length === 0) {
        return { success: false, error: 'No valid email addresses provided' };
      }

      return await storeSendInvitations(interviewId, emails);
    },
    [storeSendInvitations]
  );

  /**
   * Validate access code
   */
  const validateAccessCode = useCallback(
    async (accessCode) => {
      if (!accessCode || accessCode.trim().length === 0) {
        return { success: false, error: 'Access code is required' };
      }

      return await storeValidateAccessCode(accessCode.trim());
    },
    [storeValidateAccessCode]
  );

  /**
   * Search interviews
   */
  const searchInterviews = useCallback(
    (query) => {
      return storeSearchInterviews(query);
    },
    [storeSearchInterviews]
  );

  /**
   * Sort interviews
   */
  const sortInterviews = useCallback(
    (interviewsList, sortBy) => {
      return storeSortInterviews(interviewsList, sortBy);
    },
    [storeSortInterviews]
  );

  /**
   * Copy access code to clipboard
   */
  const copyAccessCode = useCallback(async (accessCode) => {
    try {
      await navigator.clipboard.writeText(accessCode);
      return { success: true, message: 'Access code copied to clipboard!' };
    } catch (error) {
      console.error('Failed to copy:', error);
      return { success: false, error: 'Failed to copy access code' };
    }
  }, []);

  /**
   * Get interview statistics
   */
  const getInterviewStats = useCallback(() => {
    const total = interviews.length;
    const active = interviews.filter((i) => i.status === 'active').length;
    const completed = interviews.filter((i) => i.status === 'completed').length;
    const archived = interviews.filter((i) => i.status === 'archived').length;
    const totalSessions = interviews.reduce((sum, i) => sum + (i.sessionCount || 0), 0);
    const totalCompleted = interviews.reduce((sum, i) => sum + (i.completedCount || 0), 0);

    return {
      total,
      active,
      completed,
      archived,
      totalSessions,
      totalCompleted
    };
  }, [interviews]);

  /**
   * Auto-load interviews on mount if user is authenticated
   * DISABLED FOR NOW - We'll manually trigger load to avoid issues
   */
  // useEffect(() => {
  //   if (user?.id && interviews.length === 0 && !isLoading) {
  //     loadInterviews();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [user?.id, interviews.length, isLoading]);

  return {
    // State
    interviews,
    currentInterview,
    sessions,
    isLoading,
    error,

    // Actions
    createInterview,
    loadInterviews,
    loadInterview,
    updateInterview,
    archiveInterview,
    unarchiveInterview,
    deleteInterview,
    loadSessions,
    sendInvitations,
    validateAccessCode,
    searchInterviews,
    sortInterviews,
    copyAccessCode,
    clearError,

    // Computed
    getInterviewStats,
    hasInterviews: interviews.length > 0
  };
};

export default useInterviews;
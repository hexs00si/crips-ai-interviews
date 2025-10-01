import { useEffect, useCallback } from 'react';
import useCandidateStore from '@/stores/candidateStore';

/**
 * Custom hook to detect tab visibility changes
 * Pauses interview when user switches tabs
 */
export function useTabVisibility() {
  const { setTabActive, session } = useCandidateStore();

  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden;
    setTabActive(isVisible);

    // Log visibility change for debugging
    if (session?.status === 'in_progress') {
      console.log(`Tab visibility changed: ${isVisible ? 'visible' : 'hidden'}`);
    }
  }, [setTabActive, session?.status]);

  const handleBlur = useCallback(() => {
    // Window lost focus
    if (session?.status === 'in_progress') {
      setTabActive(false);
    }
  }, [setTabActive, session?.status]);

  const handleFocus = useCallback(() => {
    // Window gained focus
    setTabActive(true);
  }, [setTabActive]);

  useEffect(() => {
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    // Set initial state
    setTabActive(!document.hidden);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [handleVisibilityChange, handleBlur, handleFocus, setTabActive]);

  return {
    isTabActive: useCandidateStore((state) => state.isTabActive),
    tabSwitchCount: useCandidateStore((state) => state.tabSwitchCount),
    lastTabSwitchTime: useCandidateStore((state) => state.lastTabSwitchTime)
  };
}
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GridBackground } from '@/components/ui/aceternity/grid-background';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { AccessCodeForm } from '../components/AccessCodeForm';
import { WelcomeBackModal } from '../components/WelcomeBackModal';
import useCandidateStore from '@/stores/candidateStore';

export function CandidateAccessPage() {
  const navigate = useNavigate();
  const { accessCode: urlAccessCode } = useParams();
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const { session, interview, initializeSession, loadSession } = useCandidateStore();

  // Check for existing session on mount
  useEffect(() => {
    if (session && session.status !== 'completed') {
      setShowWelcomeBack(true);
    }
  }, []);

  const handleSubmit = async (accessCode) => {
    try {
      const response = await fetch('/api/candidate/validate-access-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode })
      });

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Invalid access code'
        };
      }

      // Initialize session in store
      initializeSession(data.session, data.interview);

      // Navigate based on session status
      if (data.session.status === 'not_started') {
        // New session - go to info collection
        navigate('/candidate/info');
      } else if (data.session.status === 'in_progress') {
        // Resume interview
        navigate('/candidate/interview');
      } else if (data.session.status === 'completed') {
        // Show results
        navigate('/candidate/results');
      } else {
        navigate('/candidate/info');
      }

      return { success: true };
    } catch (error) {
      console.error('Access code validation error:', error);
      return {
        success: false,
        error: 'Failed to validate access code. Please try again.'
      };
    }
  };

  const handleResumeSession = async () => {
    setShowWelcomeBack(false);

    // Navigate based on current status
    if (session.status === 'in_progress') {
      navigate('/candidate/interview');
    } else if (session.status === 'completed') {
      navigate('/candidate/results');
    } else {
      navigate('/candidate/info');
    }
  };

  const handleRestartSession = () => {
    // Clear session and stay on access code page
    useCandidateStore.getState().clearSession();
    setShowWelcomeBack(false);
  };

  // Auto-fill access code from URL if present
  useEffect(() => {
    if (urlAccessCode) {
      // Could auto-submit here if desired
      console.log('Access code from URL:', urlAccessCode);
    }
  }, [urlAccessCode]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background with Grid and Beams */}
      <GridBackground className="absolute inset-0">
        <BackgroundBeams />
      </GridBackground>

      {/* Content Container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full"
        >
          <div className="flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl p-8 max-w-md w-full">
              <AccessCodeForm onSubmit={handleSubmit} />
            </div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-white/80">
              Powered by{' '}
              <span className="font-semibold text-primary-400">
                Crisp AI Interviews
              </span>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Welcome Back Modal */}
      <WelcomeBackModal
        isOpen={showWelcomeBack}
        session={session}
        onResume={handleResumeSession}
        onRestart={handleRestartSession}
      />
    </div>
  );
}
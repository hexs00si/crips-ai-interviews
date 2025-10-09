import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { GridBackground } from '@/components/ui/aceternity/grid-background';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { ArrowRight } from 'lucide-react';

/**
 * DualAuthLayout - Split screen authentication layout
 * Left side: Interviewer login/signup
 * Right side: Candidate access code entry
 */
export function DualAuthLayout({ leftContent, rightContent, mode = 'both' }) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background with Grid and Beams */}
      <GridBackground className="absolute inset-0">
        <BackgroundBeams />
      </GridBackground>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12 pt-20 md:pt-12">
        <div className="w-full max-w-6xl mx-auto">
          {/* Grid Layout - 2 columns on desktop, 1 on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Interviewer Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`${mode === 'candidate' ? 'hidden lg:block opacity-50' : ''}`}
            >
              {/* Card */}
              <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl p-8">
                {leftContent}
              </div>

              {/* Switch Link */}
              {mode === 'interviewer' && (
                <div className="text-center mt-6">
                  <a
                    href="/candidate"
                    className="inline-flex items-center space-x-2 text-white/90 hover:text-white transition-colors"
                  >
                    <span className="text-sm font-medium">
                      Are you a candidate?
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </motion.div>

            {/* Divider - Only show on desktop when mode is 'both' */}
            {mode === 'both' && (
              <div className="hidden lg:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/40 to-transparent" />
                  <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    <span className="text-white font-bold text-sm tracking-wider">
                      OR
                    </span>
                  </div>
                  <div className="w-px h-32 bg-gradient-to-b from-white/40 via-white/40 to-transparent" />
                </div>
              </div>
            )}

            {/* Right Column - Candidate Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              className={`${mode === 'interviewer' ? 'hidden lg:block opacity-50' : ''}`}
            >
              {/* Card */}
              <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl p-8">
                {rightContent}
              </div>

              {/* Switch Link */}
              {mode === 'candidate' && (
                <div className="text-center mt-6">
                  <a
                    href="/login"
                    className="inline-flex items-center space-x-2 text-white/90 hover:text-white transition-colors"
                  >
                    <span className="text-sm font-medium">
                      Are you an interviewer?
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-sm text-white/80">
              Powered by{' '}
              <span className="font-semibold text-primary-400">
                Crisp AI Interviews
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/**
 * Usage Examples:
 *
 * 1. Dual mode (both sides visible):
 * <DualAuthLayout
 *   mode="both"
 *   leftContent={<LoginForm />}
 *   rightContent={<AccessCodeForm />}
 * />
 *
 * 2. Interviewer focused (candidate side dimmed):
 * <DualAuthLayout
 *   mode="interviewer"
 *   leftContent={<LoginForm />}
 *   rightContent={<AccessCodeForm />}
 * />
 *
 * 3. Candidate focused (interviewer side dimmed):
 * <DualAuthLayout
 *   mode="candidate"
 *   leftContent={<LoginForm />}
 *   rightContent={<AccessCodeForm />}
 * />
 */
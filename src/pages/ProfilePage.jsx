import { motion } from 'framer-motion';
import { GridBackground } from '@/components/ui/aceternity/grid-background';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { ProfileHeader } from '@/components/sections/ProfileHeader';
import { ProfileForm } from '@/components/sections/ProfileForm';
import { ProfileActions } from '@/components/sections/ProfileActions';

export function ProfilePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <GridBackground className="absolute inset-0">
        <BackgroundBeams />
      </GridBackground>

      <div className="relative z-10 min-h-screen pt-40 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <ProfileHeader />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ProfileForm />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ProfileActions />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
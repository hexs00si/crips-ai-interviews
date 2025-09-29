import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { aboutData } from '@/data/about';
import { GridBackground } from '@/components/ui/aceternity/grid-background';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { PageHeader } from '@/components/sections/PageHeader';
import { AboutMission } from '@/components/sections/AboutMission';
import { AboutHowItWorks } from '@/components/sections/AboutHowItWorks';
import { AboutCTA } from '@/components/sections/AboutCTA';

export function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background with Grid and Beams */}
      <GridBackground className="absolute inset-0">
        <BackgroundBeams />
      </GridBackground>

      {/* Content */}
      <div className="relative z-10 min-h-screen pt-40 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <PageHeader title={aboutData.hero.title} subtitle={aboutData.hero.subtitle} />
          </motion.div>

          <div className="grid gap-12 md:gap-16 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <AboutMission />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <AboutHowItWorks />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <AboutCTA />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
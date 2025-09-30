import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, BarChart3 } from 'lucide-react';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { GridBackground } from '@/components/ui/aceternity/grid-background';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { interviewData } from '@/data/interviews';

export function DashboardEmpty({ onCreateClick }) {
  const { emptyState } = interviewData;

  const iconMap = {
    0: Sparkles,
    1: Zap,
    2: Shield,
    3: BarChart3
  };

  return (
    <div className="relative min-h-[calc(100vh-200px)] overflow-hidden">
      {/* Background Effects */}
      <GridBackground className="absolute inset-0">
        <BackgroundBeams />
      </GridBackground>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {emptyState.title}
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            {emptyState.subtitle}
          </p>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8">
            {emptyState.description}
          </p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <RainbowButton onClick={onCreateClick} className="px-8 py-4 text-lg">
              {emptyState.primaryAction}
            </RainbowButton>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {emptyState.features.map((feature, index) => {
            const Icon = iconMap[index];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-4">
            Ready to streamline your hiring process?
          </p>
          <button
            onClick={onCreateClick}
            className="text-primary-600 hover:text-primary-700 font-semibold hover:underline"
          >
            Get started now →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
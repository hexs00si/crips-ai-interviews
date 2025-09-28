import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { GridBackground } from "@/components/ui/aceternity/grid-background";
import { BackgroundBeams } from "@/components/ui/aceternity/background-beams";
import { FeatureCard } from "@/components/ui/feature-card";
import { featuresData } from "@/data/features";

export function Features() {
  const { heading, subheading, features, animations, responsive } = featuresData;

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background with Grid and Beams */}
      <GridBackground className="absolute inset-0">
        <BackgroundBeams />
      </GridBackground>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto w-full">
          {/* Section Header */}
          <motion.div
            className="text-center mb-8 sm:mb-16 pt-8 sm:pt-20"
            initial={animations.header.initial}
            animate={animations.header.animate}
            transition={animations.header.transition}
          >
            <h2 className="font-black text-gray-900 mb-4 sm:mb-6 leading-tight tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              {heading}
            </h2>
            <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium text-base sm:text-lg md:text-xl lg:text-2xl px-4">
              {subheading}
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid gap-4 sm:gap-6 auto-rows-fr grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                index={index}
                responsive={responsive.mobile}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { GridBackground } from "@/components/ui/aceternity/grid-background";
import { BackgroundBeams } from "@/components/ui/aceternity/background-beams";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { heroData } from "@/data/hero";

export function Hero() {
  const { heading, subheading, buttons, animations, responsive } = heroData;

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background with Grid and Beams */}
      <GridBackground className="absolute inset-0">
        <BackgroundBeams />
      </GridBackground>

      {/* Content Container */}
      <div className="relative z-10 flex h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <motion.h1
            className={`
              font-black text-gray-900 mb-8 leading-tight tracking-tight
              ${responsive.mobile.headingSize}
              sm:${responsive.tablet.headingSize}
              lg:${responsive.desktop.headingSize}
            `}
            initial={animations.heading.initial}
            animate={animations.heading.animate}
            transition={animations.heading.transition}
          >
            {heading}
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className={`
              text-gray-700 mb-16 max-w-4xl mx-auto leading-relaxed font-medium
              ${responsive.mobile.subheadingSize}
              sm:${responsive.tablet.subheadingSize}
              lg:${responsive.desktop.subheadingSize}
            `}
            initial={animations.subheading.initial}
            animate={animations.subheading.animate}
            transition={animations.subheading.transition}
          >
            {subheading}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            className={`
              flex items-center
              ${responsive.mobile.buttonDirection} ${responsive.mobile.buttonSpacing}
              sm:${responsive.tablet.buttonDirection} sm:${responsive.tablet.buttonSpacing}
              lg:${responsive.desktop.buttonDirection} lg:${responsive.desktop.buttonSpacing}
            `}
            initial={animations.buttons.initial}
            animate={animations.buttons.animate}
            transition={animations.buttons.transition}
          >
            <RainbowButton
              onClick={() => {
                // Navigation will be implemented later
                console.log(`Navigate to: ${buttons.primary.href}`);
              }}
              className="min-w-[200px] sm:min-w-[220px]"
            >
              {buttons.primary.text}
            </RainbowButton>

            <RainbowButton
              onClick={() => {
                // Navigation will be implemented later
                console.log(`Navigate to: ${buttons.secondary.href}`);
              }}
              className="min-w-[200px] sm:min-w-[220px]"
              style={{
                background: `linear-gradient(135deg,
                  #6b7280 0%,
                  #9ca3af 25%,
                  #d1d5db 50%,
                  #9ca3af 75%,
                  #6b7280 100%)`,
                backgroundSize: '200% 200%',
              }}
            >
              {buttons.secondary.text}
            </RainbowButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
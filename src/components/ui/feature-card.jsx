import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  Brain,
  BarChart3,
  Key,
  Target,
  FileText,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  Brain,
  BarChart3,
  Key,
  Target,
  FileText,
  RotateCcw
};

export function FeatureCard({
  feature,
  index = 0,
  responsive
}) {
  const IconComponent = iconMap[feature.icon];

  return (
    <motion.div
      className={cn(
        "group relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer",
        feature.hoverColor,
        responsive.cardPadding,
        // Bento grid sizing - only apply on tablet and up
        feature.size === "large" ? "sm:col-span-2 sm:row-span-2" : "sm:col-span-1 sm:row-span-1"
      )}
      initial={{
        opacity: 0,
        y: 40,
        scale: 0.95
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{
        scale: 1.02,
        y: -8,
        transition: { duration: 0.2 }
      }}
      whileTap={{
        scale: 0.98
      }}
    >
      {/* Gradient border effect */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg",
        feature.gradient
      )} />

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Icon */}
        <div className="mb-4 sm:mb-6">
          <div className={cn(
            "w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-r flex items-center justify-center group-hover:scale-110 transition-transform duration-300",
            feature.gradient
          )}>
            {IconComponent && (
              <IconComponent
                className="w-8 h-8 sm:w-12 sm:h-12 text-white"
                strokeWidth={1.5}
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className={cn(
            "font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary-600 transition-colors duration-300",
            feature.size === "large" ? "text-lg sm:text-2xl lg:text-3xl" : "text-base sm:text-xl lg:text-2xl"
          )}>
            {feature.title}
          </h3>

          <p className={cn(
            "text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300",
            feature.size === "large" ? "text-sm sm:text-lg" : "text-sm sm:text-base"
          )}>
            {feature.description}
          </p>
        </div>

        {/* Hover accent line */}
        <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 group-hover:w-full transition-all duration-500 rounded-b-lg" />
      </div>
    </motion.div>
  );
}
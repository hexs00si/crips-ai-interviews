import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { cn } from "@/lib/utils";

export function BackgroundBeams({ className }) {
  const gridSize = 20; // 20px grid to match Tailwind config

  // Use reasonable defaults for SSR compatibility
  const defaultWidth = 1200;
  const defaultHeight = 800;

  // Calculate number of grid lines that fit in a typical viewport
  const verticalLines = Math.floor(defaultWidth / gridSize);
  const horizontalLines = Math.floor(defaultHeight / gridSize);

  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full pointer-events-none",
        className
      )}
    >
      {/* Vertical animated beams following grid lines */}
      <div className="absolute inset-0">
        {[...Array(Math.min(verticalLines, 12))].map((_, i) => (
          <motion.div
            key={`vertical-${i}`}
            className="absolute h-full w-[1px] bg-gradient-to-t from-transparent via-primary-500/40 to-transparent"
            style={{
              left: `${(i + 1) * gridSize}px`,
              filter: 'blur(0.5px)',
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scaleY: [0.3, 1, 0.3],
              y: [-20, 0, 20],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Horizontal animated beams following grid lines */}
      <div className="absolute inset-0">
        {[...Array(Math.min(horizontalLines, 8))].map((_, i) => (
          <motion.div
            key={`horizontal-${i}`}
            className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-primary-500/30 to-transparent"
            style={{
              top: `${(i + 1) * gridSize}px`,
              filter: 'blur(0.5px)',
            }}
            animate={{
              opacity: [0, 0.6, 0],
              scaleX: [0.3, 1, 0.3],
              x: [-30, 0, 30],
            }}
            transition={{
              duration: 4 + (i % 2),
              repeat: Infinity,
              delay: i * 0.6 + 1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Intersection points with subtle glow */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`intersection-${i}`}
            className="absolute w-1 h-1 bg-primary-500/60 rounded-full"
            style={{
              left: `${(i + 2) * gridSize * 3}px`,
              top: `${(i + 1) * gridSize * 4}px`,
              filter: 'blur(1px)',
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
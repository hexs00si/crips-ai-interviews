import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { cn } from "@/lib/utils";

export function RainbowButton({
  children,
  className,
  onClick,
  disabled = false,
  ...props
}) {
  return (
    <motion.button
      className={cn(
        "group relative inline-flex h-14 items-center justify-center rounded-lg bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 px-12 font-semibold text-lg text-white transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      style={{
        background: `linear-gradient(135deg,
          #2563eb 0%,
          #3b82f6 25%,
          #60a5fa 50%,
          #3b82f6 75%,
          #2563eb 100%)`,
        backgroundSize: '200% 200%',
      }}
      whileHover={disabled ? {} : {
        backgroundPosition: '100% 100%',
      }}
      whileTap={disabled ? {} : {
        scale: 0.98,
      }}
      initial={{
        backgroundPosition: '0% 0%',
        opacity: 0,
        y: 20
      }}
      animate={{
        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        opacity: 1,
        y: 0
      }}
      transition={{
        backgroundPosition: {
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        },
        opacity: { duration: 0.3 },
        y: { duration: 0.3 },
        scale: { duration: 0.1 },
      }}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {/* Animated border */}
      <div className="absolute inset-0 rounded-lg p-[3px] bg-gradient-to-r from-primary-400 via-primary-300 to-primary-400 opacity-75">
        <div className="absolute inset-[3px] rounded-lg bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600" />
      </div>

      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>

      {/* Hover glow effect */}
      <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-primary-500/20 via-primary-400/20 to-primary-500/20 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.button>
  );
}
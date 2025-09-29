import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { GridBackground } from "@/components/ui/aceternity/grid-background";
import { BackgroundBeams } from "@/components/ui/aceternity/background-beams";

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background with Grid and Beams */}
      <GridBackground className="absolute inset-0">
        <BackgroundBeams />
      </GridBackground>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-lg shadow-2xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl font-black text-gray-900 mb-2 tracking-tight"
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-gray-600 leading-relaxed"
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          {/* Form Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {children}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-600">
            Powered by{" "}
            <span className="font-semibold text-primary-600">
              Crisp AI Interviews
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
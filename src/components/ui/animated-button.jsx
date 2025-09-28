import React from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { cn } from "@/lib/utils";

const buttonVariants = {
  primary: {
    base: "bg-primary-600 text-white border border-primary-600",
    hover: "bg-primary-500 border-primary-500 shadow-lg shadow-primary-500/25",
    active: "bg-primary-700 border-primary-700"
  },
  secondary: {
    base: "bg-transparent text-primary-600 border border-primary-600",
    hover: "bg-primary-50 border-primary-500 text-primary-700",
    active: "bg-primary-100 border-primary-700"
  }
};

export function AnimatedButton({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  disabled = false,
  ...props
}) {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses = {
    sm: "px-4 py-2 text-sm rounded-sm",
    md: "px-6 py-3 text-base rounded-md",
    lg: "px-8 py-4 text-lg rounded-lg"
  };

  const variantStyles = buttonVariants[variant];

  return (
    <motion.button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantStyles.base,
        className
      )}
      whileHover={disabled ? {} : {
        scale: 1.02,
        className: cn(
          baseClasses,
          sizeClasses[size],
          variantStyles.hover,
          className
        )
      }}
      whileTap={disabled ? {} : {
        scale: 0.98,
        className: cn(
          baseClasses,
          sizeClasses[size],
          variantStyles.active,
          className
        )
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
}
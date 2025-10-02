export const heroData = {
  heading: "AI-Powered Interview Platform",
  subheading: "Transform your hiring process with intelligent interviews. Create seamless experiences for both interviewers and candidates with our advanced AI assistant.",
  buttons: {
    primary: {
      text: "Try It",
      variant: "primary",
      href: "/auth" // FIXED: Changed from /get-started to /auth (correct route)
    },
    secondary: {
      text: "Learn More",
      variant: "secondary",
      href: "/about"
    }
  },
  animations: {
    heading: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, ease: "easeOut" }
    },
    subheading: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay: 0.2, ease: "easeOut" }
    },
    buttons: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay: 0.4, ease: "easeOut" }
    }
  },
  responsive: {
    mobile: {
      headingSize: "text-5xl",
      subheadingSize: "text-xl",
      buttonSpacing: "gap-3",
      buttonDirection: "flex-row flex-wrap justify-center"
    },
    tablet: {
      headingSize: "text-7xl",
      subheadingSize: "text-2xl",
      buttonSpacing: "gap-4",
      buttonDirection: "flex-row justify-center"
    },
    desktop: {
      headingSize: "text-8xl",
      subheadingSize: "text-3xl",
      buttonSpacing: "gap-6",
      buttonDirection: "flex-row justify-center"
    }
  }
};
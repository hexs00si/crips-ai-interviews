export const featuresData = {
  heading: "Powerful Features",
  subheading: "Everything you need to conduct seamless, intelligent interviews that help you find the perfect candidates.",
  features: [
    {
      id: 1,
      title: "AI-Powered Question Generation",
      description: "Intelligent algorithms create personalized interview questions based on job requirements and candidate profiles.",
      icon: "Brain",
      size: "large", // for bento grid sizing
      gradient: "from-blue-500 to-purple-600",
      hoverColor: "hover:bg-blue-50"
    },
    {
      id: 2,
      title: "Real-time Analytics",
      description: "Monitor interview progress with live insights and instant feedback.",
      icon: "BarChart3",
      size: "medium",
      gradient: "from-green-500 to-emerald-600",
      hoverColor: "hover:bg-green-50"
    },
    {
      id: 3,
      title: "Seamless Access",
      description: "Simple invitation codes for candidates - no account creation required.",
      icon: "Key",
      size: "medium",
      gradient: "from-orange-500 to-red-600",
      hoverColor: "hover:bg-orange-50"
    },
    {
      id: 4,
      title: "Smart Evaluation",
      description: "AI-driven assessment of candidate responses with detailed scoring and insights.",
      icon: "Target",
      size: "large",
      gradient: "from-purple-500 to-pink-600",
      hoverColor: "hover:bg-purple-50"
    },
    {
      id: 5,
      title: "Resume Intelligence",
      description: "Automatically extract candidate information from PDF/DOCX resumes with smart data parsing.",
      icon: "FileText",
      size: "medium",
      gradient: "from-cyan-500 to-blue-600",
      hoverColor: "hover:bg-cyan-50"
    },
    {
      id: 6,
      title: "Session Recovery",
      description: "Never lose progress with automatic session persistence and welcome-back functionality.",
      icon: "RotateCcw",
      size: "medium",
      gradient: "from-indigo-500 to-purple-600",
      hoverColor: "hover:bg-indigo-50"
    }
  ],
  animations: {
    header: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, ease: "easeOut" }
    },
    cards: {
      initial: { opacity: 0, y: 40, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0.6, ease: "easeOut" }
    }
  },
  responsive: {
    mobile: {
      headingSize: "text-4xl",
      subheadingSize: "text-lg",
      cardPadding: "p-6",
      gridCols: "grid-cols-1"
    },
    tablet: {
      headingSize: "text-5xl",
      subheadingSize: "text-xl",
      cardPadding: "p-8",
      gridCols: "grid-cols-2"
    },
    desktop: {
      headingSize: "text-6xl",
      subheadingSize: "text-2xl",
      cardPadding: "p-10",
      gridCols: "grid-cols-3"
    }
  }
};
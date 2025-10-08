/**
 * Interview Data Configuration
 * Contains all static data, labels, and configuration for the interview system
 */

export const interviewData = {
  // Empty state when no interviews exist
  emptyState: {
    title: "Welcome to Your Interview Dashboard",
    subtitle: "Create your first AI-powered interview to get started",
    description: "Set up intelligent, automated interviews that evaluate candidates fairly and comprehensively. Generate unique access codes, customize questions, and track results—all in one place.",
    primaryAction: "Create Your First Interview",
    features: [
      {
        title: "AI-Powered Questions",
        description: "Automatically generate relevant technical questions based on roles"
      },
      {
        title: "Real-Time Evaluation",
        description: "Get instant AI scoring and feedback on candidate responses"
      },
      {
        title: "Secure Access Codes",
        description: "Unique codes for each interview ensure controlled access"
      },
      {
        title: "Comprehensive Reports",
        description: "View detailed analytics and candidate performance summaries"
      }
    ]
  },

  // Create interview modal
  createModal: {
    title: "Create New Interview",
    subtitle: "Set up a new AI-powered interview session",
    fields: {
      title: {
        label: "Interview Title",
        placeholder: "e.g., Senior Full Stack Developer Interview",
        required: true,
        minLength: 5,
        maxLength: 255,
        helperText: "Give your interview a descriptive name"
      },
      roles: {
        label: "Target Roles",
        placeholder: "e.g., React, Node.js, PostgreSQL, TypeScript",
        required: true,
        helperText: "Enter comma-separated roles and technologies. AI will generate relevant questions based on these.",
        examples: ["React, Node.js, MongoDB", "Python, Django, AWS", "Java, Spring Boot, MySQL"]
      },
      customQuestions: {
        label: "Custom Questions (Optional)",
        placeholder: "Add your own specific questions...",
        required: false,
        helperText: "Add custom questions that will be included alongside AI-generated ones",
        addButton: "Add Custom Question",
        removeButton: "Remove",
        questionPlaceholder: "Enter your question",
        difficultyLabel: "Difficulty"
      }
    },
    buttons: {
      cancel: "Cancel",
      create: "Create Interview",
      creating: "Creating..."
    },
    success: {
      title: "Interview Created Successfully!",
      message: "Your interview has been created. Copy the access code to share with candidates.",
      copyButton: "Copy Access Code",
      copied: "Copied!",
      viewButton: "View Interview",
      createAnotherButton: "Create Another"
    },
    errors: {
      titleRequired: "Interview title is required",
      titleTooShort: "Title must be at least 5 characters",
      titleTooLong: "Title must be less than 255 characters",
      rolesRequired: "At least one role is required",
      rolesInvalid: "Please enter valid comma-separated roles",
      creationFailed: "Failed to create interview. Please try again."
    }
  },

  // Interview list/dashboard
  list: {
    title: "Your Interviews",
    subtitle: "Manage and monitor your interview sessions",
    searchPlaceholder: "Search by title, access code, or role...",
    sortOptions: [
      { value: "newest", label: "Newest First" },
      { value: "oldest", label: "Oldest First" },
      { value: "title", label: "Title (A-Z)" },
      { value: "sessions", label: "Most Sessions" }
    ],
    filters: {
      all: "All Interviews",
      active: "Active",
      completed: "Completed",
      archived: "Archived"
    },
    emptySearch: {
      title: "No interviews found",
      message: "Try adjusting your search or filters"
    },
    createButton: "Create New Interview"
  },

  // Interview card
  card: {
    labels: {
      accessCode: "Access Code",
      roles: "Roles",
      sessions: "Sessions",
      completed: "Completed",
      created: "Created",
      status: "Status"
    },
    statusBadges: {
      active: { label: "Active", color: "green" },
      completed: { label: "Completed", color: "blue" },
      archived: { label: "Archived", color: "gray" }
    },
    actions: {
      view: "View Details",
      copy: "Copy Code",
      copied: "Copied!",
      archive: "Archive",
      unarchive: "Unarchive",
      delete: "Delete",
      share: "Share"
    },
    confirmDelete: {
      title: "Delete Interview?",
      message: "This will permanently delete the interview and all associated sessions. This action cannot be undone.",
      confirm: "Delete Interview",
      cancel: "Cancel"
    }
  },

  // Interview details page
  details: {
    tabs: {
      overview: "Overview",
      sessions: "Sessions",
      settings: "Settings"
    },
    overview: {
      title: "Interview Overview",
      accessCode: "Access Code",
      copyCode: "Copy Code",
      shareTitle: "Share with Candidates",
      shareDescription: "Send this access code to candidates or use the email invitation feature below",
      statsTitle: "Statistics",
      stats: {
        totalSessions: "Total Sessions",
        completed: "Completed",
        inProgress: "In Progress",
        averageScore: "Average Score"
      },
      rolesTitle: "Target Roles",
      customQuestionsTitle: "Custom Questions",
      noCustomQuestions: "No custom questions added"
    },
    sessions: {
      title: "Candidate Sessions",
      searchPlaceholder: "Search by name or email...",
      sortOptions: [
        { value: "newest", label: "Newest First" },
        { value: "score", label: "Highest Score" },
        { value: "name", label: "Name (A-Z)" }
      ],
      statusFilter: {
        all: "All Status",
        completed: "Completed",
        inProgress: "In Progress",
        notStarted: "Not Started"
      },
      emptyState: {
        title: "No sessions yet",
        message: "Candidates who use your access code will appear here"
      },
      columns: {
        candidate: "Candidate",
        email: "Email",
        status: "Status",
        score: "Score",
        started: "Started",
        completed: "Completed",
        aiSummary: "AI Summary",
        actions: "Actions"
      }
    },
    invitations: {
      title: "Send Email Invitations",
      description: "Enter candidate email addresses to automatically send interview invitations with the access code",
      placeholder: "candidate1@example.com, candidate2@example.com",
      helperText: "Enter comma-separated email addresses",
      sendButton: "Send Invitations",
      sending: "Sending...",
      success: "Invitations sent successfully!",
      error: "Failed to send invitations"
    }
  },

  // Question difficulty settings
  difficulty: {
    easy: {
      label: "Easy",
      timeLimit: 20,
      color: "green",
      description: "Basic concept questions"
    },
    medium: {
      label: "Medium",
      timeLimit: 60,
      color: "yellow",
      description: "Intermediate problem-solving"
    },
    hard: {
      label: "Hard",
      timeLimit: 120,
      color: "red",
      description: "Advanced technical challenges"
    }
  },

  // Interview flow configuration
  flow: {
    totalQuestions: 6,
    questionDistribution: {
      easy: 2,
      medium: 2,
      hard: 2
    },
    scoringSystem: {
      maxScore: 100,
      questionWeight: {
        easy: 10,
        medium: 15,
        hard: 25
      }
    }
  },

  // Messages and notifications
  messages: {
    createSuccess: "Interview created successfully!",
    updateSuccess: "Interview updated successfully!",
    deleteSuccess: "Interview deleted successfully!",
    archiveSuccess: "Interview archived successfully!",
    copySuccess: "Access code copied to clipboard!",
    invitationsSent: "Invitations sent successfully!",
    error: "Something went wrong. Please try again."
  },

  // Validation rules
  validation: {
    title: {
      min: 5,
      max: 255,
      pattern: /^[a-zA-Z0-9\s\-\_]+$/
    },
    roles: {
      min: 1,
      max: 10,
      pattern: /^[a-zA-Z0-9\s\.\,\/\+\#\-]+$/
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
  }
};
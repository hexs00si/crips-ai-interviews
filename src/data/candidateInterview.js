/**
 * Candidate Interview Data Configuration
 * Contains all static data, labels, and configuration for the candidate interview system
 */

export const candidateInterviewData = {
  // Access code entry
  accessCode: {
    title: 'Enter Your Interview Code',
    subtitle: 'Enter the access code provided by your interviewer to begin',
    inputLabel: 'Access Code',
    inputPlaceholder: 'CRISP-XXXX-XXXX',
    submitButton: 'Continue',
    submitting: 'Verifying...',
    errors: {
      required: 'Access code is required',
      invalid: 'Invalid access code format',
      notFound: 'Access code not found or expired',
      alreadyUsed: 'This interview has already been completed'
    },
    helperText: 'Format: CRISP-XXXX-XXXX',
    backButton: 'Back to Home'
  },

  // Resume upload
  resumeUpload: {
    title: 'Upload Your Resume',
    subtitle: 'We\'ll extract your information to get started quickly',
    dragDropText: 'Drag and drop your resume here',
    orText: 'or',
    browseButton: 'Browse Files',
    acceptedFormats: 'Accepted formats: PDF, DOCX',
    maxSize: 'Maximum size: 10MB',
    uploadButton: 'Upload Resume',
    uploading: 'Uploading...',
    parsing: 'Extracting information...',
    skipButton: 'Skip and enter manually',
    errors: {
      fileType: 'Please upload a PDF or DOCX file',
      fileSize: 'File size must be less than 10MB',
      uploadFailed: 'Failed to upload resume. Please try again.',
      parseFailed: 'Could not extract information from resume'
    },
    success: {
      title: 'Resume Uploaded Successfully!',
      message: 'We\'ve extracted the following information:'
    }
  },

  // Extracted fields review
  extractedFields: {
    title: 'Review Your Information',
    subtitle: 'Please verify the information we extracted from your resume',
    fields: {
      name: {
        label: 'Full Name',
        placeholder: 'John Doe'
      },
      email: {
        label: 'Email Address',
        placeholder: 'john@example.com'
      },
      phone: {
        label: 'Phone Number',
        placeholder: '+1 (234) 567-8900'
      }
    },
    missingFieldsNote: 'Some information is missing. Our AI assistant will help you complete your profile.',
    editButton: 'Edit Information',
    continueButton: 'Continue',
    allFieldsComplete: 'All information looks good!'
  },

  // AI Chatbot for missing fields
  chatbot: {
    title: 'Complete Your Profile',
    subtitle: 'Our AI assistant will help you fill in the missing information',
    welcomeMessage: 'Hi! I noticed some information is missing from your resume. Let me help you complete your profile before we begin the interview.',
    inputPlaceholder: 'Type your response here...',
    sendButton: 'Send',
    thinking: 'AI is typing...',
    continueButton: 'Start Interview',
    allCompleteMessage: 'Great! We have all the information we need. You\'re ready to start the interview!'
  },

  // Interview instructions
  instructions: {
    title: 'Interview Instructions',
    subtitle: 'Please read carefully before starting',
    rules: [
      {
        icon: 'Clock',
        title: 'Timed Questions',
        description: 'You will have 6 multiple-choice questions with different time limits: Easy (20s), Medium (60s), Hard (120s)'
      },
      {
        icon: 'AlertTriangle',
        title: 'Auto-Submit',
        description: 'When time runs out, your answer will be automatically submitted and you\'ll move to the next question'
      },
      {
        icon: 'ArrowRight',
        title: 'One Way Only',
        description: 'You cannot go back to previous questions. Make sure to review your answer before submitting'
      },
      {
        icon: 'Monitor',
        title: 'Stay Focused',
        description: 'Switching tabs or windows will pause the interview. You\'ll see a warning and need to resume manually'
      },
      {
        icon: 'CheckCircle',
        title: 'Final Review',
        description: 'After all questions, you can review your answers and ask our AI assistant for explanations'
      },
      {
        icon: 'Target',
        title: 'Scoring',
        description: 'Each correct answer counts towards your final score. The interview will be automatically submitted after the last question'
      }
    ],
    readyCheck: {
      label: 'I have read and understood the instructions',
      required: 'You must agree to the instructions to continue'
    },
    startButton: 'Start Interview',
    backButton: 'Review Information'
  },

  // Interview question view
  questionView: {
    questionLabel: 'Question',
    of: 'of',
    difficulty: {
      easy: {
        label: 'Easy',
        color: 'green',
        time: 20
      },
      medium: {
        label: 'Medium',
        color: 'yellow',
        time: 60
      },
      hard: {
        label: 'Hard',
        color: 'red',
        time: 120
      }
    },
    timeRemaining: 'Time Remaining',
    selectOption: 'Select your answer',
    submitButton: 'Submit Answer',
    submitting: 'Submitting...',
    nextQuestion: 'Next Question',
    autoSubmit: 'Time\'s up! Auto-submitting...',
    loadingNext: 'Loading next question...',
    correctLabel: 'Correct!',
    incorrectLabel: 'Incorrect',
    explanationLabel: 'Explanation:',
    buttons: {
      submit: 'Submit Answer',
      submitting: 'Submitting...',
      next: 'Next Question'
    }
  },

  // Tab switch warning
  tabSwitchWarning: {
    title: 'Interview Paused',
    icon: 'AlertTriangle',
    message: 'You switched tabs or windows. Please do not leave this page during the interview.',
    warning: 'Multiple tab switches may be reported to your interviewer.',
    resumeButton: 'Resume Interview',
    switchCount: 'Tab switches'
  },

  // Welcome back modal
  welcomeBack: {
    title: 'Welcome Back!',
    message: 'You have an unfinished interview session.',
    details: {
      interview: 'Interview',
      progress: 'Progress',
      status: 'Status',
      lastActivity: 'Last Activity'
    },
    resumeButton: 'Resume Interview',
    startNewButton: 'Start Over',
    confirmRestart: {
      title: 'Are you sure?',
      message: 'Starting over will reset your progress and you\'ll need to begin from the first question.',
      confirm: 'Yes, Start Over',
      cancel: 'Cancel'
    }
  },

  // Interview results
  results: {
    title: 'Interview Complete!',
    subtitle: 'Here\'s how you performed',
    score: {
      label: 'Your Score',
      outOf: 'out of',
      percentage: 'Percentage'
    },
    performance: {
      excellent: {
        title: 'Excellent Work!',
        message: 'You demonstrated strong knowledge and skills.',
        color: 'green'
      },
      good: {
        title: 'Good Job!',
        message: 'You performed well with room for growth.',
        color: 'blue'
      },
      fair: {
        title: 'Fair Performance',
        message: 'Consider reviewing the concepts and trying again.',
        color: 'yellow'
      },
      needsImprovement: {
        title: 'Needs Improvement',
        message: 'Study the topics covered and strengthen your skills.',
        color: 'red'
      }
    },
    breakdown: {
      title: 'Question Breakdown',
      question: 'Question',
      yourAnswer: 'Your Answer',
      correctAnswer: 'Correct Answer',
      result: 'Result',
      correct: 'Correct',
      incorrect: 'Incorrect',
      timeTaken: 'Time Taken',
      seconds: 'seconds',
      viewExplanation: 'View Explanation'
    },
    aiSummary: {
      title: 'AI Assessment Summary',
      generating: 'Generating personalized feedback...'
    },
    askAI: {
      title: 'Ask the AI',
      subtitle: 'Have questions about your answers? Ask our AI assistant for explanations and tips.',
      placeholder: 'Ask a question about your interview...',
      suggestions: [
        'Why was question 3 incorrect?',
        'Explain the correct answer for question 5',
        'How can I improve my performance?',
        'What topics should I study more?'
      ]
    },
    submitButton: 'Submit Assessment',
    reviewButton: 'Review Answers',
    downloadButton: 'Download Results'
  },

  // Final submission
  finalSubmission: {
    title: 'Submit Your Interview',
    message: 'Once submitted, you cannot make any changes. Your results will be sent to the interviewer.',
    confirmButton: 'Confirm Submission',
    cancelButton: 'Review Again',
    submitting: 'Submitting...',
    success: {
      title: 'Interview Submitted Successfully!',
      message: 'Thank you for completing the interview. Your results have been sent to the interviewer.',
      homeButton: 'Return to Home'
    }
  },

  // Error states
  errors: {
    loadingSession: {
      title: 'Error Loading Session',
      message: 'We couldn\'t load your interview session. Please check your access code and try again.'
    },
    loadingQuestion: {
      title: 'Error Loading Question',
      message: 'We couldn\'t load the next question. Please try again.'
    },
    submittingAnswer: {
      title: 'Error Submitting Answer',
      message: 'We couldn\'t submit your answer. Please try again.'
    },
    generic: {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Please refresh the page and try again.'
    },
    retryButton: 'Try Again',
    homeButton: 'Go Home'
  },

  // Timer warnings
  timer: {
    halfTimeWarning: 'Half time remaining!',
    lowTimeWarning: '10 seconds left!',
    finalWarning: '5 seconds!'
  },

  // Progress tracking
  progress: {
    step1: 'Access Code',
    step2: 'Upload Resume',
    step3: 'Complete Profile',
    step4: 'Instructions',
    step5: 'Interview',
    step6: 'Results'
  }
};

// Export with both names for compatibility
export const candidateInterview = candidateInterviewData;
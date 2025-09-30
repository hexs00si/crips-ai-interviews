export const dashboardData = {
  welcome: {
    title: "Dashboard",
    message: "Welcome to your Crisp AI Interviews dashboard! This is where you'll manage your interviews.",
    description: "From here, you can create new interview sessions, manage existing ones, and review candidate evaluations."
  },
  header: {
    title: "Interview Dashboard",
    subtitle: "Manage and monitor your AI-powered interviews",
    createButton: "Create New Interview"
  },
  stats: {
    enabled: true,
    cards: [
      {
        id: 'total',
        label: 'Total Interviews',
        icon: 'briefcase'
      },
      {
        id: 'active',
        label: 'Active Interviews',
        icon: 'activity'
      },
      {
        id: 'sessions',
        label: 'Total Sessions',
        icon: 'users'
      },
      {
        id: 'completed',
        label: 'Completed Sessions',
        icon: 'checkCircle'
      }
    ]
  },
  quickActions: {
    enabled: false
  }
};
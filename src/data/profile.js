export const profileData = {
  title: "Profile",
  subtitle: "Manage your personal information and account settings",

  fields: {
    firstName: {
      label: "First Name",
      placeholder: "Enter your first name",
      validation: "min:2|max:50",
      required: true
    },
    lastName: {
      label: "Last Name",
      placeholder: "Enter your last name",
      validation: "min:2|max:50",
      required: true
    },
    company: {
      label: "Company",
      placeholder: "Your company name (optional)",
      validation: "min:2|max:100",
      required: false
    }
  },

  messages: {
    updateSuccess: "Profile updated successfully!",
    updateError: "Failed to update profile. Please try again.",
    deleteConfirm: "Are you sure you want to delete your account? This action cannot be undone.",
    deleteSuccess: "Account deleted successfully.",
    deleteError: "Failed to delete account. Please try again."
  },

  sections: {
    header: {
      title: "Your Profile",
      description: "View and manage your account information"
    },
    personalInfo: {
      title: "Personal Information",
      description: "Update your personal details"
    },
    dangerZone: {
      title: "Danger Zone",
      description: "Irreversible actions",
      deleteButton: "Delete Account",
      deleteWarning: "Once you delete your account, there is no going back. Please be certain."
    }
  }
};
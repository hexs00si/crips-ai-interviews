export const errorMessages = {
  notFound: {
    code: "404",
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist.",
    actionText: "Go Home",
    actionHref: "/"
  },
  unauthorized: {
    code: "403",
    title: "Access Denied",
    message: "You don't have permission to access this resource.",
    actionText: "Go Home",
    actionHref: "/"
  },
  serverError: {
    code: "500",
    title: "Server Error",
    message: "Something went wrong on our end. Please try again later.",
    actionText: "Go Home",
    actionHref: "/"
  },
  maintenance: {
    code: "503",
    title: "Under Maintenance",
    message: "We're currently performing maintenance. Please check back soon.",
    actionText: "Refresh",
    actionHref: "/"
  }
};
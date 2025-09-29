import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '@/features/auth/hooks/useAuth';

/**
 * ProtectedRoute component that handles authentication-based routing
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 * @param {boolean} props.requireAuth - Whether authentication is required (default: true)
 * @param {string} props.redirectTo - Where to redirect unauthorized users
 */
export function ProtectedRoute({
  children,
  allowedRoles = ['interviewer', 'admin'],
  requireAuth = true,
  redirectTo = '/login'
}) {
  const { isAuthenticated, isLoading, user, initialize } = useAuth();
  const location = useLocation();

  // Initialize auth state on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // If user is authenticated but doesn't have required role
  if (isAuthenticated && allowedRoles.length > 0) {
    const userRole = user?.user_metadata?.role;

    if (!allowedRoles.includes(userRole)) {
      return (
        <Navigate
          to="/unauthorized"
          state={{ from: location, requiredRoles: allowedRoles }}
          replace
        />
      );
    }
  }

  // If all checks pass, render the protected content
  return children;
}

/**
 * PublicRoute component for routes that should only be accessible to non-authenticated users
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.redirectTo - Where to redirect authenticated users
 */
export function PublicRoute({ children, redirectTo = '/dashboard' }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If user is not authenticated, render the public content
  return children;
}

/**
 * RoleBasedRoute component for routes with specific role requirements
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.requiredRole - Single role required to access this route
 * @param {React.ReactNode} props.fallback - Component to render if role doesn't match
 */
export function RoleBasedRoute({ children, requiredRole, fallback = null }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.user_metadata?.role;

  if (userRole !== requiredRole) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
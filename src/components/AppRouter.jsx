import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute';
import { FloatingNavbar } from '@/components/ui/FloatingNavbar';
import { ConnectionTest } from './ConnectionTest';

// Auth Pages
import { LoginForm } from '@/features/auth/components/LoginForm';
import { SignupForm } from '@/features/auth/components/SignupForm';

// Public Pages
import { LandingPage } from '@/pages/LandingPage';
import { AboutPage } from '@/pages/AboutPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { CandidateAccessPage } from '@/pages/CandidateAccessPage';

// Protected Pages
import { DashboardPage } from '@/pages/DashboardPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdminPage } from '@/pages/AdminPage';

// Error Pages
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      {/* Floating Navbar - shown on all pages */}
      <FloatingNavbar />

      {/* Connection Test Component - only show in development */}
      {import.meta.env.DEV && <ConnectionTest />}

      <Routes>
        {/* Public Routes - Landing & About */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Auth Routes - Login & Signup */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupForm />
            </PublicRoute>
          }
        />

        {/* Password Reset */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Candidate Access */}
        <Route path="/interview/:accessCode?" element={<CandidateAccessPage />} />

        {/* Protected Routes - Dashboard & Profile */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['interviewer', 'admin']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['interviewer', 'admin']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Error Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Catch All - Redirect to 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
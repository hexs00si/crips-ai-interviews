import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute';
import { FloatingNavbar } from '@/components/ui/FloatingNavbar';
import { ConnectionTest } from './ConnectionTest';

// Auth Pages
import { LoginForm } from '@/features/auth/components/LoginForm';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { UnifiedAuthPage } from '@/pages/UnifiedAuthPage';

// Public Pages
import { LandingPage } from '@/pages/LandingPage';
import { AboutPage } from '@/pages/AboutPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';

// Candidate Pages
import { CandidateAccessPage } from '@/features/candidate/pages/CandidateAccessPage';
import { CandidateInfoPage } from '@/features/candidate/pages/CandidateInfoPage';
import { InterviewPage } from '@/features/candidate/pages/InterviewPage';
import { ResultsPage } from '@/features/candidate/pages/ResultsPage';

// Protected Pages
import { DashboardPage } from '@/pages/DashboardPage';
import { InterviewDetailsPage } from '@/pages/InterviewDetailsPage';
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

        {/* Unified Auth Route - Primary Entry Point */}
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <UnifiedAuthPage />
            </PublicRoute>
          }
        />

        {/* Legacy Auth Routes - Kept for Backward Compatibility */}
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

        {/* Candidate Routes - Interview Flow */}
        <Route path="/candidate" element={<CandidateAccessPage />} />
        <Route path="/candidate/info" element={<CandidateInfoPage />} />
        <Route path="/candidate/interview" element={<InterviewPage />} />
        <Route path="/candidate/results" element={<ResultsPage />} />

        {/* Legacy Candidate Access (redirect to /candidate) */}
        <Route path="/interview/:accessCode?" element={<Navigate to="/candidate" replace />} />

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
          path="/dashboard/interview/:id"
          element={
            <ProtectedRoute allowedRoles={['interviewer', 'admin']}>
              <InterviewDetailsPage />
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
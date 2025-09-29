import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { Hero } from '@/components/sections/Hero';
import { Features } from '@/components/sections/Features';
import { FloatingNavbar } from '@/components/ui/FloatingNavbar';
import { ConnectionTest } from './ConnectionTest';

// Dashboard component (placeholder)
function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Welcome to your Crisp AI Interviews dashboard! This is where you'll manage your interviews.
          </p>
        </div>
      </div>
    </div>
  );
}

// Landing page component
function LandingPage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
    </div>
  );
}

// About page component
function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-gray-900 mb-6">About Crisp AI Interviews</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing the interview process with intelligent automation and comprehensive candidate evaluation.
          </p>
        </div>

        <div className="grid gap-12 md:gap-16">
          {/* Mission */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To streamline the hiring process by providing intelligent, AI-powered interview solutions that help companies
              find the right candidates while ensuring a fair and comprehensive evaluation process for every applicant.
            </p>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-primary-600 mb-2">For Interviewers</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Create interview sessions with ease</li>
                  <li>• Generate unique access codes for candidates</li>
                  <li>• Monitor progress in real-time</li>
                  <li>• Review comprehensive evaluation reports</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary-600 mb-2">For Candidates</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Simple access with invitation codes</li>
                  <li>• No account creation required</li>
                  <li>• AI-powered question generation</li>
                  <li>• Fair and unbiased evaluation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Started</h2>
            <p className="text-gray-600 mb-6">
              Ready to transform your interview process? Join thousands of companies already using Crisp AI Interviews.
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="/signup"
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Start Free Trial
              </a>
              <a
                href="/"
                className="border border-gray-300 hover:border-primary-500 text-gray-700 hover:text-primary-600 font-semibold px-6 py-3 rounded-lg transition-all duration-200"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Unauthorized page component
function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this resource.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

// 404 Not Found page
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

// Password reset page (placeholder)
function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Reset Password</h1>
        <p className="text-gray-600">
          Password reset functionality will be implemented here.
        </p>
      </div>
    </div>
  );
}

// Candidate access page (placeholder)
function CandidateAccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Candidate Access</h1>
        <p className="text-gray-600">
          Candidate interview access will be implemented here.
        </p>
      </div>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      {/* Floating Navbar - shown on all pages except auth pages */}
      <FloatingNavbar />

      {/* Connection Test Component - only show in development */}
      {import.meta.env.DEV && <ConnectionTest />}

      <Routes>
        {/* Public routes (accessible to non-authenticated users) */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />

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

        {/* About page (accessible to all) */}
        <Route path="/about" element={<AboutPage />} />

        {/* Password reset (accessible to all) */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Candidate access (public but with code validation) */}
        <Route path="/interview/:accessCode?" element={<CandidateAccessPage />} />

        {/* Protected routes (require authentication) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['interviewer', 'admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Profile page */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['interviewer', 'admin']}>
              <div className="min-h-screen bg-gray-50 pt-24 p-8">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Profile management coming soon!</p>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Settings page */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['interviewer', 'admin']}>
              <div className="min-h-screen bg-gray-50 pt-24 p-8">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">Settings panel coming soon!</p>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Admin only routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold">Admin Panel (Coming Soon)</h1>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Error routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Catch all route - redirect to 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { LogOut, User, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuth from '@/features/auth/hooks/useAuth';

export function MobileMenu({ isOpen, onClose, navItems, isActiveRoute }) {
  const { isAuthenticated, isLoading, user, signOut, getFullName, getInitials, isInterviewer, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    onClose();
    const result = await signOut();
    if (result.success) {
      navigate('/');
    }
  };

  const handleLoginClick = () => {
    onClose();
    navigate('/auth');
  };

  const fullName = getFullName();
  const initials = getInitials();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Mobile Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <Link
                    to="/"
                    onClick={onClose}
                    className="text-xl font-black text-gray-900"
                  >
                    Crisp
                  </Link>
                </div>

                {/* User Info or Welcome */}
                {isAuthenticated && !isLoading && (
                  <div className="mt-4 flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{fullName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <p className="text-xs text-primary-600 font-medium">
                        {isAdmin ? 'Admin' : isInterviewer ? 'Interviewer' : 'User'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Items */}
              <div className="flex-1 py-6">
                <nav className="space-y-2 px-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.link}
                      onClick={onClose}
                      className={cn(
                        'flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200',
                        isActiveRoute(item.link)
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}

                  {/* Authenticated User Menu Items */}
                  {isAuthenticated && !isLoading && (
                    <>
                      <div className="border-t border-gray-100 my-4" />

                      <Link
                        to="/dashboard"
                        onClick={onClose}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-all duration-200"
                      >
                        <Briefcase className="h-5 w-5 text-gray-500" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={onClose}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-all duration-200"
                      >
                        <User className="h-5 w-5 text-gray-500" />
                        <span>Profile</span>
                      </Link>
                    </>
                  )}
                </nav>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : isAuthenticated ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-medium rounded-lg transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLoginClick}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md"
                  >
                    Login / Sign Up
                  </motion.button>
                )}

                {/* Footer Text */}
                <p className="text-center text-xs text-gray-500 mt-4">
                  Powered by Crisp AI Interviews
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
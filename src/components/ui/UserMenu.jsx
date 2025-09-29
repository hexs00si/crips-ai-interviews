import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { ChevronDown, User, Settings, LogOut, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuth from '@/features/auth/hooks/useAuth';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null); // Ref for the button element
  const dropdownRef = useRef(null); // Ref for the dropdown menu
  const { user, signOut, getFullName, getInitials, isInterviewer, isAdmin } = useAuth();
  const navigate = useNavigate();

  // --- FIX ---
  // Added state to hold the calculated position of the dropdown.
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  // --- FIX ---
  // This effect calculates the correct position for the dropdown when it opens.
  // It runs only when `isOpen` changes to true.
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, // Position it 8px below the button
        right: window.innerWidth - rect.right, // Align the right edge of the dropdown with the right edge of the button
      });
    }
  }, [isOpen]);


  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // --- FIX ---
      // Updated the logic to check against both the button and the dropdown refs.
      if (
        buttonRef.current && !buttonRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on escape key (no changes needed here)
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    const result = await signOut();
    if (result.success) {
      navigate('/');
    }
  };

  const fullName = getFullName();
  const initials = getInitials();

  return (
    // --- FIX ---
    // The `ref` is now on the button itself for accurate position measurement.
    // The root div no longer needs `overflow-visible` as it wasn't solving the parent clipping issue.
    <div className="relative">
      {/* User Button */}
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200',
          isOpen
            ? 'bg-primary-50 text-primary-600'
            : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
        )}
      >
        {/* User Avatar */}
        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {initials}
        </div>

        {/* User Name */}
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium">
            Hello, {fullName.split(' ')[0] || 'User'}
          </span>
          <span className="text-xs text-gray-500">
            {isAdmin ? 'Admin' : isInterviewer ? 'Interviewer' : 'User'}
          </span>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            // --- FIX ---
            // Changed positioning to 'fixed' to break out of the navbar's clipping context.
            // The position is now applied dynamically via the `style` prop.
            // Removed positioning classes like `right-0`, `top-full`, `mt-2`.
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
            }}
            className="fixed w-64 bg-white/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl py-2 z-[1000]"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
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
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
              >
                <Briefcase className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              <Link
                to="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-2" />

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { ChevronDown, User, LogOut, Briefcase } from 'lucide-react';
import useAuth from '@/features/auth/hooks/useAuth';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { signOut, getFullName, getInitials, isInterviewer, } = useAuth();
  const navigate = useNavigate();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
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
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-gray-50 focus:outline-none"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white flex items-center justify-center text-base font-semibold">
          {initials}
        </div>

        {/* User Info */}
        <div className="hidden sm:flex flex-col items-start text-left">
          <span className="text-sm font-medium text-gray-900">
            Hello, {fullName.split(' ')[0] || 'User'}
          </span>
          <span className="text-xs text-gray-500">
            {isInterviewer ? 'Interviewer' : 'User'}
          </span>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu - Fixed positioning and overflow */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-visible"
            style={{
              // Ensure the dropdown is fully visible and not clipped
              minWidth: '18rem'
            }}
          >
            

            {/* Menu Items */}
            <div className="py-2">
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 group"
              >
                <Briefcase className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                <span className="font-medium">Dashboard</span>
              </Link>
              
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 group"
              >
                <User className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                <span className="font-medium">Profile</span>
              </Link>
            </div>

            {/* Sign Out - Fixed to ensure full visibility */}
            <div className="border-t border-gray-100 px-1 py-1 rounded-b-xl">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 rounded-lg group mx-1"
              >
                <LogOut className="h-4 w-4 text-red-500 group-hover:text-red-600 transition-colors" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
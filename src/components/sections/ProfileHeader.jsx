import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Calendar, Shield } from 'lucide-react';
import useAuth from '@/features/auth/hooks/useAuth';

export function ProfileHeader() {
  const { user, getFullName, getInitials, isInterviewer } = useAuth();

  const fullName = getFullName();
  const initials = getInitials();
  const role =  isInterviewer ? 'Interviewer' : 'User';

  // Format creation date
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown';

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
        {/* Avatar */}
        <div className="flex-shrink-0 mb-4 md:mb-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white flex items-center justify-center text-base font-semibold">
          {initials}
        </div>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{fullName}</h2>
          <p className="text-gray-600 mb-4">{user?.email}</p>

          <div className="flex flex-wrap gap-4">
            {/* Role Badge */}
            <div className="flex items-center space-x-2 bg-primary-50 px-3 py-1 rounded-full">
              <Shield className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-600">{role}</span>
            </div>

            {/* Member Since */}
            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Member since {createdAt}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useForm } from 'react-hook-form';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { Label } from '@/components/ui/aceternity/label';
import { Input } from '@/components/ui/aceternity/input';
import { RainbowButton } from '@/components/ui/rainbow-button';
import useAuth from '@/features/auth/hooks/useAuth';
import { validateEmail } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

export function ResetPasswordPage() {
  const { resetPassword, isLoading, error } = useAuth();
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await resetPassword(data.email);

      if (result.success) {
        setResetSent(true);
      }
    } catch (err) {
      console.error('Password reset error:', err);
    }
  };

  if (resetSent) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent you instructions to reset your password"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-gray-600 mb-6 leading-relaxed">
              Please check your email inbox and follow the instructions to reset your password.
              The link will expire in 24 hours.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setResetSent(false);
                }}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Didn't receive the email? Try again
              </button>

              <div>
                <button
                  onClick={() => navigate('/login')}
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors text-sm"
                >
                  Back to login →
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email address and we'll send you a link to reset your password"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Email Input */}
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            {...register('email', {
              required: 'Email is required',
              validate: (value) => {
                const validation = validateEmail(value);
                return validation.isValid || validation.error;
              }
            })}
            type="email"
            icon={Mail}
            error={errors.email}
            placeholder="john@company.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <RainbowButton
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Sending Reset Link...</span>
            </div>
          ) : (
            'Send Reset Link'
          )}
        </RainbowButton>

        {/* Back to Login */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            ← Back to login
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
import { useState } from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { Label } from "@/components/ui/aceternity/label";
import { Input } from "@/components/ui/aceternity/input";
import useAuth from "../hooks/useAuth";
import { validateEmail } from "@/lib/auth";

export function LoginForm() {
  const { signIn, resetPassword, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues
  } = useForm();

  const {
    register: resetRegister,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    reset: resetForm
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await signIn(data);

      if (result.success) {
        // Redirect will be handled by route protection
        console.log("Login successful:", result);
      } else {
        if (result.fieldErrors) {
          // Set field-specific errors
          Object.entries(result.fieldErrors).forEach(([field, message]) => {
            setError(field, { message });
          });
        }
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const onResetSubmit = async (data) => {
    try {
      const result = await resetPassword(data.email);

      if (result.success) {
        setResetSent(true);
        resetForm();
      }
    } catch (err) {
      console.error("Password reset error:", err);
    }
  };

  const handleForgotPassword = () => {
    const email = getValues("email");
    if (email) {
      resetForm({ email });
    }
    setShowResetForm(true);
  };

  if (showResetForm) {
    return (
      <AuthLayout
        title={resetSent ? "Check Your Email" : "Reset Password"}
        subtitle={
          resetSent
            ? "We've sent you instructions to reset your password."
            : "Enter your email address and we'll send you a reset link."
        }
      >
        {resetSent ? (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Mail className="w-8 h-8 text-blue-600" />
            </motion.div>
            <p className="text-gray-600 mb-6">
              Please check your email inbox and follow the instructions to reset your password.
            </p>
            <button
              onClick={() => {
                setShowResetForm(false);
                setResetSent(false);
              }}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-6">
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

            {/* Email */}
            <div>
              <Label htmlFor="reset-email">Email Address</Label>
              <Input
                id="reset-email"
                {...resetRegister("email", {
                  required: "Email is required",
                  validate: (value) => {
                    const validation = validateEmail(value);
                    return validation.isValid || validation.error;
                  }
                })}
                type="email"
                icon={Mail}
                error={resetErrors.email}
                placeholder="john@company.com"
              />
              {resetErrors.email && (
                <p className="mt-1 text-sm text-red-600">{resetErrors.email.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending Reset Link...</span>
                </div>
              ) : (
                "Send Reset Link"
              )}
            </motion.button>

            {/* Back to Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowResetForm(false);
                  setResetSent(false);
                }}
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Back to login
              </button>
            </div>
          </form>
        )}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your Crisp AI Interviews account to continue."
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

        {/* Email */}
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            {...register("email", {
              required: "Email is required",
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

        {/* Password */}
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              {...register("password", {
                required: "Password is required"
              })}
              type={showPassword ? "text" : "password"}
              icon={Lock}
              error={errors.password}
              placeholder="Enter your password"
              className="pr-12"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Forgot your password?
          </button>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Signing In...</span>
            </div>
          ) : (
            "Sign In"
          )}
        </motion.button>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Create one here
            </a>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
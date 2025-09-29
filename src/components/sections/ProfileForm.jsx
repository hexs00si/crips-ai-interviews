import { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useForm } from 'react-hook-form';
import { Edit2, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/aceternity/label';
import { Input } from '@/components/ui/aceternity/input';
import { RainbowButton } from '@/components/ui/rainbow-button';
import useAuth from '@/features/auth/hooks/useAuth';
import { profileData } from '@/data/profile';
import { validateName, validateCompany } from '@/lib/auth';

export function ProfileForm() {
  const { getUserMetadata, updateProfile, refreshUser, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  // Load current data
  useEffect(() => {
    const metadata = getUserMetadata();
    reset({
      firstName: metadata.first_name || '',
      lastName: metadata.last_name || '',
      company: metadata.company || ''
    });
  }, [getUserMetadata, reset]);

  const onSubmit = async (data) => {
    try {
      setErrorMessage('');

      const updates = {
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        company: data.company?.trim() || null
      };

      const result = await updateProfile(updates);

      if (result.success) {
        await refreshUser(); // Reload user data
        setShowSuccess(true);
        setIsEditing(false);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        setErrorMessage(result.error || profileData.messages.updateError);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setErrorMessage(profileData.messages.updateError);
    }
  };

  const handleCancel = () => {
    const metadata = getUserMetadata();
    reset({
      firstName: metadata.first_name || '',
      lastName: metadata.last_name || '',
      company: metadata.company || ''
    });
    setIsEditing(false);
    setErrorMessage('');
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            {profileData.sections.personalInfo.title}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {profileData.sections.personalInfo.description}
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-5 h-5" />
            <span className="font-medium">Edit</span>
          </button>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3"
        >
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          <p className="text-green-700 text-sm">{profileData.messages.updateSuccess}</p>
        </motion.div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 text-sm">{errorMessage}</p>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* First Name */}
        <div>
          <Label htmlFor="firstName">{profileData.fields.firstName.label}</Label>
          <Input
            id="firstName"
            {...register('firstName', {
              required: 'First name is required',
              validate: (value) => {
                const validation = validateName(value);
                return validation.isValid || validation.error;
              }
            })}
            type="text"
            error={errors.firstName}
            placeholder={profileData.fields.firstName.placeholder}
            disabled={!isEditing}
            className={!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <Label htmlFor="lastName">{profileData.fields.lastName.label}</Label>
          <Input
            id="lastName"
            {...register('lastName', {
              required: 'Last name is required',
              validate: (value) => {
                const validation = validateName(value);
                return validation.isValid || validation.error;
              }
            })}
            type="text"
            error={errors.lastName}
            placeholder={profileData.fields.lastName.placeholder}
            disabled={!isEditing}
            className={!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>

        {/* Company */}
        <div>
          <Label htmlFor="company">{profileData.fields.company.label}</Label>
          <Input
            id="company"
            {...register('company', {
              validate: (value) => {
                if (!value || value.trim() === '') return true; // Optional field
                const validation = validateCompany(value);
                return validation.isValid || validation.error;
              }
            })}
            type="text"
            error={errors.company}
            placeholder={profileData.fields.company.placeholder}
            disabled={!isEditing}
            className={!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}
          />
          {errors.company && (
            <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex space-x-4">
            <RainbowButton
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </RainbowButton>

            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
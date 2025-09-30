import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X, Plus, Trash2, CheckCircle, Copy, Check } from 'lucide-react';
import { Label } from '@/components/ui/aceternity/label';
import { Input } from '@/components/ui/aceternity/input';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { interviewData } from '@/data/interviews';
import useInterviews from '@/features/interviews/hooks/useInterviews';

// Storage key for form draft persistence
const FORM_STORAGE_KEY = 'crisp_interview_form_draft';

export function CreateInterviewModal({ isOpen, onClose }) {
  const { createInterview, isLoading } = useInterviews();
  const { createModal } = interviewData;

  const [customQuestions, setCustomQuestions] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdInterview, setCreatedInterview] = useState(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm();

  // Watch form values for auto-save
  const formValues = watch();

  // Restore draft when modal opens
  useEffect(() => {
    if (isOpen && !showSuccess) {
      try {
        const savedDraft = sessionStorage.getItem(FORM_STORAGE_KEY);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          setValue('title', draft.title || '');
          setValue('roles', draft.roles || '');
          setCustomQuestions(draft.customQuestions || []);
        }
      } catch (err) {
        console.error('Failed to restore draft:', err);
      }
    }
  }, [isOpen, showSuccess, setValue]);

  // Auto-save draft when form values change
  useEffect(() => {
    if (isOpen && !showSuccess && (formValues.title || formValues.roles || customQuestions.length > 0)) {
      try {
        const draft = {
          title: formValues.title,
          roles: formValues.roles,
          customQuestions
        };
        sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(draft));
      } catch (err) {
        console.error('Failed to save draft:', err);
      }
    }
  }, [formValues.title, formValues.roles, customQuestions, isOpen, showSuccess]);

  // Auto-close modal 3 seconds after success
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const clearDraft = () => {
    try {
      sessionStorage.removeItem(FORM_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear draft:', err);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setCustomQuestions([]);
      setShowSuccess(false);
      setCreatedInterview(null);
      setCopied(false);
      clearDraft();
      onClose();
    }
  };

  const onSubmit = async (data) => {
    const result = await createInterview(
      data.title,
      data.roles,
      customQuestions
    );

    if (result.success) {
      setCreatedInterview({
        ...result.data,
        accessCode: result.accessCode
      });
      setShowSuccess(true);
      clearDraft(); // Clear saved draft after successful creation
    }
  };

  const addCustomQuestion = () => {
    setCustomQuestions([
      ...customQuestions,
      { question: '', difficulty: 'medium' }
    ]);
  };

  const removeCustomQuestion = (index) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const updateCustomQuestion = (index, field, value) => {
    const updated = [...customQuestions];
    updated[index][field] = value;
    setCustomQuestions(updated);
  };

  const handleCopyCode = async () => {
    if (createdInterview?.accessCode) {
      await navigator.clipboard.writeText(createdInterview.accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateAnother = () => {
    reset();
    setCustomQuestions([]);
    setShowSuccess(false);
    setCreatedInterview(null);
    setCopied(false);
    clearDraft();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {showSuccess ? (
            /* Success View */
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {createModal.success.title}
                </h2>
                <p className="text-gray-600">
                  {createModal.success.message}
                </p>
              </div>

              {/* Access Code Display */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Access Code
                </p>
                <div className="flex items-center justify-between bg-white rounded-lg p-4">
                  <code className="text-2xl font-bold text-primary-600">
                    {createdInterview?.accessCode}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{createModal.success.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>{createModal.success.copyButton}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={handleCreateAnother}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
                >
                  {createModal.success.createAnotherButton}
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Create Form */
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {createModal.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {createModal.subtitle}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                {/* Interview Title */}
                <div className="mb-6">
                  <Label htmlFor="title">{createModal.fields.title.label}</Label>
                  <Input
                    id="title"
                    {...register('title', {
                      required: createModal.errors.titleRequired,
                      minLength: {
                        value: createModal.fields.title.minLength,
                        message: createModal.errors.titleTooShort
                      },
                      maxLength: {
                        value: createModal.fields.title.maxLength,
                        message: createModal.errors.titleTooLong
                      }
                    })}
                    type="text"
                    placeholder={createModal.fields.title.placeholder}
                    error={errors.title}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {createModal.fields.title.helperText}
                  </p>
                </div>

                {/* Target Roles */}
                <div className="mb-6">
                  <Label htmlFor="roles">{createModal.fields.roles.label}</Label>
                  <Input
                    id="roles"
                    {...register('roles', {
                      required: createModal.errors.rolesRequired
                    })}
                    type="text"
                    placeholder={createModal.fields.roles.placeholder}
                    error={errors.roles}
                  />
                  {errors.roles && (
                    <p className="mt-1 text-sm text-red-600">{errors.roles.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {createModal.fields.roles.helperText}
                  </p>
                </div>

                {/* Custom Questions */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <Label>{createModal.fields.customQuestions.label}</Label>
                    <button
                      type="button"
                      onClick={addCustomQuestion}
                      className="flex items-center space-x-2 px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{createModal.fields.customQuestions.addButton}</span>
                    </button>
                  </div>

                  {customQuestions.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      {createModal.fields.customQuestions.helperText}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {customQuestions.map((q, index) => (
                        <div key={index} className="flex space-x-3 items-start">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={q.question}
                              onChange={(e) =>
                                updateCustomQuestion(index, 'question', e.target.value)
                              }
                              placeholder={createModal.fields.customQuestions.questionPlaceholder}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            />
                            <select
                              value={q.difficulty}
                              onChange={(e) =>
                                updateCustomQuestion(index, 'difficulty', e.target.value)
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCustomQuestion(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
                  >
                    {createModal.buttons.cancel}
                  </button>
                  <RainbowButton
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? createModal.buttons.creating : createModal.buttons.create}
                  </RainbowButton>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
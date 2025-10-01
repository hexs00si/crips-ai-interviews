import { useState } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Key, ArrowRight, Loader2 } from 'lucide-react';
import { candidateInterview } from '@/data/candidateInterview';

export function AccessCodeForm({ onSubmit }) {
  const { accessCode } = candidateInterview;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCodeChange = (e) => {
    let value = e.target.value.toUpperCase();

    // Remove any characters that aren't alphanumeric or hyphens
    value = value.replace(/[^A-Z0-9\-]/g, '');

    // Auto-format as CRISP-XXXX-XXXX
    if (value.length > 0 && !value.startsWith('CRISP')) {
      value = 'CRISP-' + value;
    }

    // Add hyphens automatically
    if (value.length === 10 && !value.includes('-', 6)) {
      value = value.slice(0, 10) + '-' + value.slice(10);
    }

    // Limit to pattern length
    if (value.length > 15) {
      value = value.slice(0, 15);
    }

    setCode(value);
    setError('');
  };

  const validateCode = () => {
    const codePattern = /^CRISP-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

    if (!code.trim()) {
      setError(accessCode.errors.required);
      return false;
    }

    if (!codePattern.test(code)) {
      setError(accessCode.errors.invalid);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCode()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await onSubmit(code);

      if (!result.success) {
        setError(result.error || accessCode.errors.notFound);
      }
    } catch (err) {
      setError(accessCode.errors.server);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Key className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {accessCode.title}
          </h2>
          <p className="text-gray-600">
            {accessCode.subtitle}
          </p>
        </div>

        {/* Code Input */}
        <div className="space-y-2">
          <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">
            {accessCode.inputLabel}
          </label>
          <div className="relative">
            <input
              id="accessCode"
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder={accessCode.inputPlaceholder}
              disabled={isLoading}
              className={`w-full px-4 py-3 text-lg font-mono border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                error
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
          <p className="text-xs text-gray-500">
            {accessCode.helperText}
          </p>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 flex items-center space-x-1"
            >
              <span>{error}</span>
            </motion.p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || code.length < 15}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{accessCode.submitting}</span>
            </>
          ) : (
            <>
              <span>{accessCode.submitButton}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Back Button */}
        <div className="text-center">
          <a
            href="/"
            className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
          >
            {accessCode.backButton}
          </a>
        </div>
      </form>
    </motion.div>
  );
}
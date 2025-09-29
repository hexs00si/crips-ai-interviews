// Note: Argon2 hashing will be handled server-side for security
// Client-side validation utilities only

// Email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Password strength validation
const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false
};

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {Object} - Validation result with isValid and error message
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid, error, and strength score
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required', strength: 0 };
  }

  const errors = [];
  let strength = 0;

  // Check minimum length
  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters long`);
  } else {
    strength += 25;
  }

  // Check for uppercase letters
  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (/[A-Z]/.test(password)) {
    strength += 25;
  }

  // Check for lowercase letters
  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (/[a-z]/.test(password)) {
    strength += 25;
  }

  // Check for numbers
  if (PASSWORD_RULES.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (/\d/.test(password)) {
    strength += 25;
  }

  // Check for special characters (optional but adds strength)
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    strength = Math.min(strength + 15, 100); // Bonus for special chars
  }

  // Additional strength checks
  if (password.length >= 12) strength += 10;
  if (password.length >= 16) strength += 10;

  return {
    isValid: errors.length === 0,
    error: errors.length > 0 ? errors[0] : null,
    strength: Math.min(strength, 100),
    allErrors: errors
  };
};

/**
 * Validates password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Password confirmation
 * @returns {Object} - Validation result
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates user name (first/last name)
 * @param {string} name - Name to validate
 * @param {string} fieldName - Field name for error messages
 * @returns {Object} - Validation result
 */
export const validateName = (name, fieldName = 'Name') => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters long` };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, error: `${fieldName} must be less than 50 characters long` };
  }

  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
  }

  return { isValid: true, error: null };
};

/**
 * Validates company name
 * @param {string} company - Company name to validate
 * @returns {Object} - Validation result
 */
export const validateCompany = (company) => {
  if (!company || company.trim().length === 0) {
    return { isValid: false, error: 'Company name is required' };
  }

  const trimmedCompany = company.trim();

  if (trimmedCompany.length < 2) {
    return { isValid: false, error: 'Company name must be at least 2 characters long' };
  }

  if (trimmedCompany.length > 100) {
    return { isValid: false, error: 'Company name must be less than 100 characters long' };
  }

  return { isValid: true, error: null };
};

/**
 * Gets password strength label
 * @param {number} strength - Strength score (0-100)
 * @returns {Object} - Strength label and color
 */
export const getPasswordStrength = (strength) => {
  if (strength < 25) {
    return { label: 'Very Weak', color: 'text-red-500', bgColor: 'bg-red-500' };
  } else if (strength < 50) {
    return { label: 'Weak', color: 'text-orange-500', bgColor: 'bg-orange-500' };
  } else if (strength < 75) {
    return { label: 'Good', color: 'text-yellow-500', bgColor: 'bg-yellow-500' };
  } else if (strength < 90) {
    return { label: 'Strong', color: 'text-green-500', bgColor: 'bg-green-500' };
  } else {
    return { label: 'Very Strong', color: 'text-green-600', bgColor: 'bg-green-600' };
  }
};

/**
 * Validates complete signup form
 * @param {Object} formData - Form data object
 * @returns {Object} - Validation result with field-specific errors
 */
export const validateSignupForm = (formData) => {
  const errors = {};
  let isValid = true;

  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
    isValid = false;
  }

  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
    isValid = false;
  }

  // Validate password confirmation
  const confirmPasswordValidation = validatePasswordConfirmation(
    formData.password,
    formData.confirmPassword
  );
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.error;
    isValid = false;
  }

  // Validate first name
  const firstNameValidation = validateName(formData.firstName, 'First name');
  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation.error;
    isValid = false;
  }

  // Validate last name
  const lastNameValidation = validateName(formData.lastName, 'Last name');
  if (!lastNameValidation.isValid) {
    errors.lastName = lastNameValidation.error;
    isValid = false;
  }

  // Validate company (optional but if provided)
  if (formData.company) {
    const companyValidation = validateCompany(formData.company);
    if (!companyValidation.isValid) {
      errors.company = companyValidation.error;
      isValid = false;
    }
  }

  return {
    isValid,
    errors,
    passwordStrength: passwordValidation.strength
  };
};

/**
 * Validates login form
 * @param {Object} formData - Form data object
 * @returns {Object} - Validation result
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  let isValid = true;

  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
    isValid = false;
  }

  // Validate password (just check if present for login)
  if (!formData.password) {
    errors.password = 'Password is required';
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * Sanitizes user input to prevent XSS
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

/**
 * Generates a secure access code for candidates
 * @returns {string} - Formatted access code (CRISP-XXXX-XXXX)
 */
export const generateAccessCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const getRandomChar = () => characters.charAt(Math.floor(Math.random() * characters.length));

  const part1 = Array(4).fill().map(getRandomChar).join('');
  const part2 = Array(4).fill().map(getRandomChar).join('');

  return `CRISP-${part1}-${part2}`;
};

/**
 * Validates access code format
 * @param {string} code - Access code to validate
 * @returns {Object} - Validation result
 */
export const validateAccessCode = (code) => {
  if (!code) {
    return { isValid: false, error: 'Access code is required' };
  }

  const codeRegex = /^CRISP-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (!codeRegex.test(code.toUpperCase())) {
    return {
      isValid: false,
      error: 'Invalid access code format. Expected format: CRISP-XXXX-XXXX'
    };
  }

  return { isValid: true, error: null };
};

/**
 * Rate limiting helper (client-side basic protection)
 * @param {string} key - Unique key for the operation
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} - Rate limit status
 */
export const checkRateLimit = (key, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(`rateLimit_${key}`) || '[]');

  // Filter out attempts outside the time window
  const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);

  if (recentAttempts.length >= maxAttempts) {
    const oldestAttempt = Math.min(...recentAttempts);
    const resetTime = oldestAttempt + windowMs;
    const remainingTime = Math.ceil((resetTime - now) / 1000 / 60);

    return {
      allowed: false,
      error: `Too many attempts. Please try again in ${remainingTime} minutes.`,
      resetTime: new Date(resetTime)
    };
  }

  // Record this attempt
  recentAttempts.push(now);
  localStorage.setItem(`rateLimit_${key}`, JSON.stringify(recentAttempts));

  return {
    allowed: true,
    remainingAttempts: maxAttempts - recentAttempts.length
  };
};
/**
 * Password security validation utilities
 * Implements comprehensive password strength validation
 */

/**
 * Validates password strength according to security requirements
 * @param {string} password - The password to validate
 * @returns {Object} - Validation result with isValid flag and errors array
 */
export const validatePasswordStrength = (password) => {
  const errors = [];
  
  // Minimum length check (already handled by schema, but double-check)
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Maximum length check for security (prevent DoS attacks)
  if (password && password.length > 128) {
    errors.push('Password must be less than 128 characters long');
  }
  
  // Must contain at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Must contain at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Must contain at least one number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Must contain at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }
  
  // Check for common weak patterns
  const commonPatterns = [
    /(.)\1{2,}/, // Three or more repeated characters
    /123456|654321|abcdef|qwerty|password|admin|user/i, // Common sequences
    /^[a-zA-Z]+$/, // Only letters
    /^\d+$/, // Only numbers
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      if (pattern.source.includes('123456|654321')) {
        errors.push('Password cannot contain common sequences (123456, qwerty, password, etc.)');
      } else if (pattern.source.includes('(.)\\1{2,}')) {
        errors.push('Password cannot contain three or more repeated characters');
      } else if (pattern.source.includes('^[a-zA-Z]+$')) {
        errors.push('Password cannot contain only letters');
      } else if (pattern.source.includes('^\\d+$')) {
        errors.push('Password cannot contain only numbers');
      }
      break; // Only show one pattern error to avoid overwhelming user
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

/**
 * Calculates password strength score (0-100)
 * @param {string} password - The password to evaluate
 * @returns {number} - Strength score from 0 (weakest) to 100 (strongest)
 */
export const calculatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let score = 0;
  
  // Length scoring (up to 25 points)
  score += Math.min(password.length * 2, 25);
  
  // Character variety scoring (up to 60 points)
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (hasLower) score += 10;
  if (hasUpper) score += 10;
  if (hasNumber) score += 15;
  if (hasSpecial) score += 25;
  
  // Bonus for character variety (up to 15 points)
  const varietyCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (varietyCount >= 3) score += 10;
  if (varietyCount === 4) score += 5;
  
  // Penalty for common patterns
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters
    /123456|654321|abcdef|qwerty|password|admin|user/i, // Common sequences
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score -= 20;
      break;
    }
  }
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Gets password strength label based on score
 * @param {number} score - Password strength score (0-100)
 * @returns {string} - Strength label
 */
export const getPasswordStrengthLabel = (score) => {
  if (score < 30) return 'Weak';
  if (score < 60) return 'Fair';
  if (score < 80) return 'Good';
  return 'Strong';
};

/**
 * Validates that password and confirmation match
 * @param {string} password - The password
 * @param {string} confirmPassword - The password confirmation
 * @returns {Object} - Validation result
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  const errors = [];
  
  if (!confirmPassword) {
    errors.push('Password confirmation is required');
  } else if (password !== confirmPassword) {
    errors.push('Password and confirmation do not match');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
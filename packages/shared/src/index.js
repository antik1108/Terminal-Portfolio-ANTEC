// Shared types and constants for ANTEC Terminal Portfolio

// Authentication related constants
export const AUTH_CONSTANTS = {
  TOKEN_KEY: 'antec_auth_token',
  USER_KEY: 'antec_user',
  TOKEN_EXPIRY: '24h',
  BCRYPT_ROUNDS: 12,
  JWT_EXPIRES_IN: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
}

// API Response types (using JSDoc for comprehensive type hints)
/**
 * @typedef {Object} AuthResponse
 * @property {boolean} success - Whether the authentication operation was successful
 * @property {string} message - Human-readable message about the operation result
 * @property {User} [user] - User object if authentication was successful
 * @property {string} [token] - JWT token if authentication was successful
 */

/**
 * @typedef {Object} User
 * @property {string} _id - Unique user identifier
 * @property {string} username - User's chosen username (3-50 chars, alphanumeric + underscore)
 * @property {string} email - User's email address (unique, valid format)
 * @property {Date} createdAt - Account creation timestamp
 * @property {Date} updatedAt - Last account update timestamp
 * @property {Date} [lastLogin] - Last successful login timestamp
 */

/**
 * @typedef {Object} SignupRequest
 * @property {string} username - Desired username (3-50 chars, alphanumeric + underscore)
 * @property {string} email - User's email address
 * @property {string} password - User's password (minimum 8 characters)
 * @property {string} confirmPassword - Password confirmation (must match password)
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} emailOrUsername - User's email or username for login
 * @property {string} password - User's password
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false for error responses
 * @property {string} message - General error message
 * @property {ValidationError[]} [errors] - Array of specific validation errors
 * @property {string} [code] - Error code for programmatic handling
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} field - The field that failed validation
 * @property {string} message - Human-readable error message
 * @property {any} [value] - The invalid value that was provided
 */

/**
 * @typedef {Object} JWTPayload
 * @property {string} userId - User's unique identifier
 * @property {string} username - User's username
 * @property {string} email - User's email
 * @property {number} iat - Token issued at timestamp
 * @property {number} exp - Token expiration timestamp
 */

// Validation schemas with comprehensive rules and helper functions
export const VALIDATION = {
  username: {
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Username must be 3-50 characters, alphanumeric and underscore only'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    minLength: 8,
    message: 'Password must be at least 8 characters long'
  }
}

// Validation helper functions
export const validateField = (field, value, rules = VALIDATION[field]) => {
  if (!rules) return { isValid: true }
  
  const errors = []
  
  // Check minimum length
  if (rules.minLength && value.length < rules.minLength) {
    errors.push(`Must be at least ${rules.minLength} characters long`)
  }
  
  // Check maximum length
  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(`Must be no more than ${rules.maxLength} characters long`)
  }
  
  // Check pattern
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push(rules.message || 'Invalid format')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length > 0 ? errors[0] : null
  }
}

export const validateSignupRequest = (data) => {
  const errors = []
  
  // Validate username
  if (!data.username || data.username.trim().length === 0) {
    errors.push({ field: 'username', message: TERMINAL_CONSTANTS.ERROR_MESSAGES.USERNAME_REQUIRED })
  } else {
    const usernameValidation = validateField('username', data.username)
    if (!usernameValidation.isValid) {
      // Map generic validation errors to specific error messages
      const errorMessage = usernameValidation.errors[0]
      if (errorMessage.includes('at least')) {
        errors.push({ field: 'username', message: TERMINAL_CONSTANTS.ERROR_MESSAGES.USERNAME_TOO_SHORT })
      } else if (errorMessage.includes('no more than')) {
        errors.push({ field: 'username', message: TERMINAL_CONSTANTS.ERROR_MESSAGES.USERNAME_TOO_LONG })
      } else if (errorMessage.includes('Invalid format')) {
        errors.push({ field: 'username', message: TERMINAL_CONSTANTS.ERROR_MESSAGES.USERNAME_INVALID_FORMAT })
      } else {
        errors.push({ field: 'username', message: usernameValidation.message, value: data.username })
      }
    }
  }
  
  // Validate email
  if (!data.email || data.email.trim().length === 0) {
    errors.push({ field: 'email', message: TERMINAL_CONSTANTS.ERROR_MESSAGES.EMAIL_REQUIRED })
  } else {
    const emailValidation = validateField('email', data.email)
    if (!emailValidation.isValid) {
      errors.push({ field: 'email', message: TERMINAL_CONSTANTS.ERROR_MESSAGES.EMAIL_INVALID_FORMAT })
    }
  }
  
  // Validate password
  if (!data.password || data.password.length === 0) {
    errors.push({ field: 'password', message: TERMINAL_CONSTANTS.ERROR_MESSAGES.PASSWORD_REQUIRED })
  } else {
    const passwordValidation = validateField('password', data.password)
    if (!passwordValidation.isValid) {
      errors.push({ field: 'password', message: TERMINAL_CONSTANTS.ERROR_MESSAGES.PASSWORD_TOO_SHORT })
    }
  }
  
  // Validate password confirmation
  if (!data.confirmPassword || data.confirmPassword.length === 0) {
    errors.push({ field: 'confirmPassword', message: 'Password confirmation is required' })
  } else if (data.password !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: TERMINAL_CONSTANTS.ERROR_MESSAGES.PASSWORD_MISMATCH })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateLoginRequest = (data) => {
  const errors = []
  
  // Validate emailOrUsername (required field)
  if (!data.emailOrUsername || data.emailOrUsername.trim().length === 0) {
    errors.push({ field: 'emailOrUsername', message: 'Email or username is required' })
  }
  
  // Validate password (required field)
  if (!data.password || data.password.length === 0) {
    errors.push({ field: 'password', message: TERMINAL_CONSTANTS.ERROR_MESSAGES.PASSWORD_REQUIRED })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Terminal related constants
export const TERMINAL_CONSTANTS = {
  GUEST_PROMPT: 'guest@antec:~$',
  AUTHENTICATED_PROMPT: (username) => `${username}@antec:~$`,
  PASSWORD_MASK: '*',
  SUCCESS_MESSAGES: {
    SIGNUP: '✔ Account created successfully',
    LOGIN: '✔ Login successful', 
    LOGOUT: '✔ Logged out successfully',
    AUTO_LOGIN: '✔ You are now logged in'
  },
  ERROR_MESSAGES: {
    USERNAME_EXISTS: 'Username already exists',
    EMAIL_EXISTS: 'Email already registered',
    INVALID_CREDENTIALS: 'Invalid credentials',
    NETWORK_ERROR: 'Connection error. Please try again.',
    VALIDATION_ERROR: 'Please check your input and try again',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'Access denied',
    // Specific validation error messages
    USERNAME_REQUIRED: 'Username is required',
    USERNAME_TOO_SHORT: 'Username must be at least 3 characters',
    USERNAME_TOO_LONG: 'Username must be no more than 50 characters',
    USERNAME_INVALID_FORMAT: 'Username can only contain letters, numbers, and underscores',
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID_FORMAT: 'Please enter a valid email address',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
    PASSWORD_MISMATCH: 'Passwords do not match',
    // Network and server errors
    CONNECTION_TIMEOUT: 'Connection timed out. Please check your internet connection.',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later.',
    RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
    // Authentication specific errors
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
    TOKEN_INVALID: 'Invalid authentication token. Please log in again.',
    ACCOUNT_LOCKED: 'Account temporarily locked. Please try again later.',
    // General errors
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    OPERATION_CANCELLED: 'Operation cancelled by user'
  },
  COMMAND_STATES: {
    IDLE: 'idle',
    AUTHENTICATING: 'authenticating',
    PROCESSING: 'processing'
  }
}

// API endpoints configuration
export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:3001/api',
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me'
  }
}

// HTTP status codes for consistent error handling
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
}

// Authentication state constants
export const AUTH_STATES = {
  UNAUTHENTICATED: 'unauthenticated',
  AUTHENTICATING: 'authenticating', 
  AUTHENTICATED: 'authenticated',
  ERROR: 'error'
}
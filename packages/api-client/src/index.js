// API Client for ANTEC Terminal Portfolio Authentication
import { 
  API_ENDPOINTS, 
  HTTP_STATUS, 
  TERMINAL_CONSTANTS,
  validateSignupRequest,
  validateLoginRequest
} from '@antec/shared'

/**
 * Custom API Error class for better error handling
 */
export class APIError extends Error {
  constructor(message, status, code, errors = []) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.code = code
    this.errors = errors
  }
}

/**
 * HTTP Client for making API requests with comprehensive error handling
 */
class APIClient {
  constructor(baseURL = API_ENDPOINTS.BASE_URL) {
    this.baseURL = baseURL
  }

  /**
   * Make HTTP request with proper error handling and response parsing
   * @param {string} endpoint 
   * @param {RequestInit} options 
   * @returns {Promise<any>}
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    // Add auth token if available
    const token = this.getStoredToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, config)
      
      // Handle different content types
      let data
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = { message: await response.text() }
      }

      if (!response.ok) {
        // Map HTTP status codes to specific error messages
        let errorMessage = data.message || 'Request failed'
        let errorCode = data.code || 'REQUEST_FAILED'
        
        switch (response.status) {
          case HTTP_STATUS.BAD_REQUEST:
            if (data.errors && data.errors.length > 0) {
              // Use the first validation error as the main message
              errorMessage = data.errors[0].message || errorMessage
            }
            break
          case HTTP_STATUS.UNAUTHORIZED:
            errorMessage = TERMINAL_CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED
            errorCode = 'UNAUTHORIZED'
            break
          case HTTP_STATUS.FORBIDDEN:
            errorMessage = TERMINAL_CONSTANTS.ERROR_MESSAGES.FORBIDDEN
            errorCode = 'FORBIDDEN'
            break
          case HTTP_STATUS.NOT_FOUND:
            errorMessage = 'Resource not found'
            errorCode = 'NOT_FOUND'
            break
          case HTTP_STATUS.CONFLICT:
            // Keep the specific conflict message from server
            break
          case 429: // Rate limited
            errorMessage = TERMINAL_CONSTANTS.ERROR_MESSAGES.RATE_LIMITED
            errorCode = 'RATE_LIMITED'
            break
          case 503: // Service unavailable
            errorMessage = TERMINAL_CONSTANTS.ERROR_MESSAGES.SERVICE_UNAVAILABLE
            errorCode = 'SERVICE_UNAVAILABLE'
            break
          case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          default:
            errorMessage = TERMINAL_CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
            errorCode = 'SERVER_ERROR'
            break
        }
        
        throw new APIError(
          errorMessage,
          response.status,
          errorCode,
          data.errors || []
        )
      }

      return data
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      
      // Handle network errors with more specific messages
      if (error.name === 'TypeError') {
        if (error.message.includes('fetch')) {
          throw new APIError(
            TERMINAL_CONSTANTS.ERROR_MESSAGES.NETWORK_ERROR,
            0,
            'NETWORK_ERROR'
          )
        } else if (error.message.includes('timeout')) {
          throw new APIError(
            TERMINAL_CONSTANTS.ERROR_MESSAGES.CONNECTION_TIMEOUT,
            0,
            'CONNECTION_TIMEOUT'
          )
        }
      }
      
      // Handle AbortError (request cancelled)
      if (error.name === 'AbortError') {
        throw new APIError(
          TERMINAL_CONSTANTS.ERROR_MESSAGES.OPERATION_CANCELLED,
          0,
          'OPERATION_CANCELLED'
        )
      }
      
      // Handle other errors
      throw new APIError(
        error.message || TERMINAL_CONSTANTS.ERROR_MESSAGES.UNKNOWN_ERROR,
        0,
        'UNKNOWN_ERROR'
      )
    }
  }

  /**
   * GET request
   * @param {string} endpoint 
   * @param {RequestInit} options 
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  /**
   * POST request
   * @param {string} endpoint 
   * @param {any} data 
   * @param {RequestInit} options 
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * Get stored authentication token
   * @returns {string|null}
   */
  getStoredToken() {
    try {
      return localStorage.getItem('antec_auth_token')
    } catch (error) {
      // Handle cases where localStorage is not available
      return null
    }
  }

  /**
   * Store authentication token
   * @param {string} token 
   */
  storeToken(token) {
    try {
      localStorage.setItem('antec_auth_token', token)
    } catch (error) {
      console.warn('Failed to store auth token:', error)
    }
  }

  /**
   * Remove stored authentication token
   */
  removeToken() {
    try {
      localStorage.removeItem('antec_auth_token')
    } catch (error) {
      console.warn('Failed to remove auth token:', error)
    }
  }
}

/**
 * Authentication API Client with comprehensive error handling and response parsing
 */
export class AuthClient extends APIClient {
  /**
   * User signup with client-side validation
   * @param {import('@antec/shared').SignupRequest} userData 
   * @returns {Promise<import('@antec/shared').AuthResponse>}
   */
  async signup(userData) {
    // Client-side validation
    const validation = validateSignupRequest(userData)
    if (!validation.isValid) {
      throw new APIError(
        TERMINAL_CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR,
        HTTP_STATUS.BAD_REQUEST,
        'VALIDATION_ERROR',
        validation.errors
      )
    }

    try {
      const response = await this.post(API_ENDPOINTS.AUTH.SIGNUP, userData)
      
      // Store token and user data if signup successful and auto-login occurred
      if (response.success && response.token) {
        this.storeToken(response.token)
        if (response.user) {
          this.storeUser(response.user)
        }
      }
      
      return response
    } catch (error) {
      // Handle specific signup errors
      if (error instanceof APIError) {
        // Handle validation errors from server
        if (error.status === HTTP_STATUS.BAD_REQUEST && error.errors && error.errors.length > 0) {
          // Map server validation errors to user-friendly messages
          const mappedErrors = error.errors.map(err => {
            if (err.field === 'username' && err.message.includes('already exists')) {
              return { ...err, message: TERMINAL_CONSTANTS.ERROR_MESSAGES.USERNAME_EXISTS }
            }
            if (err.field === 'email' && err.message.includes('already registered')) {
              return { ...err, message: TERMINAL_CONSTANTS.ERROR_MESSAGES.EMAIL_EXISTS }
            }
            return err
          })
          
          throw new APIError(
            mappedErrors[0].message,
            error.status,
            error.code,
            mappedErrors
          )
        }
        
        // Handle conflict errors (duplicate username/email)
        if (error.status === HTTP_STATUS.CONFLICT || error.code === 'USERNAME_EXISTS' || error.code === 'EMAIL_EXISTS') {
          const errorMessage = error.message.toLowerCase()
          if (errorMessage.includes('username') || error.code === 'USERNAME_EXISTS') {
            throw new APIError(
              TERMINAL_CONSTANTS.ERROR_MESSAGES.USERNAME_EXISTS,
              error.status,
              'USERNAME_EXISTS'
            )
          } else if (errorMessage.includes('email') || error.code === 'EMAIL_EXISTS') {
            throw new APIError(
              TERMINAL_CONSTANTS.ERROR_MESSAGES.EMAIL_EXISTS,
              error.status,
              'EMAIL_EXISTS'
            )
          }
        }
        
        // Handle server errors
        if (error.status >= 500) {
          throw new APIError(
            TERMINAL_CONSTANTS.ERROR_MESSAGES.SERVER_ERROR,
            error.status,
            'SERVER_ERROR'
          )
        }
      }
      throw error
    }
  }

  /**
   * User login with client-side validation
   * @param {import('@antec/shared').LoginRequest} credentials 
   * @returns {Promise<import('@antec/shared').AuthResponse>}
   */
  async login(credentials) {
    // Client-side validation
    const validation = validateLoginRequest(credentials)
    if (!validation.isValid) {
      throw new APIError(
        TERMINAL_CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR,
        HTTP_STATUS.BAD_REQUEST,
        'VALIDATION_ERROR',
        validation.errors
      )
    }

    try {
      const response = await this.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
      
      // Store token and user data if login successful
      if (response.success && response.token) {
        this.storeToken(response.token)
        if (response.user) {
          this.storeUser(response.user)
        }
      }
      
      return response
    } catch (error) {
      // Handle specific login errors
      if (error instanceof APIError) {
        if (error.status === HTTP_STATUS.UNAUTHORIZED) {
          throw new APIError(
            TERMINAL_CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS,
            error.status,
            'INVALID_CREDENTIALS'
          )
        }
        
        // Handle account locked or other auth-specific errors
        if (error.code === 'ACCOUNT_LOCKED') {
          throw new APIError(
            TERMINAL_CONSTANTS.ERROR_MESSAGES.ACCOUNT_LOCKED,
            error.status,
            'ACCOUNT_LOCKED'
          )
        }
        
        // Handle server errors
        if (error.status >= 500) {
          throw new APIError(
            TERMINAL_CONSTANTS.ERROR_MESSAGES.SERVER_ERROR,
            error.status,
            'SERVER_ERROR'
          )
        }
      }
      throw error
    }
  }

  /**
   * User logout with token cleanup
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async logout() {
    try {
      const response = await this.post(API_ENDPOINTS.AUTH.LOGOUT, {})
      
      // Always clear all auth data on logout, even if request fails
      this.clearAuthData()
      
      return response
    } catch (error) {
      // Clear all auth data even if logout request fails
      this.clearAuthData()
      
      // Return success for logout since auth data is cleared locally
      return {
        success: true,
        message: TERMINAL_CONSTANTS.SUCCESS_MESSAGES.LOGOUT
      }
    }
  }

  /**
   * Get current authenticated user
   * @returns {Promise<{success: boolean, user: import('@antec/shared').User}>}
   */
  async getCurrentUser() {
    try {
      return await this.get(API_ENDPOINTS.AUTH.ME)
    } catch (error) {
      if (error instanceof APIError) {
        if (error.status === HTTP_STATUS.UNAUTHORIZED) {
          // Check if it's a token expiration or invalid token
          if (error.code === 'TokenExpiredError' || error.message.includes('expired')) {
            this.clearAuthData()
            throw new APIError(
              TERMINAL_CONSTANTS.ERROR_MESSAGES.TOKEN_EXPIRED,
              error.status,
              'TOKEN_EXPIRED'
            )
          } else {
            this.clearAuthData()
            throw new APIError(
              TERMINAL_CONSTANTS.ERROR_MESSAGES.TOKEN_INVALID,
              error.status,
              'TOKEN_INVALID'
            )
          }
        }
      }
      throw error
    }
  }

  /**
   * Check if user is currently authenticated (has valid token)
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = this.getStoredToken()
    return !!token
  }

  /**
   * Get stored user data (if available)
   * @returns {import('@antec/shared').User|null}
   */
  getStoredUser() {
    try {
      const userData = localStorage.getItem('antec_user')
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      return null
    }
  }

  /**
   * Store user data
   * @param {import('@antec/shared').User} user 
   */
  storeUser(user) {
    try {
      localStorage.setItem('antec_user', JSON.stringify(user))
    } catch (error) {
      console.warn('Failed to store user data:', error)
    }
  }

  /**
   * Remove stored user data
   */
  removeUser() {
    try {
      localStorage.removeItem('antec_user')
    } catch (error) {
      console.warn('Failed to remove user data:', error)
    }
  }

  /**
   * Clear all authentication data
   */
  clearAuthData() {
    this.removeToken()
    this.removeUser()
  }
}

// Export singleton instance and class
export const authClient = new AuthClient()
export default authClient
import { TERMINAL_CONSTANTS } from '@antec/shared'

/**
 * Password input handler for terminal interface
 * Provides character-by-character input capture with asterisk masking
 */
export class PasswordInput {
  constructor(terminal) {
    this.terminal = terminal
    this.password = ''
    this.isActive = false
    this.onComplete = null
    this.onCancel = null
  }

  /**
   * Start password input mode
   * @param {Function} onComplete - Callback when password input is complete
   * @param {Function} onCancel - Callback when password input is cancelled
   */
  start(onComplete, onCancel = null) {
    this.password = ''
    this.isActive = true
    this.onComplete = onComplete
    this.onCancel = onCancel
  }

  /**
   * Stop password input mode
   */
  stop() {
    this.isActive = false
    this.password = ''
    this.onComplete = null
    this.onCancel = null
  }

  /**
   * Handle character input during password mode
   * @param {string} data - Input data from terminal
   * @returns {boolean} - True if input was handled, false otherwise
   */
  handleInput(data) {
    if (!this.isActive) {
      return false
    }

    const code = data.charCodeAt(0)

    if (code === 13) { // Enter - complete password input
      this.isActive = false
      const password = this.password
      this.password = ''
      
      if (this.onComplete) {
        this.onComplete(password)
      }
      return true
    } else if (code === 127) { // Backspace
      if (this.password.length > 0) {
        this.password = this.password.slice(0, -1)
        this.terminal.write('\b \b')
      }
      return true
    } else if (code === 3) { // Ctrl+C - cancel password input
      this.isActive = false
      this.password = ''
      
      if (this.onCancel) {
        this.onCancel()
      }
      return true
    } else if (code === 27) { // Escape sequences (ignore arrow keys during password input)
      return true
    } else if (code >= 32 && code <= 126) { // Printable characters
      this.password += data
      this.terminal.write(TERMINAL_CONSTANTS.PASSWORD_MASK)
      return true
    }

    return false
  }

  /**
   * Get the current password (for testing purposes)
   * @returns {string} Current password
   */
  getCurrentPassword() {
    return this.password
  }

  /**
   * Check if password input is currently active
   * @returns {boolean} True if password input is active
   */
  isPasswordMode() {
    return this.isActive
  }

  /**
   * Clear the current password without completing input
   */
  clear() {
    this.password = ''
  }
}

/**
 * Sequential form handler for terminal authentication
 * Manages multi-step forms with password masking
 */
export class SequentialFormHandler {
  constructor(terminal) {
    this.terminal = terminal
    this.passwordInput = new PasswordInput(terminal)
    this.fields = []
    this.currentFieldIndex = 0
    this.formData = {}
    this.isActive = false
    this.onComplete = null
    this.onCancel = null
  }

  /**
   * Start a sequential form
   * @param {Array} fields - Array of field definitions
   * @param {Function} onComplete - Callback when form is complete
   * @param {Function} onCancel - Callback when form is cancelled
   */
  start(fields, onComplete, onCancel = null) {
    this.fields = fields
    this.currentFieldIndex = 0
    this.formData = {}
    this.isActive = true
    this.onComplete = onComplete
    this.onCancel = onCancel

    this.promptCurrentField()
  }

  /**
   * Stop the sequential form
   */
  stop() {
    this.isActive = false
    this.passwordInput.stop()
    this.fields = []
    this.currentFieldIndex = 0
    this.formData = {}
    this.onComplete = null
    this.onCancel = null
  }

  /**
   * Prompt for the current field
   */
  promptCurrentField() {
    if (this.currentFieldIndex >= this.fields.length) {
      this.completeForm()
      return
    }

    const field = this.fields[this.currentFieldIndex]
    this.terminal.write(`${field.prompt}: `)

    if (field.type === 'password') {
      this.passwordInput.start(
        (password) => this.handleFieldComplete(field.name, password),
        () => this.handleCancel()
      )
    }
    // For non-password fields, input will be handled by the main terminal handler
  }

  /**
   * Handle regular (non-password) field input
   * @param {string} data - Input data
   * @returns {boolean} True if input was handled
   */
  handleInput(data) {
    if (!this.isActive) {
      return false
    }

    // If password input is active, delegate to password handler
    if (this.passwordInput.isPasswordMode()) {
      return this.passwordInput.handleInput(data)
    }

    // Handle regular field input
    const code = data.charCodeAt(0)
    
    if (code === 3) { // Ctrl+C - cancel form
      this.handleCancel()
      return true
    }

    // For regular fields, we need to let the main terminal handler manage the input
    // and we'll get the completed value via handleRegularFieldComplete
    return false
  }

  /**
   * Handle completion of a regular field (called from terminal command handler)
   * @param {string} value - Field value
   */
  handleRegularFieldComplete(value) {
    if (!this.isActive || this.currentFieldIndex >= this.fields.length) {
      return
    }

    const field = this.fields[this.currentFieldIndex]
    if (field.type !== 'password') {
      this.handleFieldComplete(field.name, value)
    }
  }

  /**
   * Handle completion of any field
   * @param {string} fieldName - Name of the completed field
   * @param {string} value - Field value
   */
  handleFieldComplete(fieldName, value) {
    this.formData[fieldName] = value
    this.currentFieldIndex++
    
    this.terminal.write('\r\n')
    this.promptCurrentField()
  }

  /**
   * Complete the form and return data
   */
  completeForm() {
    this.isActive = false
    const data = { ...this.formData }
    
    if (this.onComplete) {
      this.onComplete(data)
    }
    
    this.stop()
  }

  /**
   * Handle form cancellation
   */
  handleCancel() {
    this.terminal.write('\r\n^C\r\n')
    
    if (this.onCancel) {
      this.onCancel()
    }
    
    this.stop()
  }

  /**
   * Check if form is currently active
   * @returns {boolean} True if form is active
   */
  isFormActive() {
    return this.isActive
  }

  /**
   * Get current form data
   * @returns {Object} Current form data
   */
  getFormData() {
    return { ...this.formData }
  }
}

/**
 * Utility functions for password validation and confirmation
 */
export const passwordUtils = {
  /**
   * Validate password confirmation
   * @param {string} password - Original password
   * @param {string} confirmPassword - Confirmation password
   * @returns {boolean} True if passwords match
   */
  validateConfirmation(password, confirmPassword) {
    return password === confirmPassword
  },

  /**
   * Mask a password string for display
   * @param {string} password - Password to mask
   * @returns {string} Masked password
   */
  maskPassword(password) {
    return TERMINAL_CONSTANTS.PASSWORD_MASK.repeat(password.length)
  },

  /**
   * Create field definitions for signup form
   * @returns {Array} Field definitions for signup
   */
  createSignupFields() {
    return [
      { name: 'username', prompt: 'Username', type: 'text' },
      { name: 'email', prompt: 'Email', type: 'text' },
      { name: 'password', prompt: 'Password', type: 'password' },
      { name: 'confirmPassword', prompt: 'Confirm Password', type: 'password' }
    ]
  },

  /**
   * Create field definitions for login form
   * @returns {Array} Field definitions for login
   */
  createLoginFields() {
    return [
      { name: 'emailOrUsername', prompt: 'Email or Username', type: 'text' },
      { name: 'password', prompt: 'Password', type: 'password' }
    ]
  }
}
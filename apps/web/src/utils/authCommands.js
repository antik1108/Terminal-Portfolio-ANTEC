import { SequentialFormHandler, passwordUtils } from './passwordInput'
import { TERMINAL_CONSTANTS, validateSignupRequest, validateLoginRequest } from '@antec/shared'

/**
 * Authentication command handler for terminal interface
 * Manages signup, login, and logout commands with proper terminal integration
 */
export class AuthCommandHandler {
  constructor(terminal, authGetter, showPromptCallback = null, promptManager = null) {
    this.terminal = terminal
    // authGetter should be a function that returns the latest auth context
    this.getAuth = typeof authGetter === 'function' ? authGetter : () => authGetter
    this.formHandler = new SequentialFormHandler(terminal)
    this.isProcessing = false
    this.currentCommand = null
    this.showPromptCallback = showPromptCallback
    this.promptManager = promptManager
    
    // Terminal state management
    this.terminalStateListeners = new Set()
    this.loadingIndicator = null
    this.loadingInterval = null
  }

  /**
   * Write text to terminal with optional newline
   * @param {string} text - Text to write
   * @param {boolean} newLine - Whether to add newline (default: true)
   */
  writeToTerminal(text, newLine = true) {
    if (this.terminal) {
      this.terminal.write(text + (newLine ? '\r\n' : ''))
    }
  }

  /**
   * Write colored text to terminal
   * @param {string} text - Text to write
   * @param {string} color - Color code (e.g., 'green', 'red', 'yellow')
   * @param {boolean} newLine - Whether to add newline
   */
  writeColoredText(text, color, newLine = true) {
    const colors = {
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      reset: '\x1b[0m'
    }
    
    const colorCode = colors[color] || colors.reset
    this.writeToTerminal(`${colorCode}${text}${colors.reset}`, newLine)
  }

  /**
   * Write error message to terminal with proper formatting
   * @param {Error|string} error - Error object or error message
   */
  writeErrorMessage(error) {
    if (typeof error === 'string') {
      this.writeColoredText(error, 'red')
      return
    }

    // Handle APIError with validation errors
    if (error.errors && error.errors.length > 0) {
      this.writeColoredText('Validation errors:', 'red')
      error.errors.forEach(err => {
        this.writeColoredText(`  ${err.field}: ${err.message}`, 'red')
      })
    } else {
      // Single error message
      this.writeColoredText(error.message || 'An error occurred', 'red')
    }
  }

  /**
   * Write success message to terminal with proper formatting
   * @param {string} message - Success message
   */
  writeSuccessMessage(message) {
    this.writeColoredText(message, 'green')
  }

  /**
   * Write warning message to terminal with proper formatting
   * @param {string} message - Warning message
   */
  writeWarningMessage(message) {
    this.writeColoredText(message, 'yellow')
  }

  /**
   * Write info message to terminal with proper formatting
   * @param {string} message - Info message
   */
  writeInfoMessage(message) {
    this.writeColoredText(message, 'cyan')
  }

  /**
   * Add a listener for terminal state changes
   * @param {Function} listener - Callback function for state changes
   */
  addTerminalStateListener(listener) {
    this.terminalStateListeners.add(listener)
  }

  /**
   * Remove a terminal state listener
   * @param {Function} listener - Callback function to remove
   */
  removeTerminalStateListener(listener) {
    this.terminalStateListeners.delete(listener)
  }

  /**
   * Notify all listeners of terminal state changes
   * @param {string} state - The new terminal state ('idle', 'authenticating', 'processing')
   * @param {Object} data - Additional state data
   */
  notifyTerminalStateChange(state, data = {}) {
    this.terminalStateListeners.forEach(listener => {
      try {
        listener(state, { command: this.currentCommand, ...data })
      } catch (error) {
        console.warn('Terminal state listener error:', error)
      }
    })
  }

  /**
   * Start loading indicator for long-running operations
   * @param {string} message - Loading message to display
   */
  startLoadingIndicator(message = 'Processing') {
    if (this.loadingInterval) {
      this.stopLoadingIndicator()
    }

    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    let frameIndex = 0
    
    // Clear current line and show initial loading message
    this.terminal.write('\r\x1b[K')
    this.loadingIndicator = message
    
    this.loadingInterval = setInterval(() => {
      this.terminal.write(`\r\x1b[K\x1b[36m${frames[frameIndex]} ${message}...\x1b[0m`)
      frameIndex = (frameIndex + 1) % frames.length
    }, 100)
  }

  /**
   * Stop loading indicator
   */
  stopLoadingIndicator() {
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval)
      this.loadingInterval = null
      this.loadingIndicator = null
      // Clear the loading line
      this.terminal.write('\r\x1b[K')
    }
  }

  /**
   * Set terminal to processing state
   * @param {string} command - The command being processed
   */
  setTerminalProcessing(command) {
    this.isProcessing = true
    this.currentCommand = command
    this.notifyTerminalStateChange(TERMINAL_CONSTANTS.COMMAND_STATES.AUTHENTICATING, {
      message: `Processing ${command} command`
    })
  }

  /**
   * Set terminal to idle state
   */
  setTerminalIdle() {
    this.isProcessing = false
    this.currentCommand = null
    this.stopLoadingIndicator()
    this.notifyTerminalStateChange(TERMINAL_CONSTANTS.COMMAND_STATES.IDLE)
  }

  /**
   * Check if terminal should accept regular commands
   * @returns {boolean} True if terminal can accept commands
   */
  canAcceptCommands() {
    return !this.isProcessing && !this.formHandler.isFormActive()
  }

  /**
   * Display terminal state message
   * @param {string} message - Message to display
   * @param {string} type - Message type ('info', 'warning', 'error')
   */
  displayStateMessage(message, type = 'info') {
    switch (type) {
      case 'warning':
        this.writeWarningMessage(message)
        break
      case 'error':
        this.writeErrorMessage(message)
        break
      default:
        this.writeInfoMessage(message)
        break
    }
  }

  /**
   * Handle the 'antec signup' command
   * Creates an interactive signup form with sequential prompts
   */
  async handleSignupCommand() {
    if (this.isProcessing) {
      this.displayStateMessage('Authentication in progress. Please wait...', 'warning')
      return
    }

    // Check if user is already authenticated
    const auth = this.getAuth()
    if (auth && auth.isAuthenticated) {
      this.displayStateMessage('You are already logged in. Please logout first.', 'warning')
      return
    }

    this.setTerminalProcessing('signup')
    
    this.writeToTerminal('Creating new account...')
    this.writeToTerminal('')

    const fields = passwordUtils.createSignupFields()
    
    this.formHandler.start(
      fields,
      (formData) => this.processSignup(formData),
      () => this.cancelAuthCommand()
    )
  }

  /**
   * Process signup form data
   * @param {Object} formData - Form data from sequential form handler
   */
  async processSignup(formData) {
    try {
      // Validate form data
      const validation = validateSignupRequest(formData)
      if (!validation.isValid) {
        this.writeErrorMessage({ errors: validation.errors })
        this.finishAuthCommand()
        return
      }

      // Validate password confirmation
      if (!passwordUtils.validateConfirmation(formData.password, formData.confirmPassword)) {
        this.writeErrorMessage(TERMINAL_CONSTANTS.ERROR_MESSAGES.PASSWORD_MISMATCH)
        this.finishAuthCommand()
        return
      }

      // Start loading indicator for API call
      this.startLoadingIndicator('Creating account')

      // Call signup through auth context
  const auth = this.getAuth()
  const response = await auth.signup(formData)

      this.stopLoadingIndicator()

      if (response.success) {
        this.writeSuccessMessage(TERMINAL_CONSTANTS.SUCCESS_MESSAGES.SIGNUP)
        
        // Check if auto-login occurred
        const latestAuth = this.getAuth()
        if (latestAuth && latestAuth.isAuthenticated) {
          this.writeSuccessMessage(TERMINAL_CONSTANTS.SUCCESS_MESSAGES.AUTO_LOGIN)
        }
        
        // Add extra delay for successful signup to ensure state updates
        setTimeout(() => {
          this.finishAuthCommand()
        }, 800)
        return
      } else {
        this.writeErrorMessage(response.message || 'Signup failed. Please try again.')
        this.finishAuthCommand()
      }
    } catch (error) {
      this.stopLoadingIndicator()
      this.writeErrorMessage(error)
      this.finishAuthCommand()
    }
  }

  /**
   * Handle the 'antec login' command
   * Creates an interactive login form
   */
  async handleLoginCommand() {
    if (this.isProcessing) {
      this.displayStateMessage('Authentication in progress. Please wait...', 'warning')
      return
    }

    // Check if user is already authenticated
    const auth = this.getAuth()
    if (auth && auth.isAuthenticated) {
      this.displayStateMessage('You are already logged in.', 'warning')
      return
    }

    this.setTerminalProcessing('login')
    
    this.writeToTerminal('Login to your account...')
    this.writeToTerminal('')

    const fields = passwordUtils.createLoginFields()
    
    this.formHandler.start(
      fields,
      (formData) => this.processLogin(formData),
      () => this.cancelAuthCommand()
    )
  }

  /**
   * Process login form data
   * @param {Object} formData - Form data from sequential form handler
   */
  async processLogin(formData) {
    try {
      // Validate form data
      const validation = validateLoginRequest(formData)
      if (!validation.isValid) {
        this.writeErrorMessage({ errors: validation.errors })
        this.finishAuthCommand()
        return
      }

      // Start loading indicator for API call
      this.startLoadingIndicator('Authenticating')

      // Call login through auth context
  const authClient = this.getAuth()
  const response = await authClient.login(formData)

      this.stopLoadingIndicator()

      if (response.success) {
        this.writeSuccessMessage(TERMINAL_CONSTANTS.SUCCESS_MESSAGES.LOGIN)
        
        // Add extra delay for successful login to ensure state updates
        setTimeout(() => {
          this.finishAuthCommand()
        }, 800)
        return
      } else {
        this.writeErrorMessage(response.message || TERMINAL_CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS)
        this.finishAuthCommand()
      }
    } catch (error) {
      this.stopLoadingIndicator()
      this.writeErrorMessage(error)
      this.finishAuthCommand()
    }
  }

  /**
   * Handle the 'antec logout' command
   * Logs out the current user and clears authentication state
   */
  async handleLogoutCommand() {
    if (this.isProcessing) {
      this.displayStateMessage('Authentication in progress. Please wait...', 'warning')
      return
    }

    // Check if user is authenticated (with fresh state check)
    const auth = this.getAuth()
    const isCurrentlyAuthenticated = auth && auth.isAuthenticated && auth.user
    if (!isCurrentlyAuthenticated) {
      this.displayStateMessage('You are not logged in.', 'warning')
      return
    }

    this.setTerminalProcessing('logout')

    try {
      // Start loading indicator for API call
      this.startLoadingIndicator('Logging out')

      // Call logout through auth context
  const authClient = this.getAuth()
  const response = await authClient.logout()

      this.stopLoadingIndicator()

      if (response.success) {
        this.writeSuccessMessage(TERMINAL_CONSTANTS.SUCCESS_MESSAGES.LOGOUT)
      } else {
        this.displayStateMessage('Logout failed, but local session cleared.', 'warning')
      }
    } catch (error) {
      this.stopLoadingIndicator()
      this.displayStateMessage('Logout failed, but local session cleared.', 'warning')
    }

    this.finishAuthCommand()
  }

  /**
   * Cancel current authentication command
   */
  cancelAuthCommand() {
    this.stopLoadingIndicator()
    this.displayStateMessage('Authentication cancelled.', 'warning')
    this.finishAuthCommand()
  }

  /**
   * Finish current authentication command and reset state
   */
  finishAuthCommand() {
    this.stopLoadingIndicator()
    this.formHandler.stop()
    this.setTerminalIdle()
    
    // Add a longer delay to ensure React state has been updated
    setTimeout(() => {
      // Force prompt update by directly calling updatePrompt
        if (this.promptManager) {
          // Force a fresh prompt update
          this.promptManager.refreshPrompt()
        } else if (this.showPromptCallback) {
          // Fallback to show prompt callback if no prompt manager
          this.showPromptCallback()
        }
    }, 800) // Longer delay to ensure React state updates are complete
  }

  /**
   * Handle input during authentication commands
   * @param {string} data - Input data from terminal
   * @returns {boolean} True if input was handled
   */
  handleInput(data) {
    if (!this.isProcessing) {
      return false
    }

    // Delegate to form handler if active
    if (this.formHandler.isFormActive()) {
      return this.formHandler.handleInput(data)
    }

    return false
  }

  /**
   * Handle regular field completion (called from terminal command processor)
   * @param {string} value - Field value
   */
  handleRegularFieldComplete(value) {
    if (this.isProcessing && this.formHandler.isFormActive()) {
      this.formHandler.handleRegularFieldComplete(value)
    }
  }

  /**
   * Check if authentication command is currently processing
   * @returns {boolean} True if processing
   */
  isAuthProcessing() {
    return this.isProcessing
  }

  /**
   * Get current authentication command
   * @returns {string|null} Current command or null
   */
  getCurrentCommand() {
    return this.currentCommand
  }

  /**
   * Get the current terminal prompt based on authentication state
   * @returns {string} Terminal prompt
   */
  getTerminalPrompt() {
    const auth = this.getAuth()
    if (auth && auth.isAuthenticated && auth.user) {
      return TERMINAL_CONSTANTS.AUTHENTICATED_PROMPT(auth.user.username)
    }
    return TERMINAL_CONSTANTS.GUEST_PROMPT
  }

  /**
   * Update terminal prompt based on current authentication state
   * @param {Function} showPrompt - Function to show the terminal prompt
   */
  updatePrompt(showPrompt) {
    if (showPrompt && typeof showPrompt === 'function') {
      showPrompt()
    }
  }
}

/**
 * Create authentication command handler instance
 * @param {Object} terminal - xterm.js terminal instance
 * @param {Object} authContext - Authentication context
 * @param {Function} showPromptCallback - Callback to show terminal prompt
 * @param {Object} promptManager - Prompt manager instance
 * @returns {AuthCommandHandler} Auth command handler instance
 */
export const createAuthCommandHandler = (terminal, authContext, showPromptCallback = null, promptManager = null) => {
  return new AuthCommandHandler(terminal, authContext, showPromptCallback, promptManager)
}

/**
 * Authentication command definitions for terminal integration
 */
export const authCommands = {
  'antec signup': {
    description: 'Create a new account',
    usage: 'antec signup',
    handler: 'handleSignupCommand'
  },
  'antec login': {
    description: 'Login to your account',
    usage: 'antec login',
    handler: 'handleLoginCommand'
  },
  'antec logout': {
    description: 'Logout from your account',
    usage: 'antec logout',
    handler: 'handleLogoutCommand'
  }
}

/**
 * Get help text for authentication commands
 * @returns {string} Help text
 */
export const getAuthCommandsHelp = () => {
  return Object.entries(authCommands)
    .map(([command, info]) => `${command.padEnd(15)} - ${info.description}`)
    .join('\n')
}
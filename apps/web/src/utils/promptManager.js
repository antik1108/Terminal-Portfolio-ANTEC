import { TERMINAL_CONSTANTS } from '@antec/shared'

/**
 * PromptManager - Manages terminal prompt display and updates based on authentication state
 * Handles dynamic prompt updates, username display, and guest vs authenticated user prompts
 */
export class PromptManager {
  constructor(terminal, authGetter) {
    this.terminal = terminal
    // authGetter should be a function that returns the latest auth context
    this.getAuth = typeof authGetter === 'function' ? authGetter : () => authGetter
    this.currentPrompt = null
    this.promptColors = {
      username: '\x1b[38;2;155;124;255m', // Purple color for username
      host: '\x1b[38;2;155;124;255m',     // Purple color for host
      path: '\x1b[38;2;139;148;158m',     // Gray color for path
      symbol: '\x1b[38;2;139;148;158m',   // Gray color for $ symbol
      reset: '\x1b[0m'                    // Reset color
    }
  }

  /**
   * Get the current prompt text based on authentication state
   * @returns {string} Formatted prompt text with colors
   */
  getCurrentPrompt() {
    const { username, host, path, symbol, reset } = this.promptColors
    const auth = this.getAuth()

    if (auth && auth.isAuthenticated && auth.user) {
      // Authenticated user prompt: username@antec:~$
      const userPrompt = `${username}${auth.user.username}@antec${reset}:${path}~${reset}${symbol}$${reset} `
      this.currentPrompt = userPrompt
      return userPrompt
    } else {
      // Guest user prompt: guest@antec:~$
      const guestPrompt = `${host}guest@antec${reset}:${path}~${reset}${symbol}$${reset} `
      this.currentPrompt = guestPrompt
      return guestPrompt
    }
  }

  /**
   * Display the current prompt in the terminal
   * @param {boolean} newLine - Whether to add a newline before the prompt (default: false)
   */
  showPrompt(newLine = false) {
    if (!this.terminal) return
    
    const prompt = this.getCurrentPrompt()
    
    if (newLine) {
      this.terminal.write('\r\n' + prompt)
    } else {
      this.terminal.write(prompt)
    }
  }

  /**
   * Update the prompt based on current authentication state and optionally display it
   * This method should be called when authentication state changes
   * @param {boolean} display - Whether to immediately display the updated prompt
   */
  updatePrompt(display = false) {
    // Get the new prompt text
    const newPrompt = this.getCurrentPrompt()
    
    // Only update if the prompt has actually changed
    if (newPrompt !== this.currentPrompt) {
      this.currentPrompt = newPrompt
      
      // Optionally display the prompt immediately
      if (display) {
        this.showPrompt()
      }
    }
  }

  /**
   * Get the username for display in the prompt
   * @returns {string} Username or 'guest' if not authenticated
   */
  getDisplayUsername() {
    const auth = this.getAuth()
    if (auth && auth.isAuthenticated && auth.user) {
      return auth.user.username
    }
    return 'guest'
  }

  /**
   * Check if the current prompt is for an authenticated user
   * @returns {boolean} True if authenticated, false if guest
   */
  isAuthenticatedPrompt() {
    const auth = this.getAuth()
    return !!(auth && auth.isAuthenticated && auth.user)
  }

  /**
   * Get the raw prompt text without colors (for testing or logging)
   * @returns {string} Plain text prompt
   */
  getPlainPrompt() {
    const auth = this.getAuth()
    if (auth && auth.isAuthenticated && auth.user) {
      return `${auth.user.username}@antec:~$ `
    }
    return 'guest@antec:~$ '
  }

  /**
   * Clear the current line and show the updated prompt
   * Useful for refreshing the prompt after authentication state changes
   */
  refreshPrompt() {
    if (!this.terminal) return
    
    // Clear current line and move cursor to beginning
    this.terminal.write('\r\x1b[K')
    
    // Show the updated prompt
    this.showPrompt()
  }

  /**
   * Handle authentication state changes
   * This method should be called when the user logs in or out
   * @param {string} event - The authentication event ('login', 'logout', 'signup')
   * @param {Object} user - User object (for login/signup events)
   */
  handleAuthStateChange(event, user = null) {
    switch (event) {
      case 'login':
      case 'signup':
        // User has logged in or signed up - update and display prompt
        this.updatePrompt(true)
        break
        
      case 'logout':
        // User has logged out - update and display prompt
        this.updatePrompt(true)
        break
        
      default:
        // Unknown event, just update the prompt
        this.updatePrompt(true)
        break
    }
  }

  /**
   * Handle session restoration on page load
   * This method should be called when the application initializes
   * and checks for existing authentication state
   * @param {boolean} hasValidSession - Whether a valid session was restored
   * @param {Object} user - User object if session was restored
   */
  handleSessionRestore(hasValidSession, user = null) {
    // Regardless of session result, update prompt to reflect latest auth state
    this.updatePrompt()
  }

  /**
   * Initialize authentication state on page load
   * Checks for existing JWT token and restores user state from valid tokens
   * @returns {Promise<boolean>} True if session was restored, false otherwise
   */
  async initializeSession() {
    // This method works with the AuthContext initialization
    // The AuthContext already handles token validation and user restoration
    // We just need to ensure the prompt reflects the current state
    
    // Wait a brief moment for AuthContext to complete initialization
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Update prompt based on current auth state
    this.updatePrompt()
    
    return this.isAuthenticatedPrompt()
  }

  /**
   * Initialize the prompt manager
   * Sets up the initial prompt based on current authentication state
   */
  initialize() {
    this.updatePrompt()
  }
  getPromptConfig() {
    return {
      authenticated: {
        template: '{username}@antec:~$ ',
        colors: this.promptColors,
        username: this.getDisplayUsername()
      },
      guest: {
        template: 'guest@antec:~$ ',
        colors: this.promptColors,
        username: 'guest'
      },
      current: {
        isAuthenticated: this.isAuthenticatedPrompt(),
        username: this.getDisplayUsername(),
        prompt: this.getPlainPrompt(),
        coloredPrompt: this.getCurrentPrompt()
      }
    }
  }

  /**
   * Set custom colors for the prompt
   * @param {Object} colors - Color configuration object
   */
  setPromptColors(colors) {
    this.promptColors = { ...this.promptColors, ...colors }
    this.updatePrompt()
  }

  /**
   * Reset prompt colors to default
   */
  resetPromptColors() {
    this.promptColors = {
      username: '\x1b[38;2;155;124;255m',
      host: '\x1b[38;2;155;124;255m',
      path: '\x1b[38;2;139;148;158m',
      symbol: '\x1b[38;2;139;148;158m',
      reset: '\x1b[0m'
    }
    this.updatePrompt()
  }
}

/**
 * Create a new PromptManager instance
 * @param {Object} terminal - xterm.js terminal instance
 * @param {Object} authContext - Authentication context
 * @returns {PromptManager} New PromptManager instance
 */
export const createPromptManager = (terminal, authContext) => {
  return new PromptManager(terminal, authContext)
}

export default PromptManager
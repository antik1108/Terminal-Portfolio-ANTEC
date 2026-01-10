import { useEffect, useRef, useState, useMemo } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'
import { useAuth } from '../contexts/AuthContext'
import { createAuthCommandHandler, getAuthCommandsHelp } from '../utils/authCommands'
import { createPromptManager } from '../utils/promptManager'
import { TERMINAL_CONSTANTS } from '@antec/shared'

function TerminalPortfolio() {
  const terminalRef = useRef(null)
  const terminal = useRef(null)
  const fitAddon = useRef(null)
  const [terminalReady, setTerminalReady] = useState(false)
  const currentLine = useRef('')
  const commandHistory = useRef([])
  const historyIndex = useRef(-1)
  const [currentTheme, setCurrentTheme] = useState('dark')
  const [terminalState, setTerminalState] = useState('idle') // 'idle', 'authenticating', 'processing'
  
  // Authentication integration
  const authContext = useAuth()
  const authRef = useRef(authContext)
  const authHandler = useRef(null)
  const promptManager = useRef(null)

  const themes = {
    dark: {
      background: '#050508',
      foreground: '#e4e4e7',
      cursor: '#9B7CFF',
      cursorAccent: '#050508',
      selection: 'rgba(155, 124, 255, 0.3)',
      black: '#050508',
      red: '#ef4444',
      green: '#22c55e',
      yellow: '#eab308',
      blue: '#3b82f6',
      magenta: '#9B7CFF',
      cyan: '#06b6d4',
      white: '#e4e4e7',
      brightBlack: '#71717a',
      brightRed: '#ef4444',
      brightGreen: '#22c55e',
      brightYellow: '#eab308',
      brightBlue: '#3b82f6',
      brightMagenta: '#B18CFF',
      brightCyan: '#06b6d4',
      brightWhite: '#ffffff'
    },
    light: {
      background: '#ffffff',
      foreground: '#1f2937',
      cursor: '#6366f1',
      cursorAccent: '#ffffff',
      selection: 'rgba(99, 102, 241, 0.3)',
      black: '#1f2937',
      red: '#dc2626',
      green: '#16a34a',
      yellow: '#ca8a04',
      blue: '#2563eb',
      magenta: '#6366f1',
      cyan: '#0891b2',
      white: '#f9fafb',
      brightBlack: '#6b7280',
      brightRed: '#dc2626',
      brightGreen: '#16a34a',
      brightYellow: '#ca8a04',
      brightBlue: '#2563eb',
      brightMagenta: '#7c3aed',
      brightCyan: '#0891b2',
      brightWhite: '#ffffff'
    },
    'blue-matrix': {
      background: '#0d1117',
      foreground: '#58a6ff',
      cursor: '#58a6ff',
      cursorAccent: '#0d1117',
      selection: 'rgba(88, 166, 255, 0.3)',
      black: '#0d1117',
      red: '#f85149',
      green: '#7ee787',
      yellow: '#f2cc60',
      blue: '#58a6ff',
      magenta: '#bc8cff',
      cyan: '#39c5cf',
      white: '#b1bac4',
      brightBlack: '#6e7681',
      brightRed: '#f85149',
      brightGreen: '#7ee787',
      brightYellow: '#f2cc60',
      brightBlue: '#58a6ff',
      brightMagenta: '#bc8cff',
      brightCyan: '#39c5cf',
      brightWhite: '#ffffff'
    },
    espresso: {
      background: '#2d2006',
      foreground: '#f4f1ed',
      cursor: '#f4f1ed',
      cursorAccent: '#2d2006',
      selection: 'rgba(244, 241, 237, 0.3)',
      black: '#2d2006',
      red: '#d25252',
      green: '#a5c261',
      yellow: '#ffc66d',
      blue: '#6c98eb',
      magenta: '#d197d9',
      cyan: '#bed6ff',
      white: '#f4f1ed',
      brightBlack: '#4c4635',
      brightRed: '#d25252',
      brightGreen: '#a5c261',
      brightYellow: '#ffc66d',
      brightBlue: '#6c98eb',
      brightMagenta: '#d197d9',
      brightCyan: '#bed6ff',
      brightWhite: '#f4f1ed'
    },
    'green-goblin': {
      background: '#0d1b0d',
      foreground: '#33ff33',
      cursor: '#33ff33',
      cursorAccent: '#0d1b0d',
      selection: 'rgba(51, 255, 51, 0.3)',
      black: '#0d1b0d',
      red: '#ff3333',
      green: '#33ff33',
      yellow: '#ffff33',
      blue: '#3333ff',
      magenta: '#ff33ff',
      cyan: '#33ffff',
      white: '#ffffff',
      brightBlack: '#1a331a',
      brightRed: '#ff3333',
      brightGreen: '#33ff33',
      brightYellow: '#ffff33',
      brightBlue: '#3333ff',
      brightMagenta: '#ff33ff',
      brightCyan: '#33ffff',
      brightWhite: '#ffffff'
    },
    ubuntu: {
      background: '#300a24',
      foreground: '#ffffff',
      cursor: '#ffffff',
      cursorAccent: '#300a24',
      selection: 'rgba(255, 255, 255, 0.3)',
      black: '#2e3436',
      red: '#cc0000',
      green: '#4e9a06',
      yellow: '#c4a000',
      blue: '#3465a4',
      magenta: '#75507b',
      cyan: '#06989a',
      white: '#d3d7cf',
      brightBlack: '#555753',
      brightRed: '#ef2929',
      brightGreen: '#8ae234',
      brightYellow: '#fce94f',
      brightBlue: '#729fcf',
      brightMagenta: '#ad7fa8',
      brightCyan: '#34e2e2',
      brightWhite: '#eeeeec'
    }
  }

  // Create commands object that updates with auth context
  const commands = useMemo(() => ({
    welcome: () => 'WELCOME',
    
    help: () => {
      let helpText = `about        - about Antik Mondal
clear        - clear the terminal
echo         - print out anything
education    - my education background
email        - send an email to me
github       - view my GitHub profile
help         - check available commands
history      - view command history
projects     - view projects that I've coded
pwd          - print current working directory
socials      - check out my social accounts
themes       - check available themes
whoami       - about current user

Authentication Commands:
${getAuthCommandsHelp()}

Tab or Ctrl + i => autocompletes the command
Up Arrow => go back to previous command
Ctrl + l => clear the terminal`

      // Add authentication status indicator
      if (authHandler.current && authHandler.current.isAuthProcessing()) {
        helpText += `\n\n\x1b[33m⚠ Authentication in progress - some commands are disabled\x1b[0m`
        helpText += `\nCtrl + C => cancel current authentication operation`
      }

      return helpText
    },
//gui          - go to my portfolio in GUI (add this latter)
    about: () => `Hi, I’m Antik Mondal.

I’m an CS engineer and a problem solver.
I like building systems and working close to the core.

I’m building my own startups, mainly focused on healthcare,
where I try to solve real problems using technology.

I enjoy writing code, designing systems,
and turning ideas into working products.
`,

    clear: () => 'CLEAR',

    echo: (args) => args.join(' '),

    education: () => `Here is my education background!

B.Tech (Computer Science)
Newton School of Technology, Rishihood University | 2024 - 2028

Higher Secondary Education
Bankura Banga Vidyalaya | 2022 - 2024`,

// IELTS 7.0
// British Council India | 2019`,

    email: () => `antik.mondal2024@nst.rishihood.edu.in`,

    gui: () => {
      window.open('https://antik.dev', '_blank')
      return 'Opening GUI version...'
    },

    history: () => {
      if (commandHistory.current.length === 0) {
        return 'No commands in history.'
      }
      return commandHistory.current.map((cmd, i) => `${i + 1}  ${cmd}`).join('\n')
    },

    projects: () => `"Talk is cheap. Show me the code"? I got you.
Here are some of my projects you shouldn't miss

1. ANTEC Terminal Portfolio
   My personal terminal-style portfolio where I showcase
   my projects and skills.

2. SnehoAyu (mHealth Platform)
   A mobile-first health application designed to support mothers
   of preterm infants through post-NICU care and home-based newborn monitoring.

3. Authra (Parcel Management System)
   A smart, paperless parcel management system for universities 
   and workplaces with secure logging, notifications, and pickup tracking.

Usage: projects go <project-no>
eg: projects go 1

These are selected projects.
More work and experiments live on GitHub.
Type: github`,

    pwd: () => `/home/antik`,

    socials: () => `Here are my social links

1. GitHub    - https://github.com/antik1108
2. LinkedIn  - https://www.linkedin.com/in/antik-t30a04m/
3. Twitter   - https://x.com/Antik_30
4. Instagram - https://www.instagram.com/__.vi0letshadow._/

Usage: socials go <social-no>
eg: socials go 1`,

    themes: () => `dark light blue-matrix espresso green-goblin ubuntu

Usage: themes set <theme-name>
eg: themes set ubuntu`,

    whoami: () => {
      // Read freshest auth info from the ref (avoids stale closures / timing races)
      try {
        const auth = authRef.current || authContext
        const user = auth && (auth.getCurrentUser ? auth.getCurrentUser() : auth.user)
        if (user && user.username) return user.username
      } catch (e) {
        // ignore and fallback
      }
      return 'guest'
    },

    github: () => `GitHub: https://github.com/antik1108`,

    // Handle compound commands
    'projects go': (args) => {
      const projectNum = parseInt(args[0])
      const projects = [
        { name: "ANTEC Terminal Portfolio", url: "https://github.com/antik1108/Terminal-Portfolio-ANTEC" },
        { name: "SnehoAyu (baby-health platform)", url: "https://github.com/antik1108/SnehoAyu" },
        { name: "Authra (Parcel Management System)", url: "https://github.com/antik1108/Authra" }
      ]
      
      if (projectNum >= 1 && projectNum <= projects.length) {
        window.open(projects[projectNum - 1].url, '_blank')
        return `Opening ${projects[projectNum - 1].name}...`
      }
      return `Project ${projectNum} not found. Use 'projects' to see available projects.`
    },

    'socials go': (args) => {
      const socialNum = parseInt(args[0])
      const socials = [
        { name: "GitHub", url: "https://github.com/antik1108" },
        { name: "LinkedIn", url: "https://www.linkedin.com/in/antik-t30a04m/" },
        { name: "Twitter", url: "https://x.com/Antik_30" },
        { name: "Instagram", url: "https://www.instagram.com/__.vi0letshadow._/" }
      ]
      
      if (socialNum >= 1 && socialNum <= socials.length) {
        window.open(socials[socialNum - 1].url, '_blank')
        return `Opening ${socials[socialNum - 1].name}...`
      }
      return `Social ${socialNum} not found. Use 'socials' to see available socials.`
    },

    'themes set': (args) => {
      const themeName = args[0]
      if (themes[themeName]) {
        setCurrentTheme(themeName)
        if (terminal.current) {
          terminal.current.options.theme = themes[themeName]
        }
        return `Theme set to ${themeName}`
      }
      return `Theme '${themeName}' not found. Use 'themes' to see available themes.`
    },

    // Authentication commands
    'antec signup': () => {
      if (authHandler.current) {
        authHandler.current.handleSignupCommand()
        return 'AUTH_COMMAND'
      }
      return 'Authentication system not available'
    },

    'antec login': () => {
      if (authHandler.current) {
        authHandler.current.handleLoginCommand()
        return 'AUTH_COMMAND'
      }
      return 'Authentication system not available'
    },

    'antec logout': () => {
      // Check current auth state using getter to avoid race conditions
      const currentUser = authContext.getCurrentUser ? authContext.getCurrentUser() : authContext.user
      if (!currentUser) {
        return 'You are not logged in.'
      }

      if (authHandler.current) {
        authHandler.current.handleLogoutCommand()
        return 'AUTH_COMMAND'
      }
      return 'Authentication system not available'
    }
  }), [authContext.isAuthenticated, authContext.user, authContext.loading]) // Dependencies for useMemo

  const writeToTerminal = (text, newLine = true) => {
    if (terminal.current) {
      terminal.current.write(text + (newLine ? '\r\n' : ''))
    }
  }

  const showPrompt = () => {
    if (promptManager.current) {
      promptManager.current.showPrompt()
    } else {
      // Fallback to original prompt logic if promptManager not available
      const promptText = authContext.isAuthenticated && authContext.user 
        ? `\x1b[38;2;155;124;255m${authContext.user.username}@antec\x1b[0m:\x1b[38;2;139;148;158m~\x1b[0m\x1b[38;2;139;148;158m$\x1b[0m `
        : '\x1b[38;2;155;124;255mguest@antec\x1b[0m:\x1b[38;2;139;148;158m~\x1b[0m\x1b[38;2;139;148;158m$\x1b[0m '
      
      writeToTerminal(promptText, false)
    }
  }

  const processCommand = (cmd) => {
    const trimmedCmd = cmd.trim()
    
    if (trimmedCmd === '') {
      showPrompt()
      return
    }

    // Check if terminal is in authentication state and block non-auth commands
    if (authHandler.current && authHandler.current.isAuthProcessing()) {
      // Only allow certain commands during authentication
      const allowedDuringAuth = ['help', 'clear']
      const baseCmd = trimmedCmd.split(' ')[0].toLowerCase()
      
      if (!allowedDuringAuth.includes(baseCmd) && !trimmedCmd.startsWith('antec')) {
        authHandler.current.displayStateMessage(
          'Authentication in progress. Please complete the current operation or use Ctrl+C to cancel.',
          'warning'
        )
        showPrompt()
        return
      }
    }

    commandHistory.current.push(cmd)
    historyIndex.current = commandHistory.current.length

    // Handle compound commands
    const parts = trimmedCmd.split(' ')
    const baseCmd = parts[0]
    const args = parts.slice(1)

    // Check for compound commands first
    if (parts.length >= 2) {
      const compoundCmd = `${parts[0]} ${parts[1]}`
      if (commands[compoundCmd]) {
        const output = commands[compoundCmd](parts.slice(2))
        if (output === 'CLEAR') {
          terminal.current.clear()
          showPrompt()
        } else if (output === 'AUTH_COMMAND') {
          // Auth command is being handled by authHandler, don't show prompt yet
          return
        } else {
          writeToTerminal(output)
          showPrompt()
        }
        return
      }
    }

    // Handle single commands
    if (commands[baseCmd]) {
      const output = commands[baseCmd](args)
      if (output === 'CLEAR') {
        terminal.current.clear()
        showPrompt()
      } else if (output === 'WELCOME') {
        showWelcome()
      } else if (output === 'AUTH_COMMAND') {
        // Auth command is being handled by authHandler, don't show prompt yet
        return
      } else {
        writeToTerminal(output)
        showPrompt()
      }
    } else {
      writeToTerminal(`Command not found: ${trimmedCmd}`)
      showPrompt()
    }
  }

  const showWelcome = () => {
    // Clear terminal first
    terminal.current.clear()
    
    // ASCII Logo for ANTEC - clean and simple with your purple color
    const asciiLogo = `
 █████╗ ███╗   ██╗████████╗███████╗ ██████╗
██╔══██╗████╗  ██║╚══██╔══╝██╔════╝██╔════╝
███████║██╔██╗ ██║   ██║   █████╗  ██║     
██╔══██║██║╚██╗██║   ██║   ██╔══╝  ██║     
██║  ██║██║ ╚████║   ██║   ███████╗╚██████╗
╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝ ╚═════╝`

    // Write ANTEC logo in your signature purple color
    writeToTerminal('\x1b[38;2;155;124;255m' + asciiLogo + '\x1b[0m')
    writeToTerminal('')
    writeToTerminal('Welcome to my terminal portfolio. (Version 2.0.0)')
    writeToTerminal('----')
    writeToTerminal('')
    writeToTerminal("This project's source code can be found in this project's \x1b[38;2;6;182;212m\x1b]8;;https://github.com/antik1108/Terminal-Portfolio-ANTEC\x1b\\GitHub repo\x1b]8;;\x1b\\\x1b[0m.")
    writeToTerminal('----')
    writeToTerminal('')
    writeToTerminal("For a list of available commands, type 'help'.")
    writeToTerminal('')
    showPrompt()
  }

  const startPortfolio = async () => {
    if (!terminal.current) return

    // Automatically show welcome on startup
    showWelcome()
    setTerminalReady(true)
    
    // Initialize session persistence check
    // The useEffect for session restoration will handle prompt updates
    // after the terminal is ready and auth context has initialized
  }

  useEffect(() => {
    if (!terminalRef.current) return

    // Initialize terminal
    terminal.current = new Terminal({
      theme: themes[currentTheme],
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 14,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      convertEol: true
    })

    fitAddon.current = new FitAddon()
    terminal.current.loadAddon(fitAddon.current)
    terminal.current.loadAddon(new WebLinksAddon())

    terminal.current.open(terminalRef.current)
    fitAddon.current.fit()

  // Initialize auth handler and prompt manager using an auth getter that reads from authRef
  // This avoids stale closures and ensures both helpers always read latest auth state
  const getAuth = () => authRef.current
  promptManager.current = createPromptManager(terminal.current, getAuth)
  authHandler.current = createAuthCommandHandler(terminal.current, getAuth, showPrompt, promptManager.current)
    
    // Add terminal state listener
    authHandler.current.addTerminalStateListener((state, data) => {
      setTerminalState(state)
      
      // Handle specific state changes
      if (state === TERMINAL_CONSTANTS.COMMAND_STATES.AUTHENTICATING) {
        // Terminal is now in authentication mode
      } else if (state === TERMINAL_CONSTANTS.COMMAND_STATES.IDLE) {
        // Terminal is back to normal mode
      }
    })
    
  // Initialize prompt manager
  promptManager.current.initialize()

    // Start portfolio display immediately
    startPortfolio()

    // Handle input
    terminal.current.onData((data) => {
      if (!terminalReady) return

      // Check if auth handler should handle this input first
      if (authHandler.current && authHandler.current.handleInput(data)) {
        return
      }

      const code = data.charCodeAt(0)
      
      if (code === 13) { // Enter
        writeToTerminal('')
        
        // If auth handler is processing, handle regular field completion
        if (authHandler.current && authHandler.current.isAuthProcessing()) {
          authHandler.current.handleRegularFieldComplete(currentLine.current)
          currentLine.current = ''
        } else {
          processCommand(currentLine.current)
          currentLine.current = ''
        }
      } else if (code === 127) { // Backspace
        if (currentLine.current.length > 0) {
          currentLine.current = currentLine.current.slice(0, -1)
          terminal.current.write('\b \b')
        }
      } else if (code === 9) { // Tab - autocomplete
        // Don't autocomplete during auth processing
        if (authHandler.current && authHandler.current.isAuthProcessing()) {
          // Provide feedback that autocomplete is disabled during auth
          authHandler.current.displayStateMessage(
            'Autocomplete disabled during authentication',
            'warning'
          )
          return
        }
        
        const availableCommands = Object.keys(commands).filter(cmd => !cmd.includes(' '))
        const matches = availableCommands.filter(cmd => cmd.startsWith(currentLine.current.toLowerCase()))
        
        if (matches.length === 1) {
          const completion = matches[0].slice(currentLine.current.length)
          currentLine.current += completion
          terminal.current.write(completion)
        } else if (matches.length > 1) {
          // Show available completions
          writeToTerminal('')
          writeToTerminal(matches.join('  '))
          showPrompt()
          terminal.current.write(currentLine.current)
        }
      } else if (code === 12) { // Ctrl+L - clear
        // Allow clear even during auth processing
        terminal.current.clear()
        showPrompt()
        currentLine.current = ''
      } else if (code === 3) { // Ctrl+C - cancel operation
        if (authHandler.current && authHandler.current.isAuthProcessing()) {
          // Cancel authentication operation
          authHandler.current.cancelAuthCommand()
          currentLine.current = ''
        } else {
          // Regular Ctrl+C behavior - clear current line
          writeToTerminal('^C')
          currentLine.current = ''
          showPrompt()
        }
      } else if (code === 27) { // Escape sequences (arrow keys)
        // Don't handle arrow keys during auth processing
        if (authHandler.current && authHandler.current.isAuthProcessing()) {
          return
        }
        
        const seq = data.slice(1)
        if (seq === '[A') { // Up arrow
          if (historyIndex.current > 0) {
            terminal.current.write('\r\x1b[K')
            showPrompt()
            historyIndex.current--
            currentLine.current = commandHistory.current[historyIndex.current]
            terminal.current.write(currentLine.current)
          }
        } else if (seq === '[B') { // Down arrow
          if (historyIndex.current < commandHistory.current.length - 1) {
            terminal.current.write('\r\x1b[K')
            showPrompt()
            historyIndex.current++
            currentLine.current = commandHistory.current[historyIndex.current]
            terminal.current.write(currentLine.current)
          } else if (historyIndex.current === commandHistory.current.length - 1) {
            terminal.current.write('\r\x1b[K')
            showPrompt()
            historyIndex.current = commandHistory.current.length
            currentLine.current = ''
          }
        }
      } else if (code >= 32 && code <= 126) { // Printable characters
        currentLine.current += data
        terminal.current.write(data)
      }
    })

    // Handle resize
    const handleResize = () => {
      if (fitAddon.current) {
        fitAddon.current.fit()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      
      // Cleanup auth handler listeners
      if (authHandler.current) {
        authHandler.current.setTerminalIdle()
      }
      
      if (terminal.current) {
        terminal.current.dispose()
      }
    }
  }, [terminalReady, currentTheme])

  // Effect to handle authentication state changes and session restoration
  useEffect(() => {
    // Update authRef so getters read latest context
    authRef.current = authContext

    if (promptManager.current) {
      // Always update prompt when auth state changes, regardless of processing state
      promptManager.current.handleAuthStateChange(
        authContext.isAuthenticated ? 'login' : 'logout',
        authContext.user
      )
    }

    // Listen for global auth change events (e.g., cross-tab or immediate updates)
    const onAuthChange = (e) => {
      try {
        authRef.current = authContext
        if (promptManager.current) {
          promptManager.current.handleAuthStateChange(e?.detail?.user ? 'login' : 'logout', e?.detail?.user)
          promptManager.current.refreshPrompt()
        }
      } catch (err) {
        // ignore
      }
    }

    window.addEventListener('antec:authChange', onAuthChange)

    return () => {
      window.removeEventListener('antec:authChange', onAuthChange)
    }
  }, [authContext.isAuthenticated, authContext.user])

  // Effect to handle session persistence on page load
  useEffect(() => {
    const handleSessionRestore = async () => {
      // Wait for terminal to be ready and auth context to initialize
      if (terminalReady && promptManager.current && !authContext.loading) {
        // Handle session restoration
        const hasValidSession = authContext.isAuthenticated && authContext.user
        promptManager.current.handleSessionRestore(hasValidSession, authContext.user)
        
        // Optionally log session restoration for debugging
        if (hasValidSession) {
          // Session restored successfully
        }
      }
    }

    handleSessionRestore()
  }, [terminalReady, authContext.loading, authContext.isAuthenticated, authContext.user])

  return (
    <div className="terminal-portfolio">
      <div ref={terminalRef} className="terminal" />
    </div>
  )
}

export default TerminalPortfolio
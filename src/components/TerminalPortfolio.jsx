import { useEffect, useRef, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'

function TerminalPortfolio() {
  const terminalRef = useRef(null)
  const terminal = useRef(null)
  const fitAddon = useRef(null)
  const [terminalReady, setTerminalReady] = useState(false)
  const currentLine = useRef('')
  const commandHistory = useRef([])
  const historyIndex = useRef(-1)
  const [currentTheme, setCurrentTheme] = useState('dark')

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

  const commands = {
    welcome: () => 'WELCOME',
    
    help: () => `about        - about Antik Mondal
clear        - clear the terminal
echo         - print out anything
education    - my education background
email        - send an email to me
gui          - go to my portfolio in GUI
help         - check available commands
history      - view command history
projects     - view projects that I've coded
pwd          - print current working directory
socials      - check out my social accounts
themes       - check available themes
whoami       - about current user

Tab or Ctrl + i => autocompletes the command
Up Arrow => go back to previous command
Ctrl + l => clear the terminal`,

    about: () => `Hi, my name is Antik Mondal!

I'm a full-stack developer based in India.
I am passionate about writing codes and
developing web applications to solve real-life challenges.`,

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
eg: projects go 1`,

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

    whoami: () => `guest`,

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
    }
  }

  const writeToTerminal = (text, newLine = true) => {
    if (terminal.current) {
      terminal.current.write(text + (newLine ? '\r\n' : ''))
    }
  }

  const showPrompt = () => {
    writeToTerminal('\x1b[38;2;155;124;255mguest@antec\x1b[0m:\x1b[38;2;139;148;158m~\x1b[0m\x1b[38;2;139;148;158m$\x1b[0m ', false)
  }

  const processCommand = (cmd) => {
    const trimmedCmd = cmd.trim()
    
    if (trimmedCmd === '') {
      showPrompt()
      return
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
    writeToTerminal('Welcome to my terminal portfolio. (Version 1.3.1)')
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

    // Start portfolio display immediately
    startPortfolio()

    // Handle input
    terminal.current.onData((data) => {
      if (!terminalReady) return

      const code = data.charCodeAt(0)
      
      if (code === 13) { // Enter
        writeToTerminal('')
        processCommand(currentLine.current)
        currentLine.current = ''
      } else if (code === 127) { // Backspace
        if (currentLine.current.length > 0) {
          currentLine.current = currentLine.current.slice(0, -1)
          terminal.current.write('\b \b')
        }
      } else if (code === 9) { // Tab - autocomplete
        const availableCommands = Object.keys(commands).filter(cmd => !cmd.includes(' '))
        const matches = availableCommands.filter(cmd => cmd.startsWith(currentLine.current.toLowerCase()))
        
        if (matches.length === 1) {
          const completion = matches[0].slice(currentLine.current.length)
          currentLine.current += completion
          terminal.current.write(completion)
        }
      } else if (code === 12) { // Ctrl+L - clear
        terminal.current.clear()
        showPrompt()
        currentLine.current = ''
      } else if (code === 27) { // Escape sequences (arrow keys)
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
      if (terminal.current) {
        terminal.current.dispose()
      }
    }
  }, [terminalReady, currentTheme])

  return (
    <div className="terminal-portfolio">
      <div ref={terminalRef} className="terminal" />
    </div>
  )
}

export default TerminalPortfolio
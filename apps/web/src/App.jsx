import { useState } from 'react'
import BootSequence from './components/BootSequence'
import TerminalPortfolio from './components/TerminalPortfolio'
import { AuthProvider } from './contexts/AuthContext'
import './App.css'

// Boot state constants
const BootState = {
  BOOTING: 'booting',
  READY: 'ready',
  PORTFOLIO: 'portfolio'
}

function App() {
  const [bootState, setBootState] = useState(BootState.BOOTING) // Start with boot sequence

  const handleBootComplete = () => {
    setBootState(BootState.READY)
    // Immediately transition to portfolio
    setTimeout(() => {
      setBootState(BootState.PORTFOLIO)
    }, 100)
  }

  return (
    <AuthProvider>
      <div className="app">
        {bootState === BootState.BOOTING && (
          <BootSequence onComplete={handleBootComplete} />
        )}
        {bootState === BootState.PORTFOLIO && (
          <TerminalPortfolio />
        )}
      </div>
    </AuthProvider>
  )
}

export default App
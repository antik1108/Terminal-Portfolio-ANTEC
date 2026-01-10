import { useState, useEffect } from 'react'
import ASCIILogo from './ASCIILogo'
import BootMessages from './BootMessages'
import './BootSequence.css'

const BOOT_MESSAGES = [
  "Initializing ANTEC Terminal...",
  "Loading system modules...",
  "Checking hardware compatibility...",
  "Mounting file systems...",
  "Starting network services...",
  "Loading user profile...",
  "Configuring terminal environment...",
  "Ready."
]

function BootSequence({ onComplete, skipAnimation = false }) {
  const [currentPhase, setCurrentPhase] = useState('logo') // 'logo', 'messages', 'complete'
  const [canSkip, setCanSkip] = useState(true)

  useEffect(() => {
    if (skipAnimation) {
      handleComplete()
      return
    }

    // Show logo for 2.5 seconds, then start messages
    const logoTimer = setTimeout(() => {
      setCurrentPhase('messages')
    }, 2500)

    return () => clearTimeout(logoTimer)
  }, [skipAnimation])

  const handleComplete = () => {
    setCurrentPhase('complete')
    setTimeout(() => {
      onComplete()
    }, 500)
  }

  const handleSkip = () => {
    if (canSkip) {
      handleComplete()
    }
  }

  // Handle spacebar and click to skip
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault()
        handleSkip()
      }
    }

    const handleClick = () => {
      handleSkip()
    }

    document.addEventListener('keydown', handleKeyPress)
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      document.removeEventListener('click', handleClick)
    }
  }, [canSkip])

  return (
    <div 
      className="boot-sequence"
      role="main"
      aria-label="Terminal boot sequence"
      tabIndex={0}
    >
      {currentPhase === 'logo' && (
        <ASCIILogo visible={true} />
      )}
      
      {currentPhase === 'messages' && (
        <BootMessages 
          messages={BOOT_MESSAGES}
          onComplete={handleComplete}
          messageDelay={800}
        />
      )}

      {canSkip && currentPhase !== 'complete' && (
        <div className="skip-hint">
          Press SPACE or click to skip
        </div>
      )}
    </div>
  )
}

export default BootSequence
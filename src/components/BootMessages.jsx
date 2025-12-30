import { useState, useEffect } from 'react'
import LoadingCursor from './LoadingCursor'

function BootMessages({ messages, onComplete, messageDelay = 800 }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [displayedMessages, setDisplayedMessages] = useState([])
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    if (currentMessageIndex >= messages.length) {
      // All messages displayed, complete after a longer delay to let users see "Ready."
      setTimeout(() => {
        setShowCursor(false)
        onComplete()
      }, 1500)
      return
    }

    const timer = setTimeout(() => {
      setDisplayedMessages(prev => [...prev, messages[currentMessageIndex]])
      setCurrentMessageIndex(prev => prev + 1)
    }, messageDelay)

    return () => clearTimeout(timer)
  }, [currentMessageIndex, messages, messageDelay, onComplete])

  return (
    <div className="boot-messages">
      {displayedMessages.map((message, index) => (
        <div key={index} className="boot-message">
          {message}
        </div>
      ))}
      <LoadingCursor visible={showCursor} />
    </div>
  )
}

export default BootMessages
function LoadingCursor({ visible, blinkRate = 1000 }) {
  if (!visible) return null

  return (
    <span 
      className="loading-cursor"
      style={{
        animation: `blink ${blinkRate}ms infinite`
      }}
    >
      █
    </span>
  )
}

export default LoadingCursor
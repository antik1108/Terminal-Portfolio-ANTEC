import { useState, useEffect } from 'react'

const ASCII_LOGO = `
 █████╗ ███╗   ██╗████████╗███████╗ ██████╗
██╔══██╗████╗  ██║╚══██╔══╝██╔════╝██╔════╝
███████║██╔██╗ ██║   ██║   █████╗  ██║     
██╔══██║██║╚██╗██║   ██║   ██╔══╝  ██║     
██║  ██║██║ ╚████║   ██║   ███████╗╚██████╗
╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝ ╚═════╝`

function ASCIILogo({ visible, animationDelay = 0 }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setShow(true)
      }, animationDelay)
      return () => clearTimeout(timer)
    }
  }, [visible, animationDelay])

  if (!show) return null

  return (
    <div className="ascii-logo">
      <pre className="logo-text">
        {ASCII_LOGO}
      </pre>
      <div className="logo-subtitle">
        ANTEC — Terminal Portfolio
      </div>
    </div>
  )
}

export default ASCIILogo
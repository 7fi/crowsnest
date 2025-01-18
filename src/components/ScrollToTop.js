import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollButton() {
  const [visible, setVisible] = useState(false)

  const toggleVisible = () => {
    const scrolled = document.documentElement.scrollTop
    if (scrolled > 300) {
      setVisible(true)
    } else if (scrolled <= 300) {
      setVisible(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
  window.addEventListener('scroll', toggleVisible)

  return (
    <button className='scrollButton' onClick={scrollToTop} style={{ display: visible ? 'inline' : 'none' }}>
      Back to top
    </button>
  )
}

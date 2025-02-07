import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <div className='footerContainer secondaryText flexRowContainer'>
      <span>©CrowsNest 2025</span>
      <Link to={'/about'}>About</Link>
      <a href='https://instagram.com/crowsnest.club/'>Instagram</a>
      <a href='https://github.com/7fi/crowsnest'>GitHub</a>
      <a href='https://github.com/7fi/crowsnest'>Issues</a>
    </div>
  )
}

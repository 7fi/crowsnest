import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <div className='footerContainer secondaryText flexRowContainer'>
      <span>©CrowsNest 2025</span>
      <Link to={'/about'}>About</Link>
      <a href='https://instagram.com/crowsnest.club/'>Instagram</a>
      <a href='https://discord.gg/RxVhg2aUQE'>Discord</a>
      <a href='https://github.com/7fi/crowsnest'>GitHub</a>
      <a href='https://docs.google.com/forms/d/e/1FAIpQLSfTz5XO-7UM5vloq1Rs9Aly5IGqNvNJN1p7mXq-O1NzoVg6-Q/viewform?usp=header'>Issues</a>
    </div>
  )
}

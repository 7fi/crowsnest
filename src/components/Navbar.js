import '../main.css'
import { Link, NavLink } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../lib/context'
import SignOutButton from './login/SignOutButton'
import { setTheme } from '../lib/hooks'
import { FaSun, FaMoon } from 'react-icons/fa'
import { AuthCheckLite } from './AuthCheck'

export default function Navbar() {
  const { user, userVals } = useContext(UserContext)

  const [theme, setThemeVal] = useState(localStorage.getItem('theme'))

  return (
    <nav className='navbar'>
      <ul>
        <li>
          <Link to='/crowsnest/' className='text-title'>
            CrowsNest
          </Link>
        </li>
        <ul className='navRight'>
          <li>
            <button
              onClick={() => {
                setTheme(localStorage.getItem('theme') == 'light' ? 'dark' : 'light')
                setThemeVal(localStorage.getItem('theme'))
              }}>
              <RenderThemeBtn />
            </button>
          </li>
          {!user && (
            <li>
              <Link to='/crowsnest/enter'>
                <button>Sign In</button>
              </Link>
            </li>
          )}
          {/* {userVals.username && ( */}
          <AuthCheckLite>
            <li>
              <Link to='/crowsnest/teams'>
                <button>Teams</button>
              </Link>
            </li>
            <li>
              <SignOutButton />
            </li>
            <li>
              <Link to={`/crowsnest/profile/${userVals?.username}`}>
                <img src={user?.photoURL} alt={userVals?.username} referrerPolicy='no-referrer' className='btn' />
              </Link>
            </li>
          </AuthCheckLite>
          {/*)} */}
        </ul>
      </ul>
    </nav>
  )
}

function RenderThemeBtn() {
  switch (localStorage.getItem('theme') ? localStorage.getItem('theme') : null) {
    case 'dark':
      return <FaSun />

    default:
      return <FaMoon />
  }
}

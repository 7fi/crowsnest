import '../main.css'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../lib/context'
import SignOutButton from './login/SignOutButton'
import { setTheme } from '../lib/hooks'
import { FaSun, FaMoon } from 'react-icons/fa'
import { AuthCheckLite } from './AuthCheck'

export default function Navbar() {
  const { user, userVals } = useContext(UserContext)

  const [theme, setThemeVal] = useState(localStorage.getItem('theme'))
  const location = useLocation()

  return (
    <nav className='navbar'>
      <ul>
        <li>
          <Link to='/' className='text-title'>
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
          {/* {userVals.username && ( */}
          <>
            <li>
              <Link to='/rankings/'>
                <button>Rankings</button>
              </Link>
            </li>
            {!user && (
              <>
                <li>
                  <Link to='/enter'>
                    <button>Sign In</button>
                  </Link>
                </li>
              </>
            )}
            <AuthCheckLite>
              {!location.pathname.includes('rankings') ? (
                <li>
                  <Link to='/teams'>
                    <button>Teams</button>
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link to={`/rankings/team/`}>
                      <button>Teams</button>
                    </Link>
                  </li>
                </>
              )}
              <li>
                <SignOutButton />
              </li>
              <li>
                <Link to={`/profile/${userVals?.username}`}>
                  <img src={user?.photoURL} alt={userVals?.username} referrerPolicy='no-referrer' className='btn' />
                </Link>
              </li>
            </AuthCheckLite>
          </>

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

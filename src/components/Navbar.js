import '../main.css'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../lib/context'
import SignOutButton from './login/SignOutButton'
import { setTheme, useMobileDetect } from '../lib/hooks'
import { FaSun, FaMoon } from 'react-icons/fa'
import { IoSunnySharp } from 'react-icons/io5'
import { AuthCheckLite } from './AuthCheck'

export default function Navbar() {
  const { user, userVals } = useContext(UserContext)

  const [theme, setThemeVal] = useState(localStorage.getItem('theme'))
  const location = useLocation()
  const isMobile = useMobileDetect()

  return (
    <nav className='navbar'>
      <ul>
        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link to='/' style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img style={{ margin: 5 }} src={theme == 'dark' ? `/Logo_Dark.png` : `/Logo_Light.png`} />
            {isMobile ? (
              <></>
            ) : (
              <>
                <span className='text-title'>CrowsNest</span>
                <span style={{ marginTop: 3 }} className='secondaryText'>
                  {' '}
                  [Alpha]
                </span>
              </>
            )}
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
          {/* <li>
              <Link to='/rankings/'>
                <button>Rankings</button>
              </Link>
            </li> */}
          <li>
            <Link to={`/rankings/team`}>
              <button>Teams</button>
            </Link>
          </li>
          <li>
            <Link to={`/rankings/search`}>
              <button>Sailors</button>
            </Link>
          </li>
          {isMobile ? (
            <></>
          ) : (
            <li>
              <Link to={`/about`}>
                <button>About</button>
              </Link>
            </li>
          )}
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
            <li>
              <Link to={`/profile/${userVals?.username}`}>
                <img style={{ maxWidth: 40, maxHeight: 40 }} src={user?.photoURL} alt={userVals?.username} referrerPolicy='no-referrer' className='btn' />
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
      return <IoSunnySharp />

    default:
      return <FaMoon />
  }
}

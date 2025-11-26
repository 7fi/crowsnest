import '../main.css'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../lib/context'
import SignOutButton from './login/SignOutButton'
import { setTheme, useMobileDetect } from '../lib/hooks'
import { FaSun, FaMoon } from 'react-icons/fa'
import { IoSunnySharp } from 'react-icons/io5'
import { AuthCheckLite } from './AuthCheck'
import { ProCheckLite } from './rankings/ProCheck'

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
                {/* <ProCheckLite>
                  <span style={{ position: 'relative', rotate: '15deg', top: -15, left: -20 }}>Pro</span>
                </ProCheckLite> */}
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
            <Link to={`/teams`}>
              <button>Teams</button>
            </Link>
          </li>
          <li className='hoverbox'>
            <Link to={`/sailors`}>
              <button>Sailors</button>
            </Link>
            <ul className='hoverafter'>
              <li>
                <Link to={'/rankings/skipper'}>Top Open Skippers</Link>
              </li>
              <li>
                <Link to={'/rankings/crew'}>Top Open Crews</Link>
              </li>
              <li>
                <Link to={'/rankings/skipper/women'}>Top Women's Skippers</Link>
              </li>
              <li>
                <Link to={'/rankings/crew/women'}>Top Women's Crews</Link>
              </li>
              <li>
                <Link to={'/rankings/trskipper'}>Top Open TR Skippers</Link>
              </li>
              <li>
                <Link to={'/rankings/trcrew'}>Top Open TR Crews</Link>
              </li>
              <li>
                <Link to={'/rankings/trskipper/women'}>Top Women's TR Skippers</Link>
              </li>
              <li>
                <Link to={'/rankings/trcrew/women'}>Top Women's TR Crews</Link>
              </li>
            </ul>
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
          {userVals.tsLink ? (
            <li>
              <button>
                <Link to={`/sailors/${userVals?.tsLink?.split('/')[4]}`}>{userVals?.displayName}</Link>
              </button>
            </li>
          ) : (
            <></>
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

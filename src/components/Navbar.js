import '../main.css'
import { Link, NavLink } from 'react-router-dom'
import { useContext } from 'react'
import { UserContext } from '../lib/context'
import SignOutButton from './SignOutButton'
import { switchMode } from '../lib/hooks'

export default function Navbar() {
    const { user, username } = useContext(UserContext)
    return (
        <nav className="navbar">
            <ul>
                <li>
                    <Link to="/" className="siteTitle">
                        CrowsNest
                    </Link>
                </li>
                <ul className="navRight">
                    <li>
                        <button onClick={() => switchMode()}>Mode</button>
                    </li>
                    {!user && (
                        <li>
                            <Link to="/enter">
                                <button>Sign In</button>
                            </Link>
                        </li>
                    )}
                    {username && (
                        <>
                            <li>
                                <NavLink to="/createteam">
                                    <button>Create Team</button>
                                </NavLink>
                            </li>
                            <li>
                                <SignOutButton />
                            </li>
                            <li>
                                <NavLink to={`/profile/${username}`}>
                                    <img src={user?.photoURL} alt={username} referrerPolicy="no-referrer" className="btn" />
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>
            </ul>
        </nav>
    )
}

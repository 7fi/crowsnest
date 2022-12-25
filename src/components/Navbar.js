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
                    <Link to="/crowsnest/" className="text-title">
                        CrowsNest
                    </Link>
                </li>
                <ul className="navRight">
                    <li>
                        <button onClick={() => switchMode()}>Mode</button>
                    </li>
                    {!user && (
                        <li>
                            <Link to="/crowsnest/enter">
                                <button>Sign In</button>
                            </Link>
                        </li>
                    )}
                    {username && (
                        <>
                            <li>
                                <Link to="/crowsnest/teams">
                                    <button>Teams</button>
                                </Link>
                            </li>
                            <li>
                                <SignOutButton />
                            </li>
                            <li>
                                <Link to={`/crowsnest/profile/${username}`}>
                                    <img src={user?.photoURL} alt={username} referrerPolicy="no-referrer" className="btn" />
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </ul>
        </nav>
    )
}

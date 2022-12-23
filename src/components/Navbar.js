import '../main.css'
import { Link, NavLink } from 'react-router-dom'
import { useContext } from 'react'
import { UserContext } from '../lib/context'
import SignOutButton from './SignOutButton'

export default function Navbar() {
    const { user, username } = useContext(UserContext)
    return (
        <nav className="navbar">
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <ul>
                    {!user && (
                        <li>
                            <Link to="/enter">Sign In</Link>
                        </li>
                    )}
                    {username && (
                        <>
                            <li>
                                <NavLink to="/createteam">Create Team</NavLink>
                            </li>
                            <li>
                                <SignOutButton />
                            </li>
                            <li>
                                <NavLink to={`/profile/${username}`}>
                                    <img src={user?.photoURL} alt={username} referrerPolicy="no-referrer" />
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>
            </ul>
        </nav>
    )
}

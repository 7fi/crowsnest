import AuthCheck from '../components/AuthCheck'
import SignOutButton from '../components/SignOutButton'
import { Link, useParams } from 'react-router-dom'
import { getUserWithUsername } from '../lib/firebase'
import { useEffect, useState } from 'react'

export default function Profile() {
    const [user, setUser] = useState({})
    const { username } = useParams()
    console.log(username)

    useEffect(() => {
        getUserWithUsername(username).then((tempuser) => setUser(tempuser))
    }, [])

    return (
        <main>
            <AuthCheck>
                <div className="contentBox profileBox">
                    <img src={user?.photoURL} alt="Profile Image" referrerPolicy="no-referrer" />
                    <div className="text-title">{user?.displayName}</div>
                    <div className="text-subtitle profileUsername">({user?.username})</div>
                </div>
                <ul className="contentBox teamsBox">
                    {user?.teams?.map((team) => (
                        <li key={team}>
                            <Link to={`/crowsnest/team/${team}`} className="text-titlecase">
                                {team}
                            </Link>
                        </li>
                    ))}
                </ul>
            </AuthCheck>
        </main>
    )
}

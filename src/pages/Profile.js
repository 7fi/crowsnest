import AuthCheck from '../components/AuthCheck'
import SignOutButton from '../components/SignOutButton'
import { Link, useParams } from 'react-router-dom'
import { getUserWithUsername } from '../lib/firebase'
import { useEffect, useState, useContext } from 'react'
import { UserContext } from '../lib/context'
import { getFirestore, deleteDoc, doc } from 'firebase/firestore'
import { deleteUser } from 'firebase/auth'

export default function Profile() {
    const { user, username } = useContext(UserContext)
    const [pageUser, setPageUser] = useState({})
    const [pageUserId, setPageUserId] = useState('')
    const { profileName } = useParams()

    useEffect(() => {
        getUserWithUsername(profileName).then(({ tempuser, uid }) => {
            console.log(tempuser)
            setPageUser(tempuser)
            setPageUserId(uid)
        })
    }, [profileName])

    return (
        <main>
            <AuthCheck>
                <div className="contentBox profileBox">
                    <img src={pageUser?.photoURL} alt="Profile Image" referrerPolicy="no-referrer" />
                    <div className="text-title">{pageUser?.displayName}</div>
                    <div className="text-subtitle profileUsername">({pageUser?.username})</div>
                </div>
                <ul className="contentBox teamsBox">
                    {pageUser?.teams?.map((team) => (
                        <li key={team}>
                            <Link to={`/crowsnest/team/${team}`} className="text-titlecase">
                                {team}
                            </Link>
                        </li>
                    ))}
                </ul>
                {profileName == username && pageUserId == user?.uid && (
                    <div className="contentBox">
                        <button className="text-danger" onClick={() => deleteAccount(user, username)}>
                            Delete Account
                        </button>
                    </div>
                )}
            </AuthCheck>
        </main>
    )
}

async function deleteAccount(user, username) {
    const db = getFirestore()

    const userDoc = doc(db, 'users', user.uid)
    const usernameDoc = doc(db, 'usernames', username)

    deleteDoc(userDoc)
    deleteDoc(usernameDoc)

    deleteUser(user)
}

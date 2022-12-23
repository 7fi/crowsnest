import AuthCheck from '../components/AuthCheck'
import SignOutButton from '../components/SignOutButton'
import { useParams } from 'react-router-dom'
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
                <img src={user?.photoURL} alt="Profile Image" referrerPolicy="no-referrer" />
                <h1>{user?.displayName}</h1>
                <span>{user?.username}</span>
                <SignOutButton />
            </AuthCheck>
        </main>
    )
}

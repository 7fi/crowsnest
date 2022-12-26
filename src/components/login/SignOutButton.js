import { getAuth, signOut } from 'firebase/auth'

export default function SignOutButton() {
    const auth = getAuth()
    // const auth = null
    return <button onClick={() => signOut(auth)}>Sign Out</button>
}

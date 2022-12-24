import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth'

export default function SignInButton() {
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider()
        const auth = getAuth()
        await signInWithPopup(auth, provider)
    }
    return (
        <button className="btn-google" onClick={signInWithGoogle}>
            <img src={'./google.png'} alt="google logo" className="btn-logo" /> Sign in with Google
        </button>
    )
}

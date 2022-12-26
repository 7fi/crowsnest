import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth'
import { toast } from 'react-hot-toast'

export default function GoogleSignInButton() {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const auth = getAuth()
    await signInWithPopup(auth, provider).catch((error) => {
      toast.error(error.toString())
    })
  }
  return (
    <button className='btn-google' onClick={signInWithGoogle}>
      <img src={'./google.png'} alt='google logo' className='btn-logo' /> Sign in with Google
    </button>
  )
}

import { GithubAuthProvider, getAuth, signInWithPopup } from 'firebase/auth'
import { toast } from 'react-hot-toast'

export default function GitHubSignInButton() {
  const signInWithGitHub = async () => {
    const provider = new GithubAuthProvider()
    const auth = getAuth()
    await signInWithPopup(auth, provider).catch((error) => {
      toast.error(error.toString())
    })
  }
  return (
    <button className='btn-google' onClick={signInWithGitHub}>
      <img src={'./github.png'} alt='Github logo' className='btn-logo' /> Sign in with GitHub
    </button>
  )
}

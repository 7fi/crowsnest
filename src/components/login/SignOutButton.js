import { getAuth, signOut } from 'firebase/auth'
import posthog from 'posthog-js'

export default function SignOutButton() {
  const auth = getAuth()
  // const auth = null

  return (
    <button
      onClick={() => {
        signOut(auth)
        posthog.reset()
      }}>
      Sign Out
    </button>
  )
}

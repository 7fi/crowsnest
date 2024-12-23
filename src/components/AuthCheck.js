import { useContext } from 'react'
import { UserContext } from '../lib/context'

// Component's children only shown to logged-in users
export default function AuthCheck(props) {
  const { userVals } = useContext(UserContext)

  // return true
  return userVals.username
    ? props.children
    : props.fallback || (
        <div className='contentBox'>
          You must be signed in to view this content!
          <br />
          <a href='/enter' className='text-danger'>
            Click here to sign in!
          </a>
        </div>
      )
}
export function AuthCheckLite(props) {
  const { userVals } = useContext(UserContext)
  return userVals.username ? props.children : null
  return true ? props.children : null
}

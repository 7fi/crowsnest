import { useContext } from 'react'
import { UserContext } from '../lib/context'

// Component's children only shown to logged-in users
export default function AuthCheck(props) {
    const { username } = useContext(UserContext)

    return username
        ? props.children
        : props.fallback || (
              <div>
                  You must be signed in to view this content!
                  <br />
                  <a href="/enter" className="text-danger">
                      Click here to sign in!
                  </a>
              </div>
          )
}

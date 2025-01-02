import { useContext } from 'react'
import { UserContext } from '../../lib/context'

// Component's children only shown to logged-in users
export default function ProCheck(props) {
  const { userVals } = useContext(UserContext)

  console.log(userVals)

  // return true
  return userVals.username ? (
    userVals.pro ? (
      props.children
    ) : (
      <div className='contentBox'>
        You must have Pro to view this content!
        <br />
        Pro is not available yet.
      </div>
    )
  ) : (
    props.fallback || (
      <div className='contentBox'>
        You must be signed in to view this content!
        <br />
        <a href='/enter' className='text-danger'>
          Click here to sign in!
        </a>
      </div>
    )
  )
}
export function ProCheckLite(props) {
  const { userVals } = useContext(UserContext)
  return userVals.pro ? props.children : <span className='secondaryText'>(you need Pro for {props.feature ? props.feature : 'this feautre'})</span>
  return true ? props.children : null
}

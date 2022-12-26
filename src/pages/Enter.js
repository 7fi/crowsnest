import { useContext, useState, useCallback, useEffect } from 'react'
import { UserContext } from '../lib/context'
import { getDoc, getFirestore, doc, writeBatch } from 'firebase/firestore'
import debounce from 'lodash.debounce'
import GoogleSignInButton from '../components/login/GoogleSignInButton'
import GitHubSignInButton from '../components/login/GitHubSignInButton'
import SignOutButton from '../components/login/SignOutButton'
import EmailSignInForm from '../components/login/EmailSignInForm'
import { useNavigate } from 'react-router'

export default function Enter() {
  const { user, userVals } = useContext(UserContext)
  console.log(user, userVals.username)

  return (
    <main>
      {user ? (
        !userVals.username ? (
          <UsernameForm />
        ) : (
          <SignOutButton />
        )
      ) : (
        <>
          <EmailSignInForm />
          <div className='contentBox flexRowContainer'>
            <GoogleSignInButton />
            <GitHubSignInButton />
          </div>
        </>
      )}
    </main>
  )
}

function UsernameForm() {
  const [usernameValue, setUsernameValue] = useState('')
  const [displaynameValue, setdisplaynameValue] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [loading, setLoading] = useState(false)

  const { user, userVals } = useContext(UserContext)

  const db = getFirestore()
  const navigate = useNavigate()

  const onChangeUsername = (e) => {
    const val = e.target.value.toLowerCase()
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/

    // Only set form value if length is < 3 OR it passes regex
    if (val.length < 3) {
      setUsernameValue(val)
      setLoading(false)
      setIsValid(false)
    }

    if (re.test(val)) {
      setUsernameValue(val)
      setLoading(true)
      setIsValid(false)
    }
  }
  const onChangeDisplayName = (e) => {
    const val = e.target.value

    if (val.length < 3 && val.length > 35) {
      setdisplaynameValue(val)
    } else {
      setdisplaynameValue(val)
    }
  }

  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        let docRef = doc(db, 'usernames', username)
        const docSnap = await getDoc(docRef)
        console.log('Read executed!', docSnap.exists())
        setIsValid(!docSnap.exists())
        setLoading(false)
      }
    }, 500),
    []
  )

  useEffect(() => {
    checkUsername(usernameValue)
  }, [usernameValue])

  const onSubmit = async (e) => {
    e.preventDefault()

    const userDoc = doc(db, 'users', user.uid)
    const usernameDoc = doc(db, 'usernames', usernameValue)

    const batch = writeBatch(db)

    batch.set(userDoc, { username: usernameValue, photoURL: user.photoURL, displayName: displaynameValue, teams: [] })
    batch.set(usernameDoc, { uid: user.uid })

    await batch.commit()
    navigate(`/crowsnest/profile/${usernameValue}`)
  }

  return (
    !userVals.username && (
      <section>
        <h3>Choose Username:</h3>
        <form onSubmit={onSubmit}>
          <input name='username' placeholder='Unique name' value={usernameValue} onChange={onChangeUsername}></input>
          <input name='displayName' placeholder='Display name' value={displaynameValue} onChange={onChangeDisplayName}></input>
          <UsernameMessage username={usernameValue} isValid={isValid} loading={loading} />
          <button type='submit' className='btn-green' disabled={!isValid}>
            Choose
          </button>

          <h3>Debug State</h3>
          <div>
            Username: {usernameValue}
            <br />
            Loading: {loading.toString()}
            <br />
            Username Valid: {isValid.toString()}
          </div>
        </form>
      </section>
    )
  )
}

function UsernameMessage({ username, isValid, loading }) {
  if (loading) {
    return <p>Checking...</p>
  } else if (isValid) {
    return <p className='text-success'>{username} is available!</p>
  } else if (username.length < 3) {
    return <p className='text-danger'>That username is too short!</p>
  } else if (username && !isValid) {
    return <p className='text-danger'>That username is taken!</p>
  } else {
    return <p></p>
  }
}

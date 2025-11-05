import AuthCheck from '../components/AuthCheck'
import SignOutButton from '../components/login/SignOutButton'
import { Link, useParams } from 'react-router-dom'
import { getUserByUsername, getUserFollows } from '../lib/apilib'
import { useEffect, useState, useContext } from 'react'
import { UserContext } from '../lib/context'
import { getFirestore, deleteDoc, doc } from 'firebase/firestore'
import { deleteUser } from 'firebase/auth'
import { toast } from 'react-hot-toast'

export default function Profile() {
  const { user, userVals } = useContext(UserContext)
  const [pageUser, setPageUser] = useState({})
  const [pageUserId, setPageUserId] = useState('')
  const [follows, setFollows] = useState([])
  const { profileName } = useParams()

  useEffect(() => {
    getUserByUsername(profileName).then((tempuser) => {
      setPageUser(tempuser)
      setPageUserId(tempuser.userID)
      getUserFollows(tempuser.userID).then((follows) => {
        setFollows(follows)
        console.log(follows)
      })
    })
  }, [profileName])

  return (
    <main>
      <AuthCheck>
        <div className='contentBox profileBox'>
          <img src={pageUser?.photoURL} alt='Profile Image' referrerPolicy='no-referrer' style={{ maxWidth: 100 }} />
          <div className='text-title'>{pageUser?.displayName}</div>
          <div className='text-subtitle profileUsername'>({pageUser?.username})</div>
        </div>
        {pageUser?.techscoreLink ? (
          <ul className='contentBox'>
            <button>
              <Link to={`/rankings/${pageUser?.techscoreLink?.split('/')[4]}`}>Crowsnest Rating Profile</Link>
            </button>
          </ul>
        ) : (
          <></>
        )}
        {/* <ul className='contentBox teamsBox'>
          {pageUser?.teams?.map((team) => (
            <li key={team}>
              <Link to={`/team/${team}`} className='text-titlecase'>
                {team}
              </Link>
            </li>
          ))}
        </ul> */}
        {profileName == userVals?.username && pageUserId == user?.uid && (
          <>
            <div className='contentBox'>
              <Link to='/feed'>
                <h2>Following:</h2>
              </Link>
              {follows.map((targetFollow, i) => (
                <div key={i}>
                  <Link to={`/rankings/${targetFollow.sailorID}`}>{targetFollow.sailorName}</Link>
                </div>
              ))}
            </div>
            <div className='contentBox'>
              <SignOutButton />

              <button
                className='text-danger'
                onClick={() => {
                  toast(
                    (t) => (
                      <div>
                        Delete Account?
                        <div className='flexRowContainer'>
                          <button
                            onClick={() => {
                              toast.dismiss(t.id)
                              toast.error('Cancelled')
                            }}>
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              deleteAccount(user, userVals.username)
                              toast.dismiss(t.id)
                              toast.success('Deleted!')
                            }}
                            className='text-danger'>
                            Delete!
                          </button>
                        </div>
                      </div>
                    )
                    // { position: 'top-center' }
                  )
                }}>
                Delete Account
              </button>
            </div>
          </>
        )}
      </AuthCheck>
    </main>
  )
}

async function deleteAccount(user, username) {
  const db = getFirestore()

  const userDoc = doc(db, 'users', user.uid)
  const usernameDoc = doc(db, 'usernames', username)

  deleteDoc(userDoc)
  deleteDoc(usernameDoc)

  deleteUser(user)
}

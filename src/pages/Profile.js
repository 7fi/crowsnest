import AuthCheck from '../components/AuthCheck'
import SignOutButton from '../components/login/SignOutButton'
import { Link, useParams } from 'react-router-dom'
import { getUserWithUsername } from '../lib/firebase'
import { useEffect, useState, useContext } from 'react'
import { UserContext } from '../lib/context'
import { getFirestore, deleteDoc, doc } from 'firebase/firestore'
import { deleteUser } from 'firebase/auth'
import { toast } from 'react-hot-toast'

export default function Profile() {
  const { user, userVals } = useContext(UserContext)
  const [pageUser, setPageUser] = useState({})
  const [pageUserId, setPageUserId] = useState('')
  const { profileName } = useParams()

  useEffect(() => {
    getUserWithUsername(profileName).then(({ tempuser, uid }) => {
      console.log(tempuser)
      setPageUser(tempuser)
      setPageUserId(uid)
    })
  }, [profileName])

  return (
    <main>
      <AuthCheck>
        <div className='contentBox profileBox'>
          <img src={pageUser?.photoURL} alt='Profile Image' referrerPolicy='no-referrer' />
          <div className='text-title'>{pageUser?.displayName}</div>
          <div className='text-subtitle profileUsername'>({pageUser?.username})</div>
        </div>
        <ul className='contentBox teamsBox'>
          {pageUser?.teams?.map((team) => (
            <li key={team}>
              <Link to={`/team/${team}`} className='text-titlecase'>
                {team}
              </Link>
            </li>
          ))}
        </ul>
        {profileName == userVals?.username && pageUserId == user?.uid && (
          <div className='contentBox'>
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

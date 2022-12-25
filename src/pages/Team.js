import AuthCheck from '../components/AuthCheck'
import { getTeamWithName } from '../lib/firebase'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { UserContext } from '../lib/context'
import { useContext } from 'react'
import { toast } from 'react-hot-toast'

import { Firestore, updateDoc, doc, getFirestore, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { FaTrash } from 'react-icons/fa'

export default function Team() {
  const { user, userVals } = useContext(UserContext)
  const [team, setTeam] = useState({})
  const [memberNames, setMemeberNames] = useState([])
  const [teamID, setTeamID] = useState('')
  const { teamName } = useParams()

  useEffect(() => {
    getTeamWithName(teamName).then((tempTeam) => {
      setTeam(tempTeam.data)
      // setMemeberNames(tempTeam.data?.members)
      setTeamID(tempTeam.id)
    })
  }, [memberNames])

  // console.log(teamID)

  return (
    <main>
      <AuthCheck>
        {/* <img src={team?.photoURL} alt="Profile Image" referrerPolicy="no-referrer" /> */}
        {Object.keys(team).length > 0 ? (
          <>
            <div className='contentBox'>
              <span className='text-title text-titlecase'>{team?.teamName}</span>
            </div>
            <div className='contentBox'>
              <h3>Members:</h3>
              <ul className='memberList'>
                {team?.members?.map((member) => (
                  <li key={team?.members.find((item) => item.displayName == member.displayName).uid} className='teamMember contentBox'>
                    <Link to={`/crowsnest/profile/${member.username}`}>
                      <strong>{member.displayName}</strong>
                    </Link>
                    <span> ({member.role})</span>
                    {team?.owner == user?.uid && team?.owner != member.uid && (
                      <button
                        onClick={() => {
                          toast(
                            (t) => (
                              <div>
                                Delete Member?
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
                                      deleteMember(teamID, team?.members.find((item) => item.displayName == member.displayName).uid, team?.members, setMemeberNames)
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
                        <FaTrash />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            {team?.members.includes(user?.uid) && (
              <div className='contentBox'>
                <button className='text-danger' onClick={() => deleteMember(teamID, user?.uid, userVals.displayName, setMemeberNames)}>
                  Leave Team
                </button>
              </div>
            )}

            {team?.owner == user?.uid && <TeamControls team={team} teamID={teamID} teamName={teamName} setMemeberNames={setMemeberNames} />}
            {!(team?.owner == user?.uid) && !team?.members.includes(user?.uid) && (
              <div className='contentBox'>
                <button
                  onClick={() => {
                    requestTeam(teamID, user.uid, userVals.username, userVals.displayName)
                    toast.success('Request Sent!')
                  }}>
                  Request
                </button>
              </div>
            )}
          </>
        ) : (
          <h1>Team not found!</h1>
        )}
      </AuthCheck>
    </main>
  )
}

function TeamControls({ team, teamID, teamName, setMemeberNames }) {
  console.log(teamID)
  return (
    <div className='contentBox'>
      <h3>Admin Controls:</h3>
      {team?.requests.length > 0 && <>Requests:</>}
      <ul className='requestsList'>
        {team?.requests?.map((request) => {
          console.log(request)
          return (
            <li className='request contentBox' key={0}>
              {request.displayName}
              <button
                className='text-sucess'
                onClick={() => {
                  toast(
                    (t) => (
                      <div>
                        Accept request?
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
                              acceptRequest(request, teamID, teamName, setMemeberNames)
                              toast.dismiss(t.id)
                              toast.success('Request accepted!')
                            }}
                            className='text-sucess'>
                            Accept!
                          </button>
                        </div>
                      </div>
                    )
                    // { position: 'top-center' }
                  )
                }}>
                Accept
              </button>
              <button
                className='text-danger'
                onClick={() => {
                  toast(
                    (t) => (
                      <div>
                        Deny request?
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
                              denyRequest(request, teamID, teamName, setMemeberNames)
                              toast.dismiss(t.id)
                              toast.success('Request denied!')
                            }}
                            className='text-danger'>
                            Deny!
                          </button>
                        </div>
                      </div>
                    )
                    // { position: 'top-center' }
                  )
                }}>
                Deny
              </button>
            </li>
          )
        })}
      </ul>
      {/* <button>Add member</button> */}
      <button className='text-danger'>Delete team</button>
    </div>
  )
}

async function acceptRequest(request, teamID, teamName, setMemeberNames) {
  console.log(teamID)
  const db = getFirestore()
  let d = doc(db, `teams/${teamID}`)
  await updateDoc(d, { members: arrayUnion({ uid: request.userId, username: request.username, displayName: request.displayName, role: 'Member' }), requests: arrayRemove(request) })
  // console.log(docSnap.data())
  setMemeberNames([])
  d = doc(db, `users/${request.userId}`)
  await updateDoc(d, { teams: arrayUnion(teamName) })
}
async function denyRequest(request, teamID, setMemeberNames) {
  const db = getFirestore()
  let d = doc(db, `teams/${teamID}`)
  await updateDoc(d, { requests: arrayRemove(request) })
  setMemeberNames([])
}

async function requestTeam(teamID, uid, username, displayName) {
  const db = getFirestore()
  let d = doc(db, `teams/${teamID}`)
  console.log(uid, username, displayName)
  await updateDoc(d, { requests: arrayUnion({ userId: uid, username: username, displayName: displayName }) })
}

async function deleteMember(teamID, uid, members, setMemeberNames) {
  const db = getFirestore()
  let d = doc(db, `teams/${teamID}`)
  await updateDoc(d, { members: arrayRemove(members.find((item) => item.uid == uid)) })
  setMemeberNames([])
}

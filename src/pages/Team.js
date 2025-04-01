import AuthCheck from '../components/AuthCheck'
import { getTeamWithName, getEventsForTeam } from '../lib/firebase'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { UserContext } from '../lib/context'
import { useContext } from 'react'
import { toast } from 'react-hot-toast'

import { updateDoc, doc, getFirestore, arrayUnion, arrayRemove, getDoc, deleteDoc } from 'firebase/firestore'
import { FaTrash } from 'react-icons/fa'
import { update } from 'lodash'

export default function Team() {
  const { user, userVals } = useContext(UserContext)
  const [team, setTeam] = useState({})
  const [memberNames, setMemeberNames] = useState([])
  const [events, setEvents] = useState([])
  const [teamID, setTeamID] = useState('')
  const [curTeamname, setTeamName] = useState('')
  const { teamName } = useParams()

  useEffect(() => {
    getTeamWithName(teamName).then((tempTeam) => {
      console.log(tempTeam.data)
      setTeam(tempTeam.data)
      // setMemeberNames(tempTeam.data?.members)
      setTeamID(tempTeam.id)
      setTeamName(tempTeam.name)
    })
    getEventsForTeam(teamName).then((tempEvents) => {
      console.log(tempEvents[1].data().endDate.toDate() - Date.now())
      console.log(tempEvents[1].data().endDate.toDate() > Date.now())
      console.log(tempEvents?.map((d) => ({ data: d.data(), id: d.id })))
      setEvents(tempEvents?.map((d) => ({ data: d.data(), id: d.id })))
    })
  }, [teamName])

  // console.log(teamID)
  console.log(team?.members)
  if (team?.members) console.log(team?.members.find((u) => user?.uid == u.uid))

  return (
    <main>
      <AuthCheck>
        {/* <img src={team?.photoURL} alt="Profile Image" referrerPolicy="no-referrer" /> */}
        {Object.keys(team).length > 0 ? (
          <>
            <div className='contentBox flexRowContainer'>
              <span className='text-title text-titlecase'>{team?.teamName}</span>
              <Link to={`/team/${team?.teamName}/pairs`}>
                <button>Pairs</button>
              </Link>
            </div>
            <div className='contentBox'>
              <div className='flexRowContainer'>
                <Link to={`/team/${team?.teamName}/events`}>
                  <h3>Events</h3>
                </Link>
                <button>
                  <Link to='/event/create'>Create</Link>
                </button>
              </div>
              <ul className='noStyleList'>
                {events
                  ?.filter((event) => event?.data?.endDate?.toDate() >= Date.now())
                  .sort((a, b) => {
                    return a?.data?.endDate?.toDate() - b?.data?.endDate?.toDate()
                  })
                  .map((event) => (
                    <Link to={`/event/${event.id}`} key={event.id}>
                      <li key={event.id} className='contentBox eventBox'>
                        <strong>{event.data.name}</strong>
                        {' ' + event.data.startDate.toDate().toDateString()}
                      </li>
                    </Link>
                  ))}
              </ul>
            </div>
            <div className='contentBox'>
              <h3>Members</h3>
              <ul className='memberList'>
                {team?.members?.map((member) => (
                  <li key={team?.members.find((item) => item.displayName == member.displayName).uid} className='teamMember contentBox'>
                    <Link to={`/profile/${member.username}`}>
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
                                      deleteMember(teamName, teamID, team?.members.find((item) => item.displayName == member.displayName).uid, team?.members, setMemeberNames)
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
            {team?.members.find((u) => user?.uid == u.uid) != undefined && (
              <div className='contentBox'>
                <button className='text-danger' onClick={() => deleteMember(teamID, user?.uid, team?.members, setMemeberNames)}>
                  Leave Team
                </button>
              </div>
            )}

            {team?.owner == user?.uid && <TeamControls team={team} teamID={teamID} teamName={teamName} setMemeberNames={setMemeberNames} />}
            {!(team?.owner == user?.uid) && !team?.members.some((u) => user?.uid == u.uid) && (
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
  const navigate = useNavigate()

  return (
    <div className='contentBox'>
      <h3>Admin Controls</h3>
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
                  acceptRequest(request, teamID, teamName, setMemeberNames)
                  toast.success('Request accepted!')
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
      <button
        className='text-danger'
        onClick={() => {
          toast((t) => (
            <div>
              Delete team?
              <div className='flexRowContainer'>
                <button
                  onClick={() => {
                    toast.dismiss(t.id)
                    toast.error('Cancelled')
                  }}>
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await deleteTeam(teamID)
                    toast.dismiss(t.id)
                    toast.success('Team deleted!')
                    navigate('/teams')
                  }}
                  className='text-danger'>
                  Delete!
                </button>
              </div>
            </div>
          ))
        }}>
        Delete team
      </button>
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
  let docSnap = (await getDoc(d)).data()
  // console.log(uid, username, displayName)
  if (docSnap.members.find((m) => uid == m.uid) == undefined) await updateDoc(d, { requests: arrayUnion({ userId: uid, username: username, displayName: displayName }) })
}

async function deleteMember(teamName, teamID, uid, members, setMemeberNames) {
  console.log(members)
  const db = getFirestore()
  let d = doc(db, `teams/${teamID}`)
  await updateDoc(d, { members: arrayRemove(members.find((item) => item.uid == uid)) })
  d = doc(db, `users/${uid}`)
  await updateDoc(d, { teams: arrayRemove(teamName) })
  setMemeberNames([])
}
async function deleteTeam(teamID) {
  const db = getFirestore()
  let d = doc(db, `teams/${teamID}`)
  let docSnap = (await getDoc(d)).data()
  await deleteDoc(d)
  d = doc(db, `teamnames/${docSnap.teamName}`)
  await deleteDoc(d)
}

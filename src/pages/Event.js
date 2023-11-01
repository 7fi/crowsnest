import AuthCheck from '../components/AuthCheck'
import { Link, useParams } from 'react-router-dom'
import { getEventWithID, getTeamWithID, getUserWithUsername, getUserWithID } from '../lib/firebase'
import { useEffect, useState, useContext } from 'react'
import { updateDoc, doc, getFirestore, arrayUnion, arrayRemove, getDoc, deleteDoc } from 'firebase/firestore'
import Pairs from '../pages/Pairs'
import { UserContext } from '../lib/context'
import { toast } from 'react-hot-toast'

export default function Home() {
  const { user, userVals } = useContext(UserContext)
  const [pageEvent, setPageEvent] = useState({})
  const [pageEventId, setPageEventId] = useState('')
  const [team, setteam] = useState('')
  const [going, setGoing] = useState([])
  const [maybe, setMaybe] = useState([])
  const [ngoing, setNGoing] = useState([])
  const { eventID } = useParams()

  useEffect(() => {
    getEventWithID(eventID).then((tempEvent) => {
      setPageEvent(tempEvent.data)
      setPageEventId(tempEvent.id)
      setteam(tempEvent.data.team)
      setGoing(tempEvent?.data?.going)
      setMaybe(tempEvent?.data?.maybe)
      setNGoing(tempEvent?.data?.ngoing)
    })
  }, [eventID])

  console.log(team)
  console.log(pageEvent)
  console.log(going, maybe, ngoing)
  console.log(user)

  const setAttendance = async (e) => {
    let val = e.target.innerText
  }

  return (
    <main>
      <AuthCheck>
        <div className='contentBox eventTitleBox'>
          <h1>{pageEvent?.name}</h1>
          <span>
            <strong>{pageEvent?.startDate?.toDate().toLocaleString()}</strong>
            <span> to </span>
            <strong>{pageEvent?.endDate?.toDate().toLocaleString()}</strong>
          </span>
          <div className='eventHeaderFlex'>
            <span>Location: {pageEvent?.location || 'Unknown Location'}</span>
            <span>Type: {pageEvent?.type}</span>
            {/* Convert to icon: */}
            <span>Sport: {pageEvent?.sport}</span>
            <Link to={`/crowsnest/team/${team}`} className='text-titlecase'>
              <span>Team: </span>
              {team || 'Unknown Team'}
            </Link>
          </div>
        </div>
        <div className='contentBox'>
          <h2 className='descriptionTitle'>Description:</h2>
          {pageEvent.description}
          {/* <div>Testing text goes here...</div> */}
        </div>
        <div className='contentBox'>
          <div className='flexRowContainer'>
            <h3>Attendees:</h3>
            <button
              onClick={(e) => {
                toast(
                  (t) => (
                    <div>
                      Do you need a ride?
                      <div className='flexRowContainer'>
                        <button
                          onClick={() => {
                            updateGoing(pageEventId, user, team, 'going', true)
                            toast.dismiss(t.id)
                            toast.success('Yes! We will try to find a ride for you.')
                          }}
                          className='text-sucess'>
                          Yes
                        </button>
                        <button
                          onClick={() => {
                            updateGoing(pageEventId, user, team, 'going', false)

                            toast.dismiss(t.id)
                            toast.error('No! We assume you will get yourself to this event.')
                          }}
                          className='text-danger'>
                          No
                        </button>
                      </div>
                    </div>
                  )
                  // { position: 'top-center' }
                )
              }}>
              Going
            </button>

            <button
              onClick={() => {
                updateGoing(pageEventId, user, team, 'maybe', false)
              }}>
              Maybe
            </button>
            <button
              onClick={() => {
                updateGoing(pageEventId, user, team, 'ngoing', false)
              }}>
              Not Going
            </button>
          </div>
          <h4>Going:</h4>
          <ul>
            {going.map((member) => (
              <li key={member.userId} className={member.needsRide ? 'text-sucess' : ''}>
                <Link to={`/crowsnest/profile/${member.username}`}>{member.displayName}</Link>
              </li>
            ))}
          </ul>
          <h4>Maybe:</h4>
          <ul>
            {maybe.map((member) => (
              <li key={member.userId}>
                <Link to={`/crowsnest/profile/${member.username}`}>{member.displayName}</Link>
              </li>
            ))}
          </ul>
          <h4>Not Going:</h4>
          <ul>
            {ngoing.map((member) => (
              <li key={member.userId}>
                <Link to={`/crowsnest/profile/${member.username}`}>{member.displayName}</Link>
              </li>
            ))}
          </ul>
        </div>
        {pageEvent.sport == 'sailing' && <Pairs />}
      </AuthCheck>
    </main>
  )
}

async function updateGoing(eventID, user, team, status, ride) {
  const curUserData = (await getUserWithID(user.uid)).tempuser
  if (curUserData.teams.includes(team)) {
    const db = getFirestore()
    let d = doc(db, `events/${eventID}`)
    let docSnap = (await getDoc(d)).data()
    console.log(docSnap)
    // console.log(docSnap?.going.find((m) => uid == m.uid))
    // if (docSnap?.going.find((m) => uid == m.uid) == undefined)

    await deleteRSVP(eventID, user)
    if (status == 'going') {
      await updateDoc(d, { going: arrayUnion({ userId: user.uid, username: curUserData.username, displayName: curUserData.displayName, needsRide: ride }) })
    } else if (status == 'maybe') {
      await updateDoc(d, { maybe: arrayUnion({ userId: user.uid, username: curUserData.username, displayName: curUserData.displayName, needsRide: ride }) })
    } else if (status == 'ngoing') {
      await updateDoc(d, { ngoing: arrayUnion({ userId: user.uid, username: curUserData.username, displayName: curUserData.displayName, needsRide: ride }) })
    }
  }
}

async function deleteRSVP(eventID, user) {
  const db = getFirestore()
  let d = doc(db, `events/${eventID}`)
  let docSnap = (await getDoc(d)).data()
  // console.log(docSnap.going[0])
  console.log(docSnap?.going?.find((item) => item.userId == user.uid))
  if (docSnap.going && docSnap.going.length > 0) await updateDoc(d, { going: arrayRemove(docSnap?.going?.find((item) => item.userId == user.uid)) })
  if (docSnap.maybe && docSnap.maybe.length > 0) await updateDoc(d, { maybe: arrayRemove(docSnap?.maybe?.find((item) => item.userId == user.uid)) })
  if (docSnap.ngoing && docSnap.ngoing.length > 0) await updateDoc(d, { ngoing: arrayRemove(docSnap?.ngoing?.find((item) => item.userId == user.uid)) })
}

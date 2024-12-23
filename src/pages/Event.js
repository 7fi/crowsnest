import AuthCheck from '../components/AuthCheck'
import { Link, useParams } from 'react-router-dom'
import { getEventWithID, getUserWithID } from '../lib/firebase'
import { useEffect, useState, useContext } from 'react'
import { updateDoc, doc, getFirestore, arrayUnion, arrayRemove, getDoc, deleteDoc } from 'firebase/firestore'
import Pairs from '../pages/Pairs'
import { UserContext } from '../lib/context'
import { toast } from 'react-hot-toast'

export default function Event() {
  const { user, userVals } = useContext(UserContext)
  const [pageEvent, setPageEvent] = useState({})
  const [pageEventId, setPageEventId] = useState('')
  const [team, setteam] = useState('')
  const [going, setGoing] = useState([])
  const [maybe, setMaybe] = useState([])
  const [ngoing, setNGoing] = useState([])
  const [rides, setRides] = useState([]) //{ driver: 'Carter', riders: [{ displayName: 'Conor', uid: '' }], spots: 3, available: 2 }
  const { eventID } = useParams()

  useEffect(() => {
    getEventWithID(eventID).then((tempEvent) => {
      setPageEvent(tempEvent.data)
      setPageEventId(tempEvent.id)
      setteam(tempEvent.data.team)
      setGoing(tempEvent?.data?.going)
      setMaybe(tempEvent?.data?.maybe)
      setNGoing(tempEvent?.data?.ngoing)
      setRides(tempEvent?.data?.rides)
    })
  }, [eventID])

  useEffect(() => {}, [going, maybe, ngoing])

  console.log(team)
  console.log(pageEvent)
  console.log(going, maybe, ngoing)
  console.log(user)

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
            <span>
              <strong>Location:</strong> {pageEvent?.location || 'Unknown Location'}
            </span>
            <span>
              <strong>Type:</strong> {pageEvent?.type}
            </span>
            {/* Convert to icon: */}
            <span>
              <strong>Sport:</strong> {pageEvent?.sport}
            </span>
            <Link to={`/team/${team}`} className='text-titlecase'>
              <span>
                <strong>Team:</strong>{' '}
              </span>
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
            <button
              onClick={async () => {
                await updateGoing(pageEvent, pageEventId, user, team, 'going', false, going, setGoing, maybe, setMaybe, ngoing, setNGoing)
                setGoing([])
              }}>
              Going
            </button>

            <button
              onClick={async () => {
                await updateGoing(pageEvent, pageEventId, user, team, 'maybe', false, going, setGoing, maybe, setMaybe, ngoing, setNGoing)
                setMaybe([])
              }}>
              Maybe
            </button>
            <button
              onClick={() => {
                updateGoing(pageEvent, pageEventId, user, team, 'ngoing', false, going, setGoing, maybe, setMaybe, ngoing, setNGoing)
                setNGoing([])
              }}>
              Not Going
            </button>
          </div>
          <h4>Going:</h4>
          <ul className='noStyleList'>
            {going.map((member) => (
              <Link to={`/profile/${member.username}`}>
                <li key={member.userId} className={(member.needsRide ? 'text-sucess' : '') + ' eventBox contentBox'}>
                  {member.displayName}
                </li>
              </Link>
            ))}
          </ul>
          <h4>Maybe:</h4>
          <ul className='noStyleList'>
            {maybe.map((member) => (
              <Link to={`/profile/${member.username}`}>
                <li key={member.userId} className='eventBox contentBox'>
                  {member.displayName}
                </li>
              </Link>
            ))}
          </ul>
          <h4>Not Going:</h4>
          <ul className='noStyleList'>
            {ngoing.map((member) => (
              <Link to={`/profile/${member.username}`}>
                <li key={member.userId} className='eventBox contentBox'>
                  {member.displayName}
                </li>
              </Link>
            ))}
          </ul>
          <div className='contentBox'>
            <div className='flexRowContainer'>
              <h3>Rides</h3> <button onClick={() => addRide(pageEvent, pageEventId, user, team, rides, setRides)}>Add Car</button>
            </div>
            <ul className='noStyleList'>
              {rides?.map((ride) => (
                <li className='eventBox contentBox'>
                  <label>
                    <strong>
                      {ride.driver + ' ' + ride.available}/{ride.spots} left
                    </strong>
                  </label>
                  <div className='contentBox'>
                    <ul className='noStyleList'>
                      {ride?.riders.map((rider) => (
                        <li className='eventBox contentBox'>{rider.displayName}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      updateRiders(eventID, rides, setRides, user, ride.driver)
                    }}>
                    Join Car
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* {pageEvent.sport == 'Sailing' && <Pairs />} */}
      </AuthCheck>
    </main>
  )
}

async function findRide() {}

async function addRide(pageEvent, eventID, user, team, rides, setRides) {
  const curUserData = (await getUserWithID(user.uid)).tempuser
  if (curUserData.teams.includes(team)) {
    if (Date.now() < pageEvent.startDate.toDate()) {
      let spots = 0
      toast((t) => (
        <div className='flexCol'>
          How many empty spots do you have?
          <input
            type='number'
            onChange={(e) => {
              spots = parseInt(e.target.value, 10)
            }}
            onKeyDown={(e) => {
              console.log(e.key)
              if (e.key == 'Enter') {
                updateRides(eventID, rides, setRides, curUserData, spots)
                toast.dismiss(t.id)
              }
            }}></input>
          <div className='flexRowContainer'>
            <button
              onClick={() => {
                toast.dismiss(t.id)
              }}
              className='text-danger'>
              Cancel
            </button>
            <button
              onClick={() => {
                updateRides(eventID, rides, setRides, curUserData, spots)
                toast.dismiss(t.id)
              }}>
              Add Ride!
            </button>
          </div>
        </div>
      ))
    } else {
      toast.error("You can't add a ride for this event during or after the event")
    }
  } else {
    toast.error('You must be on this team to give rides for it!')
  }
}
async function updateRides(eventID, rides, setRides, user, spots, riders = []) {
  if (spots > 0 && spots < 20) {
    let ride = { driver: user.displayName, riders: riders, spots: spots, available: spots }
    setRides([...rides, ride])

    // update db
    const db = getFirestore()
    let d = doc(db, `events/${eventID}`)
    let docSnap = (await getDoc(d)).data()
    console.log(docSnap.rides)
    console.log(ride)

    await updateDoc(d, { rides: arrayUnion({ driver: user.displayName, riders: riders, spots: spots, available: spots }) })

    toast.success('Ride successfully added!')
  } else {
    toast.error('Invalid number of spots')
  }
}
async function updateRiders(eventID, rides, setRides, user, rideName) {
  let ride = rides.find((x) => x.driver === rideName)
  ride.riders.push(user.displayName)
  setRides([...rides])
}

async function updateGoing(pageEvent, eventID, user, team, status, ride, going, setGoing, maybe, setMaybe, ngoing, setNGoing) {
  const curUserData = (await getUserWithID(user.uid)).tempuser
  console.log(Date.now() < pageEvent.startDate.toDate())
  if (curUserData.teams.includes(team)) {
    if (Date.now() < pageEvent.startDate.toDate()) {
      const db = getFirestore()
      let d = doc(db, `events/${eventID}`)
      let docSnap = (await getDoc(d)).data()
      console.log(docSnap)
      // console.log(docSnap?.going.find((m) => uid == m.uid))
      // if (docSnap?.going.find((m) => uid == m.uid) == undefined)

      await deleteRSVP(eventID, user)
      if (status == 'going') {
        toast(
          (t) => (
            <div>
              Do you need a ride?
              <div className='flexRowContainer'>
                <button
                  onClick={async () => {
                    await updateDoc(d, { going: arrayUnion({ userId: user.uid, username: curUserData.username, displayName: curUserData.displayName, needsRide: true }) })
                    // setGoing([...going, { userId: user.uid, username: curUserData.username, displayName: curUserData.displayName, needsRide: true }])
                    toast.dismiss(t.id)
                    toast.success('Yes! We will try to find a ride for you.')
                  }}
                  className='text-sucess'>
                  Yes
                </button>
                <button
                  onClick={async () => {
                    await updateDoc(d, { going: arrayUnion({ userId: user.uid, username: curUserData.username, displayName: curUserData.displayName, needsRide: false }) })
                    // setGoing([...going, { userId: user.uid, username: curUserData.username, displayName: curUserData.displayName, needsRide: false }])

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
      } else if (status == 'maybe') {
        await updateDoc(d, { maybe: arrayUnion({ userId: user.uid, username: curUserData.username, displayName: curUserData.displayName, needsRide: ride }) })
        // setMaybe([...maybe, { userId: user.uid, username: curUserData.username, displayName: curUserData.displayName, needsRide: ride }])
      } else if (status == 'ngoing') {
        await updateDoc(d, { ngoing: arrayUnion({ userId: user.uid, username: curUserData.username, displayName: curUserData.displayName, needsRide: ride }) })
        // setNGoing([...ngoing, { userId: user.uid, username: curUserData.username, displayName: curUserData.displayName, needsRide: ride }])
      }
    } else {
      toast.error("You can't RSVP for this event during or after the event")
    }
  } else {
    toast.error('You must be on this team to RSVP!')
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

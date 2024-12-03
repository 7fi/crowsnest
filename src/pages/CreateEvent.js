import { useContext, useState, useCallback, useEffect } from 'react'
import { getDoc, addDoc, getFirestore, doc, writeBatch, collection, updateDoc, arrayUnion } from 'firebase/firestore'
import debounce from 'lodash.debounce'
import AuthCheck from '../components/AuthCheck'
import { UserContext } from '../lib/context'
import { useNavigate } from 'react-router'
import { getUserWithUsername } from '../lib/firebase'

export default function Enter() {
  return (
    <main>
      <AuthCheck>
        <div className='contentBox'>
          <EventNameForm />
        </div>
      </AuthCheck>
    </main>
  )
}

function EventNameForm() {
  const { user, userVals } = useContext(UserContext)
  const [userTeams, setUserTeams] = useState([])
  const [eventnameValue, seteventnameValue] = useState('')
  const [eventLocationValue, seteventLocationValue] = useState('')
  const [eventDescriptionValue, seteventDescriptionValue] = useState('')
  const [eventStartValue, seteventStartValue] = useState(new Date())
  const [eventEndValue, seteventEndValue] = useState(new Date())
  const [eventTeamName, seteventTeamName] = useState('')
  const [eventSport, setEventSport] = useState('Sailing')
  const [eventType, setEventType] = useState('Practice')
  const [event, setEvent] = useState({ name: '', startDate: undefined, endDate: undefined, description: '', location: '', sport: '', type: '', team: '' })

  const [isValid, setIsValid] = useState(true)
  const [loading, setLoading] = useState(false)

  const db = getFirestore()
  const navigate = useNavigate()

  console.log(userTeams.length)

  useEffect(() => {
    console.log(user?.displayName)
    getUserWithUsername(user?.displayName).then(({ tempuser, uid }) => {
      console.log(tempuser)
      setUserTeams(tempuser?.teams)
    })
  }, [user])

  const onChangeEventname = (e) => {
    const val = e.target.value
    const re = /^(?=[a-zA-Z0-9._ ]{3,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/

    seteventnameValue(val)
    // Only set form value if length is < 3 OR it passes regex
    /*if (val.length < 3) {
      // seteventnameValue(val)
      setEvent((prevState) => ({ ...prevState, name: val }))

      // setLoading(false)
      // setIsValid(false)
    }

    if (re.test(val)) {
      // seteventnameValue(val)
      setEvent((prevState) => ({ ...prevState, name: val }))

      console.log(val)
      console.log(event)
      setLoading(true)
      // setIsValid(false)
    }*/
  }

  const onChangeEventStartTime = (e) => {
    const val = new Date(e.target.value)
    seteventStartValue(val)
  }
  const onChangeEventEndTime = (e) => {
    const val = new Date(e.target.value)
    console.log(val - eventStartValue)
    if (!(val - eventStartValue < 0)) {
      seteventEndValue(val)
    } else {
      var now = new Date()
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
      e.target.value = now.toISOString().slice(0, 16)
    }
  }
  const onChangeSport = (e) => {
    const val = e.target.value
    setEventSport(val)
  }
  const onChangeType = (e) => {
    const val = e.target.value
    setEventType(val)
  }
  const onChangeLocation = (e) => {
    const val = e.target.value
    seteventLocationValue(val)
  }
  const onChangeDescription = (e) => {
    const val = e.target.value
    seteventDescriptionValue(val)
  }
  const onChangeTeam = (e) => {
    const val = e.target.value
    seteventTeamName(val)
  }

  // const checkEventName = useCallback(
  //   debounce(async (teamname) => {
  //     if (teamname.length >= 3) {
  //       let docRef = doc(db, 'teamnames', teamname)
  //       const docSnap = await getDoc(docRef)
  //       console.log('Read executed!', docSnap.exists())
  //       setIsValid(!docSnap.exists())
  //       setLoading(false)
  //     }
  //   }, 500),
  //   []
  // )

  // useEffect(() => {
  //   checkTeamname(eventnameValue)
  // }, [eventnameValue])

  const onSubmit = async (e) => {
    e.preventDefault()

    // const eventDoc = doc(db, 'events')
    const eventObj = { name: eventnameValue, startDate: eventStartValue, endDate: eventEndValue, description: eventDescriptionValue, location: eventLocationValue, sport: eventSport, type: eventType, team: eventTeamName != '' ? eventTeamName : userTeams[0], going: [], maybe: [], ngoing: [], rides: [] }
    console.log(eventObj)

    const eventDoc = await addDoc(collection(db, 'events'), eventObj)
    navigate(`/crowsnest/event/${eventDoc.id}`)
    console.log('uploaded!')
  }

  return (
    <>
      <section>
        <h3>Create Event:</h3>
        <form onSubmit={onSubmit}>
          <input name='Event Name' placeholder='Event Name' onChange={onChangeEventname}></input>
          <input type='datetime-local' id='eventStartTimeInput' onChange={onChangeEventStartTime} />
          <input type='datetime-local' id='eventEndTimeInput' onChange={onChangeEventEndTime} />
          <select onChange={onChangeSport}>
            <option>Sailing</option>
            <option>Baseball</option>
            <option>Soccer</option>
            <option>Footbal</option>
          </select>
          <select onChange={onChangeType}>
            <option>Practice</option>
            <option>Regatta</option>
            <option>Work Day</option>
            <option>Social Event</option>
          </select>
          <select onChange={onChangeTeam}>
            {userTeams.map((team) => (
              <option>{team}</option>
            ))}
          </select>
          {/* <label>Weekly:</label>
          <input type='checkbox' id='eventWeeklyCheckbox' onChange={onChangeWeekly}></input> */}
          <input name='Event Location' placeholder='Event Location' onChange={onChangeLocation}></input>
          <input name='Event Description' placeholder='Event Description' onChange={onChangeDescription}></input>
          {/* <UsernameMessage teamname={teamnameValue} isValid={isValid} loading={loading} /> */}
          <button type='submit' className='btn-green' disabled={!isValid}>
            Create
          </button>
        </form>
      </section>
    </>
  )
}

// function UsernameMessage({ teamname, isValid, loading }) {
//   if (loading) {
//     return <p>Checking...</p>
//   } else if (isValid) {
//     return <p className='text-success'>{teamname} is available!</p>
//   } else if (teamname.length < 3 && teamname.length > 0) {
//     return <p className='text-danger'>That teamname is too short!</p>
//   } else if (teamname && !isValid) {
//     return <p className='text-danger'>That teamname is taken!</p>
//   } else {
//     return <p></p>
//   }
// }

import AuthCheck from '../components/AuthCheck'
import { Link, useParams } from 'react-router-dom'
import { getEventWithID, getTeamWithID } from '../lib/firebase'
import { useEffect, useState, useContext } from 'react'
import { Timestamp } from 'firebase/firestore'
import Pairs from '../pages/Pairs'
import { UserContext } from '../lib/context'

export default function Home() {
  const { user, userVals } = useContext(UserContext)
  const [pageEvent, setPageEvent] = useState({})
  const [pageEventId, setPageEventId] = useState('')
  const [team, setteam] = useState('')
  const { eventID } = useParams()

  useEffect(() => {
    getEventWithID(eventID).then((tempEvent) => {
      setPageEvent(tempEvent.data)
      setPageEventId(tempEvent.id)
      setteam(tempEvent.data.team)
    })

    // Need to convert date to timestamp and back to date
    // console.log(pageEvent.date)
    // let date = pageEvent.date.toDate().toDateString()
    // console.log(date)
  }, [eventID])

  console.log(team)
  console.log(pageEvent)
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
        {pageEvent.sport == 'sailing' && <Pairs />}
      </AuthCheck>
    </main>
  )
}

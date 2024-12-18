import { getSailorElo, getTeamElo } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import PosNegBarChart from '../components/PosNegBarChart'
import EloLineChart from '../components/EloLineChart'
import Loader from '../components/loader'
import VenueResults from '../components/rankings/VenueResults'
import RaceByRace from '../components/rankings/RaceByRace'

export default function Rankings() {
  const { position, sailor } = useParams()
  const [rating, setRating] = useState(1500)
  const [global, setGlobal] = useState(1500)
  const [teamNames, setTeamNames] = useState([])
  const [sailorRaces, setSailorRaces] = useState([])
  const [hasOtherPos, setHasOtherPos] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let pos = position == 'crew' ? 'Crew' : 'Skipper'
    getSailorElo(sailor).then((tempSailor) => {
      console.log(tempSailor)
      tempSailor?.docs.forEach((sailor) => {
        if (sailor != undefined) {
          if (sailor.data().Position == pos) {
            setRating(sailor?.data().Rating.toFixed(0))
            setSailorRaces(sailor?.data().races)
            setTeamNames(sailor?.data().Teams)
            setGlobal(sailor?.data().GlobalRank)
          } else {
            setHasOtherPos(true)
          }
        }
      })
      setLoaded(true)
    })
  }, [position, sailor])

  const RaceResults = ({ races }) => {
    // Step 1: Calculate total change and count for each partner
    const partnerStats = races.reduce((acc, race) => {
      if (!acc[race.partner]) {
        acc[race.partner] = { change: 0, count: 0 }
      }
      acc[race.partner].change += race.change
      acc[race.partner].count += 1
      return acc
    }, {})

    // Step 2: Sort the partners by the total change in descending order
    const sortedPartners = Object.keys(partnerStats)
      .map((partner) => ({
        name: partner,
        change: partnerStats[partner].change,
        count: partnerStats[partner].count,
      }))
      .sort((a, b) => b.change - a.change) // Sort by change in descending order

    // Step 3: Map to <span> elements with rank and total change
    return (
      <div>
        {sortedPartners.map((partner, index) =>
          partner.name != 'Unknown' ? (
            <Link to={`/crowsnest/rankings/${position == 'skipper' ? 'crew' : 'skipper'}/${partner.name}`} key={index}>
              <div className='contentBox' style={{ margin: '5px' }}>
                <span className='secondaryText'>({index + 1})</span> {partner.name}{' '}
                <span style={{ color: partner.change > 0 ? 'green' : 'red' }}>
                  {partner.change > 0 ? '+' : ''}
                  {partner.change.toFixed(0)}
                </span>
                {'  '}({partner.count} races)
              </div>
            </Link>
          ) : (
            <></>
          )
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: 15 }}>
      {loaded == true && sailorRaces.length > 0 ? (
        <div>
          <h2>
            Current <Link to={`/crowsnest/rankings/${position}`}>{position}</Link> rating for{' '}
            <a href={`https://scores.collegesailing.org/sailors/${sailor.toLowerCase().replace(' ', '-')}/`} target='1'>
              {sailor}
            </a>
            : {rating} (globally ranked: #{global} for all-time*{' '}
            <Link style={{ textDecoration: 'underline' }} to={`/crowsnest/rankings/${position}`}>
              {position}s
            </Link>
            )
          </h2>
          {hasOtherPos ? (
            <Link to={`/crowsnest/rankings/${position.toLowerCase() == 'skipper' ? 'crew' : 'skipper'}/${sailor}`}>
              <button>See {position.toLowerCase() == 'skipper' ? 'crew' : 'skipper'} page</button>
            </Link>
          ) : undefined}
          <span style={{ color: '#ccc', position: 'absolute', right: 10 }}> * all-time is only from s16 onwards</span>
          Team{teamNames.length > 1 ? 's' : ''}:{' '}
          {teamNames.map((teamName, i) => (
            <Link style={{ textDecoration: 'underline' }} key={teamName} to={`/crowsnest/rankings/team/${teamName}`}>
              {i != 0 ? ', ' : ''} {teamName}
            </Link>
          ))}{' '}
          <h2>Ranking changes by race</h2>
          <PosNegBarChart
            showLabels={true}
            data={sailorRaces.slice(0).sort((a, b) => {
              let datea = new Date(a.date.seconds * 1000)
              let dateb = new Date(b.date.seconds * 1000)
              if (datea.getFullYear() != dateb.getFullYear()) {
                return datea.getFullYear() - dateb.getFullYear()
              }
              if (datea.getMonth() != dateb.getMonth()) {
                return datea.getMonth() - dateb.getMonth()
              }
              if (datea.getDate() != dateb.getDate()) {
                return datea.getDate() - dateb.getDate()
              }
              let raceNumA = a.raceID.split('/')[2].slice(0, -1)
              let raceNumB = b.raceID.split('/')[2].slice(0, -1)
              return raceNumA - raceNumB
            })}
            dataKey='change'
            pos={position}
          />
          <h2>Ranking change over time </h2>
          <EloLineChart data={sailorRaces} />
          <h2>
            Race by race breakdown: <span className='secondaryText'>(scroll for more)</span>
          </h2>
          <RaceByRace
            position={position}
            races={sailorRaces.slice(0).sort((a, b) => {
              let datea = new Date(a.date.seconds * 1000)
              let dateb = new Date(b.date.seconds * 1000)
              console.log(datea.getFullYear())
              if (datea.getFullYear() != dateb.getFullYear()) {
                return datea.getFullYear() - dateb.getFullYear()
              }
              if (datea.getMonth() != dateb.getMonth()) {
                return datea.getMonth() - dateb.getMonth()
              }
              if (datea.getDate() != dateb.getDate()) {
                return datea.getDate() - dateb.getDate()
              }
              let raceNumA = a.raceID.split('/')[2].slice(0, -1)
              let raceNumB = b.raceID.split('/')[2].slice(0, -1)
              return raceNumA - raceNumB
            })}
          />
          <h2>Elo changes by partner (higher is better)</h2>
          (keep in mind that these values are skewed due to earlier races being highly influential)
          <RaceResults races={sailorRaces} />
          <h2>Elo changes by Venue (higher is better)</h2>
          (keep in mind that these values are skewed due to earlier races being highly influential)
          <VenueResults races={sailorRaces} />
          <h2>Scores by race (lower is better)</h2>
          <PosNegBarChart showLabels={true} data={sailorRaces} dataKey='score' pos={position} />
          <h2>Ratio by race (higher is better)</h2>
          <span>(essentially percentage of fleet beaten)</span>
          <PosNegBarChart showLabels={true} data={sailorRaces} dataKey='ratio' pos={position} />
        </div>
      ) : loaded ? (
        <div>
          Sailor {sailor} not found... (or has not loaded yet) <br /> Keep these in mind
          <ul>
            <li>Capitalization must be correct (ie first letter of each name capitalized)</li>
            <li>Check that the position is correct (skipper/crew)</li>
          </ul>
          <Link to={`/crowsnest/rankings`}>
            <button>Back to homepage</button>
          </Link>
        </div>
      ) : (
        <Loader show={!loaded} />
      )}
    </div>
  )
}

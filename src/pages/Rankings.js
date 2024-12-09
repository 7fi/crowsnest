import { getSailorElo, getTeamElo } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import PosNegBarChart from '../components/PosNegBarChart'
import EloLineChart from '../components/EloLineChart'

export default function Rankings() {
  const { position, sailor } = useParams()
  const [rating, setRating] = useState(1500)
  const [global, setGlobal] = useState(1500)
  const [teamNames, setTeamNames] = useState([])
  const [sailorRaces, setSailorRaces] = useState([])

  useEffect(() => {
    let pos = position == 'crew' ? 'Crew' : 'Skipper'
    getSailorElo(sailor, pos).then((tempSailor) => {
      setRating(tempSailor.data.Rating.toFixed(0))
      setSailorRaces(tempSailor.data.races)
      setTeamNames(tempSailor.data.Teams)
      setGlobal(tempSailor.data.GlobalRank)
    })
  }, [sailor])

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
            <Link to={`/crowsnest/rankings/${position == 'skipper' ? 'crew' : 'skipper'}/${partner.name}`}>
              <div className='contentBox' key={partner.name} style={{ margin: '5px' }}>
                <span style={{ color: '#aaa' }}>({index + 1})</span> {partner.name}:{' '}
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

  const VenueResults = ({ races }) => {
    // Step 1: Calculate total change and count for each venue
    const venueStats = races.reduce((acc, race) => {
      if (!acc[race.venue]) {
        acc[race.venue] = { change: 0, count: 0 }
      }
      acc[race.venue].change += race.change
      acc[race.venue].count += 1
      return acc
    }, {})

    // Step 2: Sort the venues by the total change in descending order
    const sortedVenues = Object.keys(venueStats)
      .map((venue) => ({
        name: venue,
        change: venueStats[venue].change,
        count: venueStats[venue].count,
      }))
      .sort((a, b) => b.change - a.change) // Sort by change in descending order

    // Step 3: Map to <span> elements with rank and total change
    return (
      <div>
        {sortedVenues.map((venue, index) =>
          venue.name != 'Unknown' ? (
            <div className='contentBox' key={venue.name} style={{ margin: '5px' }}>
              <span style={{ color: '#aaa' }}>({index + 1})</span> {venue.name}:{' '}
              <span style={{ color: venue.change > 0 ? 'green' : 'red' }}>
                {venue.change > 0 ? '+' : ''}
                {venue.change.toFixed(0)}
              </span>
              {'  '}({venue.count} races)
            </div>
          ) : (
            <></>
          )
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: 15 }}>
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
      <span style={{ color: '#ccc', position: 'absolute', right: 10 }}> * all-time is only from s22 onwards</span>
      Team{teamNames.length > 1 ? 's' : ''}:{' '}
      {teamNames.map((teamName, i) => (
        <Link style={{ textDecoration: 'underline' }} key={teamName} to={`/crowsnest/rankings/team/${teamName}`}>
          {i != 0 ? ', ' : ''} {teamName}
        </Link>
      ))}{' '}
      <h2>Ranking changes by race</h2>
      <PosNegBarChart data={sailorRaces} dataKey='change' />
      <h2>Ranking change over time </h2>
      <EloLineChart data={sailorRaces} />
      <h2>Elo changes by partner (higher is better)</h2>
      (keep in mind that these values are skewed due to earlier races being highly influential)
      <RaceResults races={sailorRaces} />
      <h2>Elo changes by Venue (higher is better)</h2>
      (keep in mind that these values are skewed due to earlier races being highly influential)
      <VenueResults races={sailorRaces} />
      <h2>Scores by race (lower is better)</h2>
      <PosNegBarChart data={sailorRaces} dataKey='score' />
      <h2>Ratio by race (higher is better)</h2>
      <span>(essentially percentage of fleet beaten)</span>
      <PosNegBarChart data={sailorRaces} dataKey='ratio' />
    </div>
  )
}

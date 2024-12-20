import { getSailorElo, getTeamElo } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import PosNegBarChart from '../components/PosNegBarChart'
import EloLineChart from '../components/EloLineChart'
import Loader from '../components/loader'
import VenueResults from '../components/rankings/VenueResults'
import RaceByRace from '../components/rankings/RaceByRace'

export default function Rankings() {
  const { sailor } = useParams()
  const [ratingSkipper, setRatingSkipper] = useState(0)
  const [globalSkipper, setGlobalSkipper] = useState(0)
  const [ratingCrew, setRatingCrew] = useState(0)
  const [globalCrew, setGlobalCrew] = useState(0)
  const [links, setLinks] = useState([])
  const [teamNames, setTeamNames] = useState([])
  const [sailorRaces, setSailorRaces] = useState([])
  const [hasOtherPos, setHasOtherPos] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getSailorElo(sailor).then((tempSailor) => {
      setRatingCrew(0)
      setRatingSkipper(0)
      setGlobalCrew(0)
      setGlobalSkipper(0)
      setTeamNames([])
      setSailorRaces([])
      setLinks([])
      console.log(sailorRaces.length)
      tempSailor?.docs.forEach((sailor) => {
        if (sailor != undefined) {
          console.log(sailor.data())
          setSailorRaces((sailorRaces) => [...sailorRaces, ...sailor?.data().races])
          sailor?.data().Teams.forEach((team) => {
            setTeamNames((prevTeamNames) => {
              if (!prevTeamNames.includes(team)) {
                return [...prevTeamNames, team]
              }
              return prevTeamNames
            })
          })

          setLinks((prevLinks) => {
            console.log(sailor?.data().Link)
            if (!prevLinks.includes(sailor?.data().Link)) {
              return [...prevLinks, sailor?.data().Link]
            }
            return prevLinks
          })

          if (sailor.data().Position == 'Skipper') {
            setGlobalSkipper(sailor?.data().GlobalRank)
            setRatingSkipper(sailor?.data().Rating.toFixed(0))
          }
          if (sailor.data().Position == 'Crew') {
            setGlobalCrew(sailor?.data().GlobalRank)
            setRatingCrew(sailor?.data().Rating.toFixed(0))
          }
        }
      })
      setLoaded(true)
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
      <table className='raceByRaceTable'>
        <thead>
          <th></th>
          <th>Partner</th>
          <th>Races</th>
          <th>Rating Change</th>
        </thead>
        <tbody>
          {sortedPartners.map((partner, index) =>
            partner.name != 'Unknown' ? (
              <tr className='clickable' style={{ margin: '5px' }} onClick={() => navigate(`/crowsnest/rankings/${partner.name}`)}>
                <td className='tdRightBorder tableColFit secondaryText'>{index + 1}</td>
                <td>{partner.name}</td>
                <td>{partner.count} races</td>
                <td style={{ color: partner.change > 0 ? 'green' : 'red' }}>
                  {partner.change > 0 ? '+' : ''}
                  {partner.change.toFixed(0)}
                </td>
              </tr>
            ) : (
              <></>
            )
          )}
        </tbody>
      </table>
    )
  }

  return (
    <div style={{ padding: 15 }}>
      {loaded == true && sailorRaces.length > 0 ? (
        <div>
          <h2>
            Current rating for{' '}
            <a href={`https://scores.collegesailing.org/sailors/${links[0]}/`} target='1'>
              {sailor}
            </a>
            {links.map((link, index) => (
              <span className='secondaryText' key={index} style={{ fontSize: '1rem' }}>
                <a href={`https://scores.collegesailing.org/sailors/${link}/`} target='1'>
                  {' '}
                  (Techscore {index + 1})
                </a>
              </span>
            ))}
          </h2>
          {ratingSkipper != 0 ? (
            <div>
              Skipper {ratingSkipper} elo{' '}
              {globalSkipper != 0 ? (
                <span>
                  globally ranked: #{globalSkipper} for{' '}
                  <Link style={{ textDecoration: 'underline' }} to={`/crowsnest/rankings/skipper`}>
                    skippers
                  </Link>
                  *
                </span>
              ) : (
                <span> (did not skipper in f24)</span>
              )}
            </div>
          ) : undefined}
          {ratingCrew != 0 ? (
            <>
              Crew: {ratingCrew} elo
              {globalCrew != 0 ? (
                <span>
                  {' '}
                  globally ranked: #{globalCrew} for{' '}
                  <Link style={{ textDecoration: 'underline' }} to={`/crowsnest/rankings/crew`}>
                    crews
                  </Link>
                  *
                </span>
              ) : (
                <span> (did not crew in f24)</span>
              )}
            </>
          ) : undefined}
          <span style={{ color: '#ccc', position: 'absolute', right: 10 }}> * in f24</span>
          <div>
            Team{teamNames.length > 1 ? 's' : ''}:{' '}
            {teamNames.map((teamName, i) => (
              <Link style={{ textDecoration: 'underline' }} key={i} to={`/crowsnest/rankings/team/${teamName}`}>
                {i != 0 ? ', ' : ''} {teamName}
              </Link>
            ))}{' '}
          </div>
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
          />
          <h2>Ranking change over time </h2>
          {ratingSkipper != 0 ? (
            <>
              (Skipper)
              <EloLineChart data={sailorRaces.filter((race) => race.pos == 'Skipper')} />
            </>
          ) : undefined}
          {ratingCrew != 0 ? (
            <>
              (Crew)
              <EloLineChart data={sailorRaces.filter((race) => race.pos == 'Crew')} />
            </>
          ) : undefined}
          <h2>
            Race by race breakdown: <span className='secondaryText'>(scroll for more)</span>
          </h2>
          <RaceByRace
            races={sailorRaces.slice(0).sort((a, b) => {
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
          />
          <div className='flexRowContainer'>
            <div className='flexGrowChild'>
              <h2>Elo changes by partner (higher is better)</h2>
              (keep in mind that these values are skewed due to earlier races being highly influential)
              <RaceResults races={sailorRaces} />
            </div>
            <div className='flexGrowChild'>
              <h2>Elo changes by Venue (higher is better)</h2>
              (keep in mind that these values are skewed due to earlier races being highly influential)
              <VenueResults races={sailorRaces} />
            </div>
          </div>
          <h2>Scores (lower is better) and Ratio* (higher is better) by race</h2>
          <span>*(essentially percentage of fleet beaten) (is slightly broken for combined division)</span>
          <PosNegBarChart showLabels={false} data={sailorRaces} dataKey='score' syncID='ranking' />
          {/* <h2>Ratio by race (higher is better)</h2> */}
          <PosNegBarChart
            showLabels={true}
            data={sailorRaces.map((race) => {
              if (race.ratio < 0) {
                race.ratio = 0
              }
              return race
            })}
            dataKey='ratio'
            syncID='ranking'
          />
        </div>
      ) : loaded ? (
        <div>
          Sailor {sailor} not found... <br /> Keep these in mind
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

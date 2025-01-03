import { getSailorElo, getTeamElo } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import PosNegBarChart from '../components/PosNegBarChart'
import EloLineChart from '../components/EloLineChart'
import Loader from '../components/loader'
import VenueResults from '../components/rankings/VenueResults'
import RaceByRace from '../components/rankings/SailorPage/RaceByRace'
import { ProCheck, ProCheckLite } from '../components/rankings/ProCheck'
import useTeamCodes from '../lib/teamCodes'

export default function Rankings() {
  const { sailor } = useParams()
  const [ratingSkipper, setRatingSkipper] = useState(0)
  const [globalSkipper, setGlobalSkipper] = useState(0)
  const [gradYear, setGradYear] = useState(0)
  const [ratingCrew, setRatingCrew] = useState(0)
  const [globalCrew, setGlobalCrew] = useState(0)
  const [links, setLinks] = useState([])
  const [teamNames, setTeamNames] = useState([])
  const [sailorRaces, setSailorRaces] = useState([])
  const [hasOtherPos, setHasOtherPos] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const navigate = useNavigate()
  const teamCodes = useTeamCodes()

  useEffect(() => {
    getSailorElo(sailor).then((tempSailor) => {
      setRatingCrew(0)
      setRatingSkipper(0)
      setGradYear(0)
      setGlobalCrew(0)
      setGlobalSkipper(0)
      setTeamNames([])
      setSailorRaces([])
      setLinks([])
      tempSailor?.docs.forEach((sailor) => {
        if (sailor != undefined) {
          setSailorRaces((sailorRaces) => [...sailorRaces, ...sailor?.data().races])
          sailor?.data().Teams.forEach((team) => {
            setTeamNames((prevTeamNames) => {
              if (!prevTeamNames.includes(team)) {
                return [...prevTeamNames, team]
              }
              return prevTeamNames
            })
          })
          setGradYear(sailor.data().Year)

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

  const PartnerResults = ({ races }) => {
    // Step 1: Calculate total change and count for each partner
    const partnerStats = races.reduce((acc, race) => {
      if (!acc[race.partner]) {
        acc[race.partner] = { change: 0, count: 0, ratio: 0 }
      }
      acc[race.partner].change += race.change
      acc[race.partner].count += 1
      acc[race.partner].ratio += race.ratio
      return acc
    }, {})

    // Step 2: Sort the partners by the total change in descending order
    const sortedPartners = Object.keys(partnerStats)
      .map((partner) => ({
        name: partner,
        change: partnerStats[partner].change,
        count: partnerStats[partner].count,
        ratio: partnerStats[partner].ratio / partnerStats[partner].count,
      }))
      .sort((a, b) => b.ratio - a.ratio) // Sort by change in descending order

    // Step 3: Map to <span> elements with rank and total change
    return (
      <table className='raceByRaceTable'>
        <thead>
          <th></th>
          <th>Partner</th>
          <th>Races</th>
          <th>Rating Change</th>
          <th>Percentage</th>
        </thead>
        <tbody>
          {sortedPartners.map((partner, index) =>
            partner.name != 'Unknown' ? (
              <tr className='clickable' style={{ margin: '5px' }} onClick={() => navigate(`/rankings/${partner.name}`)}>
                <td className='tdRightBorder tableColFit secondaryText'>{index + 1}</td>
                <td>{partner.name}</td>
                <td>{partner.count} races</td>
                <td style={{ color: partner.change > 0 ? 'green' : 'red' }}>
                  {partner.change > 0 ? '+' : ''}
                  {partner.change.toFixed(0)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div className='ratioBarBg'>
                    <div className='ratioBar' style={{ width: partner.ratio * 100 }}>
                      <span>{(partner.ratio * 100).toFixed(1)}%</span>
                    </div>
                  </div>
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

  const RankObj = ({ rank, pos }) => {
    return (
      <ProCheckLite feature='ranks'>
        Rank:
        {rank != 0 ? (
          <span>
            {' '}
            #{rank} for{' '}
            <Link style={{ textDecoration: 'underline' }} to={`/rankings/${pos}`}>
              {pos}s
            </Link>
            *
          </span>
        ) : (
          <span> (did not crew in f24)</span>
        )}
      </ProCheckLite>
    )
  }

  const skipperChange = sailorRaces
    .filter((race) => race.pos == 'Skipper')
    .slice(-5)
    .reduce((sum, race) => sum + race.change, 0)
    .toFixed(0)
  const crewChange = sailorRaces
    .filter((race) => race.pos == 'Crew')
    .slice(-5)
    .reduce((sum, race) => sum + race.change, 0)
    .toFixed(0)

  return (
    <div style={{ padding: 30 }}>
      {loaded && sailorRaces.length > 0 ? (
        <div>
          <div className='flexRowContainer sailorNameRow'>
            <img style={{ display: 'inline', maxHeight: '3rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[teamNames[teamNames.length - 1]]}.png`} />
            <h1 style={{ display: 'inline-block' }}>{sailor}</h1>
          </div>
          <div>
            20{gradYear} |{' '}
            {teamNames.map((teamName, i) => (
              <Link style={{ textDecoration: 'underline' }} key={i} to={`/rankings/team/${teamName}`}>
                {i != 0 ? ', ' : ''} {teamName}
              </Link>
            ))}{' '}
            |{' '}
            {links.map((link, index) => (
              <span className='secondaryText' key={index} style={{ fontSize: '1rem' }}>
                <a href={`https://scores.collegesailing.org/sailors/${link}/`} target='1'>
                  {' '}
                  (Techscore {index + 1})
                </a>
              </span>
            ))}
          </div>
          <br />
          {/* Elos and Rankings */}
          <div className='flexRowContainer' style={{ justifyContent: 'space-between', width: '75%' }}>
            {ratingSkipper != 0 ? (
              <div>
                <div>
                  Skipper: {ratingSkipper} elo (
                  <span
                    style={{
                      color: skipperChange > 0 ? 'green' : 'red',
                    }}>
                    {skipperChange > 0 ? '+' : ''}
                    {skipperChange}
                  </span>{' '}
                  in the last 5 skipper races)
                </div>
                <RankObj rank={globalSkipper} pos='skipper' />
              </div>
            ) : undefined}
            {ratingCrew != 0 ? (
              <div>
                <div>
                  Crew: {ratingCrew} elo (
                  <span
                    style={{
                      color: crewChange > 0 ? 'green' : 'red',
                    }}>
                    {crewChange > 0 ? '+' : ''}
                    {crewChange}
                  </span>{' '}
                  in the last 5 crew races)
                </div>
                <RankObj rank={globalCrew} pos='crew' />
              </div>
            ) : undefined}
          </div>
          <span style={{ color: '#ccc', position: 'absolute', left: 30 }}> * in f24</span>

          {/* Graphs */}
          <h2>Rating change over time </h2>

          <EloLineChart data={sailorRaces} />

          <h2>
            Race by race breakdown: <span className='secondaryText'>(scroll for more)</span>
          </h2>
          <RaceByRace races={sailorRaces} />
          <div className='flexRowContainer'>
            <div className='flexGrowChild'>
              <h2>Rating changes by partner (higher is better)</h2>
              <PartnerResults races={sailorRaces} />
            </div>
            <div className='flexGrowChild'>
              <h2>Rating changes by Venue (higher is better)</h2>
              <VenueResults races={sailorRaces} />
            </div>
          </div>
          <h2>Rating changes by race</h2>
          <h2>Scores (lower is better) and Percentage (higher is better) by race</h2>
          <PosNegBarChart showLabels={false} data={sailorRaces} dataKey='change' syncID='ranking' title='Change' />
          <PosNegBarChart showLabels={false} data={sailorRaces} dataKey='score' syncID='ranking' title='Score' />
          {/* <h2>Ratio by race (higher is better)</h2> */}
          <PosNegBarChart
            title='Percentage'
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
          <Link to={`/rankings`}>
            <button>Back to homepage</button>
          </Link>
        </div>
      ) : (
        <Loader show={!loaded} />
      )}
    </div>
  )
}

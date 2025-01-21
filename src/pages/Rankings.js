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
import Rivals from '../components/rankings/Rivals'

export default function Rankings() {
  const { key } = useParams()
  const [ratingSkipper, setRatingSkipper] = useState(0)
  const [ratingWomenSkipper, setWomenRatingSkipper] = useState(0)
  const [globalSkipper, setGlobalSkipper] = useState(0)
  const [globalWomenSkipper, setGlobalWomenSkipper] = useState(0)

  const [sailorName, setSailorName] = useState('')
  const [gradYear, setGradYear] = useState(0)

  const [ratingCrew, setRatingCrew] = useState(0)
  const [ratingWomenCrew, setWomenRatingCrew] = useState(0)
  const [globalCrew, setGlobalCrew] = useState(0)
  const [globalWomenCrew, setGlobalWomenCrew] = useState(0)

  const [links, setLinks] = useState([])
  const [teamNames, setTeamNames] = useState([])
  const [sailorRaces, setSailorRaces] = useState([])
  const [sailorRivals, setSailorRivals] = useState({})
  const [hasOtherPos, setHasOtherPos] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const navigate = useNavigate()
  const teamCodes = useTeamCodes()

  useEffect(() => {
    getSailorElo(key).then((tempSailor) => {
      setSailorName('')
      setRatingCrew(0)
      setRatingSkipper(0)
      setWomenRatingCrew(0)
      setWomenRatingSkipper(0)
      setGradYear(0)
      setGlobalCrew(0)
      setGlobalSkipper(0)
      setTeamNames([])
      setSailorRaces([])
      setLinks([])

      tempSailor?.docs.forEach((sailor) => {
        if (sailor != undefined) {
          console.log(sailor?.data())
          setSailorRaces(sailor?.data().races)
          sailor?.data().Teams.forEach((team) => {
            setTeamNames((prevTeamNames) => {
              if (!prevTeamNames.includes(team)) {
                return [...prevTeamNames, team]
              }
              return prevTeamNames
            })
          })
          setGradYear(sailor.data().Year)
          setSailorName(sailor.data().Name)

          setLinks((prevLinks) => {
            // console.log(sailor?.data().Link)
            if (!prevLinks.includes(sailor?.data().Link)) {
              return [...prevLinks, sailor?.data().Link]
            }
            return prevLinks
          })

          setGlobalSkipper(sailor?.data().SkipperRank)
          setGlobalWomenSkipper(sailor?.data().WomenSkipperRank)
          setRatingSkipper(sailor?.data().SkipperRating)
          setWomenRatingSkipper(sailor?.data().WomenSkipperRating)

          setGlobalCrew(sailor?.data().CrewRank)
          setGlobalWomenCrew(sailor?.data().WomenCrewRank)
          setRatingCrew(sailor?.data().CrewRating)
          setWomenRatingCrew(sailor?.data().WomenCrewRating)

          setSailorRivals(sailor?.data().Rivals)
        }
      })
      setLoaded(true)
    })
  }, [key])

  const PartnerResults = ({ races }) => {
    // Step 1: Calculate total change and count for each partner
    const partnerStats = races.reduce((acc, race) => {
      let key = race.partner['link']
      if (!acc[key]) {
        acc[key] = { key: race.partner['link'], name: race.partner['name'], change: 0, count: 0, ratio: 0 }
      }
      acc[key].change += race.change
      acc[key].count += 1
      acc[key].ratio += race.ratio
      return acc
    }, {})

    // Step 2: Sort the partners by the total change in descending order
    const sortedPartners = Object.keys(partnerStats)
      .map((partner) => ({
        key: partner,
        name: partnerStats[partner].name,
        change: partnerStats[partner].change,
        count: partnerStats[partner].count,
        ratio: partnerStats[partner].ratio / partnerStats[partner].count,
      }))
      .sort((a, b) => b.ratio - a.ratio) // Sort by change in descending order

    console.log(sortedPartners)
    // Step 3: Map to <span> elements with rank and total change
    return (
      <table className="raceByRaceTable">
        <thead>
          <tr>
            <th></th>
            <th>Partner</th>
            <th>Races</th>
            <th>Rating Change</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {sortedPartners.map((partner, index) =>
            partner.key != 'Unknown' ? (
              <tr key={index} className="clickable" style={{ margin: '5px' }} onClick={() => navigate(`/rankings/${partner.key}`)}>
                <td className="tdRightBorder tableColFit secondaryText">{index + 1}</td>
                <td>{partner.name}</td>
                <td>{partner.count} races</td>
                <td style={{ color: partner.change > 0 ? 'green' : 'red' }}>
                  {partner.change > 0 ? '+' : ''}
                  {partner.change.toFixed(0)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div className="ratioBarBg">
                    <div className="ratioBar" style={{ width: partner.ratio * 100 }}>
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

  const PosInfo = ({ type, pos, rating, rank }) => {
    let change = sailorRaces
      .filter((race) => race.pos == pos && (type == "Women's" ? race.womens : true))
      .slice(-5)
      .reduce((sum, race) => sum + race.change, 0)
      .toFixed(0)

    return (
      <>
        {rating != 1000 ? (
          <div>
            <div>
              {type} {pos}: {rating} elo (
              <span
                style={{
                  color: change > 0 ? 'green' : 'red',
                }}>
                {change > 0 ? '+' : ''}
                {change}
              </span>{' '}
              in the last 5 skipper races)
            </div>
            <RankObj type={type} rank={rank} pos={pos.toLowerCase()} />
          </div>
        ) : undefined}
      </>
    )
  }

  const RankObj = ({ type, rank, pos }) => {
    return (
      <ProCheckLite feature="ranks">
        Rank:
        {rank != 0 ? (
          <span>
            {' '}
            #{rank} for{' '}
            <Link style={{ textDecoration: 'underline' }} to={`/rankings/${pos}${type == "Women's" ? '/women' : ''}`}>
              {type.toLowerCase()} {pos}s
            </Link>
            *
          </span>
        ) : (
          <span> (did not {pos} in f24)</span>
        )}
      </ProCheckLite>
    )
  }

  return (
    <div style={{ padding: 30 }}>
      {loaded && sailorRaces.length > 0 ? (
        <div>
          <div className="flexRowContainer sailorNameRow">
            <img style={{ display: 'inline', maxHeight: '3rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[teamNames[teamNames.length - 1]]}.png`} />
            <h1 style={{ display: 'inline-block' }}>{sailorName}</h1>
          </div>
          <div>
            {gradYear} |{' '}
            {teamNames.map((teamName, i) => (
              <Link style={{ textDecoration: 'underline' }} key={i} to={`/rankings/team/${teamName}`}>
                {i != 0 ? ', ' : ''} {teamName}
              </Link>
            ))}{' '}
            |{' '}
            {links.map((link, index) => (
              <span className="secondaryText" key={index} style={{ fontSize: '1rem' }}>
                <a href={`https://scores.collegesailing.org/sailors/${link}/`} target="1">
                  {' '}
                  (Techscore {index + 1})
                </a>
              </span>
            ))}
          </div>
          <br />
          {/* Elos and Rankings */}
          <div className="flexRowContainer" style={{ justifyContent: 'space-between', width: '75%' }}>
            <PosInfo type="Open" pos="Skipper" rating={ratingSkipper} rank={globalSkipper} />
            <PosInfo type="Open" pos="Crew" rating={ratingCrew} rank={globalCrew} />
            <PosInfo type="Women's" pos="Skipper" rating={ratingWomenSkipper} rank={globalWomenSkipper} />
            <PosInfo type="Women's" pos="Crew" rating={ratingWomenCrew} rank={globalWomenCrew} />
          </div>
          <span style={{ color: '#ccc', position: 'absolute', left: 30 }}> * in f24</span>

          {/* Graphs */}
          <h2>Rating change over time </h2>

          <EloLineChart data={sailorRaces} />

          <h2>
            Race by race breakdown: <span className="secondaryText">(scroll for more)</span>
          </h2>
          <RaceByRace races={sailorRaces} />
          <div className="flexRowContainer">
            <div className="flexGrowChild">
              <h2>Rating changes by partner (higher is better)</h2>
              <PartnerResults races={sailorRaces} />
            </div>
            <div className="flexGrowChild">
              <h2>Rating changes by Venue (higher is better)</h2>
              <VenueResults races={sailorRaces} />
            </div>
          </div>
          <div className="flexRowContainer">
            <Rivals rivals={sailorRivals} pos={'Skipper'} />
            <Rivals rivals={sailorRivals} pos={'Crew'} />
          </div>

          <h2>Rating changes by race</h2>
          <h2>Scores (lower is better) and Percentage (higher is better) by race</h2>
          <PosNegBarChart showLabels={false} data={sailorRaces} dataKey="change" syncID="ranking" title="Change" />
          <PosNegBarChart showLabels={false} data={sailorRaces} dataKey="score" syncID="ranking" title="Score" />
          {/* <h2>Ratio by race (higher is better)</h2> */}
          <PosNegBarChart
            title="Percentage"
            showLabels={true}
            data={sailorRaces.map((race) => {
              if (race.ratio < 0) {
                race.ratio = 0
              }
              return race
            })}
            dataKey="ratio"
            syncID="ranking"
          />
        </div>
      ) : loaded ? (
        <div>
          Sailor {key} not found... <br /> Keep these in mind
          <ul>
            <li>Capitalization must be correct (ie first letter of each name capitalized)</li>
            <li>Link should match techscore link (ex: 'rankings/first-last')</li>
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

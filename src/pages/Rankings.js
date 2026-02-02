import { getSailorElo } from '../lib/firebase'
import { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PosNegBarChart from '../components/PosNegBarChart'
import EloLineChart from '../components/EloLineChart'
import Loader from '../components/loader'
import VenueResults from '../components/rankings/VenueResults'
import RaceByRace from '../components/rankings/SailorPage/RaceByRace'
import useTeamCodes from '../lib/teamCodes'
import Rivals from '../components/rankings/SailorPage/Rivals'
import PartnerResults from '../components/rankings/SailorPage/PartnerResults'
import PosInfo from '../components/rankings/SailorPage/PosInfo'
import { useMobileDetect, useTeamRegions, useUserData } from '../lib/hooks'
import { AuthCheckLite } from '../components/AuthCheck'
import FollowButton from '../components/rankings/FollowButton'
import { UserContext } from '../lib/context'
import SailorStatTab from '../components/rankings/SailorPage/SailorStatTab'
import { getSailorFollows, getSailorInfo, getSailorRivals, getSailorTeams } from '../lib/apilib'
import useRegionColors from '../lib/regionColors'

export default function Rankings() {
  const { key } = useParams()
  const [sailor, setSailor] = useState(undefined)
  const [followCount, setFollowCount] = useState(0)
  const [races, setRaces] = useState([])
  const [teams, setTeams] = useState([])
  const [rivals, setRivals] = useState({ skipper: [], crew: [] })
  const [loaded, setLoaded] = useState(false)
  const [following, setFollowing] = useState(false)
  const [isUsers, setIsUsers] = useState(false)

  const [regattaCount, setRegattaCount] = useState(0)
  const teamCodes = useTeamCodes()
  const isMobile = useMobileDetect()
  const userData = useUserData()
  const regionColors = useRegionColors()
  const teamRegions = useTeamRegions()

  // 7 6 2 1 5 4 3 8

  useEffect(() => {
    getSailorInfo(key).then((dataIn) => {
      setSailor(dataIn.data)
      let totalRaces = dataIn.fleetScores.concat(dataIn.teamScores)
      setRaces(
        totalRaces.sort((a, b) => {
          let datea = new Date(a.date)
          let dateb = new Date(b.date)
          if (datea - dateb != 0) {
            return datea - dateb
          }
          return a.raceNumber - b.raceNumber
        })
      )
      setRegattaCount(
        dataIn.fleetScores.reduce((acc, race) => {
          const regattaKey = `${race.season}-${race.regatta}`
          if (!acc.includes(regattaKey)) {
            acc.push(regattaKey)
          }
          return acc
        }, []).length
      )
      // setLoaded(true)
    })

    getSailorTeams(key).then((dataIn) => {
      setTeams(dataIn.map((item) => item.teamID))
      // setLoaded(true)
      document.querySelector(':root').style.setProperty('--highlight1', regionColors[teamRegions[dataIn[0].teamID]])
    })
    getSailorRivals(key).then((dataIn) => {
      setRivals({
        skipper: dataIn.filter((rival) => rival.position == 'Skipper'),
        crew: dataIn.filter((rival) => rival.position == 'Crew'),
      })
      // setLoaded(true)
    })
    getSailorFollows(key).then((dataIn) => {
      setFollowCount(dataIn.count)
      setLoaded(true)
    })
  }, [key])

  useEffect(() => {
    if (userData.user !== undefined) {
      console.log('checking following', userData.userVals?.following, sailor?.sailorID)
      // setFollowing(sailor?.followers?.some((fol) => fol.followerUid === userData?.user?.uid))
      setFollowing(userData.userVals?.following?.includes(sailor?.sailorID))
      setIsUsers(userData.userVals?.tsLink?.split('/')[4] == key)
    }
  }, [key, userData])

  return (
    <div style={{ padding: 30 }}>
      {loaded && sailor !== undefined ? (
        <div>
          <div className='flexRowContainer sailorNameRow'>
            <Link to={`/teams/${teams[0]}`}>
              <img style={{ display: 'inline', maxHeight: '3rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[teams[0]]}.png`} />
            </Link>
            <h1 style={{ display: 'inline-block' }}>{sailor.name}</h1>
            <AuthCheckLite>
              <FollowButton style={{ position: 'absolute', right: 0 }} sailor={sailor} userData={userData} following={following} setFollowing={setFollowing} />
              {isUsers ? '(You)' : ''}
            </AuthCheckLite>
          </div>
          <div>
            {sailor.year} |{' '}
            {teams
              .slice(0)
              .reverse()
              .map((teamName, i) => (
                <Link key={i} to={`/teams/${teamName}`}>
                  {i !== 0 ? ', ' : ''} <span style={{ textDecoration: 'underline' }}>{teamName}</span>
                </Link>
              ))}{' '}
            | {races.length} total races | {regattaCount} total regattas | {followCount} followers |{' '}
            <a href={`https://scores.collegesailing.org/sailors/${sailor.sailorID}/`} target='1'>
              <span style={{ textDecoration: 'underline' }}>Techscore</span>
            </a>{' '}
            |{' '}
            <span className='secondaryText'>
              Last updated: {new Date(sailor.lastUpdate).toLocaleDateString()} at {new Date(sailor.lastUpdate).toLocaleTimeString()}
            </span>
            <AuthCheckLite>
              {userData?.userVals?.tsLink ? (
                <></>
              ) : (
                <>
                  {' '}
                  |{' '}
                  <span className='secondaryText'>
                    {' '}
                    Is this you?{' '}
                    <Link style={{ textDecoration: 'underline' }} to={`/rankings/claim?link=${key}`}>
                      Claim
                    </Link>
                  </span>
                </>
              )}{' '}
            </AuthCheckLite>
          </div>
          {/* <div>
            Lifetime Stats: {races.length} total races | {regattaCount} total regattas |
          </div> */}
          <br />
          {/* Elos and Rankings */}
          <div className='ratingStatContainer'>
            <PosInfo isUsers={isUsers} raceType={'fleet'} races={races} type='Open' pos='Skipper' rating={sailor.sr} rank={sailor.sRank} />
            <PosInfo isUsers={isUsers} raceType={'fleet'} races={races} type='Open' pos='Crew' rating={sailor.cr} rank={sailor.cRank} />
            <PosInfo isUsers={isUsers} raceType={'fleet'} races={races} type="Women's" pos='Skipper' rating={sailor.wsr} rank={sailor.wsRank} />
            <PosInfo isUsers={isUsers} raceType={'fleet'} races={races} type="Women's" pos='Crew' rating={sailor.wcr} rank={sailor.wcRank} />

            <PosInfo isUsers={isUsers} raceType={'team'} races={races} type='Open' pos='Skipper' rating={sailor.tsr} rank={sailor.tsRank} />
            <PosInfo isUsers={isUsers} raceType={'team'} races={races} type='Open' pos='Crew' rating={sailor.tcr} rank={sailor.tcRank} />
            <PosInfo isUsers={isUsers} raceType={'team'} races={races} type="Women's" pos='Skipper' rating={sailor.wtsr} rank={sailor.wtsRank} />
            <PosInfo isUsers={isUsers} raceType={'team'} races={races} type="Women's" pos='Crew' rating={sailor.wtcr} rank={sailor.wtcRank} />
          </div>
          {/* <span style={{ color: '#ccc', left: 30 }}> * in s25</span> */}

          {/* Graphs */}
          {/* <h2>Rating over time </h2> */}
          {/* <EloLineChart woman={sailor.WomenSkipperRating !== 1000 || sailor.WomenCrewRating !== 1000} data={races} /> */}

          <SailorStatTab
            titles={['Rating Graph', 'All Races', 'Partners', 'Venues', 'Rival Skippers', 'Rival Crews', 'Bar Charts']}
            components={[
              <EloLineChart woman={sailor.wsr !== 1000 || sailor.wcr !== 1000} data={races} />, //
              <RaceByRace woman={sailor.wsr !== 1000 || sailor.wcr !== 1000} races={races} showFilter={true} />, //
              <PartnerResults races={races} />, //
              <VenueResults races={races} />, //
              <Rivals rivals={rivals.skipper} pos={'Skipper'} />, //
              <Rivals rivals={rivals.crew} pos={'Crew'} />,
              <>
                <h2>Rating changes by race, Scores (lower is better) and Percentage (higher is better) by race</h2>
                <PosNegBarChart
                  showLabels={false}
                  data={races.map((race) => {
                    race.change = race.newRating - race.oldRating
                    return race
                  })}
                  dataKey='change'
                  syncID='ranking'
                  title='Change'
                />
                <PosNegBarChart showLabels={false} data={races} dataKey='score' syncID='ranking' title='Score' />
                {/* <h2>Ratio by race (higher is better)</h2> */}
                <PosNegBarChart
                  title='Percentage'
                  showLabels={true}
                  data={races.map((race) => {
                    if (race.ratio < 0) {
                      race.ratio = 0
                    }
                    if (race.ratingType.includes('t')) {
                      if (race.outcome == 'win') {
                        race.ratio = 1
                      } else {
                        race.ratio = 0
                      }
                    }
                    return race
                  })}
                  dataKey='ratio'
                  syncID='ranking'
                />
              </>,
            ]}
          />

          {/* <h2>
            Race by race breakdown: <span className='secondaryText'>(scroll for more)</span>
          </h2>

          <div className='responsiveRowCol'>
            <div className='flexGrowChild '>
              <h2>Rating changes by partner </h2>
            </div>
            <div className='flexGrowChild'>
              <h2>Rating changes by venue </h2>
            </div>
          </div>
          <div className='responsiveRowCol'></div> */}

          {!isMobile && false ? (
            <>
              <h2>Rating changes by race</h2>
              <h2>Scores (lower is better) and Percentage (higher is better) by race</h2>
              <PosNegBarChart showLabels={false} data={races} dataKey='change' syncID='ranking' title='Change' />
              <PosNegBarChart showLabels={false} data={races} dataKey='score' syncID='ranking' title='Score' />
              {/* <h2>Ratio by race (higher is better)</h2> */}
              <PosNegBarChart
                title='Percentage'
                showLabels={true}
                data={races.map((race) => {
                  if (race.ratio < 0) {
                    race.ratio = 0
                  }
                  if (race.type == 'team') {
                    if (race.outcome == 'win') {
                      race.ratio = 1
                    } else {
                      race.ratio = 0
                    }
                  }
                  return race
                })}
                dataKey='ratio'
                syncID='ranking'
              />
            </>
          ) : (
            <></>
          )}
        </div>
      ) : loaded ? (
        <div>
          Sailor {key} not found... <br /> Keep these in mind
          <ul>
            <li>Capitalization must be correct (ie first letter of each name capitalized)</li>
            <li>Link should match techscore link (ex: 'rankings/first-last')</li>
            <li>If the sailor does not have a techscore page, it should be name - team (ex: 'rankings/First Last-Team Name')</li>
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

import { followUser, getSailorElo, getTeamElo, unFollowUser } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import PosNegBarChart from '../components/PosNegBarChart'
import EloLineChart from '../components/EloLineChart'
import Loader from '../components/loader'
import VenueResults from '../components/rankings/VenueResults'
import RaceByRace from '../components/rankings/SailorPage/RaceByRace'
import { ProCheck, ProCheckLite } from '../components/rankings/ProCheck'
import useTeamCodes from '../lib/teamCodes'
import Rivals from '../components/rankings/SailorPage/Rivals'
import RatingNum from '../components/RatingNum'
import PartnerResults from '../components/rankings/SailorPage/PartnerResults'
import PosInfo from '../components/rankings/SailorPage/PosInfo'
import { useMobileDetect, useUserData } from '../lib/hooks'
import { AuthCheckLite } from '../components/AuthCheck'

export default function Rankings() {
  const { key } = useParams()
  const [sailor, setSailor] = useState(undefined)
  const [loaded, setLoaded] = useState(false)
  const [following, setFollowing] = useState(false)
  const navigate = useNavigate()
  const teamCodes = useTeamCodes()
  const isMobile = useMobileDetect()
  const userData = useUserData()

  useEffect(() => {
    getSailorElo(key).then((tempSailor) => {
      console.log(tempSailor?.data)
      setSailor(undefined)
      if (tempSailor != undefined) {
        setSailor(tempSailor.data)
        setLoaded(true)
      } else {
        setLoaded(true)
      }
    })
  }, [key])
  useEffect(() => {
    if (userData != undefined) {
      setFollowing(sailor?.followers?.some((fol) => fol.followerUid === userData.user.uid))
      console.log(following)
    }
  }, [key, userData])

  return (
    <div style={{ padding: 30 }}>
      {loaded && sailor != undefined ? (
        <div>
          <div className='flexRowContainer sailorNameRow'>
            <Link to={`/rankings/team/${sailor.Teams.slice(-1)}`}>
              <img style={{ display: 'inline', maxHeight: '3rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[sailor.Teams[sailor.Teams.length - 1]]}.png`} />
            </Link>
            <h1 style={{ display: 'inline-block' }}>{sailor.Name}</h1>
            <AuthCheckLite>
              <button
                className='tabButton'
                style={{ marginLeft: 10, backgroundColor: following ? 'var(--border)' : '' }}
                onClick={() => {
                  console.log('following', sailor.key, sailor.Name, userData.user.uid, userData.userVals.displayName)
                  if (!following) {
                    followUser(sailor.key, sailor.Name, userData.user.uid, userData.userVals.displayName, userData.userVals.username)
                    setFollowing(true)
                  } else {
                    unFollowUser(sailor.key, sailor.Name, userData.user.uid, userData.userVals.displayName, userData.userVals.username)
                    setFollowing(false)
                  }
                }}>
                {following ? 'Unfollow' : 'Follow'}
              </button>
            </AuthCheckLite>
          </div>
          <div>
            {sailor.Year} |{' '}
            {sailor.Teams.map((teamName, i) => (
              <Link style={{ textDecoration: 'underline' }} key={i} to={`/rankings/team/${teamName}`}>
                {i != 0 ? ', ' : ''} {teamName}
              </Link>
            ))}{' '}
            | Followers: {sailor?.followers?.length}|{' '}
            <span className='secondaryText' style={{ fontSize: '1rem' }}>
              {sailor.Links.map((link, index) => (
                <a key={index} href={`https://scores.collegesailing.org/sailors/${link}/`} target='1'>
                  {' '}
                  (Techscore{sailor.Links.length > 1 ? ' ' + (index + 1) : ''})
                </a>
              ))}
            </span>
          </div>
          <br />
          {/* Elos and Rankings */}
          <div className='responsiveRowCol' style={{ gap: '3rem', width: '100%' }}>
            <PosInfo races={sailor.races} type='Open' pos='Skipper' rating={sailor.SkipperRating} rank={sailor.SkipperRank} />
            <PosInfo races={sailor.races} type='Open' pos='Crew' rating={sailor.CrewRating} rank={sailor.CrewRank} />
            <PosInfo races={sailor.races} type="Women's" pos='Skipper' rating={sailor.WomenSkipperRating} rank={sailor.WomenSkipperRank} />
            <PosInfo races={sailor.races} type="Women's" pos='Crew' rating={sailor.WomenCrewRating} rank={sailor.WomenCrewRank} />
          </div>
          <span style={{ color: '#ccc', position: 'absolute', left: 30 }}> * in f24</span>

          {/* Graphs */}
          <h2>Rating over time </h2>
          <EloLineChart data={sailor.races} />

          <h2>
            Race by race breakdown: <span className='secondaryText'>(scroll for more)</span>
          </h2>
          <RaceByRace woman={sailor.WomenSkipperRating != 1000 || sailor.WomenCrewRating != 1000} races={sailor.races} showFilter={true} />
          <div className='responsiveRowCol'>
            <div className='flexGrowChild '>
              <h2>Rating changes by partner </h2>
              <PartnerResults races={sailor.races} />
            </div>
            <div className='flexGrowChild'>
              <h2>Rating changes by venue </h2>
              <VenueResults races={sailor.races} />
            </div>
          </div>
          <div className='responsiveRowCol'>
            <Rivals rivals={sailor.Rivals} pos={'Skipper'} />
            <Rivals rivals={sailor.Rivals} pos={'Crew'} />
          </div>

          {!isMobile ? (
            <>
              <h2>Rating changes by race</h2>
              <h2>Scores (lower is better) and Percentage (higher is better) by race</h2>
              <PosNegBarChart showLabels={false} data={sailor.races} dataKey='change' syncID='ranking' title='Change' />
              <PosNegBarChart showLabels={false} data={sailor.races} dataKey='score' syncID='ranking' title='Score' />
              {/* <h2>Ratio by race (higher is better)</h2> */}
              <PosNegBarChart
                title='Percentage'
                showLabels={true}
                data={sailor.races.map((race) => {
                  if (race.ratio < 0) {
                    race.ratio = 0
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

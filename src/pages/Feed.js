import { useEffect, useState } from 'react'
import { useUserData } from '../lib/hooks'
import { getSailorElo } from '../lib/firebase'
import RaceByRace from '../components/rankings/SailorPage/RaceByRace'
import { Link } from 'react-router-dom'
import useTeamCodes from '../lib/teamCodes'
import FollowButton from '../components/rankings/FollowButton'

export default function Feed() {
  const userData = useUserData()
  const [following, setFollowing] = useState([])
  const teamCodes = useTeamCodes()

  useEffect(() => {
    if (Object.keys(userData.userVals).length > 0 && !(following.length > 0)) {
      console.log(userData.userVals)
      userData?.userVals?.following?.forEach((follow) => {
        console.log(follow.targetKey)
        getSailorElo(follow.targetKey).then((sailor) => {
          setFollowing((prev) => [...prev, sailor.data])
          console.log(sailor.data.races.slice(0, 5))
        })
      })
    }
  }, [userData])

  return (
    <div>
      <div className='contentBox'>
        <h2>Your Feed</h2> Your feed shows the latest 5 races from each sailor that you follow!
      </div>
      {following
        .sort((a, b) => b?.races[b.races.length - 1]?.date - a?.races[a.races.length - 1]?.date)
        .map((sailor, i) => (
          <div key={i} className='contentBox'>
            <div className='flexRowContainer' style={{ alignItems: 'center' }}>
              <Link to={`/rankings/team/${sailor.Teams.slice(-1)}`}>
                <img style={{ display: 'inline', maxHeight: '3rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[sailor.Teams[sailor.Teams.length - 1]]}.png`} />
              </Link>
              <div className='responsiveRowCol' style={{ gap: 10 }}>
                <h3 style={{ margin: 0 }}>
                  <Link to={`/rankings/${sailor.key}`}>{sailor.Name}</Link>
                </h3>
                <div>
                  {' '}
                  {sailor.Year} |{' '}
                  <Link style={{ textDecoration: 'underline' }} to={`/rankings/team/${sailor.Teams[sailor.Teams.length - 1]}`}>
                    {sailor.Teams[sailor.Teams.length - 1]}
                  </Link>{' '}
                  | Followers: {sailor.followers ? sailor?.followers?.length : '0'}
                </div>
              </div>
              <FollowButton
                sailor={sailor}
                userData={userData}
                following={true}
                setFollowing={() => {
                  setFollowing([])
                }}
              />
            </div>
            <RaceByRace races={sailor.races.slice(-5)} woman={sailor.gender == 'F'} showFilter={false} />
            {/* //  
        //   {sailor.races.slice(0, 5).map((race) => (
        //     <div>
        //       {race.raceID} {race.score}
        //     </div>
        //   ))} */}
          </div>
        ))}
    </div>
  )
}

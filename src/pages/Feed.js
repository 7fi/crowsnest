import { useEffect, useState } from 'react'
import { useUserData } from '../lib/hooks'
import RaceByRace from '../components/rankings/SailorPage/RaceByRace'
import { Link } from 'react-router-dom'
import useTeamCodes from '../lib/teamCodes'
import FollowButton from '../components/rankings/FollowButton'
import { getSailorInfo, getUserFeed, getUserFollows } from '../lib/apilib'

export default function Feed() {
  const userData = useUserData()
  const [following, setFollowing] = useState([])
  const teamCodes = useTeamCodes()

  useEffect(() => {
    if (userData.user && !(following.length > 0)) {
      console.log(userData.uid)
      getUserFeed(userData.user.uid).then((follows) => {
        setFollowing(follows)
      })
    }
  }, [userData])

  return (
    <div>
      <div className='contentBox'>
        <h2>Your Feed</h2> Your feed shows the latest 5 races from each sailor that you follow!
      </div>
      {following
        .sort((a, b) => b?.races[b?.races?.length - 1]?.date - a?.races[a?.races?.length - 1]?.date)
        .map((sailor, i) => (
          <div key={i} className='contentBox'>
            <div className='flexRowContainer' style={{ alignItems: 'center' }}>
              <Link to={`/rankings/team/${sailor.teamID}`}>
                <img style={{ display: 'inline', maxHeight: '3rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[sailor.teamID]}.png`} />
              </Link>
              <div className='responsiveRowCol' style={{ gap: 10 }}>
                <h3 style={{ margin: 0 }}>
                  <Link to={`/rankings/${sailor.sailorID}`}>{sailor.name}</Link>
                </h3>
                <div>
                  {' '}
                  {sailor.Year} |{' '}
                  <Link style={{ textDecoration: 'underline' }} to={`/rankings/team/${sailor.teamID}`}>
                    {sailor.teamID}
                  </Link>{' '}
                  {/* | Followers: {sailor.followers ? sailor?.followers?.length : '0'} */}
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
            <RaceByRace races={sailor.races} woman={sailor.gender == 'F'} showFilter={false} />
          </div>
        ))}
    </div>
  )
}

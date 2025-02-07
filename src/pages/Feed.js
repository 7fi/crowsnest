import { useEffect, useState } from 'react'
import { useUserData } from '../lib/hooks'
import { getSailorElo } from '../lib/firebase'
import RaceByRace from '../components/rankings/SailorPage/RaceByRace'
import { Link } from 'react-router-dom'

export default function Feed() {
  const userData = useUserData()
  const [following, setFollowing] = useState([])

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
      {following.map((sailor) => (
        <div className='contentBox'>
          <h3>
            <Link to={`/rankings/${sailor.key}`}>{sailor.Name}</Link>
          </h3>
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

import Name from '../components/pairs/Name'
import Pairing from '../components/pairs/Pairing'
import { useEffect, useState } from 'react'
import { getTeamWithName } from '../lib/firebase'
import { Link, useParams } from 'react-router-dom'

export default function Page() {
  const [team, setTeam] = useState({})
  const { teamName } = useParams()

  useEffect(() => {
    getTeamWithName(teamName).then((tempTeam) => {
      setTeam(tempTeam.data)
    })
  }, [])

  // console.log(team?.members?.length)

  return (
    <>
      <div className='pairSlots'>{team?.members && [...Array(Math.ceil(team?.members?.length / 2) || 1)].map((e, i) => <Pairing />)}</div>
      <div className='nameList'>{team?.members && [...Array(team?.members?.length || 1)].map((e, i) => <Name name={team?.members[i]?.displayName} />)}</div>
      {/* <div className='pairSlots'>
        {[...Array(15)].map((e, i) => (
          <Pairing />
        ))}
      </div>
      <div className='nameList'>
        {[...Array(25)].map((e, i) => (
          <Name name={'TEst'} />
        ))}
      </div> */}
    </>
  )
}

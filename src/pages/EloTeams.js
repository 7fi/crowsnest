import { getAllTeams } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

export default function EloTeams() {
  const [teams, setTeams] = useState([])

  useEffect(() => {
    getAllTeams().then((tempTeams) => {
      let teams = tempTeams.data.teams
      setTeams(teams)
    })
  }, [])

  return (
    <>
      {teams
        .sort((a, b) => b.avg - a.avg)
        .map((team) => (
          <Link to={`/crowsnest/rankings/team/${team.name}`}>
            <div className='contentBox'>
              {team.name} ({team.region}) <span style={{ float: 'right' }}> Avg Elo: {team.avg.toFixed(2)}</span>
            </div>
          </Link>
        ))}
    </>
  )
}

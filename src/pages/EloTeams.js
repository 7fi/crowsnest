import { getAllTeams } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

export default function EloTeams() {
  const [teams, setTeams] = useState([])

  useEffect(() => {
    getAllTeams().then((tempTeams) => {
      console.log(tempTeams)
      let teams = tempTeams.data.teams
      setTeams(teams)
    })
  }, [])
  const navigate = useNavigate()

  return (
    <div style={{ padding: 15 }}>
      <table className='raceByRaceTable'>
        <thead>
          <th>Name</th>
          <th>Region</th>
          <th style={{ textAlign: 'right' }}>Avg Rating</th>
        </thead>
        <tbody>
          {teams
            .sort((a, b) => b.avg - a.avg)
            .map((team) => (
              <tr onClick={() => navigate(`/crowsnest/rankings/team/${team.name}`)} style={{ cursor: 'pointer' }}>
                <td className=''>{team.name}</td>
                <td className=''>{team.region}</td>
                <td style={{ textAlign: 'right' }}> {team.avg.toLocaleString().split('.')[0]}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

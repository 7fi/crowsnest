import { getTeamElo } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

export default function TeamRankings() {
  const { teamName } = useParams()
  // const [rating, setRating] = useState(1500)
  const [teamSkippers, setTeamSkippers] = useState([])
  const [teamCrews, setTeamCrews] = useState([])

  useEffect(() => {
    getTeamElo(teamName).then((tempTeam) => {
      let members = tempTeam.map((tempMember) => tempMember.data())
      const skippers = members.filter((member) => member.Position.toLowerCase() === 'skipper')
      const crews = members.filter((member) => member.Position.toLowerCase() === 'crew')
      setTeamSkippers(skippers)
      setTeamCrews(crews)
    })
  }, [teamName])

  const TeamMember = ({ member }) => {
    return (
      <Link to={`/crowsnest/rankings/${member.Position.toLowerCase()}/${member.Name}`}>
        <div className='contentBox'>
          {member.Name}
          <span style={{ color: '#aaa' }}>({member.Position})</span> <span style={{ float: 'right' }}>Rating: {member.Rating.toFixed(2)}</span>
        </div>
      </Link>
    )
  }

  return (
    <>
      <div className='contentBox' style={{ marginTop: 80 }}>
        <h3>Skippers: (in f24)</h3>
        {teamSkippers
          .filter((member) => member.races.some((race) => race.raceID.startsWith('f24')))
          .sort((a, b) => {
            return b.Rating - a.Rating
          })
          .map((member) => (
            <TeamMember key={member.Name + member.Position} member={member} />
          ))}
      </div>

      <div className='contentBox'>
        <h3>Crews:</h3>
        {teamCrews
          .filter((member) => member.races.some((race) => race.raceID.startsWith('f24')))
          .sort((a, b) => {
            return b.Rating - a.Rating
          })
          .map((member) => (
            <TeamMember key={member.Name + member.Position} member={member} />
          ))}
      </div>
    </>
  )
}

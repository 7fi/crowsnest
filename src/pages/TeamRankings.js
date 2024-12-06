import { getTeamElos } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

export default function TeamRankings() {
  const { teamName } = useParams()
  const [rating, setRating] = useState(1500)
  const [teamSkippers, setTeamSkippers] = useState([])
  const [teamCrews, setTeamCrews] = useState([])
  const [teamLink, setTeamLink] = useState('')
  const [teamRegion, setTeamRegion] = useState('')

  useEffect(() => {
    getTeamElos(teamName).then((tempTeam) => {
      const members = tempTeam.data.members
      const skippers = members.filter((member) => member.pos.toLowerCase() === 'skipper')
      const crews = members.filter((member) => member.pos.toLowerCase() === 'crew')
      setTeamSkippers(skippers)
      setTeamCrews(crews)
      setRating(tempTeam.data.avg)
      setTeamLink(tempTeam.data.link)
      setTeamRegion(tempTeam.data.region)
    })
  }, [teamName])

  const TeamMember = ({ member }) => {
    return (
      <Link to={`/crowsnest/rankings/${member.pos.toLowerCase()}/${member.name}`}>
        <div className='contentBox'>
          {member.name}
          <span style={{ color: '#aaa' }}>({member.pos})</span> <span style={{ float: 'right' }}>Rating: {member.rating.toFixed(2)}</span>
        </div>
      </Link>
    )
  }

  return (
    <>
      <div className='contentBox' style={{ marginTop: 80 }}>
        <h2>
          Team:{' '}
          <a href={teamLink} target={1}>
            {teamName}
          </a>
        </h2>{' '}
        <span>
          ({teamRegion}) (avg rating:{rating.toFixed(0)})
        </span>
        <Link to={'/crowsnest/rankings/team'} style={{ position: 'absolute', right: 20, top: 90 }}>
          <button>all teams</button>
        </Link>
      </div>
      <div className='contentBox'>
        <h3>Skippers: (in f24)</h3>
        {teamSkippers
          .filter((member) => member.seasons.includes('f24'))
          .sort((a, b) => {
            return b.rating - a.rating
          })
          .map((member) => (
            <TeamMember key={member.name + member.pos} member={member} />
          ))}
      </div>

      <div className='contentBox'>
        <h3>Crews:</h3>
        {teamCrews
          .filter((member) => member.seasons.includes('f24'))
          .sort((a, b) => {
            return b.rating - a.rating
          })
          .map((member) => (
            <TeamMember key={member.name + member.pos} member={member} />
          ))}
      </div>
    </>
  )
}

import { getTeamElos } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Loader from '../components/loader'

export default function TeamRankings() {
  const { teamName } = useParams()
  const [rating, setRating] = useState(1500)
  const [teamSkippers, setTeamSkippers] = useState([])
  const [teamCrews, setTeamCrews] = useState([])
  const [teamLink, setTeamLink] = useState('')
  const [teamRegion, setTeamRegion] = useState('')
  const [loaded, setLoaded] = useState(false)

  const [sortByRatio, setSortByRatio] = useState(false)

  const [activeSeasons, setActiveSeasons] = useState([])
  const [allSeasons, setAllSeasons] = useState([])

  useEffect(() => {
    getTeamElos(teamName).then((tempTeam) => {
      const members = tempTeam.data.members.filter((member) => member.teams[member.teams.length - 1] == teamName)
      const skippers = members.filter((member) => member.pos.toLowerCase() === 'skipper')
      const crews = members.filter((member) => member.pos.toLowerCase() === 'crew')
      setTeamSkippers(skippers)
      setTeamCrews(crews)
      setRating(tempTeam.data.avg)
      setTeamLink(tempTeam.data.link)
      setTeamRegion(tempTeam.data.region)

      const allSeasons = members.flatMap((member) => member.seasons)
      const uniqueSeasons = [...new Set(allSeasons)].sort((a, b) => {
        if (parseInt(a.slice(1, 3)) - parseInt(b.slice(1, 3)) != 0) {
          return parseInt(a.slice(1, 3)) - parseInt(b.slice(1, 3))
        } else if (a.slice(0, 1) == 's' && b.slice(0, 1) == 'f') {
          return -1
        } else {
          return 1
        }
      })
      setActiveSeasons([uniqueSeasons[uniqueSeasons.length - 1]])
      setAllSeasons(uniqueSeasons)
      setLoaded(true)
    })
  }, [teamName])

  const TeamMember = ({ index, member }) => {
    const navigate = useNavigate()
    return (
      <tr className='clickable' onClick={() => navigate(`/crowsnest/rankings/${member.name}`)}>
        <td className='tdRightBorder tableColFit'>{index + 1}</td>
        <td>{member.name}</td>
        <td className='secondaryText'>{member.pos}</td>
        <td>
          {activeSeasons.reduce((total, season) => {
            if (member.raceCount[season] !== undefined) {
              return total + member.raceCount[season]
            }
            return total // If the season is not in the seasonRaces object, we ignore it
          }, 0)}
        </td>
        <td>{member.avgRatio.toFixed(3)}</td>
        <td>{member.rating.toFixed(0)}</td>
      </tr>
    )
  }

  const toggleFilter = (season) => {
    if (activeSeasons.indexOf(season) != -1) {
      setActiveSeasons(activeSeasons.filter((reg) => reg != season))
    } else {
      setActiveSeasons((activeSeasons) => [...activeSeasons, season])
    }
  }

  const PosList = ({ members }) => {
    return (
      <div className='flexGrowChild'>
        <table className='raceByRaceTable'>
          <thead>
            <th></th>
            <th>Name</th>
            <th>Position</th>
            <th>Num Races</th>
            <th className='clickable' style={{ textDecoration: sortByRatio ? 'underline' : '' }} onClick={() => setSortByRatio(true)}>
              Avg Ratio
            </th>
            <th className='clickable' style={{ textDecoration: sortByRatio ? '' : 'underline' }} onClick={() => setSortByRatio(false)}>
              Rating
            </th>
          </thead>
          <tbody>
            {members
              .filter((member) => member.seasons.some((season) => activeSeasons.includes(season)))
              .sort((a, b) => {
                if (sortByRatio) {
                  return b.avgRatio - a.avgRatio
                }
                return b.rating - a.rating
              })
              .map((member, index) => (
                <TeamMember index={index} key={member.name + member.pos} member={member} />
              ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div>
      {loaded ? (
        <div>
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
          <div className='flexRowContainer' style={{ marginLeft: 15 }}>
            {allSeasons
              .sort((a, b) => {
                if (parseInt(a.slice(1, 3)) - parseInt(b.slice(1, 3)) != 0) {
                  return parseInt(a.slice(1, 3)) - parseInt(b.slice(1, 3))
                } else if (a.slice(0, 1) == 's' && b.slice(0, 1) == 'f') {
                  return -1
                } else {
                  return 1
                }
              })
              .map((season) => (
                <button className={`filterOption ${activeSeasons.indexOf(season) != -1 ? '' : 'filterInactive'}`} onClick={() => toggleFilter(season)}>
                  {season.toUpperCase()}
                </button>
              ))}
            <button className='filterOption' onClick={() => setActiveSeasons(allSeasons)}>
              Enable all
            </button>
            <button className='filterOption' onClick={() => setActiveSeasons([])}>
              Disable all
            </button>
          </div>
          <div className='flexRowContainer' style={{ padding: 15 }}>
            <PosList members={teamSkippers} />
            <PosList members={teamCrews} />
          </div>
        </div>
      ) : (
        <Loader show={!loaded} />
      )}
    </div>
  )
}

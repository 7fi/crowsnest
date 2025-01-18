import { getTeamElos } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Loader from '../components/loader'
import useTeamCodes from '../lib/teamCodes'

export default function TeamRankings() {
  const { teamName } = useParams()
  const [rating, setRating] = useState(1500)
  const [teamSkippers, setTeamSkippers] = useState([])
  const [teamCrews, setTeamCrews] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [teamLink, setTeamLink] = useState('')
  const [teamRegion, setTeamRegion] = useState('')
  const [loaded, setLoaded] = useState(false)

  const [sortByRatio, setSortByRatio] = useState(false)
  const [activeSeasons, setActiveSeasons] = useState([])
  const [allSeasons, setAllSeasons] = useState([])
  const teamCodes = useTeamCodes()

  const RegionColors = {
    PCCSC: '#ed841a',
    NEISA: '#244a7d',
    NWICSA: '#4A90E2',
    SEISA: '#B8E986',
    MCSA: '#D0021B',
    SAISA: '#edbc1a',
    MAISA: '#32b8ad',
    GUEST: '#d45dba',
  }

  useEffect(() => {
    getTeamElos(teamName).then((tempTeam) => {
      const members = tempTeam.data.members.filter((member) => member.teams[member.teams.length - 1] == teamName)
      setTeamMembers(members)
      const skippers = members.filter((member) => member.seasons['skipper'].length > 0)
      const crews = members.filter((member) => member.seasons['crew'].length > 0)
      setTeamSkippers(skippers)
      setTeamCrews(crews)
      setRating(tempTeam.data.avg)
      setTeamLink(tempTeam.data.link)
      setTeamRegion(tempTeam.data.region)

      const allSeasons = members.flatMap((member) => [...member?.seasons.skipper, ...member?.seasons.crew])
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
      document.querySelector(':root').style.setProperty('--highlight1', RegionColors[tempTeam.data.region])
      setLoaded(true)
    })
  }, [teamName])

  const TeamMember = ({ index, member, pos }) => {
    const navigate = useNavigate()
    console.log(member)
    return (
      <tr key={index} className='clickable' onClick={() => navigate(`/rankings/${member.key}`)}>
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
        <td>{pos == 'skipper' ? member.avgSkipperRatio.toFixed(3) : member.avgCrewRatio.toFixed(3)}</td>
        <td>{pos == 'skipper' ? member.skipperRating.toFixed(0) : member.crewRating.toFixed(0)}</td>
      </tr>
    )
  }

  const toggleFilter = (season, element) => {
    if (activeSeasons.indexOf(season) != -1) {
      setActiveSeasons(activeSeasons.filter((reg) => reg != season))
      // element.classList.add('filterInactive')
    } else {
      setActiveSeasons((activeSeasons) => [...activeSeasons, season])
      // element.classList.remove('filterInactive')
    }
    // console.log(element.classList)
  }

  const PosList = ({ members, pos }) => {
    const newMembers = members.filter((member) => member.seasons[pos].length > 0)
    return (
      <div className='flexGrowChild'>
        <table className='raceByRaceTable'>
          <thead>
            <tr>
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
            </tr>
          </thead>
          <tbody>
            {newMembers
              .filter((member) => {
                return member?.seasons[pos]?.some((season) => activeSeasons.includes(season))
              })
              .sort((a, b) => {
                if (sortByRatio) {
                  return b.avgRatio - a.avgRatio
                }
                if (pos == 'skipper') {
                  return b.skipperRating - a.skipperRating
                } else {
                  return b.crewRating - a.crewRating
                }
              })
              .map((member, index) => (
                <TeamMember index={index} key={member.name + member.pos} member={member} pos={pos} />
              ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div>
      {loaded ? (
        <div style={{ padding: 15 }}>
          <div className='teamPageHeader'>
            <Link to={'/rankings/team'} className='secondaryText'>
              {'<'} Back
            </Link>
            <div className='flexRowContainer sailorNameRow'>
              <img style={{ display: 'inline', maxHeight: '3rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[teamName]}.png`} />
              <h1 style={{ display: 'inline-block' }}>
                <a href={teamLink} target={1}>
                  {teamName}
                </a>
              </h1>
            </div>

            <div>
              <span className='filterOption' style={{ backgroundColor: RegionColors[teamRegion] }}>
                {teamRegion}
              </span>{' '}
              avg rating: {rating.toFixed(0)}
            </div>
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
              .map((season, index) => (
                <div key={index} className={`filterOption`} style={{ backgroundColor: activeSeasons.includes(season) ? 'var(--highlight1)' : '' }} onClick={(e) => toggleFilter(season, e.target)}>
                  {season?.toUpperCase()}
                </div>
              ))}
            <button className='filterOption' onClick={() => setActiveSeasons(allSeasons)}>
              Enable all
            </button>
            <button className='filterOption' onClick={() => setActiveSeasons([])}>
              Disable all
            </button>
          </div>
          <div className='flexRowContainer' style={{ padding: 15 }}>
            <PosList members={teamMembers} pos={'skipper'} />
            <PosList members={teamMembers} pos='crew' />
          </div>
        </div>
      ) : (
        <Loader show={!loaded} />
      )}
    </div>
  )
}

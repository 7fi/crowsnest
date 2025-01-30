import { getTeamElos } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Loader from '../components/loader'
import useTeamCodes from '../lib/teamCodes'
import { FaDiamond } from 'react-icons/fa6'

export default function TeamRankings() {
  const { teamName } = useParams()
  const [rating, setRating] = useState(1500)
  const [teamMembers, setTeamMembers] = useState([])
  const [teamLink, setTeamLink] = useState('')
  const [teamRegion, setTeamRegion] = useState('')
  const [loaded, setLoaded] = useState(false)

  const [sortByRatio, setSortByRatio] = useState(false)
  const [activeSeasons, setActiveSeasons] = useState([])
  const [allSeasons, setAllSeasons] = useState([])
  const teamCodes = useTeamCodes()
  const debug = false

  const RegionColors = {
    PCCSC: '#4A90E2',
    NEISA: '#d12e44',
    NWICSA: '#ed841a',
    SEISA: '#82b84b',
    MCSA: '#edbc1a',
    SAISA: '#32b8ad',
    MAISA: '#244a7d',
    GUEST: '#ff7996',
  }

  useEffect(() => {
    getTeamElos(teamName).then((tempTeam) => {
      const members = tempTeam.data.members.filter((member) => member.teams[member.teams.length - 1] == teamName)
      setTeamMembers(members)
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
    let rating = 0
    if (pos == 'skipper') {
      let sr = member.skipperRating
      let wsr = member.womenSkipperRating
      if (member.womenSkipperRating == 1000) {
        wsr = 0
      }
      if (member.skipperRating == 1000) {
        sr = 0
      }
      rating = Math.max(sr, wsr)
    } else {
      // Crew
      let cr = member.crewRating
      let wcr = member.womenCrewRating
      if (member.womenCrewRating == 1000) {
        wcr = 0
      }
      if (member.crewRating == 1000) {
        cr = 0
      }
      rating = Math.max(wcr, cr)
    }

    // const rating = pos == 'skipper' ? (member.womenSkipperRating != 1000 ? Math.max(member.skipperRating, member.womenSkipperRating).toFixed(0) : member.skipperRating.toFixed(0)) : member.womenCrewRating != 1000 ? Math.max(member.crewRating, member.womenCrewRating).toFixed(0) : member.crewRating.toFixed(0)
    console.log(member)
    return (
      <tr key={index} className='clickable' onClick={() => navigate(`/rankings/${member.key}`)}>
        <td className='tdRightBorder tableColFit'>{index + 1}</td>
        {debug ? (
          <td>
            {member.cross > 20 && member.outLinks > 70 ? 'y' : ''}
            {member.cross},{member.outLinks}
          </td>
        ) : (
          <></>
        )}
        <td>{member.name}</td>
        <td>{member.year.split('.')[0].slice(2, 4)}</td>
        {/* <td className='secondaryText'>{member.gender == 'F' ? 'W' : ''}</td> */}
        <td style={{ textAlign: 'right' }}>
          {activeSeasons.reduce((total, season) => {
            if (member.raceCount[season] !== undefined) {
              return total + member.raceCount[season]
            }
            return total // If the season is not in the seasonRaces object, we ignore it
          }, 0)}
        </td>
        {/* <td style={{ textAlign: 'right' }}>{pos == 'skipper' ? member.avgSkipperRatio.toFixed(3) : member.avgCrewRatio.toFixed(3)}</td> */}
        <td style={{ textAlign: 'center' }}>
          <div className='ratioBarBg'>
            <div className='ratioBar' style={{ width: (pos == 'skipper' ? member.avgSkipperRatio : member.avgCrewRatio) * 100 }}>
              <span>{((pos == 'skipper' ? member.avgSkipperRatio : member.avgCrewRatio) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </td>
        <td style={{ textAlign: 'right' }} className='tableColFit'>
          {rating == member.womenSkipperRating || rating == member.womenCrewRating ? <FaDiamond className='secondaryText' /> : ''} {rating}
        </td>
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
    const filtered = newMembers
      .filter((member) => {
        return member?.seasons[pos]?.some((season) => activeSeasons.includes(season))
      })
      .sort((a, b) => {
        if (sortByRatio) {
          return b.avgRatio - a.avgRatio
        }
        if (pos == 'skipper') {
          return Math.max(b.skipperRating, b.womenSkipperRating) - Math.max(a.skipperRating, a.womenSkipperRating)
        } else {
          return Math.max(b.crewRating, b.womenCrewRating) - Math.max(a.crewRating, a.womenCrewRating)
        }
      })
    return (
      <div className='flexGrowChild'>
        <table className='raceByRaceTable'>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Year</th>
              {/* <th></th> */}
              <th className='tableColFit'>Num Races</th>
              <th className=' tableColFit clickable' style={{ textDecoration: sortByRatio ? 'underline' : '' }} onClick={() => setSortByRatio(true)}>
                Avg Win %
              </th>
              <th className=' tableColFit clickable' style={{ textDecoration: sortByRatio ? '' : 'underline' }} onClick={() => setSortByRatio(false)}>
                Rating
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((member, index) => <TeamMember index={index} key={member.name + member.pos} member={member} pos={pos} />)
            ) : (
              <tr>
                <span style={{ width: '50%', position: 'absolute', textAlign: 'center', margin: 20 }}>Please select at least one season!</span>
              </tr>
            )}
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

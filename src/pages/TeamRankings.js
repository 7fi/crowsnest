import { getTeamElos } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Loader from '../components/loader'
import useTeamCodes from '../lib/teamCodes'
import { TbDiamondsFilled } from 'react-icons/tb'
import { TiStarFullOutline } from 'react-icons/ti'
import RatingNum from '../components/RatingNum'
import { FaSortDown } from 'react-icons/fa'
import useRegionColors from '../lib/regionColors'
import RatioBar from '../components/rankings/RatioBar'

export default function TeamRankings() {
  const { teamName } = useParams()
  const [rating, setRating] = useState(1500)
  const [teamMembers, setTeamMembers] = useState([])
  const [teamLink, setTeamLink] = useState('')
  const [teamRegion, setTeamRegion] = useState('')
  const [loaded, setLoaded] = useState(false)

  const [sortByRatio, setSortByRatio] = useState(false)
  const [sortByRaces, setSortByRaces] = useState(false)
  const [activeSeasons, setActiveSeasons] = useState([])
  const [allSeasons, setAllSeasons] = useState([])
  const teamCodes = useTeamCodes()
  const RegionColors = useRegionColors()
  const debug = false

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

  const getRating = (member, pos, type) => {
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
      if (type != undefined) {
        if (type == 'women') {
          rating = wsr
        } else {
          rating = sr
        }
      } else {
        rating = Math.max(sr, wsr)
      }
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
      if (type != undefined) {
        if (type == 'women') {
          rating = wcr
        } else {
          rating = cr
        }
      } else {
        rating = Math.max(cr, wcr)
      }
    }
    return rating
  }

  const TeamMember = ({ index, member, pos, rankingOpen, rankingWomen }) => {
    const navigate = useNavigate()
    // let rating = getRating(member, pos)

    // const rating = pos == 'skipper' ? (member.womenSkipperRating != 1000 ? Math.max(member.skipperRating, member.womenSkipperRating).toFixed(0) : member.skipperRating.toFixed(0)) : member.womenCrewRating != 1000 ? Math.max(member.crewRating, member.womenCrewRating).toFixed(0) : member.crewRating.toFixed(0)
    // console.log(member)
    return (
      <tr key={index} className='clickable' onClick={() => navigate(`/rankings/${member.key}`)}>
        <td className='tdRightBorder tableColFit' style={{ textAlign: 'right' }}>
          {index + 1}
        </td>
        {debug ? (
          <td>
            {member.cross > 20 && member.outLinks > 70 ? 'y' : ''}
            {member.cross},{member.outLinks}
          </td>
        ) : (
          <></>
        )}
        <td className='tableColFit'>{member.name}</td>
        <td className='tableColFit'>{member.year.split('.')[0].slice(2, 4)}</td>
        <td style={{ textAlign: 'left', minWidth: 50 }}>
          {rankingOpen ? <TiStarFullOutline style={{ bottom: -5 }} className='secondaryText' /> : ''}
          {rankingWomen ? <TiStarFullOutline className='secondaryText' color='var(--women)' /> : ''}
        </td>
        {/* <td className='secondaryText'>{member.gender == 'F' ? 'W' : ''}</td> */}
        <td className='tableColFit' style={{ textAlign: 'right' }}>
          {activeSeasons.reduce((total, season) => {
            const newPos = pos == 'skipper' ? 'Skipper' : 'Crew'
            if (member.raceCount[season] != undefined && member.raceCount[season][newPos]) {
              return total + member.raceCount[season][newPos]
            }
            return total // If the season is not in the seasonRaces object, we ignore it
          }, 0)}
        </td>
        {/* <td style={{ textAlign: 'right' }}>{pos == 'skipper' ? member.avgSkipperRatio.toFixed(3) : member.avgCrewRatio.toFixed(3)}</td> */}
        <td style={{ textAlign: 'center' }}>
          <RatioBar ratio={pos == 'skipper' ? member.avgSkipperRatio : member.avgCrewRatio} />
        </td>
        <td style={{ textAlign: 'right' }} className='tableColFit'>
          <RatingNum highest={true} sailor={member} pos={pos} />
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
          if (pos == 'skipper') return b.avgSkipperRatio - a.avgSkipperRatio
          return b.avgCrewRatio - a.avgCrewRatio
        } else if (sortByRaces) {
          let bRaces = activeSeasons.reduce((total, season) => {
            const newPos = pos == 'skipper' ? 'Skipper' : 'Crew'
            if (b.raceCount[season] != undefined && b.raceCount[season][newPos]) {
              return total + b.raceCount[season][newPos]
            }
            return total // If the season is not in the seasonRaces object, we ignore it
          }, 0)
          let aRaces = activeSeasons.reduce((total, season) => {
            const newPos = pos == 'skipper' ? 'Skipper' : 'Crew'
            if (a.raceCount[season] != undefined && a.raceCount[season][newPos]) {
              return total + a.raceCount[season][newPos]
            }
            return total // If the season is not in the seasonRaces object, we ignore it
          }, 0)
          // console.log(bRaces, aRaces)
          return bRaces - aRaces
        }

        return getRating(b, pos) - getRating(a, pos)
      })

    const openrankingMembers = filtered
      .slice(0)
      .sort((a, b) => getRating(b, pos, 'open') - getRating(a, pos, 'open'))
      .filter((member) => member.cross > 20 && member.outLinks > 70 && member.seasons[pos].includes(allSeasons.slice(-1)[0]))
      .slice(0, 3)

    const womenRankingMembers = filtered
      .slice(0)
      .sort((a, b) => getRating(b, pos, 'women') - getRating(a, pos, 'women'))
      .filter((member) => member.cross > 20 && member.outLinks > 70 && member.seasons[pos].includes(allSeasons.slice(-1)[0]) && (pos == 'skipper' ? member.womenSkipperRating != 1000 : member.womenCrewRating != 1000))
      .slice(0, 3)

    return (
      <div className='flexGrowChild'>
        <table className='raceByRaceTable' style={{ fontSize: '0.9rem' }}>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Year</th>
              <th></th>
              {/* <th></th> */}
              <th
                className='tableColFit clickable'
                style={{ minWidth: 75, textAlign: 'right' }}
                onClick={() => {
                  setSortByRatio(false)
                  setSortByRaces(true)
                }}>
                {sortByRaces ? <FaSortDown /> : ''}Races
              </th>
              <th
                className=' tableColFit clickable'
                style={{ minWidth: 113, textAlign: 'right' }}
                onClick={() => {
                  setSortByRaces(false)
                  setSortByRatio(true)
                }}>
                {sortByRatio ? <FaSortDown /> : ''}Avg Win %
              </th>
              <th
                className=' tableColFit clickable'
                style={{ minWidth: 75, textAlign: 'right' }}
                onClick={() => {
                  setSortByRaces(false)
                  setSortByRatio(false)
                }}>
                {!sortByRatio && !sortByRaces ? <FaSortDown /> : ''}Rating
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((member, index) => <TeamMember index={index} key={member.name + member.pos} member={member} pos={pos} rankingOpen={openrankingMembers.includes(member)} rankingWomen={womenRankingMembers.includes(member)} />)
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
          <div className='flexRowContainer flexWrap' style={{ marginLeft: 15 }}>
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
          <div className='responsiveRowCol' style={{ padding: 15, maxWidth: '100%' }}>
            <PosList members={teamMembers} pos={'skipper'} />
            <PosList members={teamMembers} pos='crew' />
          </div>
          <span className='secondaryText'>
            <TiStarFullOutline /> means that this sailor is used in the calculation of this teams rating. Requires a certain number of races vs out of conference sailors.{' '}
          </span>
        </div>
      ) : (
        <Loader show={!loaded} />
      )}
    </div>
  )
}

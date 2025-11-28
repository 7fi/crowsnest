import { getTeam } from '../lib/apilib'
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Loader from '../components/loader'
import useTeamCodes from '../lib/teamCodes'
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

  const [sort, setSort] = useState('openrating')
  const [activeSeasons, setActiveSeasons] = useState([])
  const [allSeasons, setAllSeasons] = useState([])
  const teamCodes = useTeamCodes()
  const regionColors = useRegionColors()
  const debug = false

  useEffect(() => {
    getTeam(teamName).then((tempTeam) => {
      if (tempTeam == undefined) return
      console.log(tempTeam)
      setTeamMembers(tempTeam.members)
      setRating(tempTeam.data.avgRating)
      setTeamLink(tempTeam.data.link)
      setTeamRegion(tempTeam.data.region)

      const allSeasons = tempTeam.members.map((member) => member.season)
      const uniqueSeasons = [...new Set(allSeasons)].sort((a, b) => {
        if (parseInt(a.slice(1, 3)) - parseInt(b.slice(1, 3)) !== 0) {
          return parseInt(a.slice(1, 3)) - parseInt(b.slice(1, 3))
        } else if (a.slice(0, 1) === 's' && b.slice(0, 1) === 'f') {
          return -1
        } else {
          return 1
        }
      })
      setActiveSeasons([uniqueSeasons[uniqueSeasons.length - 1]])
      setAllSeasons(uniqueSeasons)
      document.querySelector(':root').style.setProperty('--highlight1', regionColors[tempTeam.data.region])
      setLoaded(true)
    })
  }, [teamName])

  const getRating = (member, pos, type, raceType) => {
    let rating = 0
    if (pos === 'skipper') {
      if (raceType === 'team') {
        let tsr = member.tsr
        let wtsr = member.wtsr
        if (member.wtsr === 1000) {
          wtsr = 0
        }
        if (member.tsr === 1000) {
          tsr = 0
        }
        if (type !== undefined) {
          if (type === 'women') {
            rating = wtsr
          } else {
            rating = tsr
          }
        } else {
          rating = Math.max(tsr, wtsr)
        }
      } else {
        let sr = member.sr
        let wsr = member.wsr
        if (member.wsr === 1000) {
          wsr = 0
        }
        if (member.sr === 1000) {
          sr = 0
        }
        if (type !== undefined) {
          if (type === 'women') {
            rating = wsr
          } else {
            rating = sr
          }
        } else {
          rating = Math.max(sr, wsr)
        }
      }
    } else {
      // Crew
      if (raceType === 'team') {
        let tcr = member.tcr
        let wtcr = member.wtcr
        if (member.wtcr === 1000) {
          wtcr = 0
        }
        if (member.tcr === 1000) {
          tcr = 0
        }
        if (type !== undefined) {
          if (type === 'women') {
            rating = wtcr
          } else {
            rating = tcr
          }
        } else {
          rating = Math.max(tcr, wtcr)
        }
      } else {
        let cr = member.cr
        let wcr = member.wcr
        if (member.wcr === 1000) {
          wcr = 0
        }
        if (member.cr === 1000) {
          cr = 0
        }
        if (type !== undefined) {
          if (type === 'women') {
            rating = wcr
          } else {
            rating = cr
          }
        } else {
          rating = Math.max(cr, wcr)
        }
      }
    }
    return rating
  }

  const TeamMember = ({ index, member, pos, rankingOpen, rankingWomen }) => {
    const navigate = useNavigate()
    // let rating = getRating(member, pos)

    // const rating = pos === 'skipper' ? (member.wsr !== 1000 ? Math.max(member.sr, member.wsr).toFixed(0) : member.sr.toFixed(0)) : member.wcr !== 1000 ? Math.max(member.cr, member.wcr).toFixed(0) : member.cr.toFixed(0)
    // console.log(member)
    return (
      <tr key={index} className='clickable' onClick={() => navigate(`/sailors/${member.sailorID}`)}>
        <td className='tdRightBorder tdLeftBorder tableColFit' style={{ textAlign: 'right' }}>
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
        <td className='tableColFit'>{decodeURIComponent(member.name)}</td>
        <td className='tableColFit'>{member.year.split('.')[0].includes('*') ? member.year.split('.')[0].slice(0, 2) : member.year.split('.')[0].slice(2, 4)}</td>
        {/* <td style={{ textAlign: 'left', minWidth: 50 }}>
          {rankingOpen ? <TiStarFullOutline style={{ bottom: -5 }} className='secondaryText' /> : ''}
          {rankingWomen ? <TiStarFullOutline className='secondaryText' color='var(--women)' /> : ''}
        </td> */}
        {/* <td className='secondaryText'>{member.gender === 'F' ? 'W' : ''}</td> */}
        <td className='tableColFit' style={{ textAlign: 'left' }}>
          {member.numRaces}
        </td>
        {/* <td style={{ textAlign: 'right' }}>{pos === 'skipper' ? member.avgSkipperRatio.toFixed(3) : member.avgCrewRatio.toFixed(3)}</td> */}
        <td className='tableColFit' style={{ textAlign: 'center' }}>
          <RatioBar ratio={pos === 'skipper' ? member.avgSkipperRatio : member.avgCrewRatio} />
        </td>
        <td style={{ textAlign: 'right' }} className='tableColFit'>
          <RatingNum highest={false} sailor={member} pos={pos} type={'open'} raceType={'fleet'} />
        </td>
        <td style={{ textAlign: 'right' }} className='tableColFit'>
          <RatingNum highest={false} sailor={member} pos={pos} type={'women'} raceType={'fleet'} />
        </td>
        <td style={{ textAlign: 'right' }} className='tableColFit'>
          <RatingNum highest={false} sailor={member} pos={pos} type={'open'} raceType={'team'} />
        </td>
        <td style={{ textAlign: 'right' }} className='tableColFit'>
          <RatingNum highest={false} sailor={member} pos={pos} type={'women'} raceType={'team'} />
        </td>
        <td className='tdRightBorder'></td>
      </tr>
    )
  }

  const toggleFilter = (season, element) => {
    if (activeSeasons.indexOf(season) !== -1) {
      setActiveSeasons(activeSeasons.filter((reg) => reg !== season))
      // element.classList.add('filterInactive')
    } else {
      setActiveSeasons((activeSeasons) => [...activeSeasons, season])
      // element.classList.remove('filterInactive')
    }
    // console.log(element.classList)
  }

  const PosList = ({ members, pos }) => {
    const newMembers = members.filter((member) => member.position == pos)
    const filtered = newMembers
      .map((member) => {
        // accumulate numRaces across the activeSeasons before filtering so totals reflect all selected seasons
        // sum raceCount for all entries in `members` that match this sailor (by sailorID or name+pos) and are in an active season
        const key = member.sailorID ? `${member.sailorID}` : `${member.name}_${pos}`
        const numRaces = members.reduce((total, m) => {
          const mKey = m.sailorID ? `${m.sailorID}` : `${m.name}_${pos}`
          if (mKey === key && activeSeasons.includes(m.season) && m.teamID === teamName) {
            return total + (m.raceCount || 0)
          }
          return total
        }, 0)
        if (member.sailorID == 'carter-anderson') {
          console.log(member.season)
          console.log(numRaces)
        }
        return { ...member, numRaces }
      })
      .filter((member) => {
        // reset seen set when active seasons change
        if (!PosList._seenKey || PosList._seenKey !== activeSeasons.join(',')) {
          PosList._seen = new Set()
          PosList._seenKey = activeSeasons.join(',')
        }

        // require that the member has at least one of the active seasons
        let hasSeason = activeSeasons.includes(member.season)
        if (!hasSeason) return false

        // dedupe entries (by sailorID when present, otherwise name+pos)
        const key = member.sailorID ? `${member.sailorID}` : `${member.name}_${pos}`
        if (PosList._seen.has(key)) return false
        PosList._seen.add(key)

        return true
      })
      .sort((a, b) => {
        if (sort === 'ratio') {
        } else if (sort === 'races') {
          // use the accumulated numRaces
          return (b.numRaces || 0) - (a.numRaces || 0)
        } else if (sort === 'openrating') {
          return getRating(b, pos, 'open', 'fleet') - getRating(a, pos, 'open', 'fleet')
        } else if (sort === 'womenrating') {
          return getRating(b, pos, 'women', 'fleet') - getRating(a, pos, 'women', 'fleet')
        } else if (sort === 'teamrating') {
          return getRating(b, pos, 'open', 'team') - getRating(a, pos, 'open', 'team')
        } else if (sort === 'wteamrating') {
          return getRating(b, pos, 'women', 'team') - getRating(a, pos, 'women', 'team')
        }
        return 0
      })

    const openrankingMembers = filtered
      .slice(0)
      .sort((a, b) => getRating(b, pos, 'open') - getRating(a, pos, 'open'))
      .filter((member) => member.cross > 20 && member.outLinks > 70 && member.seasons[pos].includes(allSeasons.slice(-1)[0]))
      .slice(0, 3)

    const womenRankingMembers = filtered
      .slice(0)
      .sort((a, b) => getRating(b, pos, 'women') - getRating(a, pos, 'women'))
      .filter((member) => member.cross > 20 && member.outLinks > 70 && member.seasons[pos].includes(allSeasons.slice(-1)[0]) && (pos === 'skipper' ? member.wsr !== 1000 : member.wcr !== 1000))
      .slice(0, 2)

    console.log(filtered)

    return (
      <>
        <div className=''>
          {/*flexGrowChild */}
          <h2>{pos.slice(0, 1).toUpperCase() + pos.slice(1)}s</h2>
          <table className='raceByRaceTable' style={{ fontSize: '0.9rem' }}>
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Year</th>
                {/* <th></th> */}
                <th
                  className='tableColFit clickable'
                  style={{ minWidth: 68 }}
                  onClick={() => {
                    setSort('races')
                  }}>
                  Races{sort === 'races' ? <FaSortDown /> : ''}
                </th>
                <th
                  className=' tableColFit clickable'
                  // style={{ textAlign: 'right' }}
                  onClick={() => {
                    setSort('ratio')
                  }}>
                  Avg Win %{sort === 'ratio' ? <FaSortDown /> : ''}
                </th>
                <th
                  className=' tableColFit clickable'
                  // style={{ textAlign: 'right' }}
                  onClick={() => {
                    setSort('openrating')
                  }}>
                  FR{sort === 'openrating' ? <FaSortDown /> : ''}
                </th>
                <th
                  className=' tableColFit clickable'
                  // style={{ textAlign: 'right' }}
                  onClick={() => {
                    setSort('womenrating')
                  }}>
                  WFR{sort === 'womenrating' ? <FaSortDown /> : ''}
                </th>
                <th
                  className=' tableColFit clickable'
                  // style={{ textAlign: 'right' }}
                  onClick={() => {
                    setSort('teamrating')
                  }}>
                  TR{sort === 'teamrating' ? <FaSortDown /> : ''}
                </th>
                <th
                  className=' tableColFit clickable'
                  // style={{ textAlign: 'right' }}
                  onClick={() => {
                    setSort('wteamrating')
                  }}>
                  WTR{sort === 'wteamrating' ? <FaSortDown /> : ''}
                </th>
                <th> </th>
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
      </>
    )
  }

  return (
    <div>
      {loaded ? (
        <div style={{ padding: 15 }}>
          <div className='teamPageHeader'>
            <Link to={'/teams'} className='secondaryText'>
              {'<'} All Teams
            </Link>
            <div className='flexRowContainer' style={{ alignItems: 'center' }}>
              <img style={{ display: 'inline', maxHeight: '3rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[teamName]}.png`} />
              <h1 style={{ display: 'inline-block' }}>
                <a href={teamLink} target={1}>
                  {teamName}
                </a>
              </h1>
            </div>

            <Link to={{ pathname: `/teams`, search: `?region=${teamRegion}` }}>
              <span className='filterOption' style={{ backgroundColor: regionColors[teamRegion] }}>
                {teamRegion}
              </span>{' '}
              avg rating: {rating.toFixed(0)}
            </Link>
          </div>
          <div className='flexRowContainer flexWrap' style={{ marginLeft: 15 }}>
            {allSeasons
              .sort((a, b) => {
                if (parseInt(a.slice(1, 3)) - parseInt(b.slice(1, 3)) !== 0) {
                  return parseInt(a.slice(1, 3)) - parseInt(b.slice(1, 3))
                } else if (a.slice(0, 1) === 's' && b.slice(0, 1) === 'f') {
                  return -1
                } else {
                  return 1
                }
              })
              .map((season, index) => (
                <div key={index} className={`filterOption`} style={{ backgroundColor: activeSeasons.includes(season) ? 'var(--highlight1)' : '' }} onClick={(e) => toggleFilter(season, e.target)} onDoubleClick={() => setActiveSeasons([season])}>
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
          <div className='responsiveRowCol' style={{ padding: 15, flexWrap: 'wrap' }}>
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

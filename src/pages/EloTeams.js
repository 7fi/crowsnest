import { getAllTeams } from '../lib/apilib'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Loader from '../components/loader'
import { FaSortUp, FaSortDown } from 'react-icons/fa'
import useTeamCodes from '../lib/teamCodes'
import RatingNum from '../components/RatingNum'
import useRegionColors from '../lib/regionColors'
import { useMobileDetect } from '../lib/hooks'

export default function EloTeams() {
  const [teams, setTeams] = useState([])
  const [activeRegions, setActiveRegions] = useState([])
  const [allRegions, setAllRegions] = useState([])
  const [filterText, setFilterText] = useState('')
  const [reverse, setReverse] = useState(false)
  const [sort, setSort] = useState('top') // ['ratio', 'members', 'women', 'rating', 'team', 'womensteam']

  const [loaded, setLoaded] = useState(false)

  const [searchParams] = useSearchParams()
  const linkRegion = searchParams.get('region')
  const linkSort = searchParams.get('sort')

  const teamCodes = useTeamCodes()
  const RegionColors = useRegionColors()

  const isMobile = useMobileDetect()

  useEffect(() => {
    setLoaded(false)
    getAllTeams()
      .then((tempTeams) => {
        console.log(tempTeams)
        setTeams(tempTeams)
        let regions = tempTeams.map((team) => team.region).filter((value, index, self) => self.indexOf(value) === index)
        if (linkRegion == null) {
          setActiveRegions(regions)
        } else {
          setActiveRegions([linkRegion])
        }

        if (linkSort != null) {
          setSort(linkSort)
        }

        setAllRegions(regions)
      })
      .then(() => setLoaded(true))
  }, [])

  const toggleFilter = (region) => {
    if (activeRegions.indexOf(region) !== -1) {
      setActiveRegions(activeRegions.filter((reg) => reg !== region))
    } else {
      setActiveRegions((activeRegions) => [...activeRegions, region])
    }
  }
  const filter = (e) => {
    setFilterText(e.target.value)
  }

  const filtered = teams
    .filter((team) => {
      if (filterText !== '') {
        return team.teamName.toLowerCase().includes(filterText.toLowerCase())
      }
      return true
    })
    .filter((team) => {
      let temp = true
      // if (byRatio || byMembers) {
      //   temp = team.memberCount > 0
      // }
      return activeRegions.indexOf(team.region) !== -1 && temp
    })
    .sort((a, b) => {
      if (reverse) [a, b] = [b, a]
      if (sort === 'ratio') return b.avgRatio - a.avgRatio
      else if (sort === 'members') return b.memberCount - a.memberCount
      else if (sort === 'rating') return b.avgRating - a.avgRating
      else if (sort === 'women') return b.topWomenRating - a.topWomenRating
      else if (sort === 'team') return b.topTeamRating - a.topTeamRating
      else if (sort === 'womensteam') return b.topWomenTeamRating - a.topWomenTeamRating
      // sort === 'top'
      else return b.topFleetRating - a.topFleetRating
    })

  return (
    // style={{ position: 'fixed', overflowY: 'hidden', zIndex: 100 }}
    <div>
      {loaded ? (
        <>
          <div className='flexRowContainer filterHeader'>
            <input className='flexGrowChild' placeholder='Search for a team' onChange={filter} />
            <div className='flexRowContainer'>
              {Object.keys(RegionColors).map((region, i) => (
                <button key={i} style={{ backgroundColor: activeRegions.indexOf(region) !== -1 ? RegionColors[region] : '' }} className={`filterOption ${activeRegions.indexOf(region) !== -1 ? '' : 'filterInactive'}`} onClick={() => toggleFilter(region)} onDoubleClick={() => setActiveRegions([region])}>
                  {region}
                </button>
              ))}
              <button className='filterOption filterInactive' onClick={() => setActiveRegions(allRegions)}>
                Show all
              </button>
              <button className='filterOption filterInactive' onClick={() => setActiveRegions([])}>
                Hide all
              </button>
            </div>
          </div>
          {isMobile ? <MobileTeams reverse={reverse} setReverse={setReverse} sort={sort} setSort={setSort} filtered={filtered} /> : <DesktopTeams reverse={reverse} setReverse={setReverse} sort={sort} setSort={setSort} filtered={filtered} />}
        </>
      ) : (
        <Loader show={!loaded} />
      )}
    </div>
  )
}

const MobileTeams = ({ reverse, setReverse, filtered, sort, setSort }) => {
  const teamCodes = useTeamCodes()
  const RegionColors = useRegionColors()
  const navigate = useNavigate()

  const temp = useRef(null)

  return (
    <>
      <div className='teamTableContainer' style={{ maxWidth: '100%' }} ref={temp}>
        {filtered.map((team, index) => (
          <MobileTeam key={index} team={team} index={index} teamCodes={teamCodes} RegionColors={RegionColors} navigate={navigate} sort={sort} />
        ))}
      </div>
      <MobileControls sort={sort} setSort={setSort} reverse={reverse} setReverse={setReverse} temp={temp} />
    </>
  )
}

const MobileTeam = ({ team, index, teamCodes, RegionColors, navigate, sort }) => {
  const ratings = { top: team.topFleetRating, women: team.topWomenRating, team: team.topTeamRating, womensteam: team.topWomenTeamRating, rating: team.avgRating, members: team.memberCount }
  const iconSrcs = { top: 'OpenFleetIcon.png', women: 'WomensFleetIcon.png', team: 'OpenTeamIcon.png', womensteam: 'WomensTeamIcon.png' }

  return (
    <div key={index} className='mobileTeamRow' onClick={() => navigate(`/teams/${team.teamID}`)}>
      <div style={{ padding: '0.5rem', width: '2rem' }}>{index + 1}</div>
      <img style={{ display: 'inline', maxHeight: '2rem', minWidth: '3rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[team.teamID]}.png`} />
      <div className='flexCol' style={{ width: '100%' }}>
        <div className='flexRowContainer' style={{ alignItems: 'center', width: '100%' }}>
          <div className='filterOption' style={{ backgroundColor: RegionColors[team.region] }}>
            {team.region}
          </div>
          <strong>{team.teamName}</strong>
          {/* <span>{team.memberCount} members</span> */}
          <div className='flexGrowChild'></div>
          <div className='flexRowCentered'>
            <img src={iconSrcs[sort]} style={{ height: '1.5rem' }} />
            {ratings[sort]}
          </div>
        </div>
        {/* <div className='flexRowContainer'>
        </div> */}
      </div>
    </div>
  )
}

// const MobileTeam = ({ team, index, teamCodes, RegionColors, navigate }) => {
//   return (
//     <div key={index} className='mobileTeamRow' onClick={() => navigate(`/teams/${team.teamID}`)}>
//       <div style={{ padding: '0.5rem' }}>{index + 1}</div>
//       <img style={{ display: 'inline', maxHeight: '2rem', minWidth: '3rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[team.teamID]}.png`} />
//       <div className='flexCol'>
//         <div className='flexRowContainer' style={{ alignItems: 'center' }}>
//           <div className='filterOption' style={{ backgroundColor: RegionColors[team.region] }}>
//             {team.region}
//           </div>
//           <strong>{team.teamName}</strong>
//           <span>{team.memberCount} members</span>
//         </div>
//         <div className='flexRowContainer'>
//           <div className='flexRowCentered'>
//             <img src='OpenFleetIcon.png' style={{ height: '1.5rem' }} />
//             {team.topFleetRating}
//           </div>
//           <div className='flexRowCentered'>
//             <img src='WomensFleetIcon.png' style={{ height: '1.5rem' }} />
//             {team.topWomenRating}
//           </div>
//           <div className='flexRowCentered'>
//             <img src='OpenTeamIcon.png' style={{ height: '1.5rem' }} />
//             {team.topTeamRating}
//           </div>
//           <div className='flexRowCentered'>
//             <img src='WomensTeamIcon.png' style={{ height: '1.5rem' }} />
//             {team.topWomenTeamRating}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

const MobileControls = ({ sort, setSort, reverse, setReverse, temp }) => {
  const scrollToTop = () => {
    if (temp.current) {
      temp.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
    }
  }

  return (
    <div className='mobileControlsContainer'>
      <div className='mobileControlsGrid'>
        <button
          onClick={() => {
            setReverse(false)
            if (sort == 'womensteam') {
              setSort('women')
            } else {
              setSort('top')
            }
          }}
          style={{ backgroundColor: sort == 'top' || sort == 'women' ? 'var(--border)' : 'var(--bg)' }}>
          <img src={sort == 'women' || sort == 'womensteam' ? 'WomensFleetIcon.png' : 'OpenFleetIcon.png'} style={{ height: '1.5rem' }} />
          Fleet
        </button>
        <button
          onClick={() => {
            setReverse(false)
            if (sort == 'women' || sort == 'womensteam') {
              setSort('womensteam')
            } else {
              setSort('team')
            }
          }}
          style={{ backgroundColor: sort == 'team' || sort == 'womensteam' ? 'var(--border)' : 'var(--bg)' }}>
          <img src={sort == 'women' || sort == 'womensteam' ? 'WomensTeamIcon.png' : 'OpenTeamIcon.png'} style={{ height: '1.5rem' }} />
          Team
        </button>
        <button
          onClick={() => {
            setReverse(false)
            setSort(sort === 'rating' ? 'top' : 'rating')
          }}
          style={{ backgroundColor: sort == 'rating' ? 'var(--border)' : 'var(--bg)' }}>
          Avg
        </button>
        <button
          onClick={() => {
            if (sort === 'members') {
              if (!reverse) {
                setReverse(true)
              } else {
                setSort('top')
                setReverse(false)
              }
            } else {
              setSort('members')
              setReverse(false)
            }
          }}
          style={{ backgroundColor: sort == 'members' ? 'var(--border)' : 'var(--bg)' }}>
          Members
        </button>
        <button
          onClick={() => {
            setReverse(false)
            if (sort == 'team' || sort == 'womensteam') {
              setSort('team')
            } else {
              setSort('top')
            }
          }}
          style={{ backgroundColor: sort == 'top' || sort == 'team' ? 'var(--border)' : 'var(--bg)' }}>
          Open
        </button>
        <button
          onClick={() => {
            setReverse(false)
            if (sort == 'team' || sort == 'womensteam') {
              setSort('womensteam')
            } else {
              setSort('women')
            }
          }}
          style={{ backgroundColor: sort == 'women' || sort == 'womensteam' ? 'var(--border)' : 'var(--bg)' }}>
          Women's
        </button>

        <button onClick={() => scrollToTop()} style={{ backgroundColor: 'var(--bg)', gridArea: '2 / 3 / 2 / 5' }}>
          Back to top
        </button>
      </div>
    </div>
  )
}

const DesktopTeams = ({ reverse, setReverse, filtered, sort, setSort }) => {
  const navigate = useNavigate()
  const temp = useRef(null)

  const teamCodes = useTeamCodes()
  const RegionColors = useRegionColors()

  const scrollToTop = () => {
    if (temp.current) {
      temp.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
    }
  }

  return (
    <div className='teamTableContainer'>
      <table className='raceByRaceTable teamsTable' ref={temp}>
        <thead>
          <tr>
            <th style={{ minWidth: 40, textAlign: 'right' }}></th>
            <th style={{ minWidth: 50 }}> </th>
            <th>Name</th>
            <th>Conference</th>
            <th
              className='tableColFit tooltip'
              onClick={() => {
                setReverse(false)
                setSort('top')
              }}
              style={{ minWidth: 80, textAlign: 'right' }}>
              {sort === 'top' ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}
              Open
              <span className='tooltiptext'>Takes avg the top 3 from each pos</span>
            </th>
            <th
              className='tableColFit tooltip'
              onClick={() => {
                setReverse(false)
                setSort(sort === 'women' ? 'top' : 'women')
              }}
              style={{ minWidth: 95, textAlign: 'right' }}>
              {sort === 'women' ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}
              Women's
              <span className='tooltiptext'>Takes avg the top 2 from each pos</span>
            </th>
            <th
              className='tableColFit tooltip'
              onClick={() => {
                setReverse(false)
                setSort(sort === 'team' ? 'top' : 'team')
              }}
              style={{ minWidth: 130, textAlign: 'right' }}>
              {sort === 'team' ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}
              Team Racing
              <span className='tooltiptext'>Takes avg the top 3 from each pos</span>
            </th>
            <th
              className='tableColFit tooltip'
              onClick={() => {
                setReverse(false)
                setSort(sort === 'womensteam' ? 'top' : 'womensteam')
              }}
              style={{ minWidth: 125, textAlign: 'right' }}>
              {sort === 'womensteam' ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}
              Women's TR
              <span className='tooltiptext'>Takes avg the top 3 from each pos</span>
            </th>
            <th
              className='tableColFit tooltip'
              onClick={() => {
                setReverse(false)
                setSort(sort === 'rating' ? 'top' : 'rating')
              }}
              style={{ minWidth: 110, textAlign: 'right' }}>
              <span className='tooltiptext'>Avg Rating of all sailors</span>
              {sort === 'rating' ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}Avg Rating
            </th>
            <th
              style={{ minWidth: 113, textAlign: 'right' }}
              className='tableColFit'
              onClick={() => {
                setReverse(false)
                setSort(sort === 'ratio' ? 'top' : 'ratio')
              }}>
              {sort === 'ratio' ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}Percentage
            </th>
            <th
              style={{ minWidth: 80, textAlign: 'right' }}
              className='tableColFit'
              onClick={() => {
                if (sort === 'members') {
                  if (!reverse) {
                    setReverse(true)
                  } else {
                    setSort('top')
                    setReverse(false)
                  }
                } else {
                  setSort('members')
                  setReverse(false)
                }
              }}>
              {sort === 'members' ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}
              Sailors
            </th>

            <th></th>
          </tr>
        </thead>
        <tbody className='teamsTable'>
          {filtered.length > 0 ? (
            filtered.map((team, index) => (
              <tr key={index} className='clickable' onClick={() => navigate(`/teams/${team.teamID}`)}>
                <td className='tableColFit tdRightBorder'>
                  {(sort === 'rating' ? team.avgRating !== 0 : sort === 'women' ? team.topWomenRating !== 0 : sort === 'members' ? team.memberCount !== 0 : sort === 'ratio' ? team.avgRatio !== 0 : sort === 'team' ? team.topTeamRating !== 0 : team.topFleetRating !== 0) ? (
                    index + 1
                  ) : (
                    <span className='secondaryText' style={{ textAlign: 'center' }}>
                      ~
                    </span>
                  )}
                </td>
                <td className='tableColFit'>
                  <img style={{ display: 'inline', maxHeight: '2rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[team.teamID]}.png`} />
                </td>

                <td className='tableColFit'>{team.teamName}</td>
                <td className=''>
                  <div className='filterOption' style={{ backgroundColor: RegionColors[team.region] }}>
                    {team.region}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <RatingNum ratingNum={team.topFleetRating} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <RatingNum ratingNum={team.topWomenRating} type={'women'} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <RatingNum ratingNum={team.topTeamRating} type={'open'} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <RatingNum ratingNum={team.topWomenTeamRating} type={'women'} />
                </td>
                <td style={{ textAlign: 'right' }}>{team.avgRating.toFixed(0)}</td>

                <td style={{ textAlign: 'right' }}>
                  <div className='ratioBarBg'>
                    <div className='ratioBar' style={{ width: team.avgRatio * 100 }}>
                      <span>{(team.avgRatio * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </td>
                <td className='' style={{ textAlign: 'right' }}>
                  {team.memberCount}
                </td>

                <td></td>
              </tr>
            ))
          ) : (
            <tr>
              <span style={{ width: '100%', position: 'absolute', textAlign: 'center', margin: 20 }}>Please select at least one conference!</span>
            </tr>
          )}
        </tbody>
      </table>
      <button
        className='scrollButton'
        onClick={() => {
          scrollToTop()
        }}>
        Back to top
      </button>
      {/* <ScrollButton element={temp} /> */}
    </div>
  )
}

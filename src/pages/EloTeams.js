import { getAllTeams } from '../lib/firebase'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Loader from '../components/loader'
import { FaArrowDown, FaSortUp, FaSortDown } from 'react-icons/fa'
import useTeamCodes from '../lib/teamCodes'
import ScrollButton from '../components/ScrollToTop'

export default function EloTeams() {
  const [teams, setTeams] = useState([])
  const [activeRegions, setActiveRegions] = useState([])
  const [allRegions, setAllRegions] = useState([])
  const [filterText, setFilterText] = useState('')
  const [reverse, setReverse] = useState(false)
  const [byRatio, setByRatio] = useState(false)
  const [byMembers, setByMembers] = useState(false)
  const [byRating, setByRating] = useState(false)
  const [byWomen, setByWomen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const temp = useRef(null)

  const teamCodes = useTeamCodes()
  const RegionColors = {
    NEISA: '#d12e44',
    NWICSA: '#ed841a',
    MCSA: '#edbc1a',
    SEISA: '#82b84b',
    SAISA: '#32b8ad',
    PCCSC: '#4A90E2',
    MAISA: '#244a7d',
    GUEST: '#ff7996',
  }
  // const RegionColors = {
  //   PCCSC: '#ed841a',
  //   NEISA: '#244a7d',
  //   NWICSA: '#4A90E2',
  //   SEISA: '#82b84b',
  //   MCSA: '#d12e44',
  //   SAISA: '#edbc1a',
  //   MAISA: '#32b8ad',
  //   GUEST: '#ff7996',
  // }

  useEffect(() => {
    setLoaded(false)
    getAllTeams()
      .then((tempTeams) => {
        let teams = tempTeams.data.teams
        setTeams(teams)
        let regions = tempTeams.data.teams.map((team) => team.region).filter((value, index, self) => self.indexOf(value) === index)
        setActiveRegions(regions)
        setAllRegions(regions)
      })
      .then(() => setLoaded(true))
  }, [])
  const navigate = useNavigate()

  const toggleFilter = (region) => {
    if (activeRegions.indexOf(region) != -1) {
      setActiveRegions(activeRegions.filter((reg) => reg != region))
    } else {
      setActiveRegions((activeRegions) => [...activeRegions, region])
    }
  }
  const filter = (e) => {
    setFilterText(e.target.value)
  }

  const scrollToTop = () => {
    if (temp.current) {
      temp.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
    }
  }

  const filtered = teams
    .filter((team) => {
      if (filterText != '') {
        return team.name.toLowerCase().includes(filterText.toLowerCase())
      }
      return true
    })
    .filter((team) => {
      let temp = true
      // if (byRatio || byMembers) {
      //   temp = team.memberCount > 0
      // }
      return activeRegions.indexOf(team.region) != -1 && temp
    })
    .sort((a, b) => {
      if (reverse) [a, b] = [b, a]
      if (byRatio) return b.avgRatio - a.avgRatio
      else if (byMembers) return b.memberCount - a.memberCount
      else if (byRating) return b.avg - a.avg
      else if (byWomen) return b.topWomenRating - a.topWomenRating
      else return b.topRating - a.topRating
    })

  return (
    <div>
      <div className='flexRowContainer filterHeader'>
        <input className='flexGrowChild' placeholder='Search for a team' onChange={filter} />
        <div className='flexRowContainer'>
          {Object.keys(RegionColors).map((region, i) => (
            <button key={i} style={{ backgroundColor: activeRegions.indexOf(region) != -1 ? RegionColors[region] : '' }} className={`filterOption ${activeRegions.indexOf(region) != -1 ? '' : 'filterInactive'}`} onClick={() => toggleFilter(region)}>
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
      {loaded ? (
        <div className='teamTableContainer' style={{ position: 'fixed', zIndex: 100 }}>
          <table className='raceByRaceTable teamsTable' ref={temp}>
            <thead>
              <tr>
                <th></th>
                <th style={{ minWidth: 50 }}> </th>
                <th>Name</th>
                <th>Conference</th>
                <th
                  className='tableColFit tooltip'
                  onClick={() => {
                    // if (!byMembers && !byRatio && !byRating && !byWomen) {
                    //   setReverse(!reverse)
                    // }
                    setReverse(false)
                    setByWomen(false)
                    setByRatio(false)
                    setByMembers(false)
                    setByRating(false)
                  }}
                  style={{ minWidth: 185, textAlign: 'right' }}>
                  {!byRatio && !byMembers && !byRating && !byWomen ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}
                  Open Rating
                  <span className='tooltiptext'>Takes avg the top 3 from each pos</span>
                </th>
                <th
                  className='tableColFit tooltip'
                  onClick={() => {
                    // if (byWomen) {
                    //   setReverse(!reverse)
                    // }
                    setReverse(false)
                    setByWomen(!byWomen)
                    setByRatio(false)
                    setByMembers(false)
                    setByRating(false)
                  }}
                  style={{ minWidth: 185, textAlign: 'right' }}>
                  {byWomen ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}
                  Women's Rating
                  <span className='tooltiptext'>Takes avg the top 2 from each pos</span>
                </th>
                <th
                  className='tableColFit tooltip'
                  onClick={() => {
                    // if (byRating) {
                    //   setReverse(!reverse)
                    // }
                    setReverse(false)
                    setByWomen(false)
                    setByRatio(false)
                    setByMembers(false)
                    setByRating(!byRating)
                  }}
                  style={{ minWidth: 185, textAlign: 'right' }}>
                  <span className='tooltiptext'>Avg Rating of all sailors</span>
                  Avg Rating
                  {byRating ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}
                </th>
                <th
                  className='tableColFit tooltip'
                  onClick={() => {
                    // if (byRatio) {
                    //   setReverse(!reverse)
                    // }
                    setReverse(false)
                    setByWomen(false)
                    setByRatio(!byRatio)
                    setByMembers(false)
                    setByRating(false)
                  }}>
                  Percentage
                  <span className='tooltiptext'>removes teams with less than 6 active members</span>
                  {byRatio ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}
                </th>
                <th
                  className='tableColFit tooltip'
                  onClick={() => {
                    if (byMembers) {
                      if (!reverse) {
                        setReverse(true)
                      } else {
                        setByMembers(false)
                        setReverse(false)
                      }
                    } else {
                      setByMembers(true)
                      setReverse(false)
                    }
                    setByWomen(false)
                    setByRatio(false)
                    setByRating(false)
                  }}>
                  Members
                  <span className='tooltiptext'>removes teams with less than 6 active members</span>
                  {byMembers ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}
                </th>

                <th></th>
              </tr>
            </thead>
            <tbody className='teamsTable'>
              {filtered.length > 0 ? (
                filtered.map((team, index) => (
                  <tr key={index} className='clickable' onClick={() => navigate(`/rankings/team/${team.name}`)}>
                    <td className='tableColFit tdRightBorder'>
                      {(byRating ? team.avg != 0 : byWomen ? team.topWomenRating != 0 : byMembers ? team.memberCount != 0 : byRatio ? team.avgRatio != 0 : team.topRating != 0) ? (
                        index + 1
                      ) : (
                        <span className='secondaryText' style={{ textAlign: 'center' }}>
                          ~
                        </span>
                      )}
                    </td>
                    <td className='tableColFit'>
                      <div className='flexRowContainer sailorNameRow'>
                        <img style={{ display: 'inline', maxHeight: '3rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[team.name]}.png`} />
                      </div>
                    </td>

                    <td className='tableColFit'>{team.name}</td>
                    <td className='tableColFit'>
                      <div className='filterOption' style={{ backgroundColor: RegionColors[team.region] }}>
                        {team.region}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>{team.topRating.toLocaleString().split('.')[0]}</td>
                    <td style={{ textAlign: 'right' }}>{team.topWomenRating.toLocaleString().split('.')[0]}</td>
                    <td style={{ textAlign: 'right' }}>{team.avg.toLocaleString().split('.')[0]}</td>
                    <td style={{ textAlign: 'right' }}>{(team.avgRatio * 100).toFixed(1)}</td>
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
      ) : (
        <Loader show={!loaded} />
      )}
    </div>
  )
}

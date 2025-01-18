import { getAllTeams } from '../lib/firebase'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Loader from '../components/loader'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'
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
  const [loaded, setLoaded] = useState(false)

  const temp = useRef(null)

  const teamCodes = useTeamCodes()
  const RegionColors = {
    PCCSC: '#ed841a',
    NEISA: '#244a7d',
    NWICSA: '#4A90E2',
    SEISA: '#82b84b',
    MCSA: '#d12e44',
    SAISA: '#edbc1a',
    MAISA: '#32b8ad',
    GUEST: '#ff7996',
  }
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
    console.log('bruh')
    if (temp.current) {
      temp.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
    }
  }

  return (
    <div>
      <div className='flexRowContainer filterHeader'>
        <input className='flexGrowChild' placeholder='Ex: MIT' onChange={filter} />
        <div className='flexRowContainer'>
          {allRegions.map((region, i) => (
            <button key={i} style={{ backgroundColor: activeRegions.indexOf(region) != -1 ? RegionColors[region] : '' }} className={`filterOption ${activeRegions.indexOf(region) != -1 ? '' : 'filterInactive'}`} onClick={() => toggleFilter(region)}>
              {region}
            </button>
          ))}
          <button className='filterOption filterInactive' onClick={() => setActiveRegions(allRegions)}>
            Enable all
          </button>
          <button className='filterOption filterInactive' onClick={() => setActiveRegions([])}>
            Disable all
          </button>
        </div>
      </div>
      {loaded ? (
        <div className='teamTableContainer'>
          <table className='raceByRaceTable teamsTable' ref={temp}>
            <thead>
              <tr>
                <th></th>
                <th style={{ minWidth: 50 }}> </th>
                <th>Name</th>
                <th>Region</th>
                <th
                  className='tableColFit tooltip'
                  onClick={() => {
                    if (byMembers) {
                      setReverse(!reverse)
                    }
                    setByRatio(false)
                    setByMembers(true)
                    setByRating(false)
                  }}>
                  Members
                  <span className='tooltiptext'>removes teams with less than 6 active members</span>
                  {byMembers ? reverse ? <FaArrowUp /> : <FaArrowDown /> : <></>}
                </th>
                <th
                  className='tableColFit tooltip'
                  onClick={() => {
                    if (byRatio) {
                      setReverse(!reverse)
                    }
                    setByRatio(true)
                    setByMembers(false)
                    setByRating(false)
                  }}>
                  Percentage
                  <span className='tooltiptext'>removes teams with less than 6 active members</span>
                  {byRatio ? reverse ? <FaArrowUp /> : <FaArrowDown /> : <></>}
                </th>
                <th
                  className='tableColFit tooltip'
                  onClick={() => {
                    if (byRating) {
                      setReverse(!reverse)
                    }
                    setByRatio(false)
                    setByMembers(false)
                    setByRating(true)
                  }}>
                  <span className='tooltiptext'>Avg Rating of all sailors</span>
                  Avg Rating
                  {byRating ? reverse ? <FaArrowUp /> : <FaArrowDown /> : <></>}
                </th>
                <th
                  className='tableColFit tooltip'
                  onClick={() => {
                    if (!byMembers && !byRatio && !byRating) {
                      setReverse(!reverse)
                    }
                    setByRatio(false)
                    setByMembers(false)
                    setByRating(false)
                  }}>
                  Top Avg Rating
                  <span className='tooltiptext'>Takes avg the top 4 from each pos</span>
                  {!byRatio && !byMembers && !byRating ? reverse ? <FaArrowUp /> : <FaArrowDown /> : <></>}
                </th>

                <th></th>
              </tr>
            </thead>
            <tbody className='teamsTable'>
              {teams
                .filter((team) => {
                  if (filterText != '') {
                    return team.name.toLowerCase().includes(filterText.toLowerCase())
                  }
                  return true
                })
                .filter((team) => {
                  let temp = true
                  if (byRatio || byMembers) {
                    temp = team.memberCount > 5
                  }
                  return activeRegions.indexOf(team.region) != -1 && temp
                })
                .sort((a, b) => {
                  if (reverse) [a, b] = [b, a]
                  if (byRatio) return b.avgRatio - a.avgRatio
                  else if (byMembers) return b.memberCount - a.memberCount
                  else if (byRating) return b.avg - a.avg
                  else return b.topRating - a.topRating
                })
                .map((team, index) => (
                  <tr key={index} className='clickable' onClick={() => navigate(`/rankings/team/${team.name}`)}>
                    <td className='tableColFit tdRightBorder'>{index + 1}</td>
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
                    <td className='' style={{ textAlign: 'right' }}>
                      {team.memberCount}
                    </td>
                    <td style={{ textAlign: 'right' }}>{(team.avgRatio * 100).toFixed(1)}</td>
                    <td style={{ textAlign: 'right' }}>{team.avg.toLocaleString().split('.')[0]}</td>
                    <td style={{ textAlign: 'right' }}>{team.topRating.toLocaleString().split('.')[0]}</td>
                    <td></td>
                  </tr>
                ))}
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

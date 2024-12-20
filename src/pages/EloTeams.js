import { getAllTeams } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

export default function EloTeams() {
  const [teams, setTeams] = useState([])
  const [activeRegions, setActiveRegions] = useState([])
  const [allRegions, setAllRegions] = useState([])
  const [filterText, setFilterText] = useState('')

  useEffect(() => {
    getAllTeams().then((tempTeams) => {
      console.log(tempTeams)
      let teams = tempTeams.data.teams
      setTeams(teams)
      let regions = tempTeams.data.teams.map((team) => team.region).filter((value, index, self) => self.indexOf(value) === index)
      setActiveRegions(regions)
      setAllRegions(regions)
    })
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

  return (
    <div style={{ padding: 15 }}>
      <div className='flexRowContainer'>
        <input className='flexGrowChild' placeholder='Ex: MIT' onChange={filter} />
        <div className='flexRowContainer'>
          {allRegions.map((region) => (
            <button className={`filterOption ${activeRegions.indexOf(region) != -1 ? '' : 'filterInactive'}`} onClick={() => toggleFilter(region)}>
              {region}
            </button>
          ))}
          <button className='filterOption' onClick={() => setActiveRegions(allRegions)}>
            Enable all
          </button>
          <button className='filterOption' onClick={() => setActiveRegions([])}>
            Disable all
          </button>
        </div>
      </div>
      <table className='raceByRaceTable'>
        <thead>
          <th></th>
          <th>Name</th>
          <th>Region</th>
          <th style={{ textAlign: 'right' }}>Avg Rating</th>
        </thead>
        <tbody>
          {teams
            .filter((team) => {
              if (filterText != '') {
                return team.name.toLowerCase().includes(filterText.toLowerCase())
              }
              return true
            })
            .filter((team) => activeRegions.indexOf(team.region) != -1)
            .sort((a, b) => b.avg - a.avg)
            .map((team, index) => (
              <tr onClick={() => navigate(`/crowsnest/rankings/team/${team.name}`)} style={{ cursor: 'pointer' }}>
                <td className='tableColFit tdRightBorder'>{index + 1}</td>
                <td className='tableColFit'>{team.name}</td>
                <td className='tableColFit'>{team.region}</td>
                <td className='' style={{ textAlign: 'right' }}>
                  {team.avg.toLocaleString().split('.')[0]}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

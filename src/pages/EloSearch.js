import { useEffect, useState } from 'react'
import { getAllSailors } from '../lib/firebase'
import { Link, useNavigate } from 'react-router-dom'
import useTeamCodes from '../lib/teamCodes'

export default function EloSearch() {
  const [sailors, setSailors] = useState({})
  const teamCodes = useTeamCodes()
  const [filterText, setFilterText] = useState('')
  const [useImg, setUseImg] = useState(false)

  const filter = (e) => {
    setFilterText(e.target.value)
  }

  useEffect(() => {
    getAllSailors(false).then((sailors) => {
      setSailors(sailors)
    })
  }, [])

  const nav = useNavigate()

  return (
    <div style={{ margin: 15 }}>
      <div className='responsiveRowCol'>
        <input className='flexGrowChild' style={{ minWidth: '10rem', maxWidth: '50%', height: '2rem' }} placeholder='Search by name / team *' onChange={filter} />
        <span className='secondaryText'> * only includes sailors in f24</span>
        <input
          type='checkbox'
          onChange={(e) => {
            setUseImg(e.target.checked)
            console.log(e.target.checked)
          }}
        />
        <div className='flexRowContainer flexWrap'>
          <Link to={'/rankings/skipper'}>
            <button className='buttonBG'>Top Open Skippers</button>
          </Link>
          <Link to={'/rankings/crew'}>
            <button className='buttonBG'>Top Open Crews</button>
          </Link>
          <Link to={'/rankings/skipper/women'}>
            <button className='buttonBG'>Top Women's Skippers</button>
          </Link>
          <Link to={'/rankings/crew/women'}>
            <button className='buttonBG'>Top Women's Crews</button>
          </Link>
        </div>
      </div>
      <table className='raceByRaceTable teamsTable'>
        <thead>
          <tr>
            {useImg ? <th style={{ minWidth: 50 }}></th> : <></>}
            <th>Name</th>
            <th>Team</th>
            <th>Year</th>
          </tr>
        </thead>
        <tbody className='teamsTable'>
          {Object.keys(sailors)
            .filter((sailor) => {
              if (filterText != '') {
                return sailor.toLowerCase().includes(filterText.toLowerCase()) || sailors[sailor].team.toLowerCase().includes(filterText.toLowerCase())
              }
              return true
            })
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            .map((sailor, index) => (
              <tr key={index} onClick={() => nav(`/rankings/${sailor}`)}>
                {useImg ? (
                  <td className='tableColFit'>
                    <div className='flexRowContainer sailorNameRow'>
                      <img style={{ display: 'inline', maxHeight: '3rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[sailors[sailor].team]}.png`} />
                    </div>
                  </td>
                ) : (
                  <></>
                )}
                <td>{sailors[sailor].name}</td>
                <td>{sailors[sailor].team}</td>
                <td>20{sailors[sailor].year.toString().split(' ')[0].slice(-2)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

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
    getAllSailors().then((sailors) => {
      setSailors(sailors)
    })
  }, [])
  const nav = useNavigate()

  return (
    <div>
      <input className='flexGrowChild' style={{ width: '30rem' }} placeholder='Search by name / team *' onChange={filter} />
      <input
        type='checkbox'
        onChange={(e) => {
          setUseImg(e.target.checked)
          console.log(e.target.checked)
        }}
      />
      <span className='secondaryText'> * only includes sailors in f24</span>
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
                <td>{sailor}</td>
                <td>{sailors[sailor].team}</td>
                <td>{sailors[sailor].year}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

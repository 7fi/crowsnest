import { useState } from 'react'
export default function RegattaData({ seasons, teams, regattas }) {
  const [season, setSeason] = useState('f22')
  const [team, setTeam] = useState('')
  const [regatta, setRegatta] = useState('')

  return (
    <>
      <div className='contentBox'>
        <select onChange={(e) => setSeason(e.target.value)}>
          {[...Array(seasons.length)].map((e, i) => (
            <option value={seasons[i]}>{seasons[i]}</option>
          ))}
        </select>
        <select onChange={(e) => setTeam(e.target.value)}>
          {[...Array(teams.length)].map((e, i) => (
            <option value={teams[i]}>{teams[i]}</option>
          ))}
        </select>
        <select onChange={(e) => setRegatta(e.target.value)}>
          {[...Array(regattas.length)].map((e, i) => (
            <option value={regattas[i]}>{regattas[i]}</option>
          ))}
        </select>
      </div>
    </>
  )
}

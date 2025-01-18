import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Rivals({ rivals, pos }) {
  const posRivals = rivals[pos]
  console.log(posRivals)
  const [byRaces, setByRaces] = useState(true)
  const [reverse, setReverse] = useState(false)
  const nav = useNavigate()

  if (posRivals == undefined) {
    return <></>
  }
  return (
    <div className='flexGrowChild'>
      <h2>
        Season Rivals: {pos} <span className='secondaryText'>(scroll for more)</span>
      </h2>
      <div className='raceByRaceBox'>
        <table className='raceByRaceTable'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Team</th>
              <th
                onClick={() => {
                  if (byRaces) setReverse(!reverse)
                  setByRaces(true)
                }}
                style={{ textDecoration: byRaces ? 'underline' : 'none' }}>
                Races
              </th>
              <th
                onClick={() => {
                  if (!byRaces) setReverse(!reverse)
                  setByRaces(false)
                }}
                style={{ textDecoration: !byRaces ? 'underline' : 'none' }}>
                Win %
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(posRivals)
              .sort((a, b) => {
                if (reverse) [a, b] = [b, a]
                let aRaces = Object.values(posRivals[a]['races']).reduce((acc, val) => acc + val, 0)
                let aWins = Object.values(posRivals[a]['wins']).reduce((acc, val) => acc + val, 0)
                let bRaces = Object.values(posRivals[b]['races']).reduce((acc, val) => acc + val, 0)
                let bWins = Object.values(posRivals[b]['wins']).reduce((acc, val) => acc + val, 0)
                if (byRaces || bWins / bRaces == aWins / aRaces) return bRaces - aRaces
                return bWins / bRaces - aWins / aRaces
              })
              .map((rival, index) => (
                <tr key={index} onClick={() => nav(`/rankings/${rival}`)} className='clickable'>
                  <td>{posRivals[rival].name}</td>
                  <td>{posRivals[rival].team}</td>
                  <td>{Object.values(posRivals[rival]['races']).reduce((acc, val) => acc + val, 0)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className='ratioBarBg'>
                      <div className='ratioBar' style={{ width: (Object.values(posRivals[rival]['wins']).reduce((acc, val) => acc + val, 0) / Object.values(posRivals[rival]['races']).reduce((acc, val) => acc + val, 0)) * 95 }}>
                        <span>{((Object.values(posRivals[rival]['wins']).reduce((acc, val) => acc + val, 0) / Object.values(posRivals[rival]['races']).reduce((acc, val) => acc + val, 0)) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

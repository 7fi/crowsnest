import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Rivals({ rivals, pos }) {
  const posRivals = rivals[pos]
  const [byRaces, setByRaces] = useState(true)
  const [reverse, setReverse] = useState(false)
  const [allSeasons, setAllSeasons] = useState([])
  const [activeSeasons, setActiveSeasons] = useState(['f24'])
  const nav = useNavigate()

  useEffect(() => {
    if (posRivals != undefined) {
      const allSeasons = Object.keys(posRivals).flatMap((rival) => [...Object.keys(posRivals[rival]['races'])])
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
    }
  }, [rivals, pos])

  if (posRivals == undefined) {
    return <></>
  }

  const toggleFilter = (season, element) => {
    if (activeSeasons.indexOf(season) != -1) {
      if (activeSeasons.length > 1) setActiveSeasons(activeSeasons.filter((reg) => reg != season))
    } else {
      setActiveSeasons((activeSeasons) => [...activeSeasons, season])
    }
  }

  return (
    <div className="flexGrowChild">
      <div className="flexRowContainer" style={{ alignItems: 'center' }}>
        <h2>
          Season Rivals: {pos} <span className="secondaryText">(scroll for more)</span>
        </h2>
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
      </div>
      <div className="raceByRaceBox">
        <table className="raceByRaceTable">
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
              .filter(
                (rival) =>
                  Object.keys(posRivals[rival]['wins']).reduce((sum, key) => {
                    if (activeSeasons.includes(key)) {
                      sum += posRivals[rival]['races'][key]
                    }
                    return sum
                  }, 0) > 0
              )
              .sort((a, b) => {
                if (reverse) [a, b] = [b, a]
                let aRaces = Object.keys(posRivals[a]['races']).reduce((sum, key) => {
                  if (activeSeasons.includes(key)) {
                    sum += posRivals[a]['races'][key]
                  }
                  return sum
                }, 0)
                let aWins = Object.keys(posRivals[a]['wins']).reduce((sum, key) => {
                  if (activeSeasons.includes(key)) {
                    sum += posRivals[a]['wins'][key]
                  }
                  return sum
                }, 0)
                let bRaces = Object.keys(posRivals[b]['races']).reduce((sum, key) => {
                  if (activeSeasons.includes(key)) {
                    sum += posRivals[b]['races'][key]
                  }
                  return sum
                }, 0)
                let bWins = Object.keys(posRivals[b]['wins']).reduce((sum, key) => {
                  if (activeSeasons.includes(key)) {
                    sum += posRivals[b]['wins'][key]
                  }
                  return sum
                }, 0)
                let aRatio = aWins / aRaces
                let bRatio = bWins / bRaces

                if (byRaces || bRatio == aRatio) return bRaces - aRaces
                return bRatio - aRatio
              })
              .map((rival, index) => {
                const keys = Object.keys(posRivals[rival]['wins'])
                const rivalRaces = keys.reduce((sum, key) => {
                  if (activeSeasons.includes(key)) {
                    sum += posRivals[rival]['races'][key]
                  }
                  return sum
                }, 0)

                const rivalWins = keys.reduce((sum, key) => {
                  if (activeSeasons.includes(key)) {
                    sum += posRivals[rival]['wins'][key]
                  }
                  return sum
                }, 0)

                const ratio = rivalWins / rivalRaces

                return (
                  <tr key={index} onClick={() => nav(`/rankings/${rival}`)} className="clickable">
                    <td>{posRivals[rival].name}</td>
                    <td>{posRivals[rival].team}</td>
                    <td>{rivalRaces}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="ratioBarBg">
                        <div className="ratioBar" style={{ width: ratio * 95 }}>
                          <span>{(ratio * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

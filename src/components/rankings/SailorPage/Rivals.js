import { useEffect, useState } from 'react'
import { FaSortDown, FaSortUp } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import RatioBar from '../RatioBar'
import { all } from 'axios'

export default function Rivals({ rivals, pos }) {
  const [byRaces, setByRaces] = useState(true)
  const [reverse, setReverse] = useState(false)
  const [allSeasons, setAllSeasons] = useState([])
  const [activeSeasons, setActiveSeasons] = useState(['f24'])
  const nav = useNavigate()

  useEffect(() => {
    if (rivals != undefined) {
      const allSeasons = rivals.reduce((acc, rival) => {
        if (!acc.includes(rival.season)) {
          acc.push(rival.season)
        }
        return acc
      }, [])

      setActiveSeasons(allSeasons)
      setAllSeasons(allSeasons)
    }
  }, [rivals, pos])

  if (rivals == undefined) {
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
    <div className='flexGrowChild'>
      <div className='responsiveRowCol' style={{ alignItems: 'center' }}>
        <h2>
          {pos} Rivals: <span className='secondaryText'>(scroll for more)</span>
        </h2>
        <div className='flexRowContainer flexWrap'>
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
              <div key={index} className='filterOption' style={{ backgroundColor: activeSeasons.includes(season) ? 'var(--highlight1)' : '' }} onClick={(e) => toggleFilter(season, e.target)} onDoubleClick={() => setActiveSeasons([season])}>
                {season?.toUpperCase()}
              </div>
            ))}
          <div className='filterOption' onClick={() => setActiveSeasons(allSeasons)}>
            Enable All
          </div>
          <div className='filterOption' onClick={() => setActiveSeasons([])}>
            Disable All
          </div>
        </div>
      </div>
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
                className='tableColFit'
                style={{ textAlign: 'right', minWidth: 75 }}>
                {byRaces ? reverse ? <FaSortUp /> : <FaSortDown /> : ''}
                Races
              </th>
              <th
                onClick={() => {
                  if (!byRaces) setReverse(!reverse)
                  setByRaces(false)
                }}
                className='tableColFit'
                style={{ textAlign: 'right', minWidth: 113 }}>
                {!byRaces ? reverse ? <FaSortUp /> : <FaSortDown /> : ''}
                Win %
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              // group filtered rivals by rivalID and sum counts
              const grouped = rivals
                .filter((r) => activeSeasons.includes(r.season))
                .reduce((acc, r) => {
                  const id = r.rivalID
                  if (!acc[id]) {
                    acc[id] = {
                      rivalID: id,
                      name: r.rivalName,
                      team: r.rivalTeam,
                      totalRaces: 0,
                      totalWins: 0,
                    }
                  }
                  acc[id].totalRaces += r.raceCount || 0
                  acc[id].totalWins += r.winCount || 0
                  return acc
                }, {})

              return Object.values(grouped)
                .filter((g) => g.totalRaces > 0)
                .sort((a, b) => {
                  const aRatio = a.totalWins / a.totalRaces
                  const bRatio = b.totalWins / b.totalRaces

                  if (byRaces) {
                    // primary: races (honor reverse), tiebreaker: ratio DESC always
                    const raceDiff = b.totalRaces - a.totalRaces
                    if (raceDiff !== 0) return reverse ? -raceDiff : raceDiff
                    return bRatio - aRatio
                  } else {
                    // primary: ratio (honor reverse), tiebreaker: races DESC always
                    const ratioDiff = bRatio - aRatio
                    if (ratioDiff !== 0) return reverse ? -ratioDiff : ratioDiff
                    const raceDiff = a.totalRaces - b.totalRaces
                    return raceDiff
                  }
                })
                .map((rival) => {
                  const ratio = rival.totalWins / rival.totalRaces
                  return (
                    <tr key={rival.rivalID} onClick={() => nav(`/sailors/${rival.rivalID}`)} className='clickable'>
                      <td>{rival.name}</td>
                      <td className='tableColFit'>{rival.team}</td>
                      <td style={{ textAlign: 'right' }}>{rival.totalRaces}</td>
                      <td style={{ textAlign: 'center' }}>
                        <RatioBar ratio={ratio} />
                      </td>
                    </tr>
                  )
                })
            })()}
          </tbody>
        </table>
      </div>
    </div>
  )
}

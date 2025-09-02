import { useState } from 'react'
import { FaDiamond } from 'react-icons/fa6'
import { Link, useParams, useNavigate } from 'react-router-dom'
import RatingNum from '../../RatingNum'
import { useMobileDetect } from '../../../lib/hooks'
import RatioBar from '../RatioBar'

export default function RaceByRace({ races, woman, showFilter }) {
  const navigate = useNavigate()
  const positions = ['Skipper', 'Crew']
  const types = ['Open', "Women's"]
  const raceTypes = ['Fleet', 'Team Race']
  const [activePositions, setActivePositions] = useState(positions)
  const [activeTypes, setActiveTypes] = useState(types)
  const [activeRaceTypes, setActiveRaceTypes] = useState(raceTypes)
  const [filterText, setFilterText] = useState('')
  const isMobile = useMobileDetect()

  const filter = (e) => {
    setFilterText(e.target.value)
  }

  const toggleFilter = (filter) => {
    if (positions.includes(filter)) {
      if (activePositions.includes(filter) && [...activeRaceTypes, ...activePositions, ...activeTypes].length > 1) {
        setActivePositions((prev) => prev.filter((item) => item != filter))
      } else {
        setActivePositions((prev) => [...prev, filter])
      }
    }

    if (types.includes(filter)) {
      if (activeTypes.includes(filter) && [...activeRaceTypes, ...activePositions, ...activeTypes].length > 1) {
        setActiveTypes((prev) => prev.filter((item) => item != filter))
      } else {
        setActiveTypes((prev) => [...prev, filter])
      }
    }

    if (raceTypes.includes(filter)) {
      if (activeRaceTypes.includes(filter) && [...activeRaceTypes, ...activePositions, ...activeTypes].length > 1) {
        setActiveRaceTypes((prev) => prev.filter((item) => item != filter))
      } else {
        setActiveRaceTypes((prev) => [...prev, filter])
      }
    }
  }
  const filtered = races.slice(0).filter((race) => {
    let isSearched = false
    if (race.raceID.split('-').join(' ').toLowerCase().includes(filterText.toLowerCase()) || race.partner['name'].toLowerCase().includes(filterText.toLowerCase())) {
      isSearched = true
    }

    let validType = race.womens == activeTypes.includes("Women's") || !race.womens == activeTypes.includes('Open')
    if (!activeTypes.includes("Women's") && !activeTypes.includes('Open')) {
      validType = false
    }

    let validPos = (race.pos == 'Skipper' && activePositions.includes('Skipper')) || (race.pos == 'Crew' && activePositions.includes('Crew'))
    if (!activePositions.includes('Skipper') && !activePositions.includes('Crew')) {
      validPos = false
    }

    let validRaceType = (race.type == 'fleet' && activeRaceTypes.includes('Fleet')) || (race.type == 'team' && activeRaceTypes.includes('Team Race'))
    if (!activeRaceTypes.includes('Team Race') && !activeRaceTypes.includes('Fleet')) {
      validRaceType = false
    }
    return validType && validPos && validRaceType && isSearched
  })

  return (
    <>
      <div className='flexRowContainer flexWrap'>
        {showFilter ? (
          <>
            <input className='flexGrowChild' style={{ width: '30rem' }} placeholder='Search for a partner / regatta' onChange={filter} />
            {woman ? (
              types.map((type, i) => (
                <button key={i} style={{ backgroundColor: activeTypes.includes(type) ? 'var(--highlight1)' : '' }} className={`filterOption ${activeTypes.includes(type) ? '' : 'filterInactive'}`} onClick={() => toggleFilter(type)}>
                  {type}
                </button>
              ))
            ) : (
              <></>
            )}
            {positions.map((pos, i) => (
              <button key={i} style={{ backgroundColor: activePositions.includes(pos) ? 'var(--highlight1)' : '' }} className={`filterOption ${activePositions.includes(pos) ? '' : 'filterInactive'}`} onClick={() => toggleFilter(pos)}>
                {pos}
              </button>
            ))}{' '}
            {raceTypes.map((raceType, i) => (
              <button key={i} style={{ backgroundColor: activeRaceTypes.includes(raceType) ? 'var(--highlight1)' : '' }} className={`filterOption ${activeRaceTypes.includes(raceType) ? '' : 'filterInactive'}`} onClick={() => toggleFilter(raceType)}>
                {raceType}
              </button>
            ))}{' '}
          </>
        ) : (
          <></>
        )}
      </div>
      <div className='raceByRaceBox'>
        <table className='raceByRaceTable'>
          <thead>
            <tr>
              {isMobile ? <></> : <th>Date</th>}
              <th>Race</th>
              {/* <th></th> */}
              <th>Position</th>
              <th>Partner</th>
              <th style={{ textAlign: 'right' }}>Score</th>
              <th>Predicted</th>
              <th>Percentage</th>
              <th>Rating</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered
                .sort((a, b) => {
                  let datea = new Date(a.date.seconds * 1000)
                  let dateb = new Date(b.date.seconds * 1000)
                  if (dateb.getFullYear() != datea.getFullYear()) {
                    return dateb.getFullYear() - datea.getFullYear()
                  }
                  if (dateb.getMonth() != datea.getMonth()) {
                    return dateb.getMonth() - datea.getMonth()
                  }
                  if (dateb.getDate() != datea.getDate()) {
                    return dateb.getDate() - datea.getDate()
                  }
                  let raceNumA = a.type == 'fleet' ? a.raceID.split('/')[2].slice(0, -1) : a.raceID.split('/')[2]
                  let raceNumB = a.type == 'fleet' ? b.raceID.split('/')[2].slice(0, -1) : b.raceID.split('/')[2]
                  return raceNumB - raceNumA
                })
                .map((race, i) => {
                  let date = new Date(race?.date.seconds * 1000)
                  return (
                    <tr
                      key={i}
                      onClick={() => {
                        // navigate(`/rankings/regatta/${race.raceID}/${race.pos}`)
                        window.open(`https://scores.collegesailing.org/${race.raceID.split('/')[0]}/${race.raceID.split('/')[1]}/full-scores/`, '_blank', 'noopener,noreferrer')
                      }}
                      className='clickable'>
                      {isMobile ? <></> : <td className='secondaryText tableColFit tdRightBorder'>{date.toLocaleDateString()}</td>}
                      <td className='' style={{ textTransform: 'capitalize' }}>
                        {race.raceID.split('/')[1].split('-').join(' ')} - {race.raceID.split('/')[2]}{' '}
                        {race.type == 'team' ? (
                          <>
                            <span style={{ textTransform: 'none' }}> vs </span>
                            <span>
                              {race.opponentTeam} {race.opponentNick}
                            </span>{' '}
                          </>
                        ) : (
                          ''
                        )}
                      </td>

                      <td className='tableColFit'>{race.pos}</td>
                      <td className='tableColFit'>
                        {' '}
                        {/*onClick={() => navigate(`/rankings/${race.partner}`)} */}
                        {/* <Link to={`/rankings/${race.partner['link']}`}>{race.partner['name']}</Link> */}
                        <div>{race.partner['name']}</div>
                      </td>
                      <td style={{ textAlign: 'right', color: race.type == 'fleet' ? (race.score < race.predicted ? 'green' : race.score > race.predicted ? 'red' : '') : race.outcome == 'win' && race.predicted == 'lose' ? 'green' : race.type == 'fleet' ? (race.score > race.predicted ? 'red' : race.score < race.predicted ? 'green' : '') : race.outcome == 'lose' && race.predicted == 'win' ? 'red' : '' }}>
                        {race.score}
                        {race.type == 'team' ? (race.outcome == 'win' ? '  ' : '') + ' (' + race.outcome + ')' : ''}
                        {race.type == 'fleet' ? (race.score == 1 ? 'st' : race.score == 2 ? 'nd' : race.score == 3 ? 'rd' : 'th') : ' '}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {race.predicted}
                        {race.type == 'fleet' ? (race.predicted == 1 ? 'st' : race.predicted == 2 ? 'nd' : race.predicted == 3 ? 'rd' : 'th') : ''}
                      </td>
                      <td style={{ textAlign: 'center' }}>{race.type == 'fleet' ? <RatioBar ratio={race.ratio} /> : ''}</td>
                      <td style={{ textAlign: 'right' }} className='tableColFit'>
                        <RatingNum ratingNum={(race.pos == 'Skipper' ? (race.womens ? (race.type == 'fleet' ? race.womenSkipperRating : race.wtsr) : race.type == 'fleet' ? race.skipperRating : race.tsr) : race.womens ? (race.type == 'fleet' ? race.womenCrewRating : race.wtcr) : race.type == 'fleet' ? race.crewRating : race.tcr) - race.change} type={race.womens ? 'women' : ''} />
                      </td>
                      <td style={{ color: race.change > 0 ? 'green' : 'red' }}>
                        {race.change > 0 ? ' +' : ' '}
                        {race.change.toFixed(0)}
                      </td>
                    </tr>
                  )
                })
            ) : (
              <span style={{ width: '80%', position: 'absolute', textAlign: 'center', margin: 20 }}>No races match this filter!</span>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

import { useState } from 'react'
import { FaDiamond } from 'react-icons/fa6'
import { Link, useParams, useNavigate } from 'react-router-dom'
import RatingNum from '../../RatingNum'
import { useMobileLayout } from '../../../lib/hooks'
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
  const isMobile = useMobileLayout()

  const filter = (e) => {
    setFilterText(e.target.value)
  }

  const toggleFilter = (filter) => {
    if (positions.includes(filter)) {
      if (activePositions.includes(filter) && [...activeRaceTypes, ...activePositions, ...activeTypes].length > 1) {
        setActivePositions((prev) => prev.filter((item) => item !== filter))
      } else {
        setActivePositions((prev) => [...prev, filter])
      }
    }

    if (types.includes(filter)) {
      if (activeTypes.includes(filter) && [...activeRaceTypes, ...activePositions, ...activeTypes].length > 1) {
        setActiveTypes((prev) => prev.filter((item) => item !== filter))
      } else {
        setActiveTypes((prev) => [...prev, filter])
      }
    }

    if (raceTypes.includes(filter)) {
      if (activeRaceTypes.includes(filter) && [...activeRaceTypes, ...activePositions, ...activeTypes].length > 1) {
        setActiveRaceTypes((prev) => prev.filter((item) => item !== filter))
      } else {
        setActiveRaceTypes((prev) => [...prev, filter])
      }
    }
  }

  const filtered = races
    .slice(0)
    .filter((race) => {
      const LFilter = filterText.toLowerCase()
      let isSearched = false
      if (
        race.regatta?.split('-').join(' ').toLowerCase().includes(LFilter) || //
        race.partnerID?.split('-').join(' ').toLowerCase().includes(LFilter)
        // || race.venue.toLowerCase().includes(LFilter)
      ) {
        isSearched = true
      }

      let validType = race.ratingType.includes('w') === activeTypes.includes("Women's") || !race.ratingType.includes('w') === activeTypes.includes('Open')
      if (!activeTypes.includes("Women's") && !activeTypes.includes('Open')) {
        validType = false
      }

      let validPos = (race.position === 'Skipper' && activePositions.includes('Skipper')) || (race.position === 'Crew' && activePositions.includes('Crew'))
      if (!activePositions.includes('Skipper') && !activePositions.includes('Crew')) {
        validPos = false
      }

      let validRaceType = !race.ratingType.includes('t') === activeRaceTypes.includes('Fleet') || race.ratingType.includes('t') === activeRaceTypes.includes('Team Race')
      if (!activeRaceTypes.includes('Team Race') && !activeRaceTypes.includes('Fleet')) {
        validRaceType = false
      }

      return validType && validPos && validRaceType && isSearched
    })
    .sort((b, a) => {
      let datea = new Date(a.date)
      let dateb = new Date(b.date)
      if (datea - dateb !== 0) {
        return datea - dateb
      }
      return a.raceNumber - b.raceNumber
    })

  return (
    <>
      <div className='flexRowContainer flexWrap' style={isMobile ? { gap: '0.3rem', marginBottom: '0.5rem' } : {}}>
        {showFilter ? (
          <>
            <input className={isMobile ? '' : 'flexGrowChild'} style={{ width: isMobile ? '100%' : '30rem', padding: isMobile ? '0.4rem' : undefined }} placeholder='Search for a partner / regatta' onChange={filter} />
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
            {isMobile ? (
              <tr>
                <th>Race</th>
                <th style={{ textAlign: 'right' }}>Result</th>
                <th style={{ textAlign: 'right' }}>Rating</th>
              </tr>
            ) : (
              <tr>
                <th>Date</th>
                <th>Race</th>
                {/* <th></th> */}
                <th>Position</th>
                <th>Partner</th>
                <th style={{ textAlign: 'right' }}>Score</th>
                <th>Predicted</th>
                <th>Percentage</th>
                <th>Rating</th>
                <th>Change</th>
                {/* <th>RegAvg</th> */}
              </tr>
            )}
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((race, i) => {
                let date = new Date(race?.date)
                let change = race.newRating - race.oldRating
                if (isMobile) {
                  const isTeamRace = race.ratingType.includes('t')
                  return (
                    <tr key={i} onClick={() => window.open(`https://scores.collegesailing.org/${race.season}/${race.regatta}/full-scores/`, '_blank', 'noopener,noreferrer')} className='clickable'>
                      <td>
                        <div style={{ textTransform: 'capitalize' }}>
                          {race.regatta.split('-').join(' ')} - {race.raceNumber + '' + (race.division ? race.division : '')}
                          {isTeamRace ? (
                            <>
                              <span style={{ textTransform: 'none' }}> vs </span>
                              {race.opponentTeam} {race.opponentNick}
                            </>
                          ) : (
                            ''
                          )}
                        </div>
                        <div className='secondaryText' style={{ fontSize: '0.8rem' }}>
                          {date.toLocaleDateString()} · {race.position}
                          {race.partnerName ? ` with ${race.partnerName}` : ''}
                        </div>
                      </td>
                      <td className='tableColFit' style={{ textAlign: 'right' }}>
                        <div style={{ color: getScoreColor(race) }}>{isTeamRace ? race.outcome : race.score + ordinal(race.score)}</div>
                        <div className='secondaryText' style={{ fontSize: '0.8rem' }}>
                          pred {race.predicted}
                          {isTeamRace ? '' : ordinal(race.predicted)}
                        </div>
                      </td>
                      <td className='tableColFit' style={{ textAlign: 'right' }}>
                        <RatingNum ratingNum={race.oldRating} type={race.ratingType.includes('w') ? 'women' : ''} />
                        <div style={{ color: change > 0 ? 'green' : 'red', fontSize: '0.8rem' }}>
                          {change > 0 ? '+' : ''}
                          {change.toFixed(0)}
                        </div>
                      </td>
                    </tr>
                  )
                }
                return (
                  <tr
                    key={i}
                    // style={{ backgroundColor: getRegDifficulty(race.regAvg) }}
                    onClick={() => {
                      // navigate(`/regattas/${race.season}/${race.regatta}/${race.raceNumber}${race.division}`)
                      window.open(`https://scores.collegesailing.org/${race.season}/${race.regatta}/full-scores/`, '_blank', 'noopener,noreferrer')
                    }}
                    className='clickable'>
                    <td style={{ backgroundColor: getRegDifficulty(race.regAvg) + '33' }} className='secondaryText tableColFit tdRightBorder'>
                      {date.toLocaleDateString()}
                    </td>
                    <td className='' style={{ textTransform: 'capitalize' }}>
                      {race.regatta.split('-').join(' ')} - {race.raceNumber + '' + (race.division ? race.division : '')}{' '}
                      {race.ratingType.includes('t') ? (
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

                    <td className='tableColFit'>{race.position}</td>
                    <td className='tableColFit'>
                      {' '}
                      {/*onClick={() => navigate(`/sailors/${race.partner}`)} */}
                      {/* <Link to={`/sailors/${race.partner['link']}`}>{race.partner['name']}</Link> */}
                      <div>{race.partnerName}</div>
                    </td>
                    <td style={{ textAlign: 'right', color: !race.ratingType.includes('t') ? (race.score < race.predicted ? 'green' : race.score > race.predicted ? 'red' : '') : race.outcome === 'win' && race.predicted === 'lose' ? 'green' : !race.ratingType.includes('t') ? (race.score > race.predicted ? 'red' : race.score < race.predicted ? 'green' : '') : race.outcome === 'lose' && race.predicted === 'win' ? 'red' : '' }}>
                      {race.score}
                      {race.ratingType.includes('t') ? (race.outcome === 'win' ? '  ' : '') + ' (' + race.outcome + ')' : ''}
                      {!race.ratingType.includes('t') ? (race.score === 1 ? 'st' : race.score === 2 ? 'nd' : race.score === 3 ? 'rd' : 'th') : ' '}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {race.predicted}
                      {!race.ratingType.includes('t') ? (race.predicted === 1 ? 'st' : race.predicted === 2 ? 'nd' : race.predicted === 3 ? 'rd' : 'th') : ''}
                    </td>
                    <td style={{ textAlign: 'center' }}>{!race.ratingType.includes('t') ? <RatioBar ratio={race.ratio} /> : ''}</td>
                    <td style={{ textAlign: 'right' }} className='tableColFit'>
                      <RatingNum ratingNum={race.oldRating} type={race.ratingType.includes('w') ? 'women' : ''} />
                    </td>
                    <td style={{ color: change > 0 ? 'green' : 'red' }}>
                      {change > 0 ? ' +' : ' '}
                      {change.toFixed(0)}
                    </td>
                    {/* <td></td> */}
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

const ordinal = (num) => (num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th')

// green when the sailor beat their prediction, red when they did worse
const getScoreColor = (race) => {
  if (!race.ratingType.includes('t')) return race.score < race.predicted ? 'green' : race.score > race.predicted ? 'red' : ''
  if (race.outcome === 'win' && race.predicted === 'lose') return 'green'
  if (race.outcome === 'lose' && race.predicted === 'win') return 'red'
  return ''
}

const mapRange = (value, oldMin, oldMax, newMin, newMax) => {
  return ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin
}
export function getRegDifficulty(avgRating) {
  const ranks = ['iron', 'silver', 'gold', 'diamond', 'immortal']
  // const rankColors = ['#686868', '#bcbcbc', '#ffcc00', '#3c9eee', '#bc0a0aff']
  const rankColors = ['#dbdbdb', '#dbdbdb', '#dbdbdb', '#dbdbdb', '#dbdbdb']
  const rankEmojis = ['🟫', '⬜', '🟨', '💎', '☠️']
  let newNum = Math.floor(mapRange(avgRating, 800, 1550, 0, 4))
  if (avgRating > 1500) console.log(avgRating, newNum)
  return rankColors[newNum]
}

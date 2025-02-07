import { useState } from 'react'
import { FaSortDown } from 'react-icons/fa'
import { useMobileDetect } from '../../lib/hooks'
import RatioBar from './RatioBar'

export default function VenueResults({ races }) {
  const [byChange, setByChange] = useState(false)
  const [byRaces, setByRaces] = useState(true)
  const isMobile = useMobileDetect()

  // Step 1: Calculate total change and count for each venue
  const venueStats = races.reduce((acc, race) => {
    if (!acc[race.venue]) {
      acc[race.venue] = { change: 0, count: 0, ratio: 0 }
    }
    acc[race.venue].change += race.change
    acc[race.venue].count += 1
    acc[race.venue].ratio += race.ratio
    return acc
  }, {})

  // Step 2: Sort the venues by the total change in descending order
  const sortedVenues = Object.keys(venueStats)
    .map((venue) => {
      return {
        name: venue,
        change: venueStats[venue].change,
        count: venueStats[venue].count,
        ratio: venueStats[venue].ratio / venueStats[venue].count,
      }
    })
    .sort((a, b) => {
      if (byChange) return b.change - a.change
      if (byRaces) return b.count - a.count
      return b.ratio - a.ratio
    })

  return (
    <table className='raceByRaceTable'>
      <thead>
        <tr>
          <th></th>
          <th>Venue (host)</th>
          <th
            style={{ minWidth: 75 }}
            className='clickable'
            onClick={() => {
              setByChange(false)
              setByRaces(true)
            }}>
            Races
            {byRaces ? <FaSortDown /> : <></>}
          </th>
          <th></th>
          <th
            style={{ minWidth: isMobile ? 85 : 150 }}
            className='clickable'
            onClick={() => {
              setByChange(true)
              setByRaces(false)
            }}>
            {isMobile ? 'Change' : 'Rating Change'}
            {byChange ? <FaSortDown /> : ' '}
          </th>
          <th
            style={{ minWidth: 113 }}
            className='clickable'
            onClick={() => {
              setByChange(false)
              setByRaces(false)
            }}>
            Percentage
            {!byChange && !byRaces ? <FaSortDown /> : <></>}
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedVenues.map((venue, index) =>
          venue.name != 'Unknown' ? (
            <tr className='' key={venue.name} style={{ margin: '5px' }}>
              <td className='tdRightBorder tableColFit secondaryText'>{index + 1}</td>
              <td>{venue.name}</td>
              <td className='tableColFit' style={{ textAlign: 'right' }}>
                {venue.count}
              </td>
              <td></td>
              <td style={{ color: venue.change > 0 ? 'green' : 'red' }}>
                {venue.change > 0 ? '+' : ''}
                {venue.change.toFixed(0)}
              </td>
              <td style={{ textAlign: 'center' }}>
                <RatioBar ratio={venue.ratio} />
              </td>
            </tr>
          ) : (
            <></>
          )
        )}
      </tbody>
    </table>
  )
}

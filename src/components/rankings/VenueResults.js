import { useState } from 'react'
import { FaSortDown } from 'react-icons/fa'
import { useMobileLayout, useTeamRegions } from '../../lib/hooks'
import RatioBar from './RatioBar'
import useRegionColors from '../../lib/regionColors'

export default function VenueResults({ races }) {
  const [byChange, setByChange] = useState(false)
  const [byRaces, setByRaces] = useState(true)
  const isMobile = useMobileLayout()

  const teamRegions = useTeamRegions()
  const regionColors = useRegionColors()

  // Step 1: Calculate total change and count for each venue
  const venueStats = races.reduce((acc, race) => {
    if (race.venue === undefined) {
      // console.log(race)
    }
    if (!acc[race.venue]) {
      acc[race.venue] = { change: 0, count: 0, ratio: 0 }
    }
    acc[race.venue].change += race.newRating - race.oldRating
    acc[race.venue].count += 1
    if (!race.ratingType.includes('t')) {
      acc[race.venue].ratio += race.ratio
    } else {
      acc[race.venue].ratio += race.outcome === 'win' ? 1 : 0
    }
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

  // console.log(races.length, sortedVenues)

  return (
    <table className='raceByRaceTable'>
      <thead>
        <tr>
          <th></th>
          <th>Venue (host)</th>
          {isMobile ? <></> : <th></th>}
          <th
            style={{ minWidth: isMobile ? 0 : 75 }}
            className='clickable'
            onClick={() => {
              setByChange(false)
              setByRaces(true)
            }}>
            Races
            {byRaces ? <FaSortDown /> : <></>}
          </th>
          {isMobile ? <></> : <th></th>}
          <th
            style={{ minWidth: isMobile ? 85 : 150 }}
            className='tableColFit clickable'
            onClick={() => {
              setByChange(true)
              setByRaces(false)
            }}>
            {isMobile ? 'Change' : 'Rating Change'}
            {byChange ? <FaSortDown /> : ' '}
          </th>
          <th
            style={{ minWidth: isMobile ? 0 : 113, textAlign: isMobile ? 'right' : undefined }}
            className='tableColFit clickable'
            onClick={() => {
              setByChange(false)
              setByRaces(false)
            }}>
            {isMobile ? 'Win %' : 'Percentage'}
            {!byChange && !byRaces ? <FaSortDown /> : <></>}
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedVenues.map((venue, index) =>
          venue.name !== 'Unknown' ? (
            <tr className='' key={venue.name} style={{ margin: '5px' }}>
              <td className='tdRightBorder tableColFit secondaryText'>{index + 1}</td>
              <td>{venue.name === 'undefined' || venue.name === undefined ? 'Unknown' : venue.name} </td>
              {isMobile ? (
                <></>
              ) : (
                <td>
                  {Object.keys(teamRegions).includes(venue.name) ? (
                    <div className='filterOption' style={{ backgroundColor: regionColors[teamRegions[venue.name]], fontSize: '0.8rem', float: 'right' }}>
                      {teamRegions[venue.name]}
                    </div>
                  ) : (
                    ''
                  )}
                </td>
              )}
              <td className='tableColFit' style={{ textAlign: 'right' }}>
                {venue.count}
              </td>
              {isMobile ? <></> : <td></td>}
              <td style={{ color: venue.change > 0 ? 'green' : 'red' }}>
                {venue.change > 0 ? '+' : ''}
                {venue.change.toFixed(0)}
              </td>
              <td style={{ textAlign: isMobile ? 'right' : 'center' }}>{isMobile ? `${(venue.ratio * 100).toFixed(0)}%` : <RatioBar ratio={venue.ratio} />}</td>
            </tr>
          ) : (
            <></>
          ),
        )}
      </tbody>
    </table>
  )
}

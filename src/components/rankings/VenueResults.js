export default function VenueResults({ races }) {
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
    .sort((a, b) => b.ratio - a.ratio) // Sort by change in descending order

  // Step 3: Map to <span> elements with rank and total change
  return (
    <table className='raceByRaceTable'>
      <thead>
        <th></th>
        <th>Venue (host)</th>
        <th>Races</th>
        <th>Rating Change</th>
        <th>Percentage</th>
      </thead>
      <tbody>
        {sortedVenues.map((venue, index) =>
          venue.name != 'Unknown' ? (
            <tr className='' key={venue.name} style={{ margin: '5px' }}>
              <td className='tdRightBorder tableColFit secondaryText'>{index + 1}</td>
              <td>{venue.name}</td>
              <td>{venue.count} races</td>
              <td style={{ color: venue.change > 0 ? 'green' : 'red' }}>
                {venue.change > 0 ? '+' : ''}
                {venue.change.toFixed(0)}
              </td>
              <td style={{ textAlign: 'center' }}>
                <div className='ratioBarBg'>
                  <div className='ratioBar' style={{ width: venue.ratio * 100 }}>
                    <span>{(venue.ratio * 100).toFixed(1)}%</span>
                  </div>
                </div>
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

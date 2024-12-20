export default function VenueResults({ races }) {
  // Step 1: Calculate total change and count for each venue
  const venueStats = races.reduce((acc, race) => {
    if (!acc[race.venue]) {
      acc[race.venue] = { change: 0, count: 0 }
    }
    acc[race.venue].change += race.change
    acc[race.venue].count += 1
    return acc
  }, {})

  // Step 2: Sort the venues by the total change in descending order
  const sortedVenues = Object.keys(venueStats)
    .map((venue) => ({
      name: venue,
      change: venueStats[venue].change,
      count: venueStats[venue].count,
    }))
    .sort((a, b) => b.change - a.change) // Sort by change in descending order

  // Step 3: Map to <span> elements with rank and total change
  return (
    <table className='raceByRaceTable'>
      <thead>
        <th></th>
        <th>Venue (host)</th>
        <th>Races</th>
        <th>Rating Change</th>
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
            </tr>
          ) : (
            <></>
          )
        )}
      </tbody>
    </table>
  )
}

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
    <div>
      {sortedVenues.map((venue, index) =>
        venue.name != 'Unknown' ? (
          <div className='contentBox' key={venue.name} style={{ margin: '5px' }}>
            <span className='secondaryText'>({index + 1})</span> {venue.name}{' '}
            <span style={{ color: venue.change > 0 ? 'green' : 'red' }}>
              {venue.change > 0 ? '+' : ''}
              {venue.change.toFixed(0)}
            </span>
            {'  '}({venue.count} races)
          </div>
        ) : (
          <></>
        )
      )}
    </div>
  )
}

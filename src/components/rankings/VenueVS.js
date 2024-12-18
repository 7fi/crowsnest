export default function VenueVS({ sailorAName, sailorBName, racesA, racesB }) {
  const venueStatsA = racesA.reduce((acc, race) => {
    if (!acc[race.venue]) {
      acc[race.venue] = { change: 0, count: 0, ratio: 0 }
    }
    acc[race.venue].ratio += race.ratio
    acc[race.venue].change += race.change
    acc[race.venue].count += 1
    return acc
  }, {})

  const venueStatsB = racesB.reduce((acc, race) => {
    if (!acc[race.venue]) {
      acc[race.venue] = { change: 0, count: 0, ratio: 0 }
    }
    acc[race.venue].ratio += race.ratio
    acc[race.venue].change += race.change
    acc[race.venue].count += 1
    return acc
  }, {})
  const sortedVenues = Object.keys(venueStatsA)
    .filter((venue) => {
      return venueStatsB[venue] != undefined
    })
    .map((venue) => {
      return {
        name: venue,
        avgRatioA: venueStatsA[venue].ratio / venueStatsA[venue].count,
        avgRatioB: venueStatsB[venue]?.ratio / venueStatsB[venue]?.count,
        change: venueStatsA[venue].change,
        count: venueStatsA[venue].count,
      }
    })
    .sort((a, b) => b.avgRatioA - a.avgRatioA)
  return (
    <div className='contentBox'>
      <div className='comparisonBox contentBox' style={{ fontWeight: 'bold' }}>
        <span>Venue</span>
        <span>{sailorAName}</span>
        <span>{sailorBName}</span>
      </div>
      {sortedVenues.map((venue, index) => (
        <div key={index} className='comparisonBox contentBox'>
          <span>{venue.name}</span>
          <span style={{ color: venue.avgRatioA > venue.avgRatioB ? 'green' : 'red' }}>{(venue.avgRatioA * 100).toFixed(1)}</span>
          <span style={{ color: venue.avgRatioB > venue.avgRatioA ? 'green' : 'red' }}>{(venue.avgRatioB * 100).toFixed(1)}</span>
        </div>
      ))}
    </div>
  )
}

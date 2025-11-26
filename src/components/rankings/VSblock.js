import { Link } from 'react-router-dom'
import PosNegBarChart from '../PosNegBarChart'

export default function VSblock({ sailorsA, sailorsB }) {
  let aRaces = []
  sailorsA.forEach((sailor) => {
    aRaces.push(...sailor.races)
  })
  let bRaces = []
  sailorsB.forEach((sailor) => {
    bRaces.push(...sailor.races)
  })

  const bothRacesA = aRaces
    .filter((race) => {
      return bRaces.some((race2) => race.raceID == race2.raceID)
    })
    .map((race) => {
      let temp = race
      temp.sailor = sailorsA[0].name
      return temp
    })
  const bothRacesB = bRaces
    .filter((race) => {
      return bothRacesA.some((race2) => race.raceID == race2.raceID)
    })
    .map((race) => {
      let temp = race
      temp.sailor = sailorsB[0].name
      return temp
    })

  if (bothRacesA.length < 1 && bothRacesB.length < 1) {
    return <div className='contentBox'> No races were found in common between these two sailors (must be same division)</div>
  }

  const result = [bothRacesA, bothRacesB].reduce((r, a) => (a.forEach((a, i) => (r[i] = r[i] || []).push(a)), r), []).reduce((a, b) => a.concat(b))

  return (
    <div>
      <div className='contentBox'>
        <div className='contentBox comparisonBox'>
          <span>Name</span>
          <span>Rating</span>
          <span>Rank</span>
          <span>Team</span>
        </div>
        {[...sailorsA, ...sailorsB].map((sailor, jindex) => (
          <Link key={jindex} to={`/sailors/${sailor.pos}/${sailor.Name}`}>
            <div className='contentBox comparisonBox'>
              <span>{sailor.Name}</span>
              <span>{sailor.Rating}</span>
              <span>
                #{sailor.GlobalRank} for {sailor.Position}s
              </span>
              <span>{sailor.Team}</span>
            </div>
          </Link>
        ))}
      </div>
      <h2>
        Direct Race by Race Comparison <span className='secondaryText'>(Ratio: higher is better)</span>
      </h2>
      <span>Only races that both sailors participated in</span>
      <PosNegBarChart data={result} dataKey='ratio' showLabels={true} alternate={true} />
    </div>
  )
}

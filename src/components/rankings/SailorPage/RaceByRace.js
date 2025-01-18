import { Link, useParams, useNavigate } from 'react-router-dom'

export default function RaceByRace({ races, position }) {
  const navigate = useNavigate()
  return (
    <div className='raceByRaceBox'>
      <table className='raceByRaceTable'>
        <thead>
          <tr>
            <th>Date</th>
            <th>Race</th>
            <th>Position</th>
            <th>Partner</th>
            <th>Score</th>
            <th>Predicted</th>
            <th>Percentage</th>
            <th>Rating</th>
            <th>Change</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {races
            .slice(0)
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
              let raceNumA = a.raceID.split('/')[2].slice(0, -1)
              let raceNumB = b.raceID.split('/')[2].slice(0, -1)
              return raceNumB - raceNumA
            })
            .map((race, i) => {
              let date = new Date(race?.date.seconds * 1000)
              return (
                <tr
                  key={i}
                  onClick={() => {
                    navigate(`/rankings/regatta/${race.raceID}/${race.pos}`)
                  }}
                  className='clickable'>
                  <td className='secondaryText tableColFit tdRightBorder'>{date.toLocaleDateString()}</td>
                  <td className='' style={{ textTransform: 'capitalize' }}>
                    {race.raceID.split('/')[1].split('-').join(' ')} - {race.raceID.split('/')[2]}{' '}
                  </td>

                  <td className='tableColFit'>{race.pos}</td>
                  <td className='tableColFit' onClick={() => navigate(`/rankings/${race.partner}`)}>
                    <Link to={`/rankings/${race.partner['link']}`}>{race.partner['name']}</Link>
                  </td>
                  <td style={{ textAlign: 'center', color: race.score < race.predicted ? 'green' : race.score > race.predicted ? 'red' : '' }}>
                    {race.score < 10 ? '  ' : ' '}
                    {race.score}
                    {race.score == 1 ? 'st' : race.score == 2 ? 'nd' : race.score == 3 ? 'rd' : 'th'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {race.predicted < 10 ? '  ' : ' '}
                    {race.predicted}
                    {race.predicted == 1 ? 'st' : race.predicted == 2 ? 'nd' : race.predicted == 3 ? 'rd' : 'th'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className='ratioBarBg'>
                      <div className='ratioBar' style={{ width: race.ratio * 95 }}>
                        <span>{(race.ratio * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </td>
                  <td>{((race.pos == 'Skipper' ? race.skipperRating : race.crewRating) - race.change).toFixed(0)}</td>
                  <td style={{ color: race.change > 0 ? 'green' : 'red' }}>
                    {race.change > 0 ? ' +' : ' '}
                    {race.change.toFixed(0)}
                  </td>
                  <td>{race.skipperSigma}</td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}

import { Link, useParams, useNavigate } from 'react-router-dom'

export default function RaceByRace({ races, position }) {
  return (
    <div className='raceByRaceBox'>
      {/* {races
        .slice(0)
        .sort((a, b) => {
          let datea = new Date(a.date.seconds * 1000)
          let dateb = new Date(b.date.seconds * 1000)
          console.log(datea.getFullYear())
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
            <Link to={`/crowsnest/rankings/regatta/${race.raceID}/${position}`} key={i}>
              <div className='contentBox racebyRaceBox' style={{ justifyContent: 'space-between' }}>
                <span className='secondaryText'>{date.toLocaleDateString()}</span>
                <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                  {race.raceID.split('/')[1].split('-').join(' ')} {race.raceID.split('/')[2]}
                </span>
                <span>
                  {race.score < 10 ? '   ' : ' '}
                  {race.score}
                  {race.score == 1 ? 'st' : race.score == 2 ? 'nd' : race.score == 3 ? 'rd' : 'th'}{' '}
                </span>
                <span>Partner: {race.partner} </span>
                <span>
                  {(race.newRating - race.change).toFixed(0)}
                  <span style={{ color: race.change > 0 ? 'green' : 'red' }}>
                    {race.change > 0 ? ' +' : ' '}
                    {race.change.toFixed(0)}
                  </span>
                </span>
              </div>
            </Link>
          )
        })} */}

      <table className='raceByRaceTable'>
        <thead>
          <tr>
            <th>Date</th>
            <th>Race</th>
            {/* <th>Race</th> */}
            <th>Partner</th>
            <th>Score</th>
            <th>Predicted</th>
            <th>Percentage</th>
            <th>Rating</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {races
            .slice(0)
            .sort((a, b) => {
              let datea = new Date(a.date.seconds * 1000)
              let dateb = new Date(b.date.seconds * 1000)
              console.log(datea.getFullYear())
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
                <tr>
                  <td className='secondaryText tableColFit tdRightBorder'>{date.toLocaleDateString()}</td>
                  <td className='' style={{ textTransform: 'capitalize' }}>
                    <Link to={`/crowsnest/rankings/regatta/${race.raceID}/${position}`} key={i}>
                      {race.raceID.split('/')[1].split('-').join(' ')} - {race.raceID.split('/')[2]}{' '}
                    </Link>
                  </td>
                  {/* <td>
                    <Link to={`/crowsnest/rankings/regatta/${race.raceID}/${position}`} key={i}></Link>
                  </td> */}

                  <td className='tableColFit'>{race.partner}</td>
                  <td style={{ textAlign: 'center' }}>
                    {race.score < 10 ? '  ' : ' '}
                    {race.score}
                    {race.score == 1 ? 'st' : race.score == 2 ? 'nd' : race.score == 3 ? 'rd' : 'th'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {race.predicted < 10 ? '  ' : ' '}
                    {race.predicted}0{race.predicted == 1 ? 'st' : race.predicted == 2 ? 'nd' : race.predicted == 3 ? 'rd' : 'th'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className='ratioBarBg'>
                      <div className='ratioBar' style={{ width: race.ratio * 100 }}>
                        <span>{(race.ratio * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    {/*  */}
                  </td>
                  <td>{(race.newRating - race.change).toFixed(0)}</td>
                  <td style={{ color: race.change > 0 ? 'green' : 'red' }}>
                    {race.change > 0 ? ' +' : ' '}
                    {race.change.toFixed(0)}
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}

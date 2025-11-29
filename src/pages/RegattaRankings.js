import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getRegattaElos } from '../lib/firebase'
import PosNegBarChart from '../components/PosNegBarChart'
import Loader from '../components/loader'
import { getRaceScores } from '../lib/apilib'
import useTeamCodes from '../lib/teamCodes'

export default function RegattaRankings() {
  const { season, regattaName, raceNum } = useParams()
  const [activeTab, setActiveTab] = useState('')
  const [position, setPosition] = useState('Skipper')
  const [divisions, setDivs] = useState(['A', 'B'])
  const [loaded, setLoaded] = useState(false)

  const [raceNumber, setRacenumber] = useState(raceNum)
  const [curDiv, setCurDiv] = useState('combined')
  const [scores, setScores] = useState([])
  const [allScores, setAllScores] = useState([])

  const teamCodes = useTeamCodes()

  useEffect(() => {
    let newDiv = curDiv
    let newRaceNumber = raceNumber

    if (raceNum.includes('A') || raceNum.includes('B') || raceNum.includes('C')) {
      newDiv = raceNum.slice(-1)
      newRaceNumber = raceNum.slice(0, -1)

      setCurDiv(newDiv)
      setRacenumber(newRaceNumber)
    }

    getRaceScores(season, regattaName, newRaceNumber, newDiv, 'Skipper')
      .then((scores) => {
        console.log(scores.scores)
        setScores(scores.scores)
      })
      .then(() => setLoaded(true))

    let divs = new Set()
    scores.forEach((score) => {
      divs.add(score.division)
      console.log(score)
    })
    setDivs([...divs])
    console.log([...divs])
  }, [season, regattaName, raceNum])

  const navigate = useNavigate()

  const SingleTab = () => {
    return (
      <>
        <div>
          <div>
            {divisions.map((div) => (
              <span>{div}</span>
            ))}
          </div>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Skipper</th>
                <th>Crew</th>
                <th>Score</th>
                <th>Predicted</th>
                <th>Rating</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {scores
                .sort((a, b) => a.score - b.score)
                .map((score, i) => {
                  let change = score.newRating - score.oldRating
                  return (
                    <tr key={i}>
                      <td>
                        <div className='flexRowContainer'>
                          <img style={{ display: 'inline', maxHeight: '1.5rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[score.teamID]}-40.png`} />
                        </div>
                      </td>
                      <td className='clickable' onClick={() => navigate(`/sailors/${score.sailorID}`)}>
                        {score.name}
                      </td>
                      <td className='clickable' onClick={() => navigate(`/sailors/${score.partnerID}`)}>
                        {score.partnerName}
                      </td>
                      <td style={{ textAlign: 'right', color: !score.ratingType.includes('t') ? (score.score < score.predicted ? 'green' : score.score > score.predicted ? 'red' : '') : score.outcome == 'win' && score.predicted == 'lose' ? 'green' : !score.ratingType.includes('t') ? (score.score > score.predicted ? 'red' : score.score < score.predicted ? 'green' : '') : score.outcome == 'lose' && score.predicted == 'win' ? 'red' : '' }}>
                        {score.score}
                        {score.ratingType.includes('t') ? (score.outcome == 'win' ? '  ' : '') + ' (' + score.outcome + ')' : ''}
                        {!score.ratingType.includes('t') ? (score.score == 1 ? 'st' : score.score == 2 ? 'nd' : score.score == 3 ? 'rd' : 'th') : ' '}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {score.predicted}
                        {!score.ratingType.includes('t') ? (score.predicted == 1 ? 'st' : score.predicted == 2 ? 'nd' : score.predicted == 3 ? 'rd' : 'th') : ''}
                      </td>
                      <td>{score.oldRating}</td>
                      <td style={{ color: change > 0 ? 'green' : 'red' }}>
                        {change > 0 ? ' +' : ' '}
                        {change.toFixed(0)}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  return <>{loaded ? <SingleTab /> : <Loader show={!loaded} />}</>
  // return <div>Regatta page is currently being rewritten... </div>
}

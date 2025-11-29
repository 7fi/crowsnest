import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getRegattaElos } from '../lib/firebase'
import PosNegBarChart from '../components/PosNegBarChart'
import Loader from '../components/loader'
import { getRaceScores } from '../lib/apilib'

export default function RegattaRankings() {
  const { season, regattaName, raceNum, pos } = useParams()
  const [sailors, setSailors] = useState([])
  const [raceIDs, setRaceIDs] = useState([])
  const [activeTab, setActiveTab] = useState('')
  const [position, setPosition] = useState('Skipper')
  const [divisions, setDivs] = useState(['A', 'B'])
  const [loaded, setLoaded] = useState(false)

  const [raceNumber, setRacenumber] = useState(raceNum)
  const [curDiv, setCurDiv] = useState('combined')
  const [scores, setScores] = useState([])

  useEffect(() => {
    let newDiv = curDiv
    let newRaceNumber = raceNumber

    if (raceNum.includes('A') || raceNum.includes('B') || raceNum.includes('C')) {
      newDiv = raceNum.slice(-1)
      newRaceNumber = raceNum.slice(0, -1)

      setCurDiv(newDiv)
      setRacenumber(newRaceNumber)
    }

    getRaceScores(season, regattaName, newRaceNumber, newDiv, pos)
      .then((scores) => {
        console.log(scores.scores)
        setScores(scores.scores)
      })
      .then(() => setLoaded(true))
  }, [season, regattaName, raceNum, pos])

  useEffect(() => {
    raceIDs.some((id) => {
      if (id.slice(-1) == 'C') {
        setDivs(['A', 'B', 'C'])
        return true
      }
    })
  }, [activeTab])

  const navigate = useNavigate()

  const SingleTab = ({ raceIDs, pos }) => {
    return (
      <>
        <div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Partner</th>
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
                      <td>{score.sailorID}</td>
                      <td>{score.partnerName}</td>
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

  return <>{loaded ? <SingleTab raceIDs={raceIDs} pos={position} /> : <Loader show={!loaded} />}</>
  // return <div>Regatta page is currently being rewritten... </div>
}

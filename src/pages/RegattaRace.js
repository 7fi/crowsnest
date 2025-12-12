import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getRegattaElos } from '../lib/firebase'
import PosNegBarChart from '../components/PosNegBarChart'
import Loader from '../components/loader'
import { getRaceScores, getRegattaScores } from '../lib/apilib'
import useTeamCodes from '../lib/teamCodes'

export default function RegattaRace() {
  const { season, regattaName, raceNum } = useParams()
  const [loaded, setLoaded] = useState(false)
  const [divisions, setDivs] = useState([])

  const [raceNumber, setRacenumber] = useState(0)
  const [curDiv, setCurDiv] = useState('')
  const [raceNums, setRaceNums] = useState([])
  const [scores, setScores] = useState([])

  const teamCodes = useTeamCodes()

  useEffect(() => {
    getRegattaScores(season, regattaName)
      .then((scores) => {
        // console.log(scores.scores)
        setScores(scores.scores)

        let divs = new Set()
        let raceNums = new Set()
        scores.scores.forEach((score) => {
          divs.add(score.division)
          raceNums.add(score.raceNumber)
        })
        setDivs([...divs])
        setRaceNums([...raceNums])
      })
      .then(() => setLoaded(true))
  }, [season, regattaName])

  useEffect(() => {
    if (raceNum == undefined) {
      setCurDiv('')
      setRacenumber(0)
      return
    }

    let newDiv = curDiv
    let newRaceNumber = raceNum.toUpperCase()

    if (
      raceNum.toUpperCase().includes('A') || //
      raceNum.toUpperCase().includes('B') ||
      raceNum.toUpperCase().includes('C')
    ) {
      newDiv = raceNum.slice(-1).toUpperCase()
      newRaceNumber = raceNum.slice(0, -1)

      setCurDiv(newDiv)
      setRacenumber(newRaceNumber)
    }
  }, [raceNum])

  const navigate = useNavigate()

  const SingleRaceTab = () => {
    return (
      <>
        <div>
          <table style={{ borderCollapse: 'collapse' }}>
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
                .filter((score) => score.raceNumber == raceNumber && score.division == curDiv)
                .sort((a, b) => a.score - b.score)
                .map((score, i) => {
                  let change = score.newRating - score.oldRating
                  return (
                    <tr key={i}>
                      <td>
                        <Link to={`/teams/${score.teamID}`} className='flexRowContainer'>
                          <img style={{ display: 'inline', maxHeight: '1.5rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[score.teamID]}-40.png`} />
                        </Link>
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
  const FullRegattaScores = () => {
    const accumulatedBoats = {}
    scores.forEach((score) => {
      if (accumulatedBoats[score.teamID + score.boatName] == undefined) {
        accumulatedBoats[score.teamID + score.boatName] = { score: 0, teamID: score.teamID, boatName: score.boatName }
      }
      accumulatedBoats[score.teamID + score.boatName].score += score.score
    })

    return (
      <>
        <div>
          <table style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th>Team</th>
                <th></th>
                {raceNums.map((num, i) => (
                  <th key={i}>
                    <Link to={`/regattas/${season}/${regattaName}/${num}${curDiv == '' ? 'A' : curDiv}`}>{num}</Link>
                  </th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(accumulatedBoats)
                .sort((a, b) => accumulatedBoats[a].score - accumulatedBoats[b].score)
                .map((boat, i) => {
                  const teamID = accumulatedBoats[boat].teamID
                  const boatName = accumulatedBoats[boat].boatName
                  const boatScore = accumulatedBoats[boat].score
                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>
                        <Link to={`/teams/${teamID}`} className='flexRowContainer'>
                          <img style={{ display: 'inline', maxHeight: '1.5rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[teamID]}-40.png`} />
                        </Link>
                      </td>
                      <td>
                        <Link to={`/teams/${teamID}`} style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{teamID}</span>
                          <span>{boatName}</span>
                        </Link>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {divisions.map((div, i) => (
                            <Link key={i} to={`/regattas/${season}/${regattaName}/${div}`}>
                              {div}
                            </Link>
                          ))}
                        </div>
                      </td>
                      {raceNums.map((num, j) => (
                        <td key={j}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {scores
                              .filter((score) => score.raceNumber == num && score.boatName == boatName && score.teamID == teamID)
                              .map((score, k) => (
                                <Link key={k} className='scoreEntry' to={`/regattas/${season}/${regattaName}/${num}${divisions[i]}`}>
                                  {score.score}
                                  <div className='raceSailorsTooltip'>
                                    <span>Skipper: {score.name}</span>
                                    <span>Crew: {score.partnerName}</span>
                                  </div>
                                </Link>
                              ))}
                          </div>
                        </td>
                      ))}
                      <td>{boatScore}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </>
    )
  }
  const DivisionTab = () => {
    const accumulatedBoats = {}
    scores.forEach((score) => {
      if (score.division == curDiv) {
        if (accumulatedBoats[score.teamID + score.boatName] == undefined) {
          accumulatedBoats[score.teamID + score.boatName] = { score: 0, teamID: score.teamID, boatName: score.boatName }
        }
        accumulatedBoats[score.teamID + score.boatName].score += score.score
      }
    })

    return (
      <>
        <div>
          <table style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th>Team</th>
                <th>Sailors</th>
                <th></th>
                {raceNums.map((num, i) => (
                  <th key={i}>
                    <Link to={`/regattas/${season}/${regattaName}/${num}${curDiv == '' ? 'A' : curDiv}`}>{num}</Link>
                  </th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(accumulatedBoats)
                .sort((a, b) => accumulatedBoats[a].score - accumulatedBoats[b].score)
                .map((boat, i) => {
                  const teamID = accumulatedBoats[boat].teamID
                  const boatName = accumulatedBoats[boat].boatName
                  const boatScore = accumulatedBoats[boat].score
                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>
                        <Link to={`/teams/${teamID}`} className='flexRowContainer'>
                          <img style={{ display: 'inline', maxHeight: '1.5rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[teamID]}-40.png`} />
                        </Link>
                      </td>
                      <td>
                        <Link to={`/teams/${teamID}`} style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{teamID}</span>
                          <span>{boatName}</span>
                        </Link>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {scores
                            .reduce((acc, s) => {
                              if (s.division !== curDiv) return acc
                              if (s.teamID !== teamID || s.boatName !== boatName) return acc

                              if (!acc.some((x) => x.sailorID === s.sailorID)) {
                                acc.push({ name: s.name, sailorID: s.sailorID })
                              }

                              return acc
                            }, [])
                            .map((s) => (
                              <Link key={s.sailorID} to={`/sailors/${s.sailorID}`}>
                                {s.name}
                              </Link>
                            ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {scores
                            .reduce((acc, s) => {
                              if (s.division !== curDiv) return acc
                              if (s.teamID !== teamID || s.boatName !== boatName) return acc

                              if (!acc.some((x) => x.partnerID === s.partnerID)) {
                                acc.push({ name: s.partnerName, partnerID: s.partnerID })
                              }

                              return acc
                            }, [])
                            .map((s) => (
                              <Link key={s.partnerID} to={`/sailors/${s.partnerID}`}>
                                {s.name}
                              </Link>
                            ))}
                        </div>
                      </td>
                      {raceNums.map((num, i) => (
                        <td key={i}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {scores
                              .filter((score) => score.raceNumber == num && score.division == curDiv && score.boatName == boatName && score.teamID == teamID)
                              .map((score) => (
                                <Link className='scoreEntry' to={`/regattas/${season}/${regattaName}/${num}${divisions[i]}`}>
                                  {score.score}
                                  <div className='raceSailorsTooltip'>
                                    <span>Skipper: {score.name}</span>
                                    <span>Crew: {score.partnerName}</span>
                                  </div>
                                </Link>
                              ))}
                          </div>
                        </td>
                      ))}
                      <td>{boatScore}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  const RegattaPage = () => {
    return (
      <>
        <div className='flexRowContainer' style={{ alignItems: 'center' }}>
          <h1 className='text-titlecase'>
            {regattaName} {raceNumber == 0 ? '' : raceNumber}
            {curDiv}
          </h1>
          <div className='flexRowContainer'>
            <Link to={`/regattas/${season}/${regattaName}`}>All</Link>
            {raceNums.map((num, i) => (
              <Link key={i} to={`/regattas/${season}/${regattaName}/${num}${curDiv == '' ? 'A' : curDiv}`}>
                {num}
              </Link>
            ))}
            {divisions.map((div, i) => (
              <Link key={i} to={`/regattas/${season}/${regattaName}/${raceNumber == 0 ? '' : raceNumber}${div}`}>
                {div}
              </Link>
            ))}
          </div>
        </div>
        {raceNum == undefined ? <FullRegattaScores /> : raceNumber == '' ? <DivisionTab /> : <SingleRaceTab />}
      </>
    )
  }

  const NotFound = () => {
    return (
      <div style={{ margin: 50 }}>
        Could not find any scores for {season} {regattaName}...
        <br /> Make sure it is spelled correctly!
      </div>
    )
  }

  return <>{loaded ? scores.length > 0 ? <RegattaPage /> : <NotFound /> : <Loader show={!loaded} />}</>
}

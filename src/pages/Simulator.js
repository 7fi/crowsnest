import { rating, predictWin, ordinal } from 'openskill'
import { useEffect, useState } from 'react'
import { getAllTeamsPredVals } from '../lib/firebase'
import PopupTeam from '../components/simulator/PopupTeam'
import { useSearchParams } from 'react-router-dom'
import { ord } from '../lib/hooks'

export default function Simulator() {
  const [allTeams, setAllTeams] = useState([])
  const [selectedTeams, setSelectedTeams] = useState([])
  const [selectedSailors, setSelectedSailors] = useState({})
  const [predictions, setPredictions] = useState(null)
  const [filterText, setFilterText] = useState('')
  const [squares, setSquares] = useState(false)
  const [byPreds, setByPreds] = useState(false)

  const filter = (e) => {
    setFilterText(e.target.value)
  }

  const [searchParams] = useSearchParams()
  const linkTeams = searchParams.get('teams')
  useEffect(() => {
    if (linkTeams) {
      // console.log(linkTeams.split(','))
      // setSelectedTeams(linkTeams.split(','))
      let splitTeams = linkTeams.split(',')
      // console.log(allTeams)
      setSelectedTeams(
        allTeams
          .filter((team) => splitTeams.includes(team.name))
          .sort((a, b) => {
            if (byPreds) {
              return predictions[b] - predictions[a]
            } else {
              return b.topRatingTR - a.topRatingTR
            }
          })
          .map((team) => team.name)
      )
    }
  }, [linkTeams, allTeams, byPreds])

  const makeRatings = (team) => {
    return [
      ...team.SkippersTR.filter((skipper) => selectedSailors[team.name]?.skipper.includes(skipper)) //
        .map((skipper) => rating({ mu: skipper.mu, sigma: skipper.sigma })), //
      ...team.CrewsTR.filter((crew) => selectedSailors[team.name]?.crew.includes(crew)) //
        .map((crew) => rating({ mu: crew.mu, sigma: crew.sigma })),
    ]
    const skippers = team.SkippersTR.slice(0, 3)
    const skipperRatings = skippers.map((skipper) => rating({ mu: skipper.mu, sigma: skipper.sigma }))
    console.log('MAKING RATINGS FOR:', team, skipperRatings)
    return [
      ...skipperRatings, //
      ...team.CrewsTR.slice(0, 3) //
        .map((crew) => rating({ mu: crew.mu, sigma: crew.sigma })),
    ]
  }

  useEffect(() => {
    getAllTeamsPredVals().then((teams) => {
      setAllTeams(teams.data.teams)
    })
  }, [])

  useEffect(() => {
    let teams = []
    let updatedSailors = { ...selectedSailors }

    allTeams
      .filter((team) => selectedTeams.includes(team.name))
      .forEach((team) => {
        if (!Object.keys(updatedSailors).includes(team.name)) {
          updatedSailors[team.name] = { skipper: [], crew: [] } // Initialize if not present
        }

        if (updatedSailors[team.name]?.skipper.length === 0) {
          updatedSailors[team.name].skipper = team.SkippersTR.slice(0, 3)
        }

        if (updatedSailors[team.name]?.crew.length === 0) {
          updatedSailors[team.name].crew = team.CrewsTR.slice(0, 3)
        }
        teams.push(makeRatings(team))
      })

    setSelectedSailors(updatedSailors)

    let p = {}
    const preds = predictWin(teams)
    allTeams.filter((team) => selectedTeams.includes(team.name)).forEach((t, i) => (p[t.name] = preds[i]))
    setPredictions(p)

    console.log(updatedSailors) // Final updated sailors state
  }, [selectedTeams, allTeams])

  const check = (e) => {
    console.log(e.target.value)
    if (selectedTeams.includes(e.target.value)) {
      setSelectedTeams((old) => old.filter((t) => t != e.target.value))
    } else {
      setSelectedTeams((old) => [...old, e.target.value])
    }
  }

  const newSelected = (team, selected) => {
    setSelectedSailors((old) => ({ ...old, [team]: selected }))
  }

  const TeamRow = ({ name }) => {
    const [windowOpen, setWindowOpen] = useState(false)

    const openWindow = () => setWindowOpen(true)
    const closeWindow = () => setWindowOpen(false)

    let focusTeam = allTeams.filter((team) => team.name == name)[0]
    let p = {}
    p[name] = 0
    const selectedTeams2 = allTeams.filter((team) => selectedTeams.includes(team.name) && team.name != name)
    selectedTeams2.forEach((team) => {
      const thisRatings = makeRatings(team)
      const focusRatings = makeRatings(focusTeam)
      const preds = predictWin([focusRatings, thisRatings])
      console.log(name, focusTeam.SkippersTR.slice(0, 3), focusRatings, focusRatings[0]?.mu, focusRatings[0]?.sigma)
      console.log(focusRatings.map((rating) => ord(rating.mu, rating.sigma, 1000)))
      console.log(team.name, thisRatings)
      console.log(thisRatings.map((rating) => ord(rating.mu, rating.sigma, 1000)))
      console.log(preds)
      p[team.name] = preds[0]
    })
    // console.log(name, p)

    return (
      <>
        {focusTeam ? (
          <>
            <PopupTeam team={focusTeam} closeWindow={closeWindow} visible={windowOpen} selected={selectedSailors[focusTeam?.name]} setSelected={newSelected} />
            <tr style={{ height: squares ? 100 : 'auto' }}>
              <td className='tdRightBorder' onClick={openWindow}>
                {name}
              </td>
              {selectedTeams.map((team) => (
                <td className='tdRightBorder' style={{ backgroundColor: p[team] == 0 ? 'var(--highlight3)' : p[team] > 0.5 ? `rgba(0,255,0,${(p[team] - 0.5) * 2})` : `rgba(255,0,0,${-2 * p[team] + 1})` }}>
                  {p[team] != 0 ? (p[team] * 100).toFixed(0) + '%' : ''}
                </td>
              ))}
            </tr>
          </>
        ) : (
          ''
        )}
      </>
    )
  }

  return (
    <div>
      {/* <div className='responsiveRowCol'> */}
      <table className='raceByRaceTable' style={{ width: 'fit-content', margin: 15 }}>
        <thead>
          <tr>
            <td></td>
            {selectedTeams
              .sort((a, b) => predictions[b] - predictions[a])
              .map((t) => (
                <td style={{ minWidth: 100, width: 100 }}>{t}</td>
              ))}
          </tr>
        </thead>
        <tbody>
          {selectedTeams.map((t) => (
            <TeamRow name={t} />
          ))}
        </tbody>
      </table>
      {/* <table className='raceByRaceTable' style={{ width: 'fit-content', height: 'fit-content' }}>
        <thead>
          <tr>
            <td>Name</td>
            <td>Win %</td>
          </tr>
        </thead>
        <tbody>
          {allTeams
            .filter((team) => selectedTeams.includes(team.name))
            .sort((a, b) => predictions[b.name] - predictions[a.name])
            .map((t) => (
              <tr>
                <td>{t.name}</td>
                <td> {(predictions[t.name] * 100).toFixed(0)}%</td>
              </tr>
            ))}
        </tbody>
      </table> */}
      <input className='flexGrowChild' placeholder='Search for a team' onChange={filter} />
      <input type='checkbox' onChange={() => setSquares((old) => !old)} checked={squares} />
      <input type='checkbox' onChange={() => setByPreds((old) => !old)} checked={byPreds} />
      <table className='raceByRaceTable'>
        <thead>
          <tr>
            <td></td>
            <td>Team</td>
          </tr>
        </thead>
        <tbody>
          {[
            ...allTeams.filter((team) => selectedTeams.includes(team.name)).sort((a, b) => b.topRatingTR - a.topRatingTR),
            ...allTeams
              .filter((team) => {
                if (selectedTeams.includes(team.name)) return false
                if (filterText !== '') {
                  return team.name.toLowerCase().includes(filterText.toLowerCase())
                }
                return true
              })
              .sort((a, b) => b.topRatingTR - a.topRatingTR)
              .slice(0, 10),
            ,
          ].map((team) => (
            <tr>
              <td className='tableColFit'>
                <input type='checkbox' checked={selectedTeams.includes(team.name)} onChange={check} value={team.name} />
              </td>
              <td>{team.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    // </div>
  )
}

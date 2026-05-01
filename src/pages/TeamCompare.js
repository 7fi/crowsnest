import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAllTeams, getComparisonRegattas, getComparisonStats, getTeamRecentSailors } from '../lib/apilib'
import RatingNum from '../components/RatingNum'
import { FaSortDown } from 'react-icons/fa'
import RatioBar from '../components/rankings/RatioBar'

export default function TeamCompare() {
  const [searchParams] = useSearchParams()
  const urlTeam1 = searchParams.get('team1')
  const urlTeam2 = searchParams.get('team2')

  const [teams, setTeams] = useState([])
  const [team1, setTeam1] = useState(urlTeam1)
  const [team1Sailors, setTeam1Sailors] = useState([])
  const [t1SelectedSailors, setT1SelectedSailors] = useState([])

  const [team2, setTeam2] = useState(urlTeam2)
  const [team2Sailors, setTeam2Sailors] = useState([])
  const [t2SelectedSailors, setT2SelectedSailors] = useState([])

  const [fleetRegattas, setFleetRegattas] = useState([])
  const [teamRegattas, setTeamRegattas] = useState([])
  const [selectedFleetRegattas, setSelectedFleetRegattas] = useState([])
  const [selectedTeamRegattas, setSelectedTeamRegattas] = useState([])

  const [stats, setStats] = useState({})

  const navigate = useNavigate()

  useEffect(() => {
    getAllTeams().then((tempTeams) => {
      setTeams(tempTeams)
      if (urlTeam1) setTeam1(urlTeam1)
      if (urlTeam2) setTeam2(urlTeam2)
    })
  }, [])

  useEffect(() => {
    navigate(`?team1=${team1}&team2=${team2}`)
  }, [team1, team2, navigate])

  useEffect(() => {
    getTeamRecentSailors(team1).then((sailors) => {
      setTeam1Sailors(sailors)
      setT1SelectedSailors(sailors.map((s) => s.sailorID))
    })
  }, [team1])

  useEffect(() => {
    getTeamRecentSailors(team2).then((sailors) => {
      setTeam2Sailors(sailors)
      setT2SelectedSailors(sailors.map((s) => s.sailorID))
    })
  }, [team2])

  useEffect(() => {
    if (t1SelectedSailors.length == 0 || t2SelectedSailors.length == 0) {
      setFleetRegattas([])
      setStats(null)
      return
    }
    getComparisonRegattas(t1SelectedSailors, t2SelectedSailors).then((tempRegattas) => {
      if (tempRegattas.length == 0) {
        setFleetRegattas([])
        setStats(null)
        return
      }
      setFleetRegattas(tempRegattas.fleet.map((r) => r.regatta))
      setSelectedFleetRegattas(tempRegattas.fleet.map((r) => r.regatta))

      setTeamRegattas(tempRegattas.team.map((r) => r.regatta))
      setSelectedTeamRegattas(tempRegattas.team.map((r) => r.regatta))
    })
  }, [t1SelectedSailors, t2SelectedSailors])

  useEffect(() => {
    if (t1SelectedSailors.length == 0 || t2SelectedSailors.length == 0 || fleetRegattas.length == 0) {
      setStats(null)
      return
    }

    getComparisonStats(team1, team2, t1SelectedSailors, t2SelectedSailors, selectedFleetRegattas, selectedTeamRegattas).then((stats) => {
      setStats(stats)
    })
  }, [t1SelectedSailors, t2SelectedSailors, selectedFleetRegattas, selectedTeamRegattas])

  return (
    <div>
      <div className='flexRowContainer' style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
        <select className='flexCol' value={team1} onChange={(e) => setTeam1(e.target.value)} style={{ fontSize: '1.1rem' }}>
          {teams.map((team) => (
            <option key={team.teamID} value={team.teamID}>
              {team.teamID}
            </option>
          ))}
        </select>
        <span>vs</span>
        <div className='flexRowContainer'>
          <select className='flexCol' value={team2} onChange={(e) => setTeam2(e.target.value)} style={{ fontSize: '1.1rem' }}>
            {teams.map((team) => (
              <option key={team.teamID} value={team.teamID}>
                {team.teamID}
              </option>
            ))}
          </select>
          <span style={{ position: 'absolute', transform: 'translate(205px, 2px)' }} className='secondaryText'>
            in f25/s26
          </span>
        </div>
      </div>
      <div className='responsiveRowCol' style={{ width: '100%', padding: '1rem' }}>
        <TeamSailors sailors={team1Sailors} selectedSailors={t1SelectedSailors} setSelectedSailors={setT1SelectedSailors} />
        <TeamSailors sailors={team2Sailors} selectedSailors={t2SelectedSailors} setSelectedSailors={setT2SelectedSailors} />
      </div>
      <div className='responsiveRowCol' style={{ width: '100%', padding: '0 1rem' }}>
        {fleetRegattas.length > 0 ? <RegattasList type='Fleet' regattas={fleetRegattas} selectedRegattas={selectedFleetRegattas} setSelectedRegattas={setSelectedFleetRegattas} /> : <></>}
        {teamRegattas.length > 0 ? <RegattasList type='Team' regattas={teamRegattas} selectedRegattas={selectedTeamRegattas} setSelectedRegattas={setSelectedTeamRegattas} /> : <></>}
        <div>
          {stats ? (
            <div>
              Out of <strong>{stats.head_to_head_races}</strong> fleet races, <br />
              {team1} scores <strong>{Math.abs(Math.floor(stats.avg_score_diff * 100) / 100)}</strong> {stats.avg_score_diff > 0 ? 'more' : 'fewer'} points on average <br />
              and beat {team2} <RatioBar ratio={stats.wins_for_a / stats.head_to_head_races} /> of the time
              <p>
                Out of <strong>{stats.races}</strong> team races, <br />
                {team1} beat {team2} <strong>{stats.wins}</strong> times or <RatioBar ratio={stats.wins / stats.races} /> of the time <br />
              </p>
            </div>
          ) : (
            <div>
              Could not find any races between {team1} and {team2}{' '}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TeamSailors({ sailors, selectedSailors, setSelectedSailors }) {
  const [sort, setSort] = useState('sr')

  return (
    <div style={{ maxHeight: '500px', overflow: 'scroll', flexGrow: 1 }}>
      <div className='flexRowContainer'>
        <button onClick={() => setSelectedSailors(sailors.map((s) => s.sailorID))}>Select All</button>
        <button
          onClick={() =>
            setSelectedSailors(
              sailors
                .filter((s) => {
                  const rt = s.rankType.split('.')
                  return rt.includes('sr') || rt.includes('cr')
                })
                .map((s) => s.sailorID),
            )
          }>
          Select Top Open
        </button>
        <button
          onClick={() =>
            setSelectedSailors(
              sailors
                .filter((s) => {
                  const rt = s.rankType.split('.')
                  return rt.includes('wsr') || rt.includes('wcr')
                })
                .map((s) => s.sailorID),
            )
          }>
          Select Top Women
        </button>
        <button onClick={() => setSelectedSailors([])}>Deselect</button>
      </div>
      <table className='raceByRaceTable'>
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th className='clickable' onClick={() => setSort('sr')} style={{ minWidth: 'calc(fit-content + 50px)' }}>
              {sort === 'sr' ? <FaSortDown /> : ''} Skipper
            </th>
            <th className='clickable' onClick={() => setSort('cr')}>
              {sort === 'cr' ? <FaSortDown /> : ''} Crew
            </th>
            <th className='clickable' onClick={() => setSort('wsr')}>
              {sort === 'wsr' ? <FaSortDown /> : ''} W Skipper
            </th>
            <th className='clickable' onClick={() => setSort('wcr')}>
              {sort === 'wcr' ? <FaSortDown /> : ''} W Crew
            </th>
          </tr>
        </thead>
        <tbody>
          {sailors
            ?.sort((a, b) => {
              return b[sort] - a[sort]
            })
            .map((sailor) => (
              <tr
                className='clickable'
                key={sailor.sailorID}
                onClick={() => {
                  if (!selectedSailors.includes(sailor.sailorID)) {
                    setSelectedSailors([...selectedSailors, sailor.sailorID])
                  } else {
                    setSelectedSailors(selectedSailors.filter((id) => id !== sailor.sailorID))
                  }
                }}>
                <td>
                  <input readOnly type='checkbox' checked={selectedSailors.includes(sailor.sailorID)} />
                </td>
                <td>{sailor.name}</td>
                <td>
                  <RatingNum highest={false} sailor={sailor} pos={'skipper'} type={'open'} raceType={'fleet'} />
                </td>
                <td>
                  <RatingNum highest={false} sailor={sailor} pos={'crew'} type={'open'} raceType={'fleet'} />
                </td>
                <td>
                  <RatingNum highest={false} sailor={sailor} pos={'skipper'} type={'women'} raceType={'fleet'} />
                </td>
                <td>
                  <RatingNum highest={false} sailor={sailor} pos={'crew'} type={'women'} raceType={'fleet'} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
function RegattasList({ type, regattas, selectedRegattas, setSelectedRegattas }) {
  return (
    <table style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th></th>
          <th>{type} Regatta</th>
        </tr>
      </thead>
      <tbody>
        {regattas.map((regatta) => (
          <tr
            key={regatta}
            className='clickable'
            onClick={() => {
              if (!selectedRegattas.includes(regatta)) {
                setSelectedRegattas([...selectedRegattas, regatta])
              } else {
                setSelectedRegattas(selectedRegattas.filter((id) => id !== regatta))
              }
            }}>
            <td>
              <input readOnly type='checkbox' checked={selectedRegattas.includes(regatta)} />
            </td>
            <td className='text-titlecase'>{regatta.replaceAll('-', ' ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

import { useEffect, useState } from 'react'
import { getTopSailors, searchSailors } from '../lib/apilib'
import { Link, useNavigate } from 'react-router-dom'
import useTeamCodes from '../lib/teamCodes'
import debounce from 'lodash.debounce'
import Loader from '../components/loader'

export default function EloSearch() {
  const [sailors, setSailors] = useState([])
  const teamCodes = useTeamCodes()
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const fetchResults = debounce(async (term) => {
    if (!term) {
      setSailors([])
      return
    }

    setLoading(true)
    try {
      const data = await searchSailors(term)
      setSailors(data)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }, 200)

  useEffect(() => {
    if (query === '') {
      getTopSailors('skipper', 'fleet', false).then((data) => {
        setSailors(data)
        setLoading(false)
      })
    } else {
      setLoading(true)
      fetchResults(query)
      return fetchResults.cancel
    }
  }, [query])

  const nav = useNavigate()

  return (
    <div style={{ margin: 15 }}>
      <div className='responsiveRowCol searchBarContainer'>
        {/* <div className='flexRowContainer flexWrap'>
          <Link to={'/rankings/skipper'}>
            <button className='buttonBG'>Top Open Skippers</button>
          </Link>
          <Link to={'/rankings/crew'}>
            <button className='buttonBG'>Top Open Crews</button>
          </Link>
          <Link to={'/rankings/skipper/women'}>
            <button className='buttonBG'>Top Women's Skippers</button>
          </Link>
          <Link to={'/rankings/crew/women'}>
            <button className='buttonBG'>Top Women's Crews</button>
          </Link>
          <Link to={'/rankings/trskipper'}>
            <button className='buttonBG'>Top Open TR Skippers</button>
          </Link>
          <Link to={'/rankings/trcrew'}>
            <button className='buttonBG'>Top Open TR Crews</button>
          </Link>
          <Link to={'/rankings/trskipper/women'}>
            <button className='buttonBG'>Top W TR Skippers</button>
          </Link>
          <Link to={'/rankings/trcrew/women'}>
            <button className='buttonBG'>Top W TR Crews</button>
          </Link>
        </div> */}
        <input className='flexGrowChild' style={{ minWidth: '15rem', height: '2rem' }} placeholder='Search by name / team' value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {!loading ? (
        <div style={{ maxHeight: 'calc(100% - 120px', overflowY: 'auto', position: 'absolute', marginTop: 55 }}>
          <table className='raceByRaceTable teamsTable'>
            <thead style={{ zIndex: 15 }}>
              <tr>
                <th style={{ minWidth: 50 }}></th>
                <th>Name</th>
                <th>Team</th>
                <th>Year</th>
              </tr>
            </thead>

            <tbody className='teamsTable'>
              {sailors?.map((sailor, index) => (
                <tr key={index} onClick={() => nav(`/rankings/${sailor.sailorID}`)}>
                  <td className='tableColFit'>
                    <div className='flexRowContainer sailorNameRow'>
                      <img style={{ display: 'inline', maxHeight: '1.5rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[sailor.teamID]}-40.png`} />
                    </div>
                  </td>
                  <td>{sailor.name}</td>
                  <td>{sailor.teamID}</td>
                  <td>20{sailor.year.toString().split(' ')[0].slice(-2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Loader show={true} />
      )}
    </div>
  )
}

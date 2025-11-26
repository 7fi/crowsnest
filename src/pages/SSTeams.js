import { getAllTeams } from '../lib/firebase'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Loader from '../components/loader'
import { FaSortUp, FaSortDown } from 'react-icons/fa'
import useTeamCodes from '../lib/teamCodes'
import RatingNum from '../components/RatingNum'
import useRegionColors from '../lib/regionColors'

export default function SSTeams() {
  const [teams, setTeams] = useState([])
  const [activeRegions, setActiveRegions] = useState([])
  const [allRegions, setAllRegions] = useState([])
  const [filterText, setFilterText] = useState('')
  const [reverse, setReverse] = useState(false)
  const [sort, setSort] = useState('top') // ['ratio', 'members', 'women', 'rating', 'team', 'womensteam']

  const [loaded, setLoaded] = useState(false)

  const manualTeams = [
    'Harvard',
    'Yale',
    'Stanford',
    'Roger Williams',
    'Brown',
    'Boston College',
    'Dartmouth',
    'Tulane',
    'Navy',
    'Coast Guard',
    'Georgetown',
    "St. Mary's",
    'Rhode Island',
    'Bowdoin',
    'Charleston',
    'Cornell',
    'MIT',
    'U. Miami',
    'Tufts',
    'Pennsylvania',
    'Hobart & William',
    'Fordham',
    'Jacksonville',
    'Northeastern',
    'George Washington',
    'Old Dominion',
    'South Florida',
    'Eckerd',
    'Webb Institute',
    'North Carolina State',
    'UC Santa Barbara',
    'Florida State',
    'Connecticut College',
    'Wisconsin',
    'Texas',
    'Michigan',
  ]

  const [searchParams] = useSearchParams()
  const linkRegion = searchParams.get('region')
  const linkSort = searchParams.get('sort')

  const temp = useRef(null)

  const teamCodes = useTeamCodes()
  const RegionColors = useRegionColors()

  useEffect(() => {
    setLoaded(false)
    getAllTeams()
      .then((tempTeams) => {
        let teams = tempTeams.data.teams
        setTeams(teams)
        let regions = tempTeams.data.teams.map((team) => team.region).filter((value, index, self) => self.indexOf(value) === index)
        if (linkRegion == null) {
          setActiveRegions(regions)
        } else {
          setActiveRegions([linkRegion])
        }

        if (linkSort != null) {
          setSort(linkSort)
        }

        setAllRegions(regions)
      })
      .then(() => setLoaded(true))
  }, [])
  const navigate = useNavigate()

  const toggleFilter = (region) => {
    if (activeRegions.indexOf(region) !== -1) {
      setActiveRegions(activeRegions.filter((reg) => reg !== region))
    } else {
      setActiveRegions((activeRegions) => [...activeRegions, region])
    }
  }
  const filter = (e) => {
    setFilterText(e.target.value)
  }

  const scrollToTop = () => {
    if (temp.current) {
      temp.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
    }
  }

  const filtered = teams
    .filter((team) => {
      if (filterText !== '') {
        return team.name.toLowerCase().includes(filterText.toLowerCase())
      }
      return true
    })
    .filter((team) => {
      let temp = true
      // if (byRatio || byMembers) {
      //   temp = team.memberCount > 0
      // }
      return activeRegions.indexOf(team.region) !== -1 && temp
    })
    .sort((a, b) => {
      if (reverse) [a, b] = [b, a]
      if (sort === 'ratio') return b.avgRatio - a.avgRatio
      else if (sort === 'members') return b.memberCount - a.memberCount
      else if (sort === 'rating') return b.avg - a.avg
      else if (sort === 'women') return b.topWomenRating - a.topWomenRating
      else if (sort === 'team') return b.topRatingTR - a.topRatingTR
      else if (sort === 'womensteam') return b.topWomenRatingTR - a.topWomenRatingTR
      // sort === 'top'
      else return b.topRating - a.topRating
    })

  return (
    // style={{ position: 'fixed', overflowY: 'hidden', zIndex: 100 }}
    <div>
      <div className='flexRowContainer filterHeader'>
        <input className='flexGrowChild' placeholder='Search for a team' onChange={filter} />
        <div className='flexRowContainer'>
          {Object.keys(RegionColors).map((region, i) => (
            <button key={i} style={{ backgroundColor: activeRegions.indexOf(region) !== -1 ? RegionColors[region] : '' }} className={`filterOption ${activeRegions.indexOf(region) !== -1 ? '' : 'filterInactive'}`} onClick={() => toggleFilter(region)}>
              {region}
            </button>
          ))}
          <button className='filterOption filterInactive' onClick={() => setActiveRegions(allRegions)}>
            Show all
          </button>
          <button className='filterOption filterInactive' onClick={() => setActiveRegions([])}>
            Hide all
          </button>
        </div>
      </div>
      {loaded ? (
        <div className='teamTableContainer' style={{ zIndex: 100 }}>
          <table className='raceByRaceTable teamsTable' ref={temp} style={{ backgroundColor: 'var(--bg)' }}>
            <thead>
              <tr>
                <th style={{ minWidth: 50 }}> </th>
                <th style={{ minWidth: 40, textAlign: 'right' }}></th>
                <th>Name</th>
                <th style={{ display: 'none' }}>Conference</th>
                <th
                  className='tableColFit tooltip'
                  onClick={() => {
                    setReverse(false)
                    setSort('top')
                  }}
                  style={{ minWidth: 80, textAlign: 'right' }}>
                  {sort === 'top' ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}
                  Open
                  <span className='tooltiptext'>Takes avg the top 3 from each pos</span>
                </th>
                <th
                  className='tableColFit tooltip'
                  onClick={() => {
                    setReverse(false)
                    setSort(sort === 'women' ? 'top' : 'women')
                  }}
                  style={{ minWidth: 95, textAlign: 'right' }}>
                  {sort === 'women' ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}
                  Women's
                  <span className='tooltiptext'>Takes avg the top 2 from each pos</span>
                </th>
                <th
                  className='tableColFit tooltip'
                  onClick={() => {
                    setReverse(false)
                    setSort(sort === 'team' ? 'top' : 'team')
                  }}
                  style={{ minWidth: 130, textAlign: 'right' }}>
                  {sort === 'team' ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}
                  Team Racing
                  <span className='tooltiptext'>Takes avg the top 3 from each pos</span>
                </th>
                <th
                  className='tableColFit tooltip'
                  onClick={() => {
                    setReverse(false)
                    setSort(sort === 'womensteam' ? 'top' : 'womensteam')
                  }}
                  style={{ minWidth: 125, textAlign: 'right' }}>
                  {sort === 'womensteam' ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}
                  Women's TR
                  <span className='tooltiptext'>Takes avg the top 3 from each pos</span>
                </th>
                <th
                  className='tableColFit tooltip'
                  onClick={() => {
                    setReverse(false)
                    setSort(sort === 'rating' ? 'top' : 'rating')
                  }}
                  style={{ minWidth: 110, textAlign: 'right' }}>
                  <span className='tooltiptext'>Avg Rating of all sailors</span>
                  {sort === 'rating' ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}Avg Rating
                </th>
                <th
                  style={{ minWidth: 113, textAlign: 'right' }}
                  className='tableColFit'
                  onClick={() => {
                    setReverse(false)
                    setSort(sort === 'ratio' ? 'top' : 'ratio')
                  }}>
                  {sort === 'ratio' ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}Percentage
                </th>
                <th
                  style={{ minWidth: 80, textAlign: 'right' }}
                  className='tableColFit'
                  onClick={() => {
                    if (sort === 'members') {
                      if (!reverse) {
                        setReverse(true)
                      } else {
                        setSort('top')
                        setReverse(false)
                      }
                    } else {
                      setSort('members')
                      setReverse(false)
                    }
                  }}>
                  {sort === 'members' ? reverse ? <FaSortUp /> : <FaSortDown /> : <></>}
                  Sailors
                </th>

                <th></th>
              </tr>
            </thead>
            <tbody className='teamsTable ssbody'>
              {manualTeams.map((team, index) => (
                <tr key={index}>
                  <td className='' style={{ width: 100, paddingLeft: 30 }}>
                    <img style={{ display: 'inline', maxHeight: '2.3rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[team]}.png`} />
                  </td>
                  <td>{index + 1}</td>
                  <td>{team}</td>
                </tr>
              ))}
              {filtered.length > 0 ? (
                filtered.slice(0, 36).map((team, index) => (
                  <tr key={index} className='clickable' onClick={() => navigate(`/teams/${team.name}`)}>
                    <td className='' style={{ width: 100, paddingLeft: 30 }}>
                      <img style={{ display: 'inline', maxHeight: '2.3rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[team.name]}.png`} />
                    </td>

                    <td className={`tableColFit`} style={{ width: 25 }}>
                      {(sort === 'rating' ? team.avg !== 0 : sort === 'women' ? team.topWomenRating !== 0 : sort === 'members' ? team.memberCount !== 0 : sort === 'ratio' ? team.avgRatio !== 0 : sort === 'team' ? team.topRatingTR !== 0 : team.topRating !== 0) ? (
                        index + 1
                      ) : (
                        <span className='secondaryText' style={{ textAlign: 'center' }}>
                          ~
                        </span>
                      )}
                    </td>

                    <td className='tableColFit'>
                      <strong style={{ fontFamily: 'Arial' }}>{team.name}</strong>
                    </td>
                    <td className='' style={{ display: 'none' }}>
                      <div className='filterOption' style={{ backgroundColor: RegionColors[team.region] }}>
                        {team.region}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', display: sort !== 'top' ? 'none' : 'table-cell' }}>
                      <RatingNum ratingNum={team.topRating} />
                    </td>
                    <td style={{ textAlign: 'right', display: sort !== 'women' ? 'none' : 'table-cell' }}>
                      <RatingNum ratingNum={team.topWomenRating} type={'women'} />
                    </td>
                    <td style={{ textAlign: 'right', display: sort !== 'team' ? 'none' : 'table-cell' }}>
                      <RatingNum ratingNum={team.topRatingTR} type={'open'} />
                    </td>
                    <td style={{ textAlign: 'right', display: sort !== 'womensteam' ? 'none' : 'table-cell' }}>
                      <RatingNum ratingNum={team.topWomenRatingTR} type={'women'} />
                    </td>
                    <td style={{ textAlign: 'right', display: sort !== 'rating' ? 'none' : 'table-cell' }}>{team.avg.toFixed(0)}</td>

                    <td style={{ textAlign: 'right', display: sort !== 'artio' ? 'none' : 'table-cell' }}>
                      <div className='ratioBarBg'>
                        <div className='ratioBar' style={{ width: team.avgRatio * 100 }}>
                          <span>{(team.avgRatio * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </td>
                    <td className='' style={{ textAlign: 'right', display: sort !== 'members' ? 'none' : 'table-cell' }}>
                      {team.memberCount}
                    </td>

                    <td></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <span style={{ width: '100%', position: 'absolute', textAlign: 'center', margin: 20 }}>Please select at least one conference!</span>
                </tr>
              )}
            </tbody>
          </table>
          <button
            className='scrollButton'
            onClick={() => {
              scrollToTop()
            }}>
            Back to top
          </button>
          {/* <ScrollButton element={temp} /> */}
        </div>
      ) : (
        <Loader show={!loaded} />
      )}
    </div>
  )
}

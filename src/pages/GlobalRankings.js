import { useEffect, useState } from 'react'
import { getTop100 } from '../lib/firebase'
import { Link, useNavigate } from 'react-router-dom'
import Loader from '../components/loader'
import useTeamCodes from '../lib/teamCodes'
import RatingNum from '../components/RatingNum'
import { useMobileDetect, useTeamRegions } from '../lib/hooks'
import useRegionColors from '../lib/regionColors'

export default function GlobalRankings({ pos, type, raceType }) {
  const [people, setPeople] = useState([])
  const [loaded, setLoaded] = useState(false)
  const isMobile = useMobileDetect()

  const regionColors = useRegionColors()
  const teamRegions = useTeamRegions()

  useEffect(() => {
    setLoaded(false)
    console.log(pos)
    getTop100(type, pos, raceType)
      .then((people) => {
        setPeople(people.data.sailors)
      })
      .then(() => setLoaded(true))
  }, [pos, type, raceType])

  const nav = useNavigate()
  const teamCodes = useTeamCodes()

  const Person = ({ member }) => {
    return (
      <>
        <tr className='contentBox clickable' onClick={() => nav(`/rankings/${member.key}`)}>
          <td className='tdRightBorder tableColFit secondaryText' style={{ color: '#aaa' }}>
            {member.rank}{' '}
          </td>
          <td className='tableColFit'>
            <div className='flexRowContainer'>
              <img style={{ display: 'inline', maxHeight: '1.5rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[member.team]}-40.png`} />
            </div>
          </td>
          <td className='tableColFit'>{member.name}</td>
          <td>{member.year.toString().slice(2)}</td>
          {/* <td className='tableColFit secondaryText'>{member.gender === 'F' ? 'W' : ''}</td> */}
          {isMobile ? (
            <></>
          ) : (
            <>
              <td>
                <div className='filterOption' style={{ backgroundColor: regionColors[teamRegions[member.team[member.team.length - 1]]], fontSize: '0.8rem' }}>
                  {teamRegions[member.team[member.team.length - 1]]}
                </div>
              </td>
              <td>{member.team[member.team.length - 1]}</td>
            </>
          )}
          {/* <td></td> */}
          <td style={{ textAlign: 'right' }}>
            <RatingNum type={type} pos={pos} ratingNum={member.rating} />
            {/* {member.rating.toFixed(0)} {type === 'women' ? <FaDiamond className='secondaryText' /> : ''} */}
          </td>
        </tr>
      </>
    )
  }

  return (
    <div style={{ margin: 15 }}>
      <div className='contentBox responsiveRowCol' style={{ marginTop: 80, justifyContent: 'space-between' }}>
        <div>
          <h2>
            Top 100 {raceType == 'fleet' ? 'Fleet Race' : 'Team Race'} {type[0].toUpperCase()}
            {type.slice(1)} {pos}s in Spring 25
          </h2>
          <div className='flexRowContainer'>
            <Link to={`/rankings/${pos === 'Skipper' ? (raceType == 'fleet' ? 'crew' : 'trcrew') : raceType == 'fleet' ? 'skipper' : 'trskipper'}${type === 'women' ? '/women' : ''}`}>
              <button>See {pos === 'Skipper' ? 'Crews' : 'Skippers'}</button>
            </Link>{' '}
            <Link to={`/rankings/${pos === 'Skipper' ? (raceType == 'fleet' ? 'skipper' : 'trskipper') : raceType == 'fleet' ? 'crew' : 'trcrew'}${type === 'women' ? '' : '/women'}`}>
              {' '}
              <button>See {type === 'women' ? 'Open' : "Women's"}</button>
            </Link>
            <Link to={`/rankings/${raceType === 'fleet' ? 'tr' + pos.toLowerCase() : pos.toLowerCase()}${type === 'women' ? '/women' : ''}`}>
              {' '}
              <button>See {raceType === 'fleet' ? 'Team Race' : 'Fleet Race'}</button>
            </Link>
          </div>
        </div>
        {raceType === 'fleet' ? (
          <div className='secondaryText' style={isMobile ? { maxWidth: '100%' } : { maxWidth: '45%' }}>
            This ranking requires a sailor to have 70 pairwise comparisons to out of conference sailors. So for example, two races vs 5 out of conference opponents would count as 10 comparisons. This was implemented to reduce the inflation of sailors who's rating is inaccurate due to a lack of conference diversity.
          </div>
        ) : (
          ''
        )}
      </div>
      {loaded ? (
        <table className='raceByRaceTable'>
          <thead>
            <tr>
              <th></th>
              <th style={{ minWidth: 50 }}></th>
              <th>Name</th>
              <th className='tableColFit'>Year</th>
              {!isMobile ? (
                <>
                  <th className='tableColFit'></th>
                  <th>Team</th>
                </>
              ) : (
                <></>
              )}
              <th style={{ textAlign: 'right' }}>Rating</th>
            </tr>
      </thead>
          <tbody>
            {people
              // .filter((member) => member.seasons[pos.toLowerCase()].includes('f24'))
              .map((person) => (
                <Person member={person} />
              ))}
          </tbody>
        </table>
      ) : (
        <Loader show={!loaded} />
      )}
    </div>
  )
}

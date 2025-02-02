import { useEffect, useState } from 'react'
import { getTop100 } from '../lib/firebase'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Loader from '../components/loader'
import useTeamCodes from '../lib/teamCodes'
import { FaDiamond } from 'react-icons/fa6'

export default function GlobalRankings({ pos, type }) {
  const [people, setPeople] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    console.log(pos)
    getTop100(type, pos)
      .then((people) => {
        setPeople(people.data.sailors)
      })
      .then(() => setLoaded(true))
  }, [pos, type])

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
            <div className='flexRowContainer sailorNameRow'>
              <img style={{ display: 'inline', maxHeight: '3rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[member.team]}.png`} />
            </div>
          </td>
          <td className='tableColFit'>{member.name}</td>
          {/* <td className='tableColFit secondaryText'>{member.gender == 'F' ? 'W' : ''}</td> */}
          <td>{member.team[member.team.length - 1]}</td>
          <td style={{ textAlign: 'right' }}>
            {member.rating.toFixed(0)} {type == 'women' ? <FaDiamond className='secondaryText' /> : ''}
          </td>
        </tr>
      </>
    )
  }

  return (
    <div style={{ margin: 15 }}>
      <div className='contentBox' style={{ marginTop: 80 }}>
        <h2>
          Top 100 {type[0].toUpperCase()}
          {type.slice(1)} {pos}s in Fall 24
        </h2>
        <div className='flexRowContainer'>
          <Link to={`/rankings/${pos == 'Skipper' ? 'crew' : 'skipper'}${type == 'women' ? '/women' : ''}`}>
            <button>See {pos == 'Skipper' ? 'Crews' : 'Skippers'}</button>
          </Link>{' '}
          <Link to={`/rankings/${pos == 'Skipper' ? 'skipper' : 'crew'}${type == 'women' ? '' : '/women'}`}>
            {' '}
            <button>See {type == 'women' ? 'Open' : "Women's"}</button>
          </Link>
        </div>
      </div>
      {loaded ? (
        <table className='raceByRaceTable'>
          <thead>
            <tr>
              <th></th>
              <th style={{ minWidth: 50 }}></th>
              <th>Name</th>
              <th>Team</th>
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

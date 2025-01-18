import { useEffect, useState } from 'react'
import { getTop100Crews, getTop100Skippers } from '../lib/firebase'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Loader from '../components/loader'

export default function GlobalRankings({ pos }) {
  const [people, setPeople] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    console.log(pos)
    if (pos == 'Skipper') {
      getTop100Skippers()
        .then((people) => {
          setPeople(people.data.sailors)
        })
        .then(() => setLoaded(true))
    } else if (pos == 'Crew') {
      getTop100Crews()
        .then((people) => {
          setPeople(people.data.sailors)
        })
        .then(() => setLoaded(true))
    }
  }, [pos])

  const nav = useNavigate()

  const Person = ({ member }) => {
    return (
      <>
        <tr className='contentBox clickable' onClick={() => nav(`/rankings/${member.key}`)}>
          <td className='tdRightBorder tableColFit secondaryText' style={{ color: '#aaa' }}>
            {member.rank}{' '}
          </td>
          <td className='tableColFit'>{member.name}</td>
          <td>{member.team[member.team.length - 1]}</td>
          <td style={{ textAlign: 'right' }}>{member.rating.toFixed(2)}</td>
        </tr>
      </>
    )
  }

  return (
    <>
      <div className='contentBox' style={{ marginTop: 80 }}>
        <h2>Top 100 {pos}s in Fall 24</h2>
        <Link to={`/rankings/${pos == 'Skipper' ? 'crew' : 'skipper'}`}>See {pos == 'Skipper' ? 'Crews' : 'Skippers'}</Link>
      </div>
      {loaded ? (
        <table className='raceByRaceTable'>
          <thead>
            <tr>
              <th></th>
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
    </>
  )
}

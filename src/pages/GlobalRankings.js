import { useEffect, useState } from 'react'
import { getTop100Crews, getTop100Skippers } from '../lib/firebase'
import { Link, useNavigate, useParams } from 'react-router-dom'

export default function GlobalRankings({ pos }) {
  const [people, setPeople] = useState([])

  useEffect(() => {
    console.log(pos)
    if (pos == 'Skipper') {
      getTop100Skippers().then((people) => {
        setPeople(people.data.sailors)
      })
    } else if (pos == 'Crew') {
      getTop100Crews().then((people) => {
        setPeople(people.data.sailors)
      })
    }
  }, [pos])

  const nav = useNavigate()

  const Person = ({ member }) => {
    return (
      <>
        <tr className='contentBox clickable' onClick={() => nav(`/crowsnest/rankings/${member.name}`)}>
          <td className='tdRightBorder tableColFit secondaryText' style={{ color: '#aaa' }}>
            {member.rank}{' '}
          </td>
          <td>{member.name}</td> <td>{member.team[member.team.length - 1]}</td>
          <td style={{ color: '#aaa' }}> {member.pos}</td>
          <td style={{ textAlign: 'right' }}>{member.rating.toFixed(2)}</td>
        </tr>
      </>
    )
  }

  return (
    <>
      <div className='contentBox' style={{ marginTop: 80 }}>
        <h2>Top 100 {pos}s in Fall 24</h2>
        <Link to={`/crowsnest/rankings/${pos == 'Skipper' ? 'crew' : 'skipper'}`}>See {pos == 'Skipper' ? 'Crews' : 'Skippers'}</Link>
      </div>
      <table className='raceByRaceTable'>
        <thead>
          <th></th>
          <th>Name</th>
          <th>Team</th>
          <th>Pos</th>
          <th style={{ textAlign: 'right' }}>Rating</th>
        </thead>
        <tbody>
          {people
            .filter((member) => member.seasons.includes('f24'))
            .map((person) => (
              <Person member={person} />
            ))}
        </tbody>
      </table>
    </>
  )
}

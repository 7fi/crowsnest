import { useEffect, useState } from 'react'
import { getTop100People } from '../lib/firebase'
import { Link, useParams } from 'react-router-dom'

export default function GlobalRankings() {
  const { position } = useParams()
  const [people, setPeople] = useState([])

  useEffect(() => {
    getTop100People().then((people) => {
      if (position == 'skipper') {
        setPeople(people.data.skippers)
      } else if (position == 'crew') {
        console.log(people.data)
        setPeople(people.data.crews)
      }
    })
  }, [position])

  const Person = ({ member }) => {
    return (
      <>
        <Link to={`/crowsnest/rankings/${member.pos.toLowerCase()}/${member.name}`}>
          <div className='contentBox'>
            <span style={{ color: '#aaa' }}>({member.rank}) </span>
            {member.name} ({member.team[member.team.length - 1]})<span style={{ color: '#aaa' }}> ({member.pos})</span> <span style={{ float: 'right' }}>Rating: {member.rating.toFixed(2)}</span>
          </div>
        </Link>
      </>
    )
  }

  return (
    <>
      <div className='contentBox' style={{ marginTop: 80 }}>
        <h2>Top 100 {position}s in Fall 24</h2>
      </div>
      <div className='contentBox'>
        {people
          .filter((member) => member.seasons.includes('f24'))
          .map((person) => (
            <Person member={person} />
          ))}
      </div>
    </>
  )
}

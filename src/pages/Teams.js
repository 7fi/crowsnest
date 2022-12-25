import { collection, getDocs, getFirestore } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Teams() {
  const [teams, setTeams] = useState([])
  const db = getFirestore()

  useEffect(() => {
    getDocs(collection(db, 'teamnames')).then((docs) => {
      // docs.forEach((doc) => console.log(doc.data()))
      let tempDocs = []
      docs.forEach((doc) => {
        tempDocs.push(doc.id)
      })
      setTeams(tempDocs)
    })
  }, [])

  console.log(teams)
  return (
    <main>
      <div className='contentBox'>
        <ul className='teamsList'>
          {teams.map((team) => (
            <li>
              <Link to={`/crowsnest/team/${team}`} className='text-titlecase'>
                {team}
              </Link>
            </li>
          ))}
        </ul>
        <Link to='/crowsnest/createteam'>
          <button>Create Team</button>
        </Link>
      </div>
    </main>
  )
}

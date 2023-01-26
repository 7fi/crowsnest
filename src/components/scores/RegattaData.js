import { useEffect, useState } from 'react'
import { getFirestore, collection, doc, getDoc } from 'firebase/firestore'

export default function RegattaData({ seasons, teams, regattas }) {
  const [season, setSeason] = useState(seasons[0])
  const [team, setTeam] = useState(teams[0])
  // setTeam(teams[0])
  // console.log(season)
  const [regatta, setRegatta] = useState('')
  const [regattas2, setRegattas] = useState(['Hi'])
  const db = getFirestore()

  useEffect(() => {
    const fetchData = async () => {
      console.log('TEAM', team)
      let docRef = doc(db, 'techscoreTeams', team)
      // console.log((await getDoc(docRef)).data().regattas)
      setRegattas(Object.keys((await getDoc(docRef)).data().regattas[season]))
      // console.log(regattas2)
    }
    fetchData().catch(console.error)
  }, [team])

  useEffect(() => {
    console.log('SEAON', season)
    console.log(regattas2)
  }, [regattas2])

  return (
    <>
      <div className="contentBox">
        <select onChange={(e) => setSeason(e.target.value)}>
          {[...Array(seasons.length)].map((e, i) => (
            <option value={seasons[i]}>{seasons[i]}</option>
          ))}
        </select>
        <select onChange={(e) => setTeam(e.target.value)}>
          {[...Array(teams.length)].map((e, i) => (
            <option value={teams[i]}>{teams[i]}</option>
          ))}
        </select>
        <select onChange={(e) => setRegatta(e.target.value)}>
          {[...Array(regattas2.length)].map((e, i) => (
            <option value={regattas2[i]}>{regattas2[i]}</option>
          ))}
        </select>
      </div>
    </>
  )
}

import { useEffect, useState } from 'react'
import { getFirestore, collection, doc, getDoc } from 'firebase/firestore'
import { FaTrash } from 'react-icons/fa'

export default function RegattaData({ seasons, teams, updateRegatta, removeRegatta }) {
  const [season, setSeason] = useState(seasons[0])
  const [team, setTeam] = useState(teams[0])
  const [regatta, setRegatta] = useState('')
  const [regattas, setRegattas] = useState({})
  const db = getFirestore()

  useEffect(() => {
    setTeam(teams[0])
  }, [teams])

  useEffect(() => {
    const fetchData = async () => {
      console.log('TEAM', team)
      if (team != undefined) {
        let docRef = doc(db, 'techscoreTeams', team)
        // console.log((await getDoc(docRef)).data().regattas)
        let regattas = (await getDoc(docRef)).data().regattas[season]
        // console.log(regattas)
        let sortedRegattas = Object.keys(regattas).sort(function (a, b) {
          // console.log(new Date(regattas[a].date) - new Date(regattas[b].date))
          if (regattas[a] != undefined && regattas[b] != undefined) return new Date(regattas[a].date) - new Date(regattas[b].date)
          return 0
        })
        let sortedMap = {}
        sortedRegattas.forEach((e) => {
          sortedMap[e] = regattas[e]
        })
        // console.log(sortedMap)
        setRegattas(sortedMap)
        setRegatta(Object.values(sortedMap)[0].link)
        // console.log(regattas2)
      }
    }
    fetchData().catch(console.error)
  }, [team])

  // useEffect(() => {
  //   console.log('SEAON', season)
  //   console.log(regattas)
  // }, [regattas])

  useEffect(() => {
    console.log('Regatta Changed:', regatta)
    updateRegatta(regatta)
  }, [regatta])

  return (
    <>
      <div className="contentBox flexRowContainer">
        <select onChange={(e) => setSeason(e.target.value)}>
          {[...Array(seasons.length)].map((e, i) => (
            <option key={i} value={seasons[i]}>
              {seasons[i]}
            </option>
          ))}
        </select>
        <select onChange={(e) => setTeam(e.target.value)}>
          {[...Array(teams.length)].map((e, i) => (
            <option key={i} value={teams[i]}>
              {teams[i]}
            </option>
          ))}
        </select>
        <select onChange={(e) => setRegatta(e.target.value)}>
          {Object.keys(regattas).map((e, i) => (
            <option key={i} value={regattas[e].link} defaultValue={0}>
              {e}
            </option>
          ))}
        </select>
        <button onClick={() => removeRegatta(regatta)}>
          <FaTrash />
        </button>
        {regatta}
      </div>
    </>
  )
}

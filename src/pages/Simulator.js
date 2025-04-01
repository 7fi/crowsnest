import { rating, predictWin, ordinal } from 'openskill'
import { useEffect, useState } from 'react'
import { getAllTeams } from '../lib/firebase'

export default function Simulator() {
  const [allTeams, setAllTeams] = useState([])
  const [selectedTeams, setSelectedTeams] = useState([])

  useEffect(() => {
    getAllTeams().then((teams) => {
      setAllTeams(teams)
      console.log(teams)
    })
  }, [])

  const a1 = rating()
  const a2 = rating({ mu: 33.564, sigma: 1.123 })
  const predictions = predictWin([[a1], [a2]])

  return <div>{predictions}</div>
}

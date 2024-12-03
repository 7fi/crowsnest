import { getSailorElo, getTeamElo } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import PosNegBarChart from '../components/PosNegBarChart'
import EloLineChart from '../components/EloLineChart'

export default function Rankings() {
  const { position, sailor } = useParams()
  const [rating, setRating] = useState(1500)
  const [sailorRaces, setSailorRaces] = useState([])

  useEffect(() => {
    let pos = position == 'crew' ? 'Crew' : 'Skipper'
    getSailorElo(sailor, pos).then((tempSailor) => {
      console.log(tempSailor)
      setRating(tempSailor.data.Rating.toFixed(0))
      setSailorRaces(tempSailor.data.races)
    })
    // getTeamElo('Northeastern').then((tempTeam) => {
    //   console.log(tempTeam)
    // })
  }, [sailor])

  return (
    <>
      <h2>
        Current {position} rating: {rating}
      </h2>
      <h2>Ranking changes by race</h2>
      <PosNegBarChart data={sailorRaces} />
      <h2>Ranking change over time </h2>
      <EloLineChart data={sailorRaces} />
      <a href={`https://scores.collegesailing.org/sailors/${sailor.toLowerCase().replace(' ', '-')}/`} target='1'>
        Techscore link
      </a>
    </>
  )
}

import { getSailorElo } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import VenueVS from '../components/rankings/VenueVS'
import Loader from '../components/loader'
import VSblock from '../components/rankings/VSblock'
import ProCheck from '../components/rankings/ProCheck'

export default function VersusRanking() {
  const { sailorAName, sailorBName } = useParams()
  const [sailorA, setSailorA] = useState([])
  const [aRaces, setARaces] = useState([])
  const [sailorB, setSailorB] = useState([])
  const [bRaces, setBRaces] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getSailorElo(sailorAName).then((sa) => {
      setSailorA([])
      setARaces([])
      sa?.docs.forEach((sailor) => {
        if (sailor != undefined) {
          setSailorA((sailorA) => [...sailorA, sailor?.data()])
          setARaces((aRaces) => [...aRaces, ...sailor?.data().races])
        }
      })
    })
    getSailorElo(sailorBName)
      .then((sa) => {
        setSailorB([])
        setBRaces([])
        sa?.docs.forEach((sailor) => {
          setSailorB((sailorB) => [...sailorB, sailor?.data()])
          setBRaces((bRaces) => [...bRaces, ...sailor?.data().races])
        })
      })
      .then(() => {
        setLoaded(true)
      })
  }, [sailorAName, sailorBName])

  return (
    <div style={{ padding: 15 }}>
      {loaded ? (
        <ProCheck>
          <div>
            <h2>
              {sailorAName} vs {sailorBName}
            </h2>
            <VSblock sailorsA={sailorA} sailorsB={sailorB} />
            <h2>Avg ratio by venue</h2>
            <VenueVS racesA={aRaces} racesB={bRaces} sailorAName={sailorAName} sailorBName={sailorBName} />
          </div>
        </ProCheck>
      ) : (
        <Loader show={!loaded} />
      )}
    </div>
  )
}

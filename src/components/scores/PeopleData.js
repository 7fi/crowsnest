import { useEffect, useState } from 'react'
import { getFirestore, collection, doc, getDoc } from 'firebase/firestore'
import { FaTrash } from 'react-icons/fa'

export default function PeopleData({ index, people, updateRegatta, removeRegatta }) {
  const [person, setRegatta] = useState('')
  const [people, setRegattas] = useState({})
  const db = getFirestore()

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
        <button onClick={() => removeRegatta(regatta)}>
          <FaTrash />
        </button>
      </div>
    </>
  )
}

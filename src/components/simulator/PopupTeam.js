import { ordinal, rating } from 'openskill'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ord } from '../../lib/hooks'

export default function PopupTeam({ team, closeWindow, visible, selected, setSelected }) {
  const selectionChanged = (e) => {
    console.log(e.target.value)
  }

  const people = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank']

  // State to hold selected people for each dropdown dynamically
  const [selectedPeople, setSelectedPeople] = useState(
    Array.from({ length: 6 }, (_, index) => ({
      [`person${index + 1}`]: '',
    })).reduce((acc, curr) => ({ ...acc, ...curr }), {}) // Flatten to one object
  )

  // Handle dropdown change
  const handleSelectChange = (e) => {
    const { name, value } = e.target
    const newSelectedPeople = { ...selectedPeople, [name]: value }
    setSelectedPeople(newSelectedPeople)
    selectionChanged(newSelectedPeople) // Passing to parent component
  }
  const selectedValues = Object.values(selectedPeople)

  const dropdowns = Array.from({ length: 6 }, (_, index) => {
    const personKey = `person${index + 1}`
    // Filter out selected people for this dropdown
    const availableOptions = people.filter((person) => !selectedValues.includes(person))

    return (
      <select key={index} name={personKey} value={selectedPeople[personKey]} onChange={handleSelectChange}>
        <option value=''>Select Person {index + 1}</option>
        {availableOptions.map((person) => (
          <option key={person} value={person}>
            {person}
          </option>
        ))}
      </select>
    )
  })

  return (
    <div
      style={{ display: visible ? '' : 'none' }}
      className='popupBackground'
      // onClick={closeWindow}
    >
      <div className='popupWindow'>
        <div className='popupBar'>
          <Link to={`/teams/${team.name}`}>
            <h2>{team.name}</h2>
          </Link>
          <button onClick={closeWindow} className='popupX'>
            x
          </button>
        </div>
        <div>
          {selected?.skipper?.map((member) => (
            <div>
              <select onChange={selectionChanged} defaultValue={member.key}>
                {team.SkippersTR.filter((m) => m.key != member.key).map((skipper) => (
                  <option>{skipper.name}</option>
                ))}
              </select>
              {/* <Link to={`/sailors/${member.key}`}>{member.name}</Link>  */}
              {ord(member.mu, member.sigma, 1000).toFixed(0)} {member.mu} {member.sigma}
            </div>
          ))}
          {selected?.crew?.map((member) => (
            <div>
              <Link to={`/sailors/${member.key}`}>{member.name}</Link> {ord(member.mu, member.sigma, 1000).toFixed(0)}
            </div>
          ))}
        </div>
        <div>
          <h3>Select People</h3>
          {dropdowns}
        </div>
      </div>
    </div>
  )
}

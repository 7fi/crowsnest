import { useState } from 'react'

export default function Name({ name }) {
  const [prevClickTime, setPrevClickTime] = useState(Date.now())

  return (
    <button draggable='true' className='name draggable' onClick={handleClick} data-boatDisplay='true'>
      {name}
    </button>
  )
}
function handleClick() {}

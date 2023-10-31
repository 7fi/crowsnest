import { useState } from 'react'

export default function Name({ name, prov }) {
  const [prevClickTime, setPrevClickTime] = useState(Date.now())

  return (
    <button ref={prov?.innerRef} {...prov?.draggableProps} {...prov?.dragHandleProps} className='name' onClick={handleClick} data-boatdisplay='true'>
      {name}
    </button>
  )
}
function handleClick() {}

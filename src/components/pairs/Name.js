import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { useState } from 'react'

export default function Name({ name, index }) {
  const [prevClickTime, setPrevClickTime] = useState(Date.now())

  return (
    <Draggable draggableId={'draggable2-' + index} index={index} key={index}>
      {(provided, snapshot) => (
        <button ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className='name' data-boatdisplay='true'>
          {name}
        </button>
      )}
    </Draggable>
  )
}

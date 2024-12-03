import { Link } from 'react-router-dom'
import AuthCheck from '../components/AuthCheck'
import Name from '../components/pairs/Name'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'

export default function TestDrag() {
  return (
    <main>
      <DragDropContext
        onDragEnd={(...props) => {
          // console.log(props)
        }}>
        <Droppable droppableId='droppable'>
          {(provided, _) => (
            <div className='nameList'>
              {[...Array(25)].map((e, i) => (
                <Draggable draggableId={'draggable2-' + i} index={i}>
                  {(provided, snapshot) => <Name name={'Test'} key={i} prov={provided} />}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </main>
  )
}

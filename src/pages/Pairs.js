import Name from '../components/pairs/Name'
import Pairing from '../components/pairs/Pairing'
import { useEffect, useState } from 'react'
import { getTeamWithName } from '../lib/firebase'
import { Link, useParams } from 'react-router-dom'
// import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'

export default function Page() {
  const [team, setTeam] = useState({})
  const { teamName } = useParams()

  useEffect(() => {
    getTeamWithName(teamName).then((tempTeam) => {
      setTeam(tempTeam.data)
    })
  }, [])

  // const memberList = ['Blake', 'Colin', 'Lucas', 'George', 'Devon', 'Irene', 'Hunter', 'Carter']
  const memberList = ['Blake', 'Colin', 'Lucas', 'George', 'Devon', 'Irene', 'Hunter', 'Annika', 'Asha', 'Caden', 'Carter', 'Christopher', 'Connor F', 'Conor K', 'Crawford', 'Dante', 'David', 'Elle', 'Jonas', 'Jonathan', 'Kat', 'Kiera', 'Maggie', 'Max L', 'Max S', 'Megan', 'Nathan', 'Neil', 'Niko', 'Summer']
  // console.log(team?.members?.length)

  return (
    <>
      {/* <div className='pairSlots'>{team?.members && [...Array(Math.ceil(team?.members?.length / 2) || 1)].map((e, i) => <Pairing />)}</div> */}
      {/* <div className='nameList'>{team?.members && [...Array(team?.members?.length || 1)].map((e, i) => <Name name={team?.members[i]?.displayName} />)}</div> */}
      <DragDropContext
        onDragEnd={(...props) => {
          // console.log(props)
        }}>
        <Droppable droppableId='droppable'>
          {(provided, _) => (
            <div className='pairSlots' ref={provided.innerRef} {...provided.droppableProps}>
              {[...Array(Math.ceil(memberList.length / 2) || 1)].map((e, i) => (
                <Draggable draggableId={'draggable-' + i} index={i} key={i}>
                  {(provided, snapshot) => <Pairing prov={provided} innerRef={provided.innerRef} />}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
          {/* </Droppable>
        <Droppable droppableId='droppable-2'> */}
          {(provided, _) => (
            <div className='nameList' ref={provided.innerRef} {...provided.droppableProps}>
              {[...Array(memberList.length || 1)].map((e, i) => (
                <Name name={memberList[i]} index={i} />
              ))}
              {/* {[...Array(25)].map((e, i) => (
                <Draggable draggableId={'draggable2-' + i} index={i}>
                  {(provided, snapshot) => <Name name={'Test'} key={i} prov={provided} />}
                </Draggable>
              ))} */}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* <Droppable
        droppableId='pairDrop'
        renderClone={(provided, snapshot, rubric) => (
          <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
            Item id: {items[rubric.source.index].id}
          </div>
        )}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {items.map((item) => (
              <Draggable draggableId={item.id} index={item.index}>
                {(provided, snapshot) => (
                  <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                    Item id: {item.id}
                  </div>
                )}
              </Draggable>
            ))}
          </div>
        )}
      </Droppable> */}
    </>
  )
}

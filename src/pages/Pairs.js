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

  const memberList = ['Blake', 'Colin', 'Lucas', 'George', 'Devon', 'Irene', 'Hunter', 'Carter']

  // console.log(team?.members?.length)

  return (
    <>
      {/* <div className='pairSlots'>{team?.members && [...Array(Math.ceil(team?.members?.length / 2) || 1)].map((e, i) => <Pairing />)}</div> */}
      {/* <div className='nameList'>{team?.members && [...Array(team?.members?.length || 1)].map((e, i) => <Name name={team?.members[i]?.displayName} />)}</div> */}
      <DragDropContext
        onDragEnd={(...props) => {
          // console.log(props)
        }}>
        <Droppable droppableId='droppable-1'>
          {(provided, _) => (
            <div className='pairSlots' ref={provided.innerRef} {...provided.droppableProps}>
              {[...Array(Math.ceil(memberList.length / 2) || 1)].map((e, i) => (
                <Draggable draggableId={'draggable-' + i} index={i} key={i}>
                  {(provided, snapshot) => <Pairing prov={provided} />}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <Droppable droppableId='droppable-2'>
          {(provided, _) => (
            <div className='nameList' ref={provided.innerRef} {...provided.droppableProps}>
              {[...Array(memberList.length || 1)].map((e, i) => (
                <Draggable draggableId={'draggable2-' + i} index={i} key={i}>
                  {(provided, snapshot) => <Name name={memberList[i]} prov={provided} />}
                </Draggable>
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
    </>
  )
}

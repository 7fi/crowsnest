import { FaBars } from 'react-icons/fa'
import Name from './Name'

export default function Pairing({ prov, innerRef }) {
  let slotNames = ['Skipper', 'Crew', 'Rot']
  return (
    <div className='pairing flexRowContainer' ref={innerRef} {...prov.draggableProps}>
      <div className='pairDrag' {...prov.dragHandleProps}>
        <FaBars />
      </div>
      {[...Array(3)].map((e, i) => (
        <div className='nameSlot' key={i}>
          <span className='text-bg slotName'>{slotNames[i]}</span>
          {/* <Name name='Test' /> */}
        </div>
      ))}
    </div>
  )
}

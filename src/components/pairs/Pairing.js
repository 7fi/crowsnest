import { FaBars } from 'react-icons/fa'
import Name from './Name'

export default function Pairing({}) {
  let slotNames = ['Skipper', 'Crew', 'Rot']
  return (
    <div className='pairing flexRowContainer' draggable='true'>
      <div className='pairDrag'>
        <FaBars />
      </div>
      {[...Array(3)].map((e, i) => (
        <div className='nameSlot'>
          <span className='text-bg slotName'>{slotNames[i]}</span>
          {/* <Name name='Test' /> */}
        </div>
      ))}
    </div>
  )
}

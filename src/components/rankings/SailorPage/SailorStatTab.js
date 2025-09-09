import { useState } from 'react'

export default function SailorStatTab({ titles, components }) {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  return (
    <div>
      <div className='flexRowContainer sailorStatTabContainer'>
        {titles.map((title, i) => (
          <div className='sailorStatTabButton' style={activeTabIndex == i ? { backgroundColor: 'var(--highlight1)', color: '#fff', border: '2px solid var(--highlight1)' } : {}} onClick={() => setActiveTabIndex(i)}>
            {title}
          </div>
        ))}
      </div>
      {components[activeTabIndex]}
    </div>
  )
}

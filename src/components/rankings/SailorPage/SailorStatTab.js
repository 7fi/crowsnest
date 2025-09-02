import { useState } from 'react'

export default function SailorStatTab({ titles, components }) {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  return (
    <div>
      <div className='flexRowContainer sailorStatTabContainer'>
        {titles.map((title, i) => (
          <div className='sailorStatTabButton' style={{ backgroundColor: activeTabIndex == i ? 'var(--bg)' : '', textDecoration: activeTabIndex == i ? 'underline' : '' }} onClick={() => setActiveTabIndex(i)}>
            {title}
          </div>
        ))}
      </div>
      {components[activeTabIndex]}
    </div>
  )
}

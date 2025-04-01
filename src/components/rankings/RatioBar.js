import { useEffect, useState } from 'react'

export default function RatioBar({ ratio }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (ratio == NaN) {
      setWidth(0)
    } else {
      setWidth(ratio * 100)
    }
  }, [ratio])
  return (
    <div className='ratioBarBg' style={{ overflow: 'hidden' }}>
      <div className='ratioBar' style={{ width: width, overflow: 'visible' }}>
        <span>{width.toFixed(1)}%</span>
      </div>
    </div>
  )
}

export default function RatioBar({ ratio }) {
  return (
    <div className='ratioBarBg' style={{ overflow: 'hidden' }}>
      <div className='ratioBar' style={{ width: ratio * 100, overflow: 'visible' }}>
        <span>{(ratio * 100).toFixed(1)}%</span>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useMobileDetect } from '../lib/hooks'

export default function DoubleSlider({ values = [], initialStart, initialEnd, onChange, showTicks = true }) {
  const mobile = useMobileDetect()
  let newValues = Array.from(values)

  if (mobile && newValues.length > 10) {
    newValues = newValues.slice(-10)
    initialStart = newValues[0]
    initialEnd = newValues[newValues.length - 1]
    console.log(newValues, initialStart, initialEnd)
  }

  const maxIndex = newValues.length - 1

  const initialStartIndex = initialStart && newValues.includes(initialStart) ? newValues.indexOf(initialStart) : 0

  const initialEndIndex = initialEnd && newValues.includes(initialEnd) ? newValues.indexOf(initialEnd) : maxIndex

  const [startIndex, setStartIndex] = useState(initialStartIndex)
  const [endIndex, setEndIndex] = useState(initialEndIndex)

  const sliderRef = useRef(null)
  const [draggingMode, setDraggingMode] = useState(null)
  const dragOffsetRef = useRef(0)

  useEffect(() => {
    if (!onChange) return
    const low = Math.min(startIndex, endIndex)
    const high = Math.max(startIndex, endIndex)
    onChange([newValues[low], newValues[high]])
  }, [startIndex, endIndex])

  const getIndexFromClientX = (clientX) => {
    if (!sliderRef.current) return 0
    const rect = sliderRef.current.getBoundingClientRect()
    const percent = (clientX - rect.left) / rect.width
    const clamped = Math.max(0, Math.min(1, percent))
    return Math.round(clamped * maxIndex)
  }

  const handlePointerDown = (e) => {
    if (!sliderRef.current) return
    sliderRef.current.setPointerCapture(e.pointerId)

    const clickedIndex = getIndexFromClientX(e.clientX)
    const low = Math.min(startIndex, endIndex)
    const high = Math.max(startIndex, endIndex)

    if (clickedIndex >= low && clickedIndex <= high) {
      setDraggingMode('range')
      dragOffsetRef.current = clickedIndex - low
      return
    }

    const distToStart = Math.abs(clickedIndex - startIndex)
    const distToEnd = Math.abs(clickedIndex - endIndex)

    if (distToStart <= distToEnd) {
      setDraggingMode('start')
      setStartIndex(clickedIndex)
    } else {
      setDraggingMode('end')
      setEndIndex(clickedIndex)
    }
  }

  const handlePointerMove = (e) => {
    if (!draggingMode) return
    const newIndex = getIndexFromClientX(e.clientX)

    if (draggingMode === 'start') {
      setStartIndex(newIndex)
    } else if (draggingMode === 'end') {
      setEndIndex(newIndex)
    } else if (draggingMode === 'range') {
      const rangeSize = Math.abs(endIndex - startIndex)
      let newLow = newIndex - dragOffsetRef.current
      newLow = Math.max(0, Math.min(maxIndex - rangeSize, newLow))
      const newHigh = newLow + rangeSize

      if (startIndex <= endIndex) {
        setStartIndex(newLow)
        setEndIndex(newHigh)
      } else {
        setStartIndex(newHigh)
        setEndIndex(newLow)
      }
    }
  }

  const handlePointerUp = (e) => {
    if (!sliderRef.current) return
    try {
      sliderRef.current.releasePointerCapture(e.pointerId)
    } catch {}
    setDraggingMode(null)
  }

  const low = Math.min(startIndex, endIndex)
  const high = Math.max(startIndex, endIndex)

  const percent = (index) => (maxIndex > 0 ? (index / maxIndex) * 100 : 0)

  return (
    <div className='range-container'>
      <div className='range-values'>
        <span>{newValues[low]}</span>
        <span>{newValues[high]}</span>
      </div>

      <div className={`slider-wrapper ${draggingMode ? 'dragging' : ''}`} ref={sliderRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
        <div className='slider-track' />

        {showTicks && (
          <div className='slider-ticks'>
            {newValues.map((_, i) => (
              <div key={i} className='slider-tick' style={{ left: `${percent(i)}%` }}>
                <span className='tick-label'>{newValues[i]}</span>
              </div>
            ))}
          </div>
        )}

        <div
          className='slider-range'
          style={{
            left: `${percent(low)}%`,
            width: `${percent(high) - percent(low)}%`,
          }}
        />

        <div
          className='slider-thumb'
          style={{ left: `${percent(startIndex)}%` }}
          onPointerDown={(e) => {
            e.stopPropagation()
            sliderRef.current.setPointerCapture(e.pointerId)
            setDraggingMode('start')
          }}
        />

        <div
          className='slider-thumb'
          style={{ left: `${percent(endIndex)}%` }}
          onPointerDown={(e) => {
            e.stopPropagation()
            sliderRef.current.setPointerCapture(e.pointerId)
            setDraggingMode('end')
          }}
        />
      </div>
    </div>
  )
}

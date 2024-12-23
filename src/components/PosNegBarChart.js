import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'

export default function PosNegBarChart({ data, dataKey, showLabels, color, alternate, syncID }) {
  const colors = ['#ffc658', '#82ca9d', '#8884d8', '#ff8042', '#8dd1e1']
  const eventToColor = {}
  const navigate = useNavigate()

  // const data = datax.map((race, index) => ({ race, change: datay[index] }))

  data.forEach(({ raceID }) => {
    const event = raceID.split('/')[0] + '/' + raceID.split('/')[1]
    if (!eventToColor[event]) {
      eventToColor[event] = colors[Object.keys(eventToColor).length % colors.length]
    }
  })

  // Custom Tick Component
  const CustomTick = ({ x, y, index }) => {
    const currentEvent = data[index]?.raceID.split('/')[0] + '/' + data[index]?.raceID.split('/')[1]
    const previousEvent = index > 0 ? data[index - 1]?.raceID.split('/')[0] + '/' + data[index - 1]?.raceID.split('/')[1] : null

    // Only render the label if the event is different from the previous one
    if (currentEvent !== previousEvent && showLabels) {
      return (
        <text
          x={x}
          y={y + 10} // Adjust vertical position for better alignment
          textAnchor='start'
          transform={`rotate(45, ${x}, ${y + 10})`} // Rotate text at the tick position
          fontSize={12}>
          {currentEvent}
        </text>
      )
    }
    return null // No label for non-unique events
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active) {
      // console.log(payload[0]?.payload)
      return (
        <>
          <div className='contentBox' style={{ padding: 4, fontSize: '0.8rem' }}>
            Sailor: {payload[0]?.payload.sailor}
            <br />
            Position: {payload[0]?.payload.pos}
            <br />
            Rating Change: {payload[0]?.payload.change.toFixed(2)}
            <br />
            Race Score : {payload[0]?.payload.score}
            <br />
            Predicted Score : {payload[0]?.payload.predicted}
            <br />
            Race Ratio: {payload[0]?.payload.ratio.toFixed(2)}
            <br />
            Partner: {payload[0]?.payload.partner}
            <br />
            Race ID: {payload[0]?.payload?.raceID.split('/')[1]}/{payload[0]?.payload?.raceID.split('/')[2]}
          </div>
        </>
      )
    }

    return null
  }

  let offset = Math.floor(Math.random() * colors.length + 1)
  return (
    <ResponsiveContainer width='100%' height={showLabels ? 400 : 120}>
      <BarChart margin={{ top: 10, bottom: showLabels ? 100 : 0 }} data={data} syncId={syncID}>
        <XAxis type='category' dataKey='raceID' tick={<CustomTick />} height={showLabels ? 60 : 0} interval={0} />
        <YAxis type='number' />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={dataKey} fill='#fff'>
          {data.map((entry, index) => {
            return (
              <Cell
                key={`cell-${index}`}
                onClick={() => {
                  navigate(`/rankings/regatta/${entry.raceID}/${entry.pos}`)
                }}
                fill={alternate ? colors[(offset + Math.floor(index % 2)) % colors.length] : color ? color : eventToColor[entry.raceID.split('/')[0] + '/' + entry.raceID.split('/')[1]]}
              />
            )
          })}
        </Bar>
        <ReferenceLine y={0} stroke='#000' />
      </BarChart>
      {/* <Legend /> */}
    </ResponsiveContainer>
  )
}

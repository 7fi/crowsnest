import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts'

export default function PosNegBarChart({ data, dataKey }) {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1']
  const eventToColor = {}

  // const data = datax.map((race, index) => ({ race, change: datay[index] }))

  data.forEach(({ raceID }) => {
    const event = raceID.split('/')[0] + '/' + raceID.split('/')[1]
    if (!eventToColor[event]) {
      eventToColor[event] = colors[Object.keys(eventToColor).length % colors.length]
    }
  })

  // Custom Tick Component
  const CustomTick = ({ x, y, payload, index }) => {
    const currentEvent = data[index]?.raceID.split('/')[0] + '/' + data[index]?.raceID.split('/')[1]
    const previousEvent = index > 0 ? data[index - 1]?.raceID.split('/')[0] + '/' + data[index - 1]?.raceID.split('/')[1] : null

    // Only render the label if the event is different from the previous one
    if (currentEvent !== previousEvent) {
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
      return (
        <>
          <div className='contentBox' style={{ padding: 4, fontSize: '0.8rem' }}>
            Rating Change: {payload[0]?.payload.change.toFixed(2)}
            <br />
            Race Score : {payload[0]?.payload.score}
            <br />
            Race Ratio: {payload[0]?.payload.ratio.toFixed(2)}
            <br />
            Race ID: {payload[0]?.payload?.raceID.split('/')[1]}/{payload[0]?.payload?.raceID.split('/')[2]}
          </div>
        </>
      )
    }

    return null
  }

  return (
    <ResponsiveContainer width='100%' height={400}>
      <BarChart margin={{ top: 20, right: 30, bottom: 100, left: 30 }} data={data}>
        <XAxis dataKey='raceID' tick={<CustomTick />} height={60} interval={0} />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={dataKey} fill='#fff'>
          {data.map((entry, index) => {
            return <Cell key={`cell-${index}`} fill={eventToColor[entry.raceID.split('/')[0] + '/' + entry.raceID.split('/')[1]]} />
          })}
        </Bar>
        <ReferenceLine y={0} stroke='#000' />
      </BarChart>
    </ResponsiveContainer>
  )
}

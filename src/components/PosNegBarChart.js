import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts'

export default function PosNegBarChart({ data }) {
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

  return (
    <ResponsiveContainer width='100%' height={400}>
      <BarChart margin={{ top: 20, right: 30, bottom: 100, left: 30 }} data={data}>
        <XAxis dataKey='raceID' tick={<CustomTick />} height={60} interval={0} />
        <YAxis />
        <Tooltip
          labelFormatter={(race, props) => {
            return `${props[0]?.value.toFixed(2)} ${race.split('/')[1]}/${race.split('/')[2]}`
          }}
        />
        <Bar dataKey='change' fill='#fff'>
          {data.map((entry, index) => {
            return <Cell key={`cell-${index}`} fill={eventToColor[entry.raceID.split('/')[0] + '/' + entry.raceID.split('/')[1]]} />
          })}
        </Bar>
        <ReferenceLine y={0} stroke='#000' />
      </BarChart>
    </ResponsiveContainer>
  )
}

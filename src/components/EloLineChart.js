import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function EloLineChart({ data }) {
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
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 35,
        }}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='raceID' tick={<CustomTick />} height={60} interval={0} />
        <YAxis />
        <Tooltip />
        <Line type='monotone' dataKey='newRating' stroke='#faa' />
        <Line type='monotone' dataKey='regAvg' stroke='#aaf' />
      </LineChart>
    </ResponsiveContainer>
  )
}

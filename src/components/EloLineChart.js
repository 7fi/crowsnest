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
  const CustomTooltip = ({ active, payload, label }) => {
    if (active) {
      return (
        <>
          <div className='contentBox' style={{ padding: 4, fontSize: '0.8rem' }}>
            Sailor Rating: {payload[0]?.payload.newRating.toFixed(2)}
            <br />
            Average Regatta Rating: {payload[0]?.payload.regAvg.toFixed(2)}
            <br />
            Race Score : {payload[0]?.payload.score}
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
        <Tooltip content={<CustomTooltip />} />
        <Line type='monotone' dataKey='newRating' stroke='#faa' dot={false} />
        <Line type='monotone' dataKey='regAvg' stroke='#aaf' dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

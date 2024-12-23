import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function EloLineChart({ data }) {
  // Custom Tick Component
  const CustomTick = ({ x, y, payload, index }) => {
    if (index == data.length) return null
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
      if (payload[0].payload?.raceID !== '/Start/' && payload[0].payload?.raceID !== '/END/') {
        return (
          <>
            <div className='chartTooltip'>
              Sailor Rating: {payload[0]?.payload?.newRating?.toFixed(2)}
              <br />
              Average Regatta Rating: {payload[0]?.payload?.regAvg?.toFixed(2)}
              <br />
              Race Position : {payload[0]?.payload?.pos}
              <br />
              <span className='text-titlecase'>
                Race: {payload[0]?.payload?.raceID?.split('/')[1].replace(/-/g, ' ')} {payload[0]?.payload?.raceID?.split('/')[2]}
              </span>
            </div>
          </>
        )
      }
    }

    return null
  }

  const mappedRaces = data
    .slice(0)
    .sort((a, b) => {
      let datea = new Date(a.date.seconds * 1000)
      let dateb = new Date(b.date.seconds * 1000)
      if (datea.getFullYear() != dateb.getFullYear()) {
        return datea.getFullYear() - dateb.getFullYear()
      }
      if (datea.getMonth() != dateb.getMonth()) {
        return datea.getMonth() - dateb.getMonth()
      }
      if (datea.getDate() != dateb.getDate()) {
        return datea.getDate() - dateb.getDate()
      }
      let raceNumA = parseInt(a.raceID.split('/')[2].slice(0, -1))
      let raceNumB = parseInt(b.raceID.split('/')[2].slice(0, -1))
      return raceNumA - raceNumB
    })
    .map((race, index) => {
      race.index = index
      if (race.pos == 'Crew') {
        race.crewElo = race.newRating
        // if (index == 0) race.skipperElo = 1500
        return race
      } else if (race.pos == 'Skipper') {
        race.skipperElo = race.newRating
        // if (index == 0) race.crewElo = 1500
        return race
      }
    })

  const extendData = (data) => {
    // Find the first and last valid points
    const firstValids = data.find((d) => d['skipperElo'] != null)
    const lastValids = [...data].reverse().find((d) => d['skipperElo'] != null)
    const firstValidc = data.find((d) => d['crewElo'] != null)
    const lastValidc = [...data].reverse().find((d) => d['crewElo'] != null)

    if (!firstValids || !lastValids) return data
    if (!firstValidc || !lastValidc) return data

    let start = { raceID: '/Start/', skipperElo: 1500, crewElo: 1500 }
    let end = { raceID: '/END/', skipperElo: lastValids.skipperElo, crewElo: lastValidc.crewElo }

    const extendedData = [start, ...data, end]
    console.log(extendedData[extendedData.length - 1])

    return extendedData
  }

  const extended = extendData(mappedRaces)

  const createRange = (start, end, gap) => Array.from({ length: Math.floor((end - start) / gap) + 1 }, (_, i) => start + i * gap)

  const CustomLegend = ({ payload }) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {payload?.map((entry, index) => (
          <div key={index} style={{ margin: '0 10px', display: 'flex', alignItems: 'center' }}>
            {/* Custom colored square */}
            <div
              style={{
                width: 20,
                height: 20,
                backgroundColor: entry.payload.stroke,
                marginRight: 5,
              }}
            />
            {/* Custom label with color */}
            <span style={{ color: entry.payload.stroke, fontWeight: 'bold' }}>{entry.value == 'crewElo' ? 'Crew Rating' : entry.value == 'skipperElo' ? 'Skipper Rating' : 'Regatta Average'}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={480}>
      <LineChart
        data={extended}
        margin={{
          top: 5,
          right: 5,
          left: 5,
          bottom: 130,
        }}>
        <CartesianGrid strokeDasharray='3 3' verticalCoordinatesGenerator={(props) => createRange(65, props.width, (props.width + 40) / 10)} />
        <XAxis dataKey='raceID' tick={<CustomTick />} height={60} interval={0} />
        <YAxis />
        <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
        <Line strokeWidth={2} type='monotone' dataKey='crewElo' connectNulls={true} stroke='#fda' dot={false} />
        <Line strokeWidth={2} type='monotone' dataKey='skipperElo' connectNulls={true} stroke='#faa' dot={false} />
        <Line strokeWidth={2} type='monotone' dataKey='regAvg' stroke='#aaf' dot={false} />
        <Legend content={<CustomLegend />} verticalAlign='top' height={36} />
      </LineChart>
    </ResponsiveContainer>
  )
}

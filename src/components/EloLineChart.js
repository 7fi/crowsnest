import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useMobileDetect } from '../lib/hooks'

export default function EloLineChart({ data }) {
  const [activeLines, setActiveLines] = useState(['crewRating', 'skipperRating', 'womenSkipperRating', 'womenCrewRating', 'regAvg']) // 'crewRating', 'skipperRating', 'womenSkipperRating', 'womenCrewRating',
  const [notAvailableLines, setNotAvailableLines] = useState([])
  const isMobile = useMobileDetect()

  useEffect(() => {
    // Create a temporary list to collect the new values
    const newLines = []

    mappedRaces.forEach((race) => {
      if (race.skipperRating != null && !newLines.includes('skipperRating')) {
        newLines.push('skipperRating')
      }
      if (race.crewRating != null && !newLines.includes('crewRating')) {
        newLines.push('crewRating')
      }
      if (race.womenSkipperRating != null && !newLines.includes('womenSkipperRating')) {
        newLines.push('womenSkipperRating')
      }
      if (race.womenCrewRating != null && !newLines.includes('womenCrewRating')) {
        newLines.push('womenCrewRating')
      }
    })

    // Update the state with the new list
    const unavaiable = ['crewRating', 'skipperRating', 'womenSkipperRating', 'womenCrewRating'].filter((line) => !newLines.includes(line) && line != 'regAvg')
    setActiveLines([...newLines, 'regAvg'])
    setNotAvailableLines(unavaiable)
  }, [data])

  // Custom Tick Component
  const CustomTick = ({ x, y, payload, index }) => {
    if (index == mappedRaces.length) return null
    const currentEvent = mappedRaces[index]?.raceID.split('/')[0] + '/' + mappedRaces[index]?.raceID.split('/')[1]
    const previousEvent = index > 0 ? mappedRaces[index - 1]?.raceID.split('/')[0] + '/' + mappedRaces[index - 1]?.raceID.split('/')[1] : null

    // Only render the label if the event is different from the previous one
    if (currentEvent !== previousEvent) {
      return (
        <text
          fill='var(--text)'
          x={x}
          y={y + 10} // Adjust vertical position for better alignment
          transform={`rotate(45, ${x}, ${y + 10})`} // Rotate text at the tick position
          className='chartLabel'>
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
              Skipper Rating: {payload[0]?.payload?.skipperRating?.toFixed(2)}
              <br />
              {/* Skipper Sigma: {payload[0]?.payload?.skipperSigma?.toFixed(2)}
              <br /> */}
              Crew Rating: {payload[0]?.payload?.crewRating?.toFixed(2)}
              <br />
              Women Skipper Rating: {payload[0]?.payload?.womenSkipperRating?.toFixed(2)}
              <br />
              Women Crew Rating: {payload[0]?.payload?.womenCrewRating?.toFixed(2)}
              <br />
              Average Regatta Rating: {payload[0]?.payload?.regAvg?.toFixed(2)}
              <br />
              Race Position: {payload[0]?.payload?.pos}
              <br />
              <span className='text-titlecase'>
                Race: {payload[0]?.payload?.raceID?.split('/')[1].replace(/-/g, ' ')} {payload[0]?.payload?.raceID?.split('/')[2]}
              </span>
              <br />
              {/* <span>{new Date(payload[0]?.payload?.date.seconds * 1000).toDateString()}</span> */}
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
      // if (race.pos == 'Crew') {
      //   race.crewElo = race.newRating
      //   return race
      // } else if (race.pos == 'Skipper') {
      //   race.skipperElo = race.newRating
      //   return race
      // }
      if (race.skipperRating == 1000) {
        race.skipperRating = null
      }
      if (race.crewRating == 1000) {
        race.crewRating = null
      }
      if (race.womenSkipperRating == 1000) {
        race.womenSkipperRating = null
      }
      if (race.womenCrewRating == 1000) {
        race.womenCrewRating = null
      }
      return race
    })

  // mappedRaces.forEach((race) => {
  //   if(race.skipperRating != null && !activeLines.includes('skipperRating')) setActiveLines((prev) => [...prev, 'skipperRating'])
  //   if(race.crewRating != null && !activeLines.includes('crewRating')) setActiveLines((prev) => [...prev, 'crewRating'])
  //   if(race.womenSkipperRating != null && !activeLines.includes('womenSkipperRating')) setActiveLines((prev) => [...prev, 'womenSkipperRating'])
  //   if(race.womenCrewRating != null && !activeLines.includes('womenCrewRating')) setActiveLines((prev) => [...prev, 'womenCrewRating'])
  // })

  const extendData = (data) => {
    // Find the first and last valid points
    const firstValids = data.find((d) => d['skipperRating'] != null)
    const lastValids = [...data].reverse().find((d) => d['skipperRating'] != null)
    const firstValidc = data.find((d) => d['crewRating'] != null)
    const lastValidc = [...data].reverse().find((d) => d['crewRating'] != null)
    if (!firstValids || !lastValids) return data
    if (!firstValidc || !lastValidc) return data
    // let start = { raceID: '/Start/', skipperRating: null, crewRating: null, womenSkipperRating: null, womenCrewRating: null }
    let end = { raceID: '/END/', skipperRating: lastValids.skipperRating, crewRating: lastValidc.crewRating }
    const extendedData = [...data, end]
    return extendedData
  }

  const extended = extendData(mappedRaces)

  const createRange = (start, end, gap) => Array.from({ length: Math.floor((end - start) / gap) + 1 }, (_, i) => start + i * gap)

  const CustomLegend = ({ payload }) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {payload?.map((entry, index) =>
          !notAvailableLines.includes(entry.value) ? (
            <div
              key={index}
              className='clickable'
              style={{ margin: '0 10px', display: 'flex', alignItems: 'center' }}
              onClick={() => {
                if (activeLines.includes(entry.value)) {
                  if (activeLines.length > 1) setActiveLines(activeLines.filter((el) => el !== entry.value))
                } else {
                  setActiveLines((prev) => [...prev, entry.value])
                }
              }}>
              {/* Custom colored square */}
              <div
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: entry.payload.stroke,
                  marginRight: 5,
                  opacity: activeLines.includes(entry.value) ? '100%' : '50%',
                }}
              />
              {/* Custom label with color */}
              <span style={{ color: entry.payload.stroke, fontWeight: 'bold', opacity: activeLines.includes(entry.value) ? '100%' : '50%' }}>{entry.value == 'crewRating' ? 'Open Crew' : entry.value == 'skipperRating' ? 'Open Skipper' : entry.value == 'womenSkipperRating' ? "Women's Skipper" : entry.value == 'womenCrewRating' ? "Women's Crew" : 'Regatta Average'}</span>
            </div>
          ) : (
            <div key={index}></div>
          )
        )}
      </div>
    )
  }

  let uniqueRegattas = new Set()
  mappedRaces.forEach((race) => {
    if (race != undefined) {
      const [season, raceName] = race?.raceID.split('/') // Split the string into [season, raceName, raceNumber]
      const uniqueKey = `${season}/${raceName}` // Create a unique key by combining season and raceName
      uniqueRegattas.add(uniqueKey) // Add the unique key to the Set
    }
  })
  uniqueRegattas = Array.from(uniqueRegattas)

  return (
    <ResponsiveContainer width='100%' height={isMobile ? 250 : 480}>
      <LineChart data={extended} margin={!isMobile ? { top: 5, right: 5, left: 10, bottom: 130 } : { top: 5, right: 5, left: -10, bottom: -39 }}>
        <CartesianGrid strokeDasharray='3 3' verticalCoordinatesGenerator={(props) => createRange(65, props.width, (props.width + 40) / 10)} />
        <XAxis dataKey='raceID' tick={<CustomTick />} height={60} interval={0} />
        <YAxis label={!isMobile ? { value: 'Rating', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }, offset: 0 } : {}} />
        <Tooltip content={<CustomTooltip />} isAnimationActive={false} />

        <Line hide={!activeLines.includes('skipperRating')} strokeWidth={2} type='monotone' dataKey='skipperRating' connectNulls={true} stroke='#6088ff' dot={false} />
        <Line hide={!activeLines.includes('crewRating')} strokeWidth={2} type='monotone' dataKey='crewRating' connectNulls={true} stroke='#ffc259' dot={false} />
        <Line hide={!activeLines.includes('womenSkipperRating')} strokeWidth={2} type='monotone' dataKey='womenSkipperRating' connectNulls={true} stroke='#ff8585' dot={false} />
        <Line hide={!activeLines.includes('womenCrewRating')} strokeWidth={2} type='monotone' dataKey='womenCrewRating' connectNulls={true} stroke='#60b55e' dot={false} />
        <Line hide={!activeLines.includes('regAvg')} strokeWidth={2} type='monotone' dataKey='regAvg' stroke='#aaa' dot={false} />

        <Legend content={<CustomLegend />} verticalAlign='top' height={isMobile ? 55 : 36} />
      </LineChart>
    </ResponsiveContainer>
  )
}

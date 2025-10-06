import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts'
import { useMobileDetect } from '../lib/hooks'

export default function EloLineChart({ data, woman }) {
  const [activeLines, setActiveLines] = useState(['cr', 'sr', 'womenSkipperRating', 'womenCrewRating', 'tsr', 'tcr', 'wtsr', 'wtcr', 'regAvg']) // 'cr', 'skipperRating', 'womenSkipperRating', 'womenCrewRating',
  const [notAvailableLines, setNotAvailableLines] = useState([])
  const [allRaces, setAllRaces] = useState([])
  const [races, setRaces] = useState([])
  const isMobile = useMobileDetect()

  useEffect(() => {
    // Create a temporary list to collect the new values
    const newLines = []

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
        race.conf = [24 * (race.srmu + 3 * race.srsig + 1000 / 24), 24 * (race.srmu - 3 * race.srsig + 1000 / 24)]

        if (race.sr == 1000) {
          race.sr = null
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
        if (race.tsr == 1000) {
          race.tsr = null
        }
        if (race.tcr == 1000) {
          race.tcr = null
        }
        if (race.wtsr == 1000) {
          race.wtsr = null
        }
        if (race.wtcr == 1000) {
          race.wtcr = null
        }
        return race
      })

    // mappedRaces.forEach((race) => {
    //   if(race.skipperRating != null && !activeLines.includes('skipperRating')) setActiveLines((prev) => [...prev, 'skipperRating'])
    //   if(race.crewRating != null && !activeLines.includes('cr')) setActiveLines((prev) => [...prev, 'cr'])
    //   if(race.womenSkipperRating != null && !activeLines.includes('womenSkipperRating')) setActiveLines((prev) => [...prev, 'womenSkipperRating'])
    //   if(race.womenCrewRating != null && !activeLines.includes('womenCrewRating')) setActiveLines((prev) => [...prev, 'womenCrewRating'])
    // })

    mappedRaces.forEach((race) => {
      if (race.sr != null && !newLines.includes('sr')) {
        newLines.push('sr')
      }
      if (race.crewRating != null && !newLines.includes('cr')) {
        newLines.push('cr')
      }
      if (race.womenSkipperRating != null && !newLines.includes('womenSkipperRating')) {
        newLines.push('womenSkipperRating')
      }
      if (race.womenCrewRating != null && !newLines.includes('womenCrewRating')) {
        newLines.push('womenCrewRating')
      }
      if (race.tsr != null && !newLines.includes('tsr')) {
        newLines.push('tsr')
      }
      if (race.tcr != null && !newLines.includes('tcr')) {
        newLines.push('tcr')
      }
      if (race.wtsr != null && !newLines.includes('wtsr')) {
        newLines.push('wtsr')
      }
      if (race.wtcr != null && !newLines.includes('wtcr')) {
        newLines.push('wtcr')
      }
    })

    // Update the state with the new list
    const unavaiable = ['cr', 'sr', 'womenSkipperRating', 'womenCrewRating', 'tsr', 'tcr', 'wtsr', 'wtcr'].filter((line) => !newLines.includes(line) && line != 'regAvg')
    setActiveLines([...newLines, 'regAvg'])
    setNotAvailableLines(unavaiable)

    const extendData = (data) => {
      // Find the first and last valid points
      const firstValids = data.find((d) => d['sr'] != null)
      const lastValids = [...data].reverse().find((d) => d['sr'] != null)
      const firstValidc = data.find((d) => d['cr'] != null)
      const lastValidc = [...data].reverse().find((d) => d['cr'] != null)
      if (!firstValids || !lastValids) return data
      if (!firstValidc || !lastValidc) return data
      // let start = { raceID: '/Start/', skipperRating: null, crewRating: null, womenSkipperRating: null, womenCrewRating: null }
      let end = { raceID: '/END/', skipperRating: lastValids.skipperRating, crewRating: lastValidc.crewRating }
      const extendedData = [...data, end]
      return extendedData
    }

    const extended = extendData(mappedRaces)
    setRaces(extended)
    setAllRaces(mappedRaces)
  }, [data])

  // Custom Tick Component
  const CustomTick = ({ x, y, payload, index }) => {
    if (index == races.length) return null
    const currentEvent = races[index]?.raceID.split('/')[0] + '/' + races[index]?.raceID.split('/')[1]
    const previousEvent = index > 0 ? races[index - 1]?.raceID.split('/')[0] + '/' + races[index - 1]?.raceID.split('/')[1] : null

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
              <strong className='text-titlecase'>
                {payload[0]?.payload?.raceID?.split('/')[1].replace(/-/g, ' ')} {payload[0]?.payload?.raceID?.split('/')[2]}
              </strong>
              <table style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <td>{payload[0]?.payload?.raceID?.split('/')[0]}</td>
                    <td>Skipper</td>
                    <td>Crew</td>
                  </tr>
                </thead>
                <tbody>
                  {woman ? (
                    <>
                      <tr>
                        <td>Women's Fleet</td>
                        <td>{payload[0]?.payload?.womenSkipperRating?.toFixed(2)}</td>
                        <td>{payload[0]?.payload?.womenCrewRating?.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Women's Team</td>
                        <td>{payload[0]?.payload?.wtsr?.toFixed(2)}</td>
                        <td>{payload[0]?.payload?.wtcr?.toFixed(2)}</td>
                      </tr>
                    </>
                  ) : (
                    <></>
                  )}
                  <tr>
                    <td>Open Fleet</td>
                    <td>{payload[0]?.payload?.sr?.toFixed(2)}</td>
                    <td>{payload[0]?.payload?.crewRating?.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Open Team</td>
                    <td>{payload[0]?.payload?.tsr?.toFixed(2)}</td>
                    <td>{payload[0]?.payload?.tcr?.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              Avg Regatta {payload[0]?.payload?.pos}: {payload[0]?.payload?.regAvg?.toFixed(2)}
              <br />
              Position: {payload[0]?.payload?.pos}
              <br />
              <br />
              {/* <span>{new Date(payload[0]?.payload?.date.seconds * 1000).toDateString()}</span> */}
            </div>
          </>
        )
      }
    }

    return null
  }

  const updateRaces = (curLines) => {
    setRaces(() => {
      console.log(curLines)
      return allRaces.filter((race) => {
        let include = true
        if (!curLines.includes('sr')) {
          if (race.type == 'fleet' && !race.womens && race.pos == 'Skipper') {
            include = false
          }
        }
        if (!curLines.includes('tsr')) {
          if (race.type == 'team' && !race.womens && race.pos == 'Skipper') {
            include = false
          }
        }
        if (!curLines.includes('cr')) {
          if (race.type == 'fleet' && !race.womens && race.pos == 'Crew') {
            include = false
          }
        }
        if (!curLines.includes('tcr')) {
          if (race.type == 'team' && !race.womens && race.pos == 'Crew') {
            include = false
          }
        }
        if (!curLines.includes('womenSkipperRating')) {
          if (race.type == 'fleet' && race.womens && race.pos == 'Skipper') {
            include = false
          }
        }
        if (!curLines.includes('wtsr')) {
          if (race.type == 'team' && race.womens && race.pos == 'Skipper') {
            include = false
          }
        }
        if (!curLines.includes('womenCrewRating')) {
          if (race.type == 'fleet' && race.womens && race.pos == 'Crew') {
            include = false
          }
        }
        if (!curLines.includes('wtcr')) {
          if (race.type == 'team' && race.womens && race.pos == 'Crew') {
            include = false
          }
        }

        return include
      })
    })
  }

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
                if (entry.value != 'regAvg') {
                  if (activeLines.includes(entry.value)) {
                    if (activeLines.length > 2)
                      setActiveLines(() => {
                        updateRaces(activeLines.filter((el) => el !== entry.value))
                        return activeLines.filter((el) => el !== entry.value)
                      })
                  } else {
                    setActiveLines((prev) => {
                      updateRaces([...prev, entry.value])
                      return [...prev, entry.value]
                    })
                  }
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
              <span style={{ color: entry.payload.stroke, fontWeight: 'bold', opacity: activeLines.includes(entry.value) ? '100%' : '50%' }}>
                {entry.value == 'cr' ? 'Open Crew' : entry.value == 'sr' ? 'Open Skipper' : entry.value == 'womenSkipperRating' ? "Women's Skipper" : entry.value == 'womenCrewRating' ? "Women's Crew" : entry.value == 'tsr' ? 'Open TR Skipper' : entry.value == 'tcr' ? 'Open TR Crew' : entry.value == 'wtsr' ? "Women's TR Skipper" : entry.value == 'wtcr' ? "Women's TR Crew" : 'Regatta Average'}
              </span>
            </div>
          ) : (
            <div key={index}></div>
          )
        )}
      </div>
    )
  }

  let uniqueRegattas = new Set()
  let firstRaces = []
  races?.forEach((race) => {
    if (race != undefined) {
      const [season, raceName] = race?.raceID.split('/') // Split the string into [season, raceName, raceNumber]
      const uniqueKey = `${season}/${raceName}` // Create a unique key by combining season and raceName
      if (!uniqueRegattas.has(uniqueKey)) {
        firstRaces.push(race?.raceID)
      }
      uniqueRegattas.add(uniqueKey) // Add the unique key to the Set
    }
  })
  uniqueRegattas = Array.from(uniqueRegattas)
  firstRaces = Array.from(firstRaces)

  let refLines = firstRaces.map((regatta) => <ReferenceLine x={regatta} strokeDasharray='3 3' />)

  return (
    <ResponsiveContainer height={isMobile ? 250 : 480}>
      <ComposedChart data={races} margin={!isMobile ? { top: 5, right: 5, left: 10, bottom: 130 } : { top: 5, right: 5, left: -10, bottom: -39 }}>
        <CartesianGrid strokeDasharray='3 3' vertical={false} />

        {refLines}
        <Area dataKey='conf' stroke='#6088ff' fill='#6088ff55' />
        <XAxis dataKey='raceID' tick={<CustomTick />} height={60} interval={0} />
        <YAxis label={!isMobile ? { value: 'Rating', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }, offset: 0 } : {}} />
        <Tooltip content={<CustomTooltip />} isAnimationActive={false} />

        <Line hide={!activeLines.includes('sr')} strokeWidth={2} type='monotone' dataKey='sr' connectNulls={true} stroke='#6088ff' dot={false} />
        <Line hide={!activeLines.includes('cr')} strokeWidth={2} type='monotone' dataKey='cr' connectNulls={true} stroke='#ffc259' dot={false} />
        <Line hide={!activeLines.includes('womenSkipperRating')} strokeWidth={2} type='monotone' dataKey='womenSkipperRating' connectNulls={true} stroke='#ff8585' dot={false} />
        <Line hide={!activeLines.includes('womenCrewRating')} strokeWidth={2} type='monotone' dataKey='womenCrewRating' connectNulls={true} stroke='#60b55e' dot={false} />

        <Line hide={!activeLines.includes('tsr')} strokeWidth={2} type='monotone' dataKey='tsr' connectNulls={true} stroke='#a90000' dot={false} />
        <Line hide={!activeLines.includes('tcr')} strokeWidth={2} type='monotone' dataKey='tcr' connectNulls={true} stroke='#77dd84' dot={false} />
        <Line hide={!activeLines.includes('wtsr')} strokeWidth={2} type='monotone' dataKey='wtsr' connectNulls={true} stroke='#ef8b60' dot={false} />
        <Line hide={!activeLines.includes('wtcr')} strokeWidth={2} type='monotone' dataKey='wtcr' connectNulls={true} stroke='#8956e1' dot={false} />

        <Line hide={!activeLines.includes('regAvg')} strokeWidth={2} type='monotone' dataKey='regAvg' stroke='#aaa' dot={false} />

        <Legend content={<CustomLegend />} verticalAlign='top' height={isMobile ? 55 : 36} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

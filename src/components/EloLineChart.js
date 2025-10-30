import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts'
import { useMobileDetect } from '../lib/hooks'

export default function EloLineChart({ data, woman }) {
  const [activeLines, setActiveLines] = useState(['cr', 'sr', 'wsr', 'wcr', 'tsr', 'tcr', 'wtsr', 'wtcr', 'regAvg']) // 'cr', 'sr', 'wsr', 'wcr',
  const [notAvailableLines, setNotAvailableLines] = useState([])
  const [allRaces, setAllRaces] = useState([])
  const [races, setRaces] = useState([])
  const isMobile = useMobileDetect()

  useEffect(() => {
    const mappedRaces = data
      .slice(0)
      .sort((a, b) => {
        let datea = new Date(a.date)
        let dateb = new Date(b.date)
        if (datea - dateb != 0) {
          return datea - dateb
        }
        return a.raceNumber - b.raceNumber
      })
      .map((race, index) => {
        race.index = index

        race.conf = [24 * (race.srmu + 3 * race.srsig + 1000 / 24), 24 * (race.srmu - 3 * race.srsig + 1000 / 24)]

        race[race.ratingType] = race.newRating
        race.raceID = `${race.season}/${race.regatta}/${race.raceNumber}${race.division}`
        return race
      })

    // Create a temporary list to collect the new values
    const newLines = Array.from(new Set(mappedRaces.map((race) => race.ratingType)))

    // Update the state with the new list
    const unavaiable = ['cr', 'sr', 'wsr', 'wcr', 'tsr', 'tcr', 'wtsr', 'wtcr', 'conf'].filter((line) => !newLines.includes(line) && line != 'regAvg')
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
      // let start = { raceID: '/Start/', sr: null, cr: null, wsr: null, wcr: null }
      let end = { raceID: '/END/', sr: lastValids.sr, cr: lastValidc.cr }
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
    const currentEvent = races[index]?.season + '/' + races[index]?.regatta
    const previousEvent = index > 0 ? races[index - 1]?.season + '/' + races[index - 1]?.regatta : null

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
                {payload[0]?.payload?.regatta.replace(/-/g, ' ')} {payload[0]?.payload?.raceNumber + payload[0]?.payload?.division}
              </strong>
              <table style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <td>{payload[0]?.payload?.season}</td>
                    <td>Skipper</td>
                    <td>Crew</td>
                  </tr>
                </thead>
                <tbody>
                  {woman ? (
                    <>
                      <tr>
                        <td>Women's Fleet</td>
                        <td>{payload[0]?.payload?.wsr?.toFixed(2)}</td>
                        <td>{payload[0]?.payload?.wcr?.toFixed(2)}</td>
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
                    <td>{payload[0]?.payload?.cr?.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Open Team</td>
                    <td>{payload[0]?.payload?.tsr?.toFixed(2)}</td>
                    <td>{payload[0]?.payload?.tcr?.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              Avg Regatta {payload[0]?.payload?.race?.position}: {payload[0]?.payload?.regAvg?.toFixed(2)}
              <br />
              Position: {payload[0]?.payload?.race?.position}
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
      return allRaces.filter((race) => {
        let include = true
        if (!curLines.includes('sr')) {
          if (!race.ratingType.includes('t') && !race.raceType.includes('w') && race.position == 'Skipper') {
            include = false
          }
        }
        if (!curLines.includes('tsr')) {
          if (race.ratingType.includes('t') && !race.raceType.includes('w') && race.position == 'Skipper') {
            include = false
          }
        }
        if (!curLines.includes('cr')) {
          if (!race.ratingType.includes('t') && !race.raceType.includes('w') && race.position == 'Crew') {
            include = false
          }
        }
        if (!curLines.includes('tcr')) {
          if (race.ratingType.includes('t') && !race.raceType.includes('w') && race.position == 'Crew') {
            include = false
          }
        }
        if (!curLines.includes('wsr')) {
          if (!race.ratingType.includes('t') && race.raceType.includes('w') && race.position == 'Skipper') {
            include = false
          }
        }
        if (!curLines.includes('wtsr')) {
          if (race.ratingType.includes('t') && race.raceType.includes('w') && race.position == 'Skipper') {
            include = false
          }
        }
        if (!curLines.includes('wcr')) {
          if (!race.ratingType.includes('t') && race.raceType.includes('w') && race.position == 'Crew') {
            include = false
          }
        }
        if (!curLines.includes('wtcr')) {
          if (race.ratingType.includes('t') && race.raceType.includes('w') && race.position == 'Crew') {
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
              <span style={{ color: entry.payload.stroke, fontWeight: 'bold', opacity: activeLines.includes(entry.value) ? '100%' : '50%' }}>{entry.value == 'cr' ? 'Open Crew' : entry.value == 'sr' ? 'Open Skipper' : entry.value == 'wsr' ? "Women's Skipper" : entry.value == 'wcr' ? "Women's Crew" : entry.value == 'tsr' ? 'Open TR Skipper' : entry.value == 'tcr' ? 'Open TR Crew' : entry.value == 'wtsr' ? "Women's TR Skipper" : entry.value == 'wtcr' ? "Women's TR Crew" : 'Regatta Average'}</span>
            </div>
          ) : (
            <div key={index}></div>
          )
        )}
      </div>
    )
  }

  // let uniqueRegattas = new Set(races.map((race) => race.season + '/' + race.regatta))
  let uniqueRegattas = new Set()
  // let firstRaces = new Set(races.map((race) => `${race.season}/${race.regatta}`))
  let firstRaces = new Set()
  races?.forEach((race) => {
    const uniqueRegatta = `${race.season}/${race.regatta}`
    if (!uniqueRegattas.has(uniqueRegatta)) {
      firstRaces.add(race.raceID)
    }
    uniqueRegattas.add(uniqueRegatta)
  })
  uniqueRegattas = Array.from(uniqueRegattas)
  firstRaces = Array.from(firstRaces)

  let refLines = firstRaces.map((race) => <ReferenceLine x={race} strokeDasharray='3 3' />)

  return (
    <ResponsiveContainer height={isMobile ? 250 : 480}>
      <ComposedChart data={races} margin={!isMobile ? { top: 5, right: 5, left: 10, bottom: 130 } : { top: 5, right: 5, left: -10, bottom: -39 }}>
        <CartesianGrid strokeDasharray='3 3' vertical={false} />

        {refLines}
        <Area connectNulls dataKey='conf' stroke='#6088ff' fill='#6088ff55' />
        <XAxis dataKey='raceID' tick={<CustomTick />} height={60} interval={0} />
        <YAxis label={!isMobile ? { value: 'Rating', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }, offset: 0 } : {}} />
        <Tooltip content={<CustomTooltip />} isAnimationActive={false} />

        <Line hide={!activeLines.includes('sr')} strokeWidth={2} type='monotone' dataKey='sr' connectNulls={true} stroke='#6088ff' dot={false} />
        <Line hide={!activeLines.includes('cr')} strokeWidth={2} type='monotone' dataKey='cr' connectNulls={true} stroke='#ffc259' dot={false} />
        <Line hide={!activeLines.includes('wsr')} strokeWidth={2} type='monotone' dataKey='wsr' connectNulls={true} stroke='#ff8585' dot={false} />
        <Line hide={!activeLines.includes('wcr')} strokeWidth={2} type='monotone' dataKey='wcr' connectNulls={true} stroke='#60b55e' dot={false} />

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

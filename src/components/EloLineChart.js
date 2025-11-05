import { useEffect, useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts'
import { useMobileDetect } from '../lib/hooks'

export default function EloLineChart({ data, woman }) {
  const [activeLines, setActiveLines] = useState(['cr', 'sr', 'wsr', 'wcr', 'tsr', 'tcr', 'wtsr', 'wtcr', 'regAvg'])
  const [notAvailableLines, setNotAvailableLines] = useState([])
  const [allRaces, setAllRaces] = useState([]) // original mapped races (unsliced)
  const isMobile = useMobileDetect()

  // rating keys (all possible)
  const allKeys = ['sr', 'cr', 'wsr', 'wcr', 'tsr', 'tcr', 'wtsr', 'wtcr']

  // Helper: forward-fill only for the keys provided
  const forwardFill = (arr, keys) => {
    const filled = []
    const last = {}
    arr.forEach((d) => {
      const copy = { ...d }
      keys.forEach((k) => {
        if (copy[k] != null) last[k] = copy[k]
        else if (last[k] != null) copy[k] = last[k]
      })
      filled.push(copy)
    })
    return filled
  }

  useEffect(() => {
    if (!data || !data.length) return

    // Map & sort original races and set per-race fields
    const mappedRaces = data
      .slice(0)
      .sort((a, b) => {
        const datea = new Date(a.date)
        const dateb = new Date(b.date)
        return datea - dateb || a.raceNumber - b.raceNumber
      })
      .map((race, index) => {
        const copy = { ...race }
        copy.index = index
        copy.conf = [24 * (copy.srmu + 3 * copy.srsig + 1000 / 24), 24 * (copy.srmu - 3 * copy.srsig + 1000 / 24)]
        // assign the new rating to its ratingType key
        copy[copy.ratingType] = copy.newRating
        // Keep regAvg if it's present on the race object (or compute elsewhere if you do)
        // build raceID
        copy.raceID = `${copy.season}/${copy.regatta}/${copy.raceNumber}${copy.division}`
        return copy
      })

    setAllRaces(mappedRaces)

    // Determine which rating types are present in the dataset
    const present = Array.from(new Set(mappedRaces.map((r) => r.ratingType)))
    const unavailable = [...allKeys.filter((key) => !present.includes(key)), 'conf']
    // default activeLines: everything present plus regAvg
    setActiveLines((prev) => {
      // if previous has meaningful selection keep it, otherwise default
      // (but to keep behavior similar to original, set to all present + regAvg)
      return [...present, 'regAvg']
    })
    setNotAvailableLines(unavailable)
  }, [data])

  // decide whether a specific race should be included given current activeLines
  const shouldIncludeRace = (race, active) => {
    // if regAvg only, we still don't want to include races that are only for disabled lines
    // Use the same logic you had in updateRaces to match ratingType -> line mapping
    // If any of the active rating types apply to this race, include it.
    // active is an array of active keys (may include 'regAvg')
    if (!race) return false
    // If active includes 'sr' and this race is an open skipper race
    if (active.includes('sr')) {
      if (!race.ratingType.includes('t') && !race.ratingType.includes('w') && race.position === 'Skipper') return true
    }
    if (active.includes('tsr')) {
      if (race.ratingType.includes('t') && !race.ratingType.includes('w') && race.position === 'Skipper') return true
    }
    if (active.includes('wsr')) {
      if (!race.ratingType.includes('t') && race.ratingType.includes('w') && race.position === 'Skipper') return true
    }
    if (active.includes('wtsr')) {
      if (race.ratingType.includes('t') && race.ratingType.includes('w') && race.position === 'Skipper') return true
    }

    if (active.includes('cr')) {
      if (!race.ratingType.includes('t') && !race.ratingType.includes('w') && race.position === 'Crew') return true
    }
    if (active.includes('tcr')) {
      if (race.ratingType.includes('t') && !race.ratingType.includes('w') && race.position === 'Crew') return true
    }
    if (active.includes('wcr')) {
      if (!race.ratingType.includes('t') && race.ratingType.includes('w') && race.position === 'Crew') return true
    }
    if (active.includes('wtcr')) {
      if (race.ratingType.includes('t') && race.ratingType.includes('w') && race.position === 'Crew') return true
    }

    // If race.ratingType itself is exactly one of the active keys (fallback)
    if (active.includes(race.ratingType)) return true

    return false
  }

  // Compute the data to display on the chart (filtered -> forward-filled -> extended)
  const displayRaces = useMemo(() => {
    if (!allRaces || !allRaces.length) return []

    // visible rating keys (do not include regAvg here)
    const visibleKeys = allKeys.filter((k) => activeLines.includes(k))

    // filter original mapped races to keep only races that match at least one active visible key
    // If there are no visible keys (all toggled off), produce an empty array (or optionally keep regAvg-only)
    if (!visibleKeys.length) return []

    const filteredMapped = allRaces.filter((race) => shouldIncludeRace(race, activeLines))

    // If we have nothing after filtering, return empty
    if (!filteredMapped.length) return []

    // For regAvg: keep it copied from original races. If it's missing on an item, attempt to use race.regAvg or leave undefined.
    // Now forward-fill only the visible keys so disabled lines won't be re-created
    const filled = forwardFill(filteredMapped, visibleKeys)

    // Optionally ensure each filled item still keeps regAvg/conf/etc copied from original if present
    // (filteredMapped already contains their regAvg if they had it)
    const last = filled[filled.length - 1]
    // Append an END sentinel to push lines to the right edge. For regAvg, keep the value from last if present.
    const end = { ...last, raceID: '/END/' }
    const extended = [...filled, end]
    return extended
  }, [allRaces, activeLines])

  // Custom tick: label each unique regatta on the X axis (works with displayRaces)
  const CustomTick = ({ x, y, payload, index }) => {
    if (index === displayRaces.length) return null
    const currentEvent = displayRaces[index]?.season + '/' + displayRaces[index]?.regatta
    const previousEvent = index > 0 ? displayRaces[index - 1]?.season + '/' + displayRaces[index - 1]?.regatta : null
    if (currentEvent !== previousEvent) {
      return (
        <text fill='var(--text)' x={x} y={y + 10} transform={`rotate(45, ${x}, ${y + 10})`} className='chartLabel'>
          {currentEvent}
        </text>
      )
    }
    return null
  }

  // Custom tooltip always shows all rating values (for visibleKeys we forward-filled)
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null
    const d = payload[0].payload
    if (!d || d.raceID === '/Start/' || d.raceID === '/END/') return null

    return (
      <div className='chartTooltip'>
        <strong className='text-titlecase'>
          {d.regatta?.replace(/-/g, ' ')} {d.raceNumber + (d.division || '')}
        </strong>
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <td>{d.season}</td>
              <td>Skipper</td>
              <td>Crew</td>
            </tr>
          </thead>
          <tbody>
            {woman && (
              <>
                <tr>
                  <td>Women's Fleet</td>
                  <td>{d.wsr != null ? d.wsr.toFixed(2) : '-'}</td>
                  <td>{d.wcr != null ? d.wcr.toFixed(2) : '-'}</td>
                </tr>
                <tr>
                  <td>Women's Team</td>
                  <td>{d.wtsr != null ? d.wtsr.toFixed(2) : '-'}</td>
                  <td>{d.wtcr != null ? d.wtcr.toFixed(2) : '-'}</td>
                </tr>
              </>
            )}
            <tr>
              <td>Open Fleet</td>
              <td>{d.sr != null ? d.sr.toFixed(2) : '-'}</td>
              <td>{d.cr != null ? d.cr.toFixed(2) : '-'}</td>
            </tr>
            <tr>
              <td>Open Team</td>
              <td>{d.tsr != null ? d.tsr.toFixed(2) : '-'}</td>
              <td>{d.tcr != null ? d.tcr.toFixed(2) : '-'}</td>
            </tr>
          </tbody>
        </table>
        <br />
        <small>
          Regatta Avg: {d.regAvg != null ? d.regAvg.toFixed(2) : '-'} | Position: {d.race?.position ?? '-'}
        </small>
      </div>
    )
  }

  // Legend with toggle support - filter out regAvg so it's not selectable
  const CustomLegend = ({ payload }) => {
    // Ensure regAvg is always included
    const base = (payload || []).filter((p) => p.value !== 'regAvg' && p.value !== 'conf')
    const fullPayload = [...base, { value: 'regAvg', payload: { stroke: '#aaa' } }]

    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {fullPayload.map((entry, index) =>
          !notAvailableLines.includes(entry.value) ? (
            <div
              key={index}
              className='clickable'
              style={{
                margin: '0 10px',
                display: 'flex',
                alignItems: 'center',
                cursor: entry.value === 'regAvg' ? 'default' : 'pointer',
              }}
              onClick={() => {
                if (entry.value !== 'regAvg') {
                  setActiveLines((prev) => {
                    const isActive = prev.includes(entry.value)
                    const nonRegAvgCount = prev.filter((k) => k !== 'regAvg').length

                    // Prevent disabling the last non-regAvg line
                    if (isActive && nonRegAvgCount === 1) return prev

                    const next = isActive ? prev.filter((el) => el !== entry.value) : [...prev, entry.value]

                    // Always keep regAvg
                    if (!next.includes('regAvg')) next.push('regAvg')
                    return next
                  })
                }
              }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: entry.payload.stroke,
                  marginRight: 5,
                  opacity: activeLines.includes(entry.value) ? '100%' : '50%',
                  pointerEvents: entry.value === 'regAvg' ? 'none' : 'auto',
                }}
              />
              <span
                style={{
                  color: entry.payload.stroke,
                  fontWeight: 'bold',
                  opacity: activeLines.includes(entry.value) ? '100%' : '50%',
                  pointerEvents: entry.value === 'regAvg' ? 'none' : 'auto',
                }}>
                {entry.value === 'cr' ? 'Open Crew' : entry.value === 'sr' ? 'Open Skipper' : entry.value === 'wsr' ? "Women's Skipper" : entry.value === 'wcr' ? "Women's Crew" : entry.value === 'tsr' ? 'Open TR Skipper' : entry.value === 'tcr' ? 'Open TR Crew' : entry.value === 'wtsr' ? "Women's TR Skipper" : entry.value === 'wtcr' ? "Women's TR Crew" : 'Regatta Average'}
              </span>
            </div>
          ) : null
        )}
      </div>
    )
  }

  // Build reference lines for start of each visible regatta (based on displayRaces)
  const refLines = useMemo(() => {
    const uniqueRegattas = new Set()
    const firstRaces = []
    displayRaces?.forEach((race) => {
      const uniqueRegatta = `${race.season}/${race.regatta}`
      if (!uniqueRegattas.has(uniqueRegatta)) {
        firstRaces.push(race.raceID)
      }
      uniqueRegattas.add(uniqueRegatta)
    })
    return firstRaces.map((race, i) => <ReferenceLine key={i} x={race} strokeDasharray='3 3' />)
  }, [displayRaces])

  // If displayRaces is empty, we can show an empty chart gracefully
  return (
    <ResponsiveContainer height={isMobile ? 250 : 480}>
      <ComposedChart data={displayRaces} margin={!isMobile ? { top: 5, right: 5, left: 10, bottom: 130 } : { top: 5, right: 5, left: -10, bottom: -39 }}>
        <CartesianGrid strokeDasharray='3 3' vertical={false} />
        {refLines}
        <Area connectNulls dataKey='conf' stroke='#6088ff' fill='#6088ff55' legendType='none' />
        <XAxis dataKey='raceID' tick={<CustomTick />} height={60} interval={0} />
        <YAxis
          label={
            !isMobile
              ? {
                  value: 'Rating',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' },
                  offset: 0,
                }
              : {}
          }
        />
        <Tooltip content={<CustomTooltip />} isAnimationActive={false} />

        {/* Render lines for all rating keys but they'll only have values for visible races.
            hide property remains so users can toggle lines visually */}
        <Line hide={!activeLines.includes('sr')} strokeWidth={2} type='monotone' dataKey='sr' connectNulls stroke='#6088ff' dot={false} />
        <Line hide={!activeLines.includes('cr')} strokeWidth={2} type='monotone' dataKey='cr' connectNulls stroke='#ffc259' dot={false} />
        <Line hide={!activeLines.includes('wsr')} strokeWidth={2} type='monotone' dataKey='wsr' connectNulls stroke='#ff8585' dot={false} />
        <Line hide={!activeLines.includes('wcr')} strokeWidth={2} type='monotone' dataKey='wcr' connectNulls stroke='#60b55e' dot={false} />
        <Line hide={!activeLines.includes('tsr')} strokeWidth={2} type='monotone' dataKey='tsr' connectNulls stroke='#a90000' dot={false} />
        <Line hide={!activeLines.includes('tcr')} strokeWidth={2} type='monotone' dataKey='tcr' connectNulls stroke='#77dd84' dot={false} />
        <Line hide={!activeLines.includes('wtsr')} strokeWidth={2} type='monotone' dataKey='wtsr' connectNulls stroke='#ef8b60' dot={false} />
        <Line hide={!activeLines.includes('wtcr')} strokeWidth={2} type='monotone' dataKey='wtcr' connectNulls stroke='#8956e1' dot={false} />

        {/* Always-on regAvg line: not selectable, still shown if present in displayRaces */}
        <Line strokeWidth={2} type='monotone' dataKey='regAvg' stroke='#aaa' dot={false} />

        <Legend content={<CustomLegend />} verticalAlign='top' height={isMobile ? 55 : 36} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

import { useEffect, useState } from 'react'
import { getTeamRanks } from '../lib/firebase'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList, ReferenceLine } from 'recharts'

export default function History() {
  const [teams, setTeams] = useState([])
  const [dates, setDates] = useState([])
  const [minTeams, setMinTeams] = useState(90)
  const [data, setData] = useState([])
  const [type, setType] = useState('o')

  useEffect(() => {
    getTeamRanks().then((res) => {
      setDates(res['ranks']['dates'])
      setTeams(res['ranks'])
    })
    calculateData()
  }, [])

  const calculateData = () => {
    const tempData = dates
      ?.map((date, index) => {
        const entry = { date }
        for (const team in teams) {
          if (team != 'dates') {
            let temp = teams[team][index]
            if (temp != null) {
              entry[team] = temp[type]
            }
          }
        }
        return entry
      })
      .filter((entry) => Object.values(entry).filter((v) => v != null).length > minTeams)
      .map((entry) => Object.fromEntries(Object.entries(entry).filter(([key, value]) => value <= 30 || key == 'date')))
    // .filter((entry) => entry['date'].split('-')[0] == '2025')
    setData(tempData)
    // console.log(data)
  }

  useEffect(() => {
    calculateData()
  }, [teams, minTeams, type])

  const teamNames = Object.keys(teams)
  const colors = ['#ffc658', '#82ca9d', '#8884d8', '#ff8042', '#8dd1e1', '#a4de6c', '#d88884', '#888888', '#a28fd0']

  const [hoveredLine, setHoveredLine] = useState(null)

  const CustomTooltip = ({ active, payload, label }) => {
    if (active) {
      const value = payload.filter((entry) => entry.dataKey == hoveredLine)[0]
      const listvals = payload.map((entry) => [entry.dataKey, entry.value]).sort((a, b) => a[1] - b[1])
      return (
        <div className='chartTooltip'>
          <h3 style={{ margin: 0 }}>{label}</h3>
          {hoveredLine == null ? (
            <ul style={{ listStyleType: 'none', margin: 0, padding: 0 }}>
              {listvals.map(([team, rank]) => (
                <li>
                  {rank < 10 ? ' ' : ''}
                  {rank} {team}
                </li>
              ))}
            </ul>
          ) : (
            <>
              {value?.value} {value?.dataKey}
            </>
          )}
        </div>
      )
    }
  }
  // 2300 height with all teams
  return (
    <div>
      How many teams must be ranked for a given date in order for that date to be shown? (lower is more dates) <input type='range' min={1} max={150} value={minTeams} onChange={(e) => setMinTeams(e.target.value)} /> {minTeams} <button onClick={() => setMinTeams(90)}>reset</button>
      <select onChange={(e) => setType(e.target.value)}>
        <option value='o'>Open Fleet</option>
        <option value='tr'>Open Team</option>
        <option value='w'>Women's Fleet</option>
        <option value='wtr'>Women's Team</option>
      </select>
      <div style={{ margin: 40, marginTop: 90 }}>
        <ResponsiveContainer width='100%' height={500}>
          <LineChart data={data} margin={{ right: 100 }} onMouseLeave={() => setHoveredLine(null)}>
            <XAxis dataKey='date' />
            <YAxis reversed allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
            {/* <Legend verticalAlign='top' /> */}
            {teamNames?.map((team, idx) => {
              const isActive = hoveredLine === null || hoveredLine === team
              return (
                <Line type='linear' key={team} dataKey={team} dot={false} strokeOpacity={isActive ? 1 : 0.2} strokeWidth={isActive ? 2.5 : 1.5} stroke={colors[idx % colors.length]} isAnimationActive={false}>
                  {/* Label the last point on the right */}
                  <LabelList
                    dataKey={team}
                    content={({ x, y, index }) => {
                      if (index === data.length - 1) {
                        return (
                          <text x={x + 5} y={y} dy={5} opacity={isActive ? 1 : 0.2} fill={colors[idx % colors.length]} display={Object.keys(data[data.length - 1]).includes(team) ? '' : 'none'} fontSize={12} onMouseEnter={() => setHoveredLine(team)}>
                            {team}
                          </text>
                        )
                      }
                      return null
                    }}
                  />
                </Line>
              )
            })}
            <ReferenceLine
              x={
                data
                  .map((entry) => entry['date'])
                  .filter((date) => {
                    let spl = date.split('-')
                    return spl[0] == '2024' && spl[1] == '09'
                  })[0]
              }
              stroke='red'
              label='f24 Season'
            />
            <ReferenceLine
              x={
                data
                  .map((entry) => entry['date'])
                  .filter((date) => {
                    let spl = date.split('-')
                    return spl[0] == '2025'
                  })[0]
              }
              stroke='red'
              label='s25 Season'
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

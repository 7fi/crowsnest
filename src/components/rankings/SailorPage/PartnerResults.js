import { useState } from 'react'
import { FaSortDown } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { useMobileDetect } from '../../../lib/hooks'
import RatioBar from '../RatioBar'

export default function PartnerResults({ races }) {
  const [byChange, setByChange] = useState(false)
  const [byRaces, setByRaces] = useState(true)
  const navigate = useNavigate()
  const isMobile = useMobileDetect()

  // Step 1: Calculate total change and count for each partner
  const partnerStats = races.reduce((acc, race) => {
    // TODO: Switch link to key when sailors get re-uploaded
    let key = race.partner['key']
    if (!acc[key]) {
      acc[key] = { key: race.partner['key'], name: race.partner['name'], change: 0, count: 0, ratio: 0 }
    }
    acc[key].change += race.change
    acc[key].count += 1
    if (race.type == 'fleet') {
      acc[key].ratio += race.ratio
    } else {
      acc[key].ratio += race.outcome == 'win' ? 1 : 0
    }
    return acc
  }, {})

  // Step 2: Sort the partners by the total change in descending order
  const sortedPartners = Object.keys(partnerStats)
    .map((partner) => ({
      key: partner,
      name: partnerStats[partner].name,
      change: partnerStats[partner].change,
      count: partnerStats[partner].count,
      ratio: partnerStats[partner].ratio / partnerStats[partner].count,
    }))
    .sort((a, b) => {
      if (byChange) return b.change - a.change
      if (byRaces) return b.count - a.count
      return b.ratio - a.ratio
    }) // Sort by change in descending order

  // Step 3: Map to <span> elements with rank and total change
  return (
    <table className='raceByRaceTable'>
      <thead>
        <tr>
          <th></th>
          <th>Partner</th>
          <th
            style={{ minWidth: 75 }}
            className='clickable'
            onClick={() => {
              setByChange(false)
              setByRaces(true)
            }}>
            Races
            {byRaces ? <FaSortDown /> : <></>}
          </th>
          <th></th>
          <th
            style={{ minWidth: isMobile ? 50 : 150 }}
            className='tableColFit clickable'
            onClick={() => {
              setByChange(true)
              setByRaces(false)
            }}>
            {isMobile ? 'Change' : 'Rating Change'}
            {byChange ? <FaSortDown /> : ' '}
          </th>
          <th
            style={{ minWidth: 113 }}
            className='tableColFit clickable'
            onClick={() => {
              setByChange(false)
              setByRaces(false)
            }}>
            Percentage
            {!byChange && !byRaces ? <FaSortDown /> : <></>}
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedPartners.map((partner, index) =>
          partner.key != 'Unknown' ? (
            <tr key={index} className='clickable' style={{ margin: '5px' }} onClick={() => navigate(`/rankings/${partner.key}`)}>
              <td className='tdRightBorder tableColFit secondaryText'>{index + 1}</td>
              <td>{partner.name}</td>
              <td style={{ textAlign: 'right' }} className='tableColFit'>
                {partner.count}
              </td>
              <td> </td>
              <td style={{ color: partner.change > 0 ? 'green' : 'red' }}>
                {partner.change > 0 ? '+' : ''}
                {partner.change.toFixed(0)}
              </td>
              <td style={{ textAlign: 'center' }}>
                <RatioBar ratio={partner.ratio} />
              </td>
            </tr>
          ) : (
            <></>
          )
        )}
      </tbody>
    </table>
  )
}

import { Link, useNavigate } from 'react-router-dom'
import useRegionColors from '../../../lib/regionColors'
import RatingNum from '../../RatingNum'

export default function RankingDisplay({ data, members, rankType }) {
  const rankTypeMap = { fr: ['sr', 'cr'], wfr: ['wsr', 'wcr'], tr: ['tsr', 'tcr'], wtr: ['wtsr', 'wtcr'] }
  const globalRankTypes = { fr: 'topFleetRating', tr: 'topTeamRating', wfr: 'topWomenRating', wtr: 'topWomenTeamRating' }

  const filtered = members.filter((m) => rankTypeMap[rankType].some((rank) => m.rankType.split('.').includes(rank))).filter((user, index, self) => index === self.findIndex((u) => u.sailorID === user.sailorID))

  const nav = useNavigate()

  return (
    <tr>
      <td className='clickable' onClick={() => nav(`/teams?sort=${rankType.includes('w') ? 'women' : ''}${rankType.includes('t') ? 'team' : rankType.includes('w') ? '' : 'top'}`)}>
        {rankType.includes('w') ? "Women's " : ''}
        {rankType.includes('t') ? 'Team' : 'Fleet'} Race {/*#{data[rankType + '_rank']}*/}
      </td>
      <td className='clickable' onClick={() => nav(`/teams?sort=${rankType.includes('w') ? 'women' : ''}${rankType.includes('t') ? 'team' : rankType.includes('w') ? '' : 'top'}`)}>
        #{data[rankType + '_rank']}
      </td>
      <td>
        {' '}
        <Link to={{ pathname: `/teams`, search: `?region=${data?.region}&sort=${rankType.includes('w') ? 'women' : ''}${rankType.includes('t') ? 'team' : rankType.includes('w') ? '' : 'top'}` }}>#{data[rankType + '_region_rank']}</Link>
      </td>
      <td className='clickable' onClick={() => nav(`/teams?sort=${rankType.includes('w') ? 'women' : ''}${rankType.includes('t') ? 'team' : rankType.includes('w') ? '' : 'top'}`)}>
        <RatingNum ratingNum={data[globalRankTypes[rankType]]} type={rankType.includes('w') ? 'women' : 'open'} raceType={rankType.includes('t') ? 'team' : 'fleet'} />
      </td>
      <td className='teamRatingSailors'>
        <table style={{ borderCollapse: 'collapse', border: 'none', width: '100%' }}>
          <tbody className='cleanTable'>
            {filtered
              .filter((m) => m.position === 'skipper')
              .sort((a, b) => b[rankTypeMap[rankType][0]] - a[rankTypeMap[rankType][0]])
              .map((member, i) => {
                return (
                  <tr style={{ width: '100%' }}>
                    <td>
                      <Link key={i} to={`/sailors/${member.sailorID}`}>
                        {member.name}
                      </Link>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link key={i} to={`/sailors/${member.sailorID}`}>
                        {member[rankTypeMap[rankType][0]]}
                      </Link>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </td>
      <td className='teamRatingSailors'>
        <table style={{ borderCollapse: 'collapse', border: 'none', width: '100%' }}>
          <tbody className='cleanTable'>
            {/* <div className='flexCol'> */}
            {filtered
              .filter((m) => m.position === 'crew')
              .sort((a, b) => b[rankTypeMap[rankType][1]] - a[rankTypeMap[rankType][1]])
              .map((member, i) => {
                return (
                  <tr style={{ width: '100%' }}>
                    <td>
                      <Link key={i} to={`/sailors/${member.sailorID}`}>
                        {member.name}
                      </Link>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link key={i} to={`/sailors/${member.sailorID}`}>
                        {member[rankTypeMap[rankType][1]]}
                      </Link>
                    </td>
                  </tr>
                )
              })}
            {/* </div> */}
          </tbody>
        </table>
      </td>
    </tr>
  )
}

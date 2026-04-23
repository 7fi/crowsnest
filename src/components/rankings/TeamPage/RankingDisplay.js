import { Link } from 'react-router-dom'
import useRegionColors from '../../../lib/regionColors'

export default function RankingDisplay({ data, members, rankType }) {
  const rankTypeMap = { fr: ['sr', 'cr'], wfr: ['wsr', 'wcr'], tr: ['tsr', 'tcr'], wtr: ['wtsr', 'wtcr'] }
  const globalRankTypes = { fr: 'topFleetRating', tr: 'topTeamRating', wfr: 'topWomenRating', wtr: 'topWomenTeamRating' }

  const filtered = members.filter((m) => rankTypeMap[rankType].some((rank) => m.rankType.split('.').includes(rank)) && m.season == 's26')

  const regionColors = useRegionColors()

  return (
    <div class='teamRatingCard'>
      <h2>
        {rankType.includes('w') ? "Women's " : ''}
        {rankType.includes('t') ? 'Team' : 'Fleet'} Race Rank: #{data[rankType + '_rank']}
      </h2>
      <div className='flexRowContainer' style={{ justifyContent: 'space-between' }}>
        <div>
          #{data[rankType + '_region_rank']} in{' '}
          <Link to={{ pathname: `/teams`, search: `?region=${data?.region}` }}>
            <span className='filterOption' style={{ backgroundColor: regionColors[data?.region] }}>
              {data?.region}
            </span>
          </Link>
        </div>
        <div>Rating: {data[globalRankTypes[rankType]]}</div>
      </div>
      <div className='flexRowContainer'>
        <div>
          <h3>Skippers</h3>
          {filtered
            .filter((m) => m.position == 'skipper')
            .map((member) => {
              return (
                <div>
                  {member.name} {member[rankTypeMap[rankType]]}
                </div>
              )
            })}
        </div>
        <div>
          <h3>Crews</h3>
          {filtered
            .filter((m) => m.position == 'crew')
            .map((member) => {
              return <div>{member.name}</div>
            })}
        </div>
      </div>
    </div>
  )
}

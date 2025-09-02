import { Link } from 'react-router-dom'
import EloLineChart from '../../EloLineChart'
import RaceByRace from './RaceByRace'
import { ProCheckLite } from '../ProCheck'
import RatingNum from '../../RatingNum'

export default function PosInfo({ type, raceType, pos, rating, rank, races }) {
  const RankObj = ({ type, rank, pos, raceType }) => {
    return (
      <ProCheckLite feature='ranks'>
        {rank != 0 ? (
          <span>
            #{rank} for{' '}
            <Link style={{ textDecoration: 'underline' }} to={`/rankings/${raceType == 'fleet' ? pos : 'tr' + pos}${type == "Women's" ? '/women' : ''}`}>
              {type.toLowerCase()} {pos}s
            </Link>
            *
          </span>
        ) : (
          <span className='secondaryText'> (ineligible for {pos} rank in s25)</span>
        )}
      </ProCheckLite>
    )
  }

  const change = races
    .filter((race) => race.pos == pos && (type == "Women's" ? race.womens : !race.womens) && race.type == raceType)
    .slice(-5)
    .reduce((sum, race) => sum + Math.round(race.change), 0)
    .toFixed(0)

  const peakRating = races
    .filter((race) => race.pos == pos && (type == "Women's" ? race.womens : !race.womens))
    // .sort((a,b) => race)
    .slice(-1)

  return (
    <>
      {rating != 1000 ? (
        <div className='ratingStatCard'>
          <div>
            <div style={{ fontSize: '2rem' }}>
              <RatingNum ratingNum={rating} type={type == "Women's" ? 'women' : 'open'} pos={pos} />
            </div>
            <div>
              <span
                style={{
                  color: change > 0 ? 'green' : 'red',
                }}>
                {change > 0 ? '+' : ''}
                {change}
              </span>{' '}
              in the last 5 races
            </div>
            <div>
              {type} {raceType} {pos}
            </div>
          </div>
          <RankObj raceType={raceType} type={type} rank={rank} pos={pos.toLowerCase()} />
        </div>
      ) : undefined}
    </>
  )
}

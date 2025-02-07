import { Link } from 'react-router-dom'
import EloLineChart from '../../EloLineChart'
import RaceByRace from './RaceByRace'
import { ProCheckLite } from '../ProCheck'
import RatingNum from '../../RatingNum'

export default function PosInfo({ type, pos, rating, rank, races }) {
  const RankObj = ({ type, rank, pos }) => {
    return (
      <ProCheckLite feature='ranks'>
        Rank:
        {rank != 0 ? (
          <span>
            {' '}
            #{rank} for{' '}
            <Link style={{ textDecoration: 'underline' }} to={`/rankings/${pos}${type == "Women's" ? '/women' : ''}`}>
              {type.toLowerCase()} {pos}s
            </Link>
            *
          </span>
        ) : (
          <span> (did not {pos} in f24)</span>
        )}
      </ProCheckLite>
    )
  }

  let change = races
    .filter((race) => race.pos == pos && (type == "Women's" ? race.womens : !race.womens))
    .slice(-5)
    .reduce((sum, race) => sum + Math.round(race.change), 0)
    .toFixed(0)

  return (
    <>
      {rating != 1000 ? (
        <div>
          <div>
            {type} {pos}: <RatingNum ratingNum={rating} type={type == "Women's" ? 'women' : 'open'} pos={pos} /> (
            <span
              style={{
                color: change > 0 ? 'green' : 'red',
              }}>
              {change > 0 ? '+' : ''}
              {change}
            </span>{' '}
            in the last 5 races)
          </div>
          <RankObj type={type} rank={rank} pos={pos.toLowerCase()} />
        </div>
      ) : undefined}
    </>
  )
}

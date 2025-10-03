import { Link } from 'react-router-dom'
import { ProCheckLite } from '../ProCheck'
import RatingNum from '../../RatingNum'

export default function PosInfo({ type, raceType, pos, rating, rank, races }) {
  const RankObj = ({ type, rank, pos, raceType }) => {
    return (
      <ProCheckLite feature='ranks'>
        {rank != 0 ? (
          <span>
            <Link style={{ textDecoration: 'underline' }} to={`/rankings/${raceType == 'fleet' ? pos : 'tr' + pos}${type == "Women's" ? '/women' : ''}`}>
              #{rank}
            </Link>

            {/* for{' '} */}
            {/* <Link style={{ textDecoration: 'underline' }} to={`/rankings/${raceType == 'fleet' ? pos : 'tr' + pos}${type == "Women's" ? '/women' : ''}`}>
              {type.toLowerCase()} {pos}s
            </Link> */}
            {/* * */}
          </span>
        ) : (
          <span className='secondaryText'> (unranked) </span>
        )}
      </ProCheckLite>
    )
  }

  const lastRegatta = races
    .filter((race) => race.pos == pos && (type == "Women's" ? race.womens : !race.womens) && race.type == raceType)
    .slice(-1)[0]
    ?.raceID.split('/')
  console.log(lastRegatta)

  const change = races
    .filter((race) => race.pos == pos && (type == "Women's" ? race.womens : !race.womens) && race.type == raceType)
    .filter((race) => race.raceID.split('/')[0] == lastRegatta[0] && race.raceID.split('/')[1] == lastRegatta[1])
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
              <span style={{ fontSize: '0.7rem' }}>
                <span
                  style={{
                    color: change > 0 ? 'green' : 'red',
                  }}>
                  {change > 0 ? '+' : ''}
                  {change}
                </span>{' '}
                in last regatta
              </span>
            </div>
            {/* <div>{lastRegatta}</div> */}
            <div>
              {type} {raceType} race {pos.toLowerCase()} <RankObj raceType={raceType} type={type} rank={rank} pos={pos.toLowerCase()} />
            </div>
          </div>
        </div>
      ) : undefined}
    </>
  )
}

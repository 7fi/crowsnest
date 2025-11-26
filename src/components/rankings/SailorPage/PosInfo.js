import { Link } from 'react-router-dom'
import { ProCheckLite } from '../ProCheck'
import RatingNum from '../../RatingNum'

export default function PosInfo({ isUsers, type, raceType, pos, rating, rank, races }) {
  const RankObj = ({ type, rank, pos, raceType }) => {
    return (
      <ProCheckLite disable={isUsers} feature='ranks'>
        {rank != 0 ? (
          <span>
            <Link style={{ textDecoration: 'underline' }} to={`/rankings/${raceType == 'fleet' ? pos : 'tr' + pos}${type == "Women's" ? '/women' : ''}`}>
              #{rank}
            </Link>

            {/* for{' '} */}
            {/* <Link style={{ textDecoration: 'underline' }} to={`/sailors/${raceType == 'fleet' ? pos : 'tr' + pos}${type == "Women's" ? '/women' : ''}`}>
              {type.toLowerCase()} {pos}s
            </Link> */}
          </span>
        ) : (
          <span className='secondaryText'> (unranked) </span>
        )}
      </ProCheckLite>
    )
  }

  function getRaceType(race) {
    if (race.ratingType.includes('t')) {
      return 'team'
    } else {
      return 'fleet'
    }
  }
  function getRaceWomens(race) {
    if (race.ratingType.includes('w')) {
      return true
    } else {
      return false
    }
  }

  const lastRace = races
    .filter(
      (race) =>
        race.position == pos && //
        (type == "Women's" ? getRaceWomens(race) : !getRaceWomens(race)) &&
        getRaceType(race) == raceType
    )
    .slice(-1)[0]

  const change = races
    .filter((race) => race.position == pos && (type == "Women's" ? getRaceWomens(race) : !getRaceWomens(race)) && getRaceType(race) == raceType)
    .filter((race) => race.season == lastRace.season && race.regatta == lastRace.regatta)
    .reduce((sum, race) => sum + Math.round(race.newRating - race.oldRating), 0)
    .toFixed(0)

  const peakRating = races
    .filter((race) => race.position == pos && (type == "Women's" ? getRaceWomens(race) : !getRaceWomens(race)))
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

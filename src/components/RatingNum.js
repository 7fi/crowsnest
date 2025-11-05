import { TbDiamondsFilled } from 'react-icons/tb'

export default function RatingNum({ sailor, pos, type, highest, ratingNum, raceType }) {
  let rating = 0
  let isWomens = type === 'women'
  if (ratingNum === undefined) {
    if (pos === 'skipper') {
      if (raceType === 'team') {
        let tsr = sailor.tsr
        let wtsr = sailor.wtsr
        if (sailor.wtsr === 1000) {
          wtsr = 0
        }
        if (sailor.tsr === 1000) {
          tsr = 0
        }
        rating = highest ? Math.max(tsr, wtsr) : type === 'women' ? wtsr : tsr
        if (highest && rating === wtsr) {
          isWomens = true
        }
      } else {
        let sr = sailor.sr
        let wsr = sailor.wsr
        if (sailor.wsr === 1000) {
          wsr = 0
        }
        if (sailor.sr === 1000) {
          sr = 0
        }
        rating = highest ? Math.max(sr, wsr) : type === 'women' ? wsr : sr
        if (highest && rating === wsr) {
          isWomens = true
        }
      }
    } else {
      if (raceType === 'team') {
        let tcr = sailor.tcr
        let wtcr = sailor.wtcr
        if (sailor.wtcr === 1000) {
          wtcr = 0
        }
        if (sailor.tcr === 1000) {
          tcr = 0
        }
        rating = highest ? Math.max(tcr, wtcr) : type === 'women' ? wtcr : tcr
        if (highest && rating === wtcr) {
          isWomens = true
        }
      } else {
        let cr = sailor.cr
        let wcr = sailor.wcr
        if (sailor.wcr === 1000) {
          wcr = 0
        }
        if (sailor.cr === 1000) {
          cr = 0
        }
        rating = highest ? Math.max(cr, wcr) : type === 'women' ? wcr : cr
        if (highest && rating === wcr) {
          isWomens = true
        }
      }
    }
  } else {
    rating = ratingNum
  }

  if (highest === true) {
    if (pos === 'skipper') {
    }
  }
  return (
    <span>
      {rating !== 0 ? (
        <>
          {isWomens ? <TbDiamondsFilled className='' style={{ color: 'var(--women)' }} /> : ''}
          {rating.toFixed(0)}{' '}
        </>
      ) : (
        <span className='secondaryText'>~</span>
      )}
    </span>
  )
}

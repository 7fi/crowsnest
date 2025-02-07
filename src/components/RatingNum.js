import { TbDiamondsFilled } from 'react-icons/tb'

export default function RatingNum({ sailor, pos, type, highest, ratingNum }) {
  let rating = 0
  let isWomens = type == 'women'
  if (ratingNum == undefined) {
    if (pos == 'skipper') {
      let sr = sailor.skipperRating
      let wsr = sailor.womenSkipperRating
      if (sailor.womenSkipperRating == 1000) {
        wsr = 0
      }
      if (sailor.skipperRating == 1000) {
        sr = 0
      }
      rating = highest ? Math.max(sr, wsr) : type == 'women' ? wsr : sr
      if (highest && rating == wsr) {
        isWomens = true
      }
    } else {
      let cr = sailor.crewRating
      let wcr = sailor.womenCrewRating
      if (sailor.womenCrewRating == 1000) {
        wcr = 0
      }
      if (sailor.crewRating == 1000) {
        cr = 0
      }
      rating = highest ? Math.max(cr, wcr) : type == 'women' ? wcr : cr
      if (highest && rating == wcr) {
        isWomens = true
      }
    }
  } else {
    rating = ratingNum
  }

  if (highest == true) {
    if (pos == 'skipper') {
    }
  }
  return (
    <span>
      {isWomens ? <TbDiamondsFilled className='' style={{ color: 'var(--women)' }} /> : ''}
      {rating.toFixed(0)}
    </span>
  )
}

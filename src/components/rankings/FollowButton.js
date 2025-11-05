import { Link } from 'react-router-dom'
import { AuthCheckLite } from '../AuthCheck'
import { followUser, unFollowUser } from '../../lib/apilib'

export default function FollowButton({ sailor, userData, following, setFollowing }) {
  return (
    <button
      className='tabButton'
      style={{ marginLeft: 10, backgroundColor: following ? 'var(--border)' : '' }}
      onClick={() => {
        if (!following) {
          console.log('following', sailor.sailorID, sailor.name, userData.user.uid, userData.userVals.displayName)
          followUser(sailor.sailorID, sailor.name, userData.user.uid)
          setFollowing(true)
        } else {
          console.log('unfollowing', sailor.sailorID, sailor.name, userData.user.uid, userData.userVals.displayName)
          unFollowUser(sailor.sailorID, sailor.name, userData.user.uid).then(() => {
            setFollowing(false)
            console.log(following)
          })
        }
      }}>
      {following ? 'Unfollow' : 'Follow'}
    </button>
  )
}

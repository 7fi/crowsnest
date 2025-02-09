import { Link } from 'react-router-dom'
import { AuthCheckLite } from '../AuthCheck'
import { followUser, unFollowUser } from '../../lib/firebase'

export default function FollowButton({ sailor, userData, following, setFollowing }) {
  return (
    <button
      className='tabButton'
      style={{ marginLeft: 10, backgroundColor: following ? 'var(--border)' : '' }}
      onClick={() => {
        if (!following) {
          console.log('following', sailor.key, sailor.Name, userData.user.uid, userData.userVals.displayName)
          followUser(sailor.key, sailor.Name, userData.user.uid, userData.userVals.displayName, userData.userVals.username)
          setFollowing(true)
        } else {
          console.log('unfollowing', sailor.key, sailor.Name, userData.user.uid, userData.userVals.displayName)
          unFollowUser(sailor.key, sailor.Name, userData.user.uid, userData.userVals.displayName, userData.userVals.username).then(() => {
            setFollowing(false)
            console.log(following)
          })
        }
      }}>
      {following ? 'Unfollow' : 'Follow'}
    </button>
  )
}

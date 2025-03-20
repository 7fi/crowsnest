import { useContext, useState } from 'react'
import AuthCheck from '../components/AuthCheck'
import { updateDoc, doc, getFirestore, arrayUnion, arrayRemove, getDoc, deleteDoc } from 'firebase/firestore'
import { UserContext } from '../lib/context'

export default function Claim() {
  const { user, userVals } = useContext(UserContext)
  const [id, setId] = useState(0)
  const [link, setLink] = useState('')

  return (
    <main>
      <AuthCheck>
        <h1>Link your CrowsNest account to your Techscore account for additional features!</h1>
        <div className='contentBox'>
          <h2>Step 1:</h2>
          <span>
            Head to{' '}
            <a style={{ textDecoration: 'underline' }} href='https://ts.collegesailing.org/' target='1'>
              https://ts.collegesailing.org/
            </a>{' '}
            and copy your ID.
          </span>
          <div></div>
          <label>Techscore ID: </label>
          <input onChange={(e) => setId(e.target.value)} type='number' placeholder='ex: 1234567' />
        </div>
        <div className='contentBox'>
          <h2>Step 2:</h2>
          Now grab the link to your techscore page (such as https://scores.collegesailing.org/sailors/example-sailor) and put that below.
          <div>
            <label>Sailor Link: </label>
            <input style={{ width: 360 }} onChange={(e) => setLink(e.target.value)} type='text' placeholder='ex: https://scores.collegesailing.org/sailors/example-sailor' />
          </div>
          <button
            onClick={() => {
              if (id != 0 && id > 999999 && id < 10000000 && link != '') createLink(user.uid, id, link)
            }}>
            Submit
          </button>
        </div>

        {/* <h1>Transfered schools? Combine your crowsnest pages</h1> */}
      </AuthCheck>
    </main>
  )
}
async function createLink(uid, techscoreID, techscoreLink) {
  const db = getFirestore()
  console.log(uid, techscoreID)

  // add to links document
  let d = doc(db, `links/techscoreLinks`)
  await updateDoc(d, { links: arrayUnion({ uid: uid, techscoreID: techscoreID, techscoreLink: techscoreLink }) })

  console.log('test')
  d = doc(db, `users/${uid}`)
  await updateDoc(d, { techscoreID: techscoreID, techscoreLink: techscoreLink })
}

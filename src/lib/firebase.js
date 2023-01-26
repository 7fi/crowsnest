import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore, collection, where, query, doc, getDoc, getDocs, setDoc, getCountFromServer, documentId, serverTimestamp } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'

const firebaseConfig = {
  apiKey: 'AIzaSyDbkwUsSlVAYxbLycxj9MRge1W0bkz8Bew',
  authDomain: 'thecrowsnestapp.firebaseapp.com',
  projectId: 'thecrowsnestapp',
  storageBucket: 'thecrowsnestapp.appspot.com',
  messagingSenderId: '586945381440',
  appId: '1:586945381440:web:9ff3c23f1948d61a46cba5',
  measurementId: 'G-VD29NPRMS8',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
//eslint-disable-next-line
const analytics = getAnalytics(app)
const db = getFirestore()

const functions = getFunctions()
const getSchools = httpsCallable(functions, 'getSchools')
const getRegattas = httpsCallable(functions, 'getRegattas')

const getUserWithUsername = async (username) => {
  const q = query(collection(db, 'users'), where('username', '==', username))
  let doc = (await getDocs(q)).docs[0]
  return { tempuser: doc.data(), uid: doc.id }
}
const getTeamWithName = async (teamName) => {
  const q = query(collection(db, 'teams'), where('teamName', '==', teamName))
  let doc = (await getDocs(q)).docs[0]
  return { data: doc.data(), id: doc.id }
}

const getTeamList = async () => {
  const docSnaps = await getDocs(collection(db, 'techscoreTeams'))
  // console.log(docSnaps)
  return docSnaps
}

async function docExists(id, col) {
  const snap = await getCountFromServer(query(collection(db, col), where(documentId(), '==', id)))
  return !!snap.data().count
}

const scrapeTeamListToDb = async (district, seasons) => {
  getDoc(doc(db, 'vars', 'lastTeamScrape')).then(async (document) => {
    // console.log(Date.now())
    console.log('Been 30 minutes since last scrape?', Date.now() / 1000 - document.data().timestamp.seconds > 30 * 60)
    if (Date.now() / 1000 - document.data().timestamp.seconds > 30 * 60) {
      // console.log()
      let schools = await getSchools({ district: 'NWISA' })
      // console.log(await getRegattas({ schoolLink: schools.data['Bainbridge High School'], season: seasons[0] }))
      console.log(schools.data)
      Object.keys(schools.data).forEach(async (school) => {
        // if (!(await docExists(school, 'techscoreTeams'))) {
        let regattas = {}
        // console.log(`https://scores.hssailing.org${schools.data[school]}${season}`)
        regattas[seasons[0]] = await (await getRegattas({ schoolLink: schools.data[school], season: seasons[0] })).data
        console.log(regattas)
        await setDoc(doc(db, 'techscoreTeams', school), {
          regattas: regattas,
        })
        // } else {
        //   console.log('doc exists')
        // }
      })
      setDoc(doc(db, 'vars', 'lastTeamScrape'), { timestamp: serverTimestamp() })
      // return { data: schools.data }
    }
  })
}

export { app, getUserWithUsername, getTeamWithName, getTeamList, scrapeTeamListToDb }

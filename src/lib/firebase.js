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
const scrToDb = httpsCallable(functions, 'scrapeToDB')

const getUserWithUsername = async (username) => {
  const q = query(collection(db, 'users'), where('username', '==', username))
  let doc = (await getDocs(q)).docs[0]
  return { tempuser: doc.data(), uid: doc.id }
}
const getUserWithID = async (uid) => {
  const q = query(collection(db, 'users'), where(documentId(), '==', uid))
  let doc = (await getDocs(q)).docs[0]
  return { tempuser: doc.data(), uid: doc.id }
}

const getEventWithID = async (id) => {
  const q = query(collection(db, 'events'), where(documentId(), '==', id))
  let doc = (await getDocs(q)).docs[0]
  return { data: doc.data(), id: doc.id }
}
const getTeamWithID = async (id) => {
  if (id == undefined) return {}
  const q = query(collection(db, 'teams'), where(documentId(), '==', id))
  let doc = (await getDocs(q)).docs[0]
  return { data: doc.data(), id: doc.id }
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
const getEventsForTeam = async (teamName) => {
  const q = query(collection(db, 'events'), where('team', '==', teamName))
  const docSnaps = (await getDocs(q)).docs
  console.log(docSnaps)
  return docSnaps
}

async function docExists(id, col) {
  const snap = await getCountFromServer(query(collection(db, col), where(documentId(), '==', id)))
  return !!snap.data().count
}

const scrapeTeamListToDb = async (district, seasons) => {
  // getDoc(doc(db, 'vars', 'lastTeamScrape')).then(async (document) => {
  //   // console.log(Date.now())
  //   console.log('Been 30 minutes since last scrape?', Date.now() / 1000 - document.data().timestamp.seconds > 30 * 60)
  //   if (Date.now() / 1000 - document.data().timestamp.seconds > 30 * 60) {
  //     // console.log()
  //     let schools = await getSchools({ district: 'NWISA' })
  //     // console.log(await getRegattas({ schoolLink: schools.data['Bainbridge High School'], season: seasons[0] }))
  //     console.log(schools.data)
  //     Object.keys(schools.data).forEach(async (school) => {
  //       // if (!(await docExists(school, 'techscoreTeams'))) {
  //       let regattas = {}
  //       // console.log(`https://scores.hssailing.org${schools.data[school]}${season}`)
  //       regattas[seasons[0]] = await (await getRegattas({ schoolLink: schools.data[school], season: seasons[0] })).data
  //       console.log(regattas)
  //       await setDoc(doc(db, 'techscoreTeams', school), {
  //         regattas: regattas,
  //       })
  //       // } else {
  //       //   console.log('doc exists')
  //       // }
  //     })
  //     setDoc(doc(db, 'vars', 'lastTeamScrape'), { timestamp: serverTimestamp() })
  //     // return { data: schools.data }
  //   }
  // })
  scrToDb({ seasons: seasons })
}

const getSailorElo = async (sailorkey) => {
  const q = query(collection(db, 'sailorsElo'), where('key', '==', sailorkey))
  const docs = await getDocs(q)
  console.log('reads: ' + docs.docs.length)
  // const doc = docs.docs[0]
  if (docs != undefined) {
    return { docs: docs.docs }
  } else {
    return undefined
  }
}

const getAllTeams = async () => {
  const thisDoc = await getDoc(doc(db, 'vars', 'eloTeams'))
  console.log('reads: %d', 1)
  if (thisDoc != undefined) {
    return { data: thisDoc.data(), id: thisDoc.id }
  } else {
    return undefined
  }
}

const getTop100 = async (type, pos) => {
  const docName = pos == 'Skipper' ? (type == 'women' ? 'topWomenSkippers' : 'topSkippers') : type == 'women' ? 'topWomenCrews' : 'topCrews'
  const thisDoc = await getDoc(doc(db, 'vars', docName))
  console.log('reads: %d', 1)
  if (thisDoc != undefined) {
    return { data: thisDoc.data(), id: thisDoc.id }
  } else {
    return undefined
  }
}

const getTeamElos = async (teamname) => {
  const q = query(collection(db, 'eloTeams'), where('name', '==', teamname))
  const docs = await getDocs(q)
  console.log('reads: ' + docs.docs.length)
  const doc = docs.docs[0]
  if (doc != undefined) {
    return { data: doc.data(), id: doc.id }
  } else {
    return undefined
  }
}

const getRegattaElos = async (regattaName) => {
  const q = query(collection(db, 'eloRegattas'), where('regattaName', '==', regattaName))
  const docs = await getDocs(q)
  console.log('reads: ' + docs.docs.length)
  const doc = docs.docs[0]
  if (doc != undefined) {
    return { data: doc.data(), id: doc.id }
  } else {
    return undefined
  }
}

const CACHE_KEY = 'allPeople'
const CACHE_EXPIRY_KEY = 'allPeopleExpiry'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

const getAllSailors = async ({ useCache }) => {
  const cachedIndex = localStorage.getItem(CACHE_KEY)
  const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)

  if (useCache && cachedIndex && expiry && Date.now() < expiry) {
    console.log('loaded from cache!')
    return JSON.parse(cachedIndex)
  }

  const thisDoc = await getDoc(doc(db, 'vars', 'allSailors'))

  console.log('reads: %d', 1)
  if (thisDoc != undefined) {
    // Cache the result
    localStorage.setItem(CACHE_KEY, thisDoc.data()?.allSailors)
    localStorage.setItem(CACHE_EXPIRY_KEY, Date.now() + CACHE_DURATION)
    return JSON.parse(thisDoc.data()?.allSailors)
  } else {
    // Cache the result
    localStorage.setItem(CACHE_KEY, JSON.stringify({}))
    localStorage.setItem(CACHE_EXPIRY_KEY, Date.now() + CACHE_DURATION)
    return undefined
  }
}

export { app, getUserWithUsername, getTeamWithName, getTeamWithID, getTeamList, scrapeTeamListToDb, getEventWithID, getEventsForTeam, getUserWithID, getSailorElo, getAllTeams, getTeamElos, getTop100, getRegattaElos, getAllSailors }

import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore, collection, where, query, doc, getDoc, getDocs, setDoc, getCountFromServer, documentId, serverTimestamp, arrayUnion, updateDoc, arrayRemove } from 'firebase/firestore'
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
const db = getFirestore()

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

const getAllTeams = async () => {
  const thisDoc = await getDoc(doc(db, 'vars', 'eloTeams'))
  console.log('reads: %d', 1)
  if (thisDoc != undefined) {
    return { data: thisDoc.data(), id: thisDoc.id }
  } else {
    return undefined
  }
}

const getAllTeamsPredVals = async () => {
  const thisDoc = await getDoc(doc(db, 'vars', 'predTeams'))
  console.log('reads: %d', 1)
  if (thisDoc != undefined) {
    return { data: thisDoc.data(), id: thisDoc.id }
  } else {
    return undefined
  }
}

const getTop100 = async (type, pos, raceType) => {
  const docName = pos == 'Skipper' ? (type == 'women' ? (raceType == 'fleet' ? 'topWomenSkippers' : 'topWomenSkippersTR') : raceType == 'fleet' ? 'topSkippers' : 'topSkippersTR') : type == 'women' ? (raceType == 'fleet' ? 'topWomenCrews' : 'topWomenCrewsTR') : raceType == 'fleet' ? 'topCrews' : 'topCrewsTR'
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

async function followUser(targetKey, targetName, uid, name, username) {
  const db = getFirestore()
  let d = doc(db, `users/${uid}`)
  // let docSnap = (await getDoc(d)).data()
  // console.log(uid, username, displayName)
  await updateDoc(d, { following: arrayUnion({ targetKey: targetKey, targetName: targetName }) })

  try {
    const collectionRef = collection(db, 'eloSailors')
    const q = query(collectionRef, where('key', '==', targetKey))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      console.log('No matching documents.')
      return
    }

    // Update ALL matching documents (important!).  If you only want to update
    // the first one, you can break after the first iteration.
    for (const docSnapshot of querySnapshot.docs) {
      const docRef = doc(collectionRef, docSnapshot.id) // Get doc ref using docSnapshot.id
      await updateDoc(docRef, { followers: arrayUnion({ followerUid: uid, followerName: name, followerUsername: username }) })
      console.log(`Document ${docSnapshot.id} successfully updated!`)
    }
  } catch (error) {
    console.error('Error updating documents: ', error)
  }
}

async function unFollowUser(targetKey, targetName, uid, name, username) {
  const db = getFirestore()
  let d = doc(db, `users/${uid}`)
  // let docSnap = (await getDoc(d)).data()
  // console.log(uid, username, displayName)
  await updateDoc(d, { following: arrayRemove({ targetKey: targetKey, targetName: targetName }) })

  try {
    const collectionRef = collection(db, 'eloSailors')
    const q = query(collectionRef, where('key', '==', targetKey))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      console.log('No matching documents.')
      return
    }

    // Update ALL matching documents (important!).  If you only want to update
    // the first one, you can break after the first iteration.
    for (const docSnapshot of querySnapshot.docs) {
      const docRef = doc(collectionRef, docSnapshot.id) // Get doc ref using docSnapshot.id
      await updateDoc(docRef, { followers: arrayRemove({ followerUid: uid, followerName: name, followerUsername: username }) })
      console.log(`Document ${docSnapshot.id} successfully updated!`)
    }
  } catch (error) {
    console.error('Error updating documents: ', error)
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

const getTeamRanks = async () => {
  const thisDoc = await getDoc(doc(db, 'vars', 'dateRanks'))
  console.log('reads: %d', 1)
  if (thisDoc != undefined) {
    return thisDoc.data()
  } else {
    return undefined
  }
}

export { app, getUserWithUsername, getTeamWithName, getTeamWithID, getTeamList, getEventWithID, getEventsForTeam, getUserWithID, getAllTeams, getTeamElos, getTop100, getRegattaElos, getAllSailors, followUser, unFollowUser, getAllTeamsPredVals, getTeamRanks }

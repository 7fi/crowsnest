import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore, collection, where, query, limit, getDocs } from 'firebase/firestore'
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

const getTeamList = async (district) => {
  const docSnaps = await getDocs(db, 'techscoreTeamlist')
  console.log(docSnaps)
}

const scrapeTeamList = async (district) => {
  let schools = await getSchools({ district: 'NWISA' })
  console.log(schools.data)
  return { data: schools.data }
}

export { app, getUserWithUsername, getTeamWithName, getTeamList, scrapeTeamList }

import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore, collection, where, query, limit, getDocs } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: 'AIzaSyCSR2v6LtnYuj0aT6v9NaGDWunJbZwotuU',
    authDomain: 'sailing-manager.firebaseapp.com',
    projectId: 'sailing-manager',
    storageBucket: 'sailing-manager.appspot.com',
    messagingSenderId: '796021609321',
    appId: '1:796021609321:web:180396e3845773a59623f8',
    measurementId: 'G-5GD1XBM3T9',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
//eslint-disable-next-line
const analytics = getAnalytics(app)
const db = getFirestore()

const getUserWithUsername = async (username) => {
    const q = query(collection(db, 'users'), where('username', '==', username))
    let doc = (await getDocs(q)).docs[0]
    return doc.data()
}
const getTeamWithName = async (teamName) => {
    const q = query(collection(db, 'teams'), where('teamName', '==', teamName))
    let doc = (await getDocs(q)).docs[0]
    return { data: doc.data(), id: doc.id }
}

export { app, getUserWithUsername, getTeamWithName }

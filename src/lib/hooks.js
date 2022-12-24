import { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'

import { getAuth } from 'firebase/auth'
import { getDoc, getFirestore, onSnapshot, doc } from 'firebase/firestore'

export function useUserData() {
    const auth = getAuth()
    const db = getFirestore()
    const [user] = useAuthState(auth)
    const [username, setUsername] = useState(null)
    const [displayname, setDisplayName] = useState(null)

    useEffect(() => {
        let unsubscribe
        if (user) {
            let docRef = doc(db, 'users', user.uid)
            // let docSnap = await getDoc(docRef)
            unsubscribe = onSnapshot(docRef, (snapshot) => {
                // console.log(snapshot.data())
                setUsername(snapshot.data()?.username)
                setDisplayName(snapshot.data()?.displayName)
            })
        } else {
            setUsername(null)
            setDisplayName(null)
        }

        return unsubscribe
    }, [user])
    console.log(displayname)
    return { user, username, displayname }
}

export function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
    console.log('Theme set to', theme)
}

export function checkTheme() {
    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme)
    }
}

export function switchMode() {
    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null
    if (currentTheme == 'dark') {
        document.documentElement.setAttribute('data-theme', 'light')
        localStorage.setItem('theme', 'light')
    } else {
        document.documentElement.setAttribute('data-theme', 'dark')
        localStorage.setItem('theme', 'dark')
    }
}

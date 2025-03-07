import { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'

import { getAuth } from 'firebase/auth'
import { getFirestore, onSnapshot, doc } from 'firebase/firestore'

export function useUserData() {
  const auth = getAuth()
  const db = getFirestore()
  const [user] = useAuthState(auth)
  const [userVals, setUserVals] = useState({})
  //   const [username, setUsername] = useState(null)
  //   const [displayname, setDisplayName] = useState(null)

  useEffect(() => {
    let unsubscribe
    if (user) {
      let docRef = doc(db, 'users', user.uid)
      // let docSnap = await getDoc(docRef)
      unsubscribe = onSnapshot(docRef, (snapshot) => {
        // console.log(snapshot.data())
        setUserVals({ username: snapshot.data()?.username, displayName: snapshot.data()?.displayName, pro: snapshot.data()?.pro, following: snapshot.data()?.following })
        // setUsername(snapshot.data()?.username)
        // setDisplayName(snapshot.data()?.displayName)
      })
    } else {
      setUserVals({ username: null, displayName: null, pro: null })
    }

    return unsubscribe
  }, [user, db])
  // console.log(displayname)
  return { user, userVals }
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
  } else {
    localStorage.setItem('theme', 'light')
    checkTheme()
  }
}

export function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent
    const isMobileDevice = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    setIsMobile(isMobileDevice)
  }, [])

  return isMobile
}

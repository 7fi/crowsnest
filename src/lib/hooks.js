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

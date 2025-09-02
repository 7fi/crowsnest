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
        setUserVals({ username: snapshot.data()?.username, displayName: snapshot.data()?.displayName, pro: snapshot.data()?.pro, following: snapshot.data()?.following, tsLink: snapshot.data()?.techscoreLink })
        // setUsername(snapshot.data()?.username)
        // setDisplayName(snapshot.data()?.displayName)
      })
    } else {
      setUserVals({ username: null, displayName: null, pro: null, tsLink: null })
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
const alpha = 200.0 / (25.0 / 3)
export function ord(mu, sigma, target) {
  return alpha * (mu - 3.0 * sigma + target / alpha)
}

export function useTeamRegions() {
  const teamRegions = {
    Hawaii: 'PCCSC',
    Brown: 'NEISA',
    'Southern Cal': 'PCCSC',
    'Salve Regina': 'NEISA',
    'UC Santa Barbara': 'PCCSC',
    'Cal Poly': 'PCCSC',
    Washington: 'NWICSA',
    'Channel Islands': 'PCCSC',
    'UC San Diego': 'PCCSC',
    'British Columbia': 'NWICSA',
    'UC Los Angeles': 'PCCSC',
    'Westmont College': 'PCCSC',
    'Arizona State': 'PCCSC',
    'Texas A&M Galveston': 'SEISA',
    'Texas A&M': 'SEISA',
    Tulane: 'SEISA',
    Rice: 'SEISA',
    Texas: 'SEISA',
    'Oklahoma State': 'SEISA',
    'Texas A&M C. Christ': 'SEISA',
    'Central Oklahoma': 'SEISA',
    'Notre Dame': 'MCSA',
    Jacksonville: 'SAISA',
    Florida: 'SAISA',
    Tennessee: 'SAISA',
    Rollins: 'SAISA',
    'North Carolina State': 'SAISA',
    'Georgia Tech': 'SAISA',
    Auburn: 'SAISA',
    Charleston: 'SAISA',
    'South Florida': 'SAISA',
    'Old Dominion': 'MAISA',
    Eckerd: 'SAISA',
    'Florida State': 'SAISA',
    'U. Miami': 'SAISA',
    'UW Milwaukee': 'MCSA',
    'Stony Brook': 'MAISA',
    Duke: 'SAISA',
    Clemson: 'SAISA',
    'U South Carolina': 'SAISA',
    'UNC Wilmington': 'SAISA',
    Georgia: 'SAISA',
    Berkeley: 'PCCSC',
    'CSU Long Beach': 'PCCSC',
    'Monterey Bay': 'PCCSC',
    'UC Irvine': 'PCCSC',
    'UC Davis': 'PCCSC',
    'Rhode Island': 'NEISA',
    Georgetown: 'MAISA',
    Dartmouth: 'NEISA',
    MIT: 'NEISA',
    'George Washington': 'MAISA',
    Navy: 'MAISA',
    Fordham: 'MAISA',
    Northeastern: 'NEISA',
    'Christopher Newport': 'MAISA',
    Victoria: 'NWICSA',
    'Boston University': 'NEISA',
    'Miami University': 'MCSA',
    Hampton: 'MAISA',
    Virginia: 'MAISA',
    Stevens: 'MAISA',
    Columbia: 'MAISA',
    'NY Maritime': 'MAISA',
    'Kings Point': 'MAISA',
    "St. Mary's": 'MAISA',
    Maryland: 'MAISA',
    'Virginia Tech': 'MAISA',
    Drexel: 'MAISA',
    'Maryland/Baltimore': 'MAISA',
    Buffalo: 'MAISA',
    'UC Santa Cruz': 'PCCSC',
    'Santa Clara': 'PCCSC',
    Wisconsin: 'MCSA',
    Michigan: 'MCSA',
    'Washington College': 'MAISA',
    Minnesota: 'MCSA',
    Yale: 'NEISA',
    'Hobart & William': 'MAISA',
    Vermont: 'NEISA',
    'Connecticut College': 'NEISA',
    Harvard: 'NEISA',
    'Roger Williams': 'NEISA',
    Syracuse: 'MAISA',
    Tufts: 'NEISA',
    Middlebury: 'NEISA',
    'New College': 'SAISA',
    'William and Mary': 'MAISA',
    Gannon: 'MAISA',
    'Boston College': 'NEISA',
    Stanford: 'PCCSC',
    Bowdoin: 'NEISA',
    'Lewis & Clark': 'NWICSA',
    Monmouth: 'MAISA',
    American: 'MAISA',
    'Michigan State': 'MCSA',
    Hope: 'MCSA',
    'Western Michigan': 'MCSA',
    Toledo: 'MCSA',
    'Ohio State': 'MCSA',
    'Mass Maritime': 'NEISA',
    'Coast Guard': 'NEISA',
    Bates: 'NEISA',
    Fairfield: 'NEISA',
    'Sacred Heart': 'NEISA',
    'Wentworth Institute': 'NEISA',
    Providence: 'NEISA',
    'Iowa State': 'MCSA',
    Iowa: 'MCSA',
    Indiana: 'MCSA',
    Davidson: 'SAISA',
    'Oregon State': 'NWICSA',
    'Western Washington': 'NWICSA',
    'U. Rochester': 'MAISA',
    Army: 'MAISA',
    'New Hampshire': 'NEISA',
    'U. Connecticut': 'NEISA',
    'UMass Dartmouth': 'NEISA',
    Wesleyan: 'NEISA',
    'U. Mass/ Amherst': 'NEISA',
    'U New England': 'NEISA',
    Denison: 'MCSA',
    'Northern Michigan': 'MCSA',
    Ohio: 'MCSA',
    Pennsylvania: 'MAISA',
    Villanova: 'MAISA',
    'Maine Maritime': 'NEISA',
    'Michigan Tech': 'MCSA',
    Illinois: 'MCSA',
    Chicago: 'MCSA',
    Northwestern: 'MCSA',
    'Grand Valley State': 'MCSA',
    'Washington U': 'MCSA',
    Marquette: 'MCSA',
    'Lake Forest': 'MCSA',
    Cornell: 'MAISA',
    Oregon: 'NWICSA',
    'Portland State': 'NWICSA',
    Princeton: 'MAISA',
    "Queen's": 'MAISA',
    'Penn State': 'MAISA',
    'Ocean County': 'MAISA',
    Delaware: 'MAISA',
    Rutgers: 'MAISA',
    'Worcester Polytech': 'NEISA',
    'Emmanuel College': 'NEISA',
    "St. John's": 'MAISA',
    'U Pittsburgh': 'MAISA',
    'Webb Institute': 'MAISA',
    McGill: 'NEISA',
    Citadel: 'SAISA',
    Colgate: 'MAISA',
    'Catholic U America': 'MAISA',
    'Loyola College': 'MAISA',
    Ottawa: 'MAISA',
    'Royal Military': 'MAISA',
    Dalhousie: 'NEISA',
    'U Toronto': 'MAISA',
    'New Orleans': 'SEISA',
    Kansas: 'SEISA',
    Bentley: 'NEISA',
    Brandeis: 'NEISA',
    'Cal Maritime': 'PCCSC',
    'San Diego State': 'PCCSC',
    Loyola: 'SEISA',
    'North Texas': 'SEISA',
    Vanderbilt: 'SAISA',
    Purdue: 'MCSA',
    'North Carolina': 'SAISA',
    Hillsdale: 'MCSA',
    Amherst: 'NEISA',
    Williams: 'NEISA',
    Hamilton: 'MAISA',
    Rochester: 'MAISA',
    Wellesley: 'NEISA',
    'Hosei Univerisity': 'GUEST',
    Colorado: 'SEISA',
    'John Carroll': 'MCSA',
    'U.  Mass/ Boston': 'NEISA',
    Mercyhurst: 'MAISA',
    'Penn State Behrend': 'MAISA',
    'Indiana U Pennsylvan': 'MAISA',
    'U Nebraska': 'MCSA',
    'U Maine': 'NEISA',
    'Texas Christian': 'SEISA',
    'Embry-Riddle': 'SAISA',
    'Palm Beach Atlantic': 'SAISA',
    'U of Central Florida': 'SAISA',
    'Baldwin-Wallace': 'MCSA',
    "Saint Mary's College": 'MCSA',
    Olin: 'NEISA',
    Baylor: 'SEISA',
    'Texas Tech': 'SEISA',
    'Wake Forest': 'SAISA',
    'Georgia Southern': 'SAISA',
    'East Carolina': 'SAISA',
    'Florida Tech': 'SAISA',
    'Saint Thomas': 'MCSA',
    Cincinnati: 'MCSA',
    'Florida Gulf Coast': 'SAISA',
    'Saginaw Valley': 'MCSA',
    'Coastal Georgia': 'SAISA',
    'Cleveland State': 'MCSA',
    Sewanee: 'SAISA',
    'Case Western': 'MCSA',
    Oklahoma: 'SEISA',
    Gonzaga: 'PCCSC',
  }
  return teamRegions
}

import posthog from 'posthog-js'
import { getAuth, signOut } from 'firebase/auth'

// const APIURL = 'http://localhost:3001/'
const APIURL = 'https://api.crowsnest.club/'

export async function getAllSailors() {
  const res = await fetch(APIURL + 'sailors/').then((response) => response.json())
  return res
}
export async function searchSailors(query) {
  const res = await fetch(APIURL + 'search/' + query).then((response) => response.json())
  return res
}
export async function getSailorInfo(key) {
  const res = await fetch(APIURL + 'sailors/' + key).then((response) => response.json())
  return res
}

export async function getSailorTeams(key) {
  const res = await fetch(APIURL + 'sailors/teams/' + key).then((response) => response.json())
  return res
}

export async function getSailorFollows(key) {
  const res = await fetch(APIURL + 'sailors/follows/' + key).then((response) => response.json())
  return res
}
export async function getUserFollows(key) {
  const res = await fetch(APIURL + 'users/follows/' + key).then((response) => response.json())
  return res
}
export async function getSailorRivals(key) {
  const res = await fetch(APIURL + 'sailors/rivals/' + key).then((response) => response.json())
  return res
}
export async function getUserData(key) {
  const res = await fetch(APIURL + 'users/' + key).then((response) => response.json())
  return res
}

export async function getTeam(key) {
  const res = await fetch(APIURL + 'teams/' + key).then((response) => response.json())
  return res
}
export async function getAllTeams() {
  const res = await fetch(APIURL + 'teams').then((response) => response.json())
  return res
}

export async function getTopSailors(pos, raceType, womens, count = 100) {
  const res = await fetch(APIURL + `sailors/top` + `?pos=${pos}&raceType=${raceType}&women=${womens}&count=${count}`).then((response) => response.json())
  return res
}

export async function getHomePageStats() {
  const res = await fetch(APIURL + 'homestats').then((response) => response.json())
  return res
}

export async function followUser(targetID, targetName, userID) {
  const res = await fetch(APIURL + 'follow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetID: targetID, targetName: targetName, userID: userID }),
  }).then((response) => response.json())
  return res
}

export async function unFollowUser(targetID, targetName, userID) {
  const res = await fetch(APIURL + 'follow', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetID: targetID, targetName: targetName, userID: userID }),
  }).then((response) => response.json())
  return res
}

export async function getUserByUsername(username) {
  const res = await fetch(APIURL + 'users/username/' + username).then((response) => response.json())
  return res
}

export async function getUserFeed(userID) {
  const res = await fetch(APIURL + 'users/feed/' + userID).then((response) => response.json())
  return res
}

export async function createUserAccount(userID, username, photoURL, displayName) {
  const res = await fetch(APIURL + 'users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username, photoURL: photoURL, displayName: displayName, userID: userID }),
  }).then((response) => response.json())
  return res
}
export async function deleteUserAccount(userID) {
  const auth = getAuth()
  signOut(auth)
  posthog.reset()
  const res = await fetch(APIURL + 'users', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userID: userID }),
  }).then((response) => response.json())
  return res
}

// export async function getRaceScores(season, regatta, raceNumber, division, pos) {
//   console.log(season, regatta, raceNumber, division, pos)
//   const res = await fetch(APIURL + `regattas/race` + `?season=${season}&regatta=${regatta}&raceNum=${raceNumber}&division=${division}&position=${pos}`).then((response) => response.json())
//   return res
// }
export async function getRaceScores(season, regatta, raceNumber, division, pos) {
  console.log(season, regatta, raceNumber, division, pos)
  const res = await fetch(APIURL + `regattas` + `?season=${season}&regatta=${regatta}`).then((response) => response.json())
  return res
}

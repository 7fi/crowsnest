const APIURL = 'http://localhost:3001/api/'

export async function getSailorInfo(key) {
  const res = await fetch(APIURL + 'sailors/' + key).then((response) => response.json())
  return res
}

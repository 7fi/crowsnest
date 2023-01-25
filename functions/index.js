const functions = require('firebase-functions')
const cheerio = require('cheerio')
const axios = require('axios')
const admin = require('firebase-admin')
admin.initializeApp()

const db = admin.firestore()

class person {
  constructor(name, team, home, races) {
    this.name = name
    this.team = team
    this.home = home
    this.races = races
  }
}
class race {
  constructor(number, division, score, teams, position, venue, fleet) {
    this.number = number
    this.division = division
    this.score = score
    this.teams = teams
    this.position = position
    this.venue = venue
    this.fleet = fleet
  }
}
function addPerson(people, name, pos, division, home, teamName, raceNums, scores, teams, venue, fleet) {
  // console.log(name, scores)
  let scoreLen = Array.from(scores).length
  // console.log("Scorelen", scoreLen)
  let newNums = []
  let names = people.map((person) => person.name)
  if (!names.includes(name)) {
    people.push(new person(name, home, teamName, []))
  }
  // console.log([''] == [''])
  // console.log(raceNums[0].includes(''))
  // console.log(name, raceNums)
  if (raceNums[0].includes('')) {
    newNums = [...Array(scoreLen).keys()].map((i) => i + 1)
    // console.log(newNums)
  } else if (raceNums.length > 0) {
    for (let i = 0; i < raceNums.length; i++) {
      if (raceNums[i].length > 1) {
        for (j = parseInt(raceNums[i][0]); j < parseInt(raceNums[i][1]) + 1; j++) {
          newNums.push(j)
        }
      } else {
        newNums.push(parseInt(raceNums[i]))
      }
    }
  }
  raceNums = newNums
  // console.log(name, raceNums)
  for (let i = 0; i < scoreLen; i++) {
    const score = scores[i]
    if (raceNums.includes(i + 1)) {
      people.forEach((p) => {
        if (p.name == name) {
          // console.log(p.races)
          p.races.push(new race(i + 1, division, score, teams, pos, venue, fleet))
        }
      })
    }
  }
  return people
}

exports.getSchools = functions.https.onCall(async (data, ctx) => {
  let schools = {}
  try {
    const response = await axios.get(`https://scores.hssailing.org/schools/`)
    const $ = cheerio.load(response.data)
    // console.log(response.status)
    $(`#${data.district} tbody`)
      .children()
      .each(async function (i) {
        // functions.logger.log($(this).find('a').text())
        schools[$(this).find('a').text()] = $(this).find('a').attr('href')
      })
  } catch (error) {
    // console.error(error)
  }
  // functions.logger.info(`Hello logs! ${JSON.stringify(schools)}`, { structuredData: true })
  return schools
})

exports.getRegattas = functions.https.onCall(async (data, ctx) => {
  let regattas = {}
  if (data.schoolLink != '') {
    try {
      const response = await axios.get(`https://scores.hssailing.org${data.schoolLink}${data.season}`)
      const $ = cheerio.load(response.data)
      // console.log(response.status)

      $(`table.participation-table tbody`)
        .children()
        .each(function (i) {
          // console.log($(this).text().includes("2 Divisions") || $(this).text().includes("Combined"))
          if ($(this).text().includes('2 Divisions') || $(this).text().includes('Combined')) {
            regattas[$(this).find('a span').text()] = { link: $(this).find('a').attr('href'), date: $(this).find('time').attr('datetime').split('T')[0] }
          }
        })
    } catch (error) {
      // console.error(error)
    }
  }
  return regattas
})

exports.getRegattaData = functions.https.onCall(async (data, ctx) => {
  let people = []

  for (r = 0; r < Object.values(data.regattas).length; r++) {
    let regatta = Object.values(data.regattas)[r]

    try {
      const response = await axios.get(`https://scores.hssailing.org${regatta}full-scores/`)
      const response2 = await axios.get(`https://scores.hssailing.org${regatta}sailors/`)
      const fullScores = cheerio.load(response.data)
      const scoreData = fullScores('table.results tbody')
      const sailors = cheerio.load(response2.data)
      const raceCount = parseInt(fullScores('th.right:nth-last-child(3)').text())
      const teamCount = scoreData.children().length / 3
      let fleet = 'Gold'
      if (regatta.toUpperCase().includes('SILVER')) fleet = 'Silver'
      // console.log(fullScores('table.results tbody').children(0).text())

      let betterVenue = Object.keys(data.regattas)[r]
      console.log(`(${r + 1}/${Object.values(data.regattas).length}) Analyzing ${betterVenue}`)

      let teamHomes = []
      for (i = 0; i < teamCount; i++) {
        // teamHomes.push(fullScores(`table.results tbody :nth-child(${i * 3 + 1}) a`).text());
        // teamHomes.push(scoreData.children(i * 3 + 1).find('a').text());
        teamHomes.push(scoreData.find(`:nth-child(${i * 3 + 1}) a`).text())
      }
      // console.log(teamHomes)

      //Loop through teams
      for (let i = 0; i < teamCount; i++) {
        let teamHome = scoreData.find(`:nth-child(${i * 3 + 1}) a`).text()
        let teamName = fullScores(`table.results tbody :nth-child(${i * 3 + 2}) :nth-child(3)`).text()
        // console.log(teamNameEl.text())
        let teamScores = {
          A: [],
          B: [],
        }
        // console.log(teamName)

        for (j = 5; j < 5 + raceCount; j++) {
          let score = scoreData.find(`:nth-child(${i * 3 + 1}) :nth-child(${j})`).text()
          if (!isNaN(score)) score = parseInt(score)
          teamScores['A'].push(score)

          score = fullScores(`table.results tbody :nth-child(${i * 3 + 2}) :nth-child(${j})`).text()
          if (!isNaN(score)) score = parseInt(score)
          teamScores['B'].push(score)
        }
        // console.log(teamScores)

        let teamNameEl
        let schoolName
        sailors(`table.sailors tbody .teamname`).each(function (i) {
          if (sailors(this).text() == teamName) {
            teamNameEl = sailors(this)
            schoolName = sailors(this).prev().text()
          }
        })
        // console.log(teamNameEl.text())
        // console.log(schoolName)

        let index = 0
        let row = teamNameEl.parent()
        while ((row.next() != null && row.next().attr('class') != undefined && !row.attr('class').split(/\s+/).includes('topborder') && !row.attr('class').split(/\s+/).includes('reserves-row')) || index == 0) {
          let curRow = row
          // console.log(row.attr('class').split(/\s+/).includes("topborder"))
          // console.log(row.next().html())
          // console.log(curRow.find('td.division-cell').html())

          while (curRow.find('td.division-cell').html() == null) {
            curRow = curRow.prev()
          }
          let division = curRow.find('td.division-cell').text()

          // Get Skipper
          let skipper = row.find(`:nth-last-child(4)`)
          let skipperName = row.find(`:nth-last-child(4)`).text().split(" '")[0]
          if (skipperName != '') {
            let raceNums = skipper.next().text().split(',')
            raceNums = raceNums.map((num) => num.split('-'))
            // console.log(raceNums)
            people = addPerson(people, skipperName.split(" '")[0], 'Skipper', division, teamHome, schoolName, raceNums, teamScores[division], teamHomes, betterVenue, fleet)
          }

          // Get Skipper
          let crew = row.find(`:nth-last-child(2)`)
          let crewName = row.find(`:nth-last-child(2)`).text().split(" '")[0]
          if (crewName != '') {
            let raceNums = crew.next().text().split(',')
            raceNums = raceNums.map((num) => num.split('-'))
            people = addPerson(people, crewName.split(" '")[0], 'Crew', division, teamHome, schoolName, raceNums, teamScores[division], teamHomes, betterVenue, fleet)
            // console.log(raceNums)
          }

          // console.log(skipperName, crewName)
          row = row.next()
          index++
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
  return people
})

exports.scrapeToDB = functions.https.onCall(async (data, ctx) => {
  console.log('Hi')
  const colRef = db.collection('techscoreTeams')
  const docs = docRef.get().then((doc) => {
    if (!doc.exists) {
      console.log('No such document!')
      return res.send('Not Found')
    }
    console.log(doc.data())
    return res.send(doc.data())
  })
  console.log(docSnaps)
  return docSnaps?.data
})

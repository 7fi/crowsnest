import express from 'express'
import mysql from 'mysql2/promise'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Create a connection pool (better performance than single connection)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
})

app.get('/', async (req, res) => {
  res.send('<p>You found the crowsnest backend API!</p>')
})

app.get('/sailors', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT DISTINCT s.sailorID, s.name, s.year, st.teamID FROM Sailors s JOIN SailorTeams st ON s.sailorID = st.sailorID WHERE st.season in ('s25');")
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed' })
  }
})

app.get('/search/:query', async (req, res) => {
  const { query } = req.params
  if (!query) return res.json([])
  try {
    const [rows] = await pool.query(`SELECT DISTINCT s.sailorID, s.name, s.year, st.teamID FROM Sailors s JOIN SailorTeams st ON s.sailorID = st.sailorID WHERE s.name LIKE '%${query}%' OR st.teamID LIKE '%${query}%' LIMIT 200`)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed' })
  }
})

app.get('/sailors/top', async (req, res) => {
  const { pos, raceType, women, count } = req.query
  // if (!pos || !raceType || !womens) return res.json([])

  const rankQuery = `${women == 'true' ? 'w' : ''}${raceType === 'team' ? 't' : ''}${pos === 'skipper' ? 's' : 'c'}Rank`
  const ratingQuery = `${women == 'true' ? 'w' : ''}${raceType === 'team' ? 't' : ''}${pos === 'skipper' ? 's' : 'c'}r`

  try {
    const [rows] = await pool.query(
      `
      SELECT s.sailorID, s.name, s.year, st.teamID, s.${ratingQuery} AS rating
      FROM Sailors s
      JOIN SailorTeams st ON s.sailorID = st.sailorID
      WHERE s.${rankQuery} != 0
      GROUP BY s.sailorID, s.${rankQuery}, s.year, st.teamID
      ORDER BY s.${rankQuery}
      LIMIT ?
    `,
      [Number(count) || 100]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed' })
  }
})

app.get('/sailors/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Sailors WHERE sailorID = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sailor not found' })
    }
    const [fleetRows] = await pool.query('SELECT season, regatta, raceNumber, division, sa.sailorID, partnerID, partnerName, score, predicted, ratio, penalty, position, date, scoring, venue, boat, ratingType, oldRating, newRating, regAvg FROM Sailors sa JOIN FleetScores sc ON sa.sailorID = sc.sailorID WHERE sa.sailorID = ? ORDER BY date DESC, raceNumber DESC;', [req.params.id])
    const [teamRows] = await pool.query('SELECT season, regatta, raceNumber, round, sa.sailorID, partnerID, partnerName, opponentTeam, opponentNick, score, outcome, predicted, penalty, position, date, venue, boat, ratingType, oldRating, newRating, regAvg FROM Sailors sa JOIN TRScores sc ON sa.sailorID = sc.sailorID WHERE sa.sailorID = ? ORDER BY date DESC, raceNumber DESC;', [req.params.id])

    const result = { data: rows[0], fleetScores: fleetRows, teamScores: teamRows }
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/teams', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT t.teamID as teamID, teamName, topFleetRating, topWomenRating, topTeamRating,
       topWomenTeamRating, avgRating, avgRatio, region,
           COUNT(DISTINCT st.sailorID) AS memberCount
    FROM Teams t JOIN SailorTeams st ON t.teamID = st.teamID
    WHERE st.season in ('f24','s25')
    GROUP BY teamID;`)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/teams/:id', async (req, res) => {
  try {
    const [members] = await pool.query(
      `SELECT * FROM Sailors s JOIN SailorTeams st on s.sailorID = st.sailorID
        WHERE st.teamID = ?;`,
      [req.params.id]
    )
    const [info] = await pool.query(
      `SELECT * FROM Teams
        WHERE teamID = ?;`,
      [req.params.id]
    )
    const [regattas] = await pool.query(
      `SELECT Distinct fs.regatta, fs.date
      FROM FleetScores fs
      JOIN SailorTeams st ON fs.sailorID = st.sailorID
      WHERE st.teamID = ?
      ORDER BY fs.date DESC
      LIMIT 50;`,
      [req.params.id]
    )
    res.json({ members: members, data: info[0], regattas: regattas })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/sailors/teams/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT DISTINCT teamID FROM SailorTeams WHERE sailorID = ?;`, [req.params.id])
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/users/follows/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM SailorFollows WHERE userID = ?;`, [req.params.id])
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/sailors/follows/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT COUNT(*) as count FROM SailorFollows WHERE sailorID = ?;`, [req.params.id])
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/sailors/rivals/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM SailorRivals WHERE sailorID = ?;`, [req.params.id])
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM Users WHERE userID = ? AND deleted = FALSE;`, [req.params.id])
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/users/feed/:id', async (req, res) => {
  try {
    const resJson = []
    const [rows] = await pool.query(
      `WITH RankedTeams AS ( SELECT  st.*,
        ROW_NUMBER() OVER (
            PARTITION BY st.sailorID
            ORDER BY st.season DESC, st.teamID ASC ) AS rn FROM SailorTeams st)
        SELECT
            s.sailorID,
            s.name,
            s.gender,
            s.year,
            s.lastUpdate,
            rt.season,
            rt.teamID
        FROM SailorFollows sf
        JOIN Sailors s ON sf.sailorID = s.sailorID
        JOIN RankedTeams rt ON s.sailorID = rt.sailorID
        JOIN Users u ON sf.userID = u.userID
         AND rt.rn = 1
        WHERE sf.userID = ? AND u.deleted = FALSE;`,
      [req.params.id]
    )
    await Promise.all(
      rows.map(async (sailor) => {
        const [recentRaces] = await pool.query(
          `SELECT season, regatta, sailorID, date, score, predicted, ratingType, oldRating, newRating, position, raceNumber, division, ratio FROM FleetScores fs WHERE fs.sailorID = ? UNION ALL
          SELECT season, regatta, sailorID, date, score, predicted, ratingType, oldRating, newRating, position, raceNumber, raceNumber as x, raceNumber as y FROM TRScores ts WHERE ts.sailorID = ?
          ORDER BY date DESC
          LIMIT 5;`,
          [sailor.sailorID, sailor.sailorID]
        )
        sailor.races = recentRaces
        resJson.push(sailor)
      })
    )
    res.json(resJson)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/users/username/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM Users WHERE username = ? AND deleted = FALSE;`, [req.params.id])
    if (rows.length > 0) {
      res.json(rows[0])
    } else {
      res.json([])
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/homestats', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM HomePageStats`)
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.post('/follow', async (req, res) => {
  const { targetID, targetName, userID } = req.body
  if (targetID == undefined || userID == undefined) return

  try {
    const [rows] = await pool.query(`INSERT IGNORE INTO SailorFollows (sailorID, sailorName, userID) VALUES (?,?,?)`, [targetID, targetName, userID])
    res.status(201)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})
app.delete('/follow', async (req, res) => {
  const { targetID, targetName, userID } = req.body
  if (targetID == undefined || userID == undefined) return

  try {
    const [rows] = await pool.query(`DELETE FROM SailorFollows WHERE sailorID = ? AND userID = ?`, [targetID, userID])

    res.status(201)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.put('/link', async (req, res) => {
  const { userID, techscoreID, techscoreLink } = req.body
  if (userID == undefined || techscoreID == undefined || techscoreLink == undefined) {
    res.status(400)
    return
  }
  try {
    const [rows] = await pool.query(
      `UPDATE Users SET techscoreLink = ?,
                 techscoreID = ?
      WHERE userID = ?;`,
      [techscoreLink, techscoreID, userID]
    )
  } catch (err) {
    console.err(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.delete('/link', async (req, res) => {
  const { userID, techscoreID, techscoreLink } = req.body
  if (userID == undefined || techscoreID == undefined || techscoreLink == undefined) {
    res.status(400)
    return
  }
  try {
    const [rows] = await pool.query(
      `UPDATE Users SET techscoreLink = '',
                 techscoreID = 0
      WHERE userID = ?;`,
      [userID]
    )
  } catch (err) {
    console.err(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.post('/users', async (req, res) => {
  const { userID, username, photoURL, displayName } = req.body
  if ((userID == undefined || username == undefined || photoURL == undefined, displayName == undefined)) {
    res.status(400)
    return
  }
  // Do username + displayname validation here?

  try {
    const [rows] = await pool.query(`INSERT INTO Users (userID, username, displayName, photoURL) Values(?,?,?,?) `, [userID, username, displayName, photoURL])
  } catch (err) {
    console.err(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.delete('/users', async (req, res) => {
  const { userID } = req.body
  if (userID == undefined) {
    res.status(400)
    return
  }

  try {
    const [rows] = await pool.query(`UPDATE Users SET deleted = TRUE WHERE userID = ? `, [userID])
  } catch (err) {
    console.err(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/regattas', async (req, res) => {
  const { season, regatta } = req.query

  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT fs.sailorID, s.name, fs.raceNumber, fs.division, fs.boatName, fs.score, fs.predicted, fs.partnerID, fs.partnerName, fs.newRating, fs.oldRating, fs.ratingType, fs.regAvg, st.teamID
      FROM FleetScores fs JOIN SailorTeams st ON fs.sailorID = st.sailorID
      JOIN Sailors s ON s.sailorID = fs.sailorID
      WHERE fs.season = ?
          AND st.season = ?
          AND fs.regatta = ?
          AND fs.position = 'Skipper'
      LIMIT 500;`,
      [season, season, regatta]
    )

    res.json({ scores: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/regattas/race', async (req, res) => {
  const { season, regatta, raceNum, division, position } = req.query

  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT fs.sailorID, s.name, fs.division, fs.score, fs.predicted, fs.partnerID, fs.partnerName, fs.newRating, fs.oldRating, fs.ratingType, fs.regAvg, st.teamID
      FROM FleetScores fs JOIN SailorTeams st ON fs.sailorID = st.sailorID
      JOIN Sailors s ON s.sailorID = fs.sailorID
      WHERE fs.season = ?
          AND st.season = ?
          AND regatta = ?
          AND raceNumber = ?
          AND division = ?
          AND fs.position = ?
      LIMIT 50;`,
      [season, season, regatta, raceNum, division, position]
    )

    res.json({ scores: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

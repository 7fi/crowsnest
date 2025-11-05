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

app.get('/api/sailors', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT DISTINCT s.sailorID, s.name, s.year, st.teamID FROM Sailors s JOIN SailorTeams st ON s.sailorID = st.sailorID WHERE st.season in ('s25','f24');")
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed' })
  }
})

app.get('/api/search/:query', async (req, res) => {
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

app.get('/api/sailors/top', async (req, res) => {
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

app.get('/api/sailors/:id', async (req, res) => {
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

app.get('/api/teams', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT t.teamID as teamID, teamName, topFleetRating, topWomenRating, topTeamRating,
       topWomenTeamRating, avgRating, avgRatio, region, link,
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

app.get('/api/teams/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM Sailors s JOIN SailorTeams st on s.sailorID = st.sailorID
        WHERE st.teamID = ?;`,
      [req.params.id]
    )
    const [info] = await pool.query(
      `SELECT * FROM Teams
        WHERE teamID = ?;`,
      [req.params.id]
    )
    res.json({ members: rows, data: info[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/api/sailors/teams/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT DISTINCT teamID FROM SailorTeams WHERE sailorID = ?;`, [req.params.id])
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/api/users/follows/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM SailorFollows WHERE userID = ?;`, [req.params.id])
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/api/sailors/follows/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT COUNT(*) as count FROM SailorFollows WHERE sailorID = ?;`, [req.params.id])
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/api/sailors/rivals/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM SailorRivals WHERE sailorID = ?;`, [req.params.id])
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/api/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM Users WHERE userID = ?;`, [req.params.id])
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/api/homestats', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM HomePageStats`)
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.post('/api/follow', async (req, res) => {
  const { follow, targetID, targetName, userID } = req.body
  if (follow == undefined || targetID == undefined || userID == undefined) return

  try {
    if (follow) {
      const [rows] = await pool.query(`INSERT IGNORE INTO SailorFollows (sailorID, sailorName, userID) VALUES (?,?,?)`, [targetID, targetName, userID])
    } else {
      const [rows] = await pool.query(`DELETE IGNORE FROM SailorFollows WHERE sailorID = ? AND userID = ?`, [targetID, userID])
    }
    res.status(201)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))

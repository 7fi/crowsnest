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

// Example endpoint: get all users
app.get('/api/sailors', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Sailors;')
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed' })
  }
})

// Example endpoint: get a single user
app.get('/api/sailors/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Sailors WHERE sailorID = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sailor not found' })
    }
    console.log(rows)
    const [raceRows] = await pool.query('SELECT season, regatta, raceNumber, division, sa.sailorID, partnerID, partnerName, score, predicted, ratio, penalty, position, date, scoring, venue, boat, ratingType, oldRating, newRating FROM Sailors sa JOIN FleetScores sc ON sa.sailorID = sc.sailorID WHERE sa.sailorID = ? ORDER BY date DESC, raceNumber DESC;', [req.params.id])

    const result = { data: rows[0], fleetScores: raceRows }
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

app.get('/api/teams/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM Sailors s JOIN SailorTeams st on s.sailorID = st.sailorID
        WHERE st.teamID = ?
         AND s.year > 2025;`,
      [req.params.id]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))

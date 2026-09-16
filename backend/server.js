import express from 'express'
import mysql from 'mysql2/promise'
import cors from 'cors'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './swagger.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

const targetSeasons = "'s26','f26'"

// Create a connection pool (better performance than single connection)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
})

/**
 * @openapi
 * /sailors:
 *   get:
 *     summary: List all sailors in the target seasons
 *     tags: [Sailors]
 *     responses:
 *       200:
 *         description: Array of sailors with their current team
 */
app.get('/sailors', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT DISTINCT s.sailorID, s.name, s.year, st.teamID FROM Sailors s JOIN SailorTeams st ON s.sailorID = st.sailorID WHERE st.season in (${targetSeasons}) LIMIT 500;`)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed' })
  }
})

/**
 * @openapi
 * /search/{query}:
 *   get:
 *     summary: Search sailors by name or team ID
 *     tags: [Sailors]
 *     parameters:
 *       - in: path
 *         name: query
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Matching sailors (max 200)
 */
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

/**
 * @openapi
 * /sailors/top:
 *   get:
 *     summary: Get top-ranked sailors by rating category
 *     tags: [Sailors]
 *     parameters:
 *       - in: query
 *         name: pos
 *         schema: { type: string, enum: [skipper, crew] }
 *       - in: query
 *         name: raceType
 *         schema: { type: string, enum: [fleet, team] }
 *       - in: query
 *         name: women
 *         schema: { type: boolean }
 *       - in: query
 *         name: count
 *         schema: { type: integer, default: 100 }
 *     responses:
 *       200:
 *         description: Ranked list of sailors
 */
app.get('/sailors/top', async (req, res) => {
  const { pos, raceType, women, count } = req.query
  // if (!pos || !raceType || !womens) return res.json([])

  const rankQuery = `${women == 'true' ? 'w' : ''}${raceType === 'team' ? 't' : ''}${pos === 'skipper' ? 's' : 'c'}Rank`
  const ratingQuery = `${women == 'true' ? 'w' : ''}${raceType === 'team' ? 't' : ''}${pos === 'skipper' ? 's' : 'c'}r`

  try {
    const [rows] = await pool.query(
      `
      SELECT s.sailorID, s.name, s.year, st.teamID, s.${ratingQuery} AS rating, crossLinks, outLinks
      FROM Sailors s
      JOIN SailorTeams st ON s.sailorID = st.sailorID
      WHERE s.${rankQuery} != 0
      GROUP BY s.sailorID, s.${rankQuery}, s.year, st.teamID
      ORDER BY s.${rankQuery}
      LIMIT ?
    `,
      [Number(count) || 100],
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed' })
  }
})

/**
 * @openapi
 * /sailors/{id}:
 *   get:
 *     summary: Get a sailor's profile plus their fleet and team race history
 *     tags: [Sailors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Sailor data, fleetScores, and teamScores
 *       404:
 *         description: Sailor not found
 */
app.get('/sailors/:id', async (req, res) => {
  try {
    const startMembers = Date.now()
    const [rows] = await pool.query('SELECT * FROM Sailors WHERE sailorID = ?', [req.params.id])
    console.log(`Sailor query took ${Date.now() - startMembers}ms`)

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sailor not found' })
    }
    const startFleet = Date.now()
    const [fleetRows] = await pool.query('SELECT season, regatta, raceNumber, division, sa.sailorID, partnerID, partnerName, score, predicted, ratio, penalty, position, date, scoring, venue, boat, ratingType, oldRating, newRating, regAvg FROM Sailors sa JOIN FleetScores sc ON sa.sailorID = sc.sailorID WHERE sa.sailorID = ? ORDER BY date DESC, raceNumber DESC;', [req.params.id])
    console.log(`Fleet query took ${Date.now() - startFleet}ms`)

    const startTeam = Date.now()
    const [teamRows] = await pool.query('SELECT season, regatta, raceNumber, round, sa.sailorID, partnerID, partnerName, opponentTeam, opponentNick, score, outcome, predicted, penalty, position, date, venue, boat, ratingType, oldRating, newRating, regAvg FROM Sailors sa JOIN TRScores sc ON sa.sailorID = sc.sailorID WHERE sa.sailorID = ? ORDER BY date DESC, raceNumber DESC;', [req.params.id])

    console.log(`Team query took ${Date.now() - startTeam}ms`)

    const result = { data: rows[0], fleetScores: fleetRows, teamScores: teamRows }
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

/**
 * @openapi
 * /teams:
 *   get:
 *     summary: List all teams with aggregate ratings
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: Array of teams
 */
app.get('/teams', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT t.teamID as teamID, teamName, topFleetRating, topWomenRating, topTeamRating,
       topWomenTeamRating, avgRating, avgRatio, region,
           COUNT(DISTINCT st.sailorID) AS memberCount
    FROM Teams t JOIN SailorTeams st ON t.teamID = st.teamID
    GROUP BY teamID;`)
    // Not sure why I had this, it removes teams that haven't sailed in the target seasons but sometimes you want old teams
    // WHERE st.season IN (${targetSeasons})
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

/**
 * @openapi
 * /teams/{id}:
 *   get:
 *     summary: Get a team's members, ranking info, and recent regattas
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Team members, data, and regattas
 */
app.get('/teams/:id', async (req, res) => {
  try {
    const startMembers = Date.now()
    const [members] = await pool.query(
      `SELECT * FROM Sailors s JOIN SailorTeams st on s.sailorID = st.sailorID
      WHERE st.teamID = ?;`,
      [req.params.id],
    )
    // console.log(`Members query took ${Date.now() - startMembers}ms`)

    const startInfo = Date.now()
    const [info] = await pool.query(
      `SELECT *
        FROM (
            SELECT Teams.*,
                  CASE WHEN topFleetRating != 0 THEN RANK() OVER (ORDER BY topFleetRating DESC) END fr_rank,
                  CASE WHEN topTeamRating != 0 THEN RANK() OVER (ORDER BY topTeamRating DESC) END tr_rank,
                  CASE WHEN topWomenRating != 0 THEN RANK() OVER (ORDER BY topWomenRating DESC) END wfr_rank,
                  CASE WHEN topWomenTeamRating != 0 THEN RANK() OVER (ORDER BY topWomenTeamRating DESC) END wtr_rank,
                  CASE WHEN topFleetRating != 0 THEN RANK() OVER (PARTITION BY Region ORDER BY topFleetRating DESC) END fr_region_rank,
                  CASE WHEN topTeamRating != 0 THEN RANK() OVER (PARTITION BY Region ORDER BY topTeamRating DESC) END tr_region_rank,
                  CASE WHEN topWomenRating != 0 THEN RANK() OVER (PARTITION BY Region ORDER BY topWomenRating DESC) END wfr_region_rank,
                  CASE WHEN topWomenTeamRating != 0 THEN RANK() OVER (PARTITION BY Region ORDER BY topWomenTeamRating DESC) END wtr_region_rank
            FROM Teams
        ) RankedTeams
      WHERE teamID = ?;`,
      [req.params.id],
    )
    // console.log(`Info query took ${Date.now() - startInfo}ms`)
    // const regattas = []
    const startReg = Date.now()
    const [regattas] = await pool.query(
      `SELECT Distinct fs.regatta, fs.date, fs.season
      FROM FleetScores fs
      JOIN SailorTeams st ON fs.sailorID = st.sailorID
      WHERE st.teamID = ? AND fs.season IN (${targetSeasons.split(',')[1]}) AND st.season IN (${targetSeasons.split(',')[1]})
      ORDER BY fs.date DESC
      LIMIT 50;`,
      [req.params.id],
    )
    const [teamRegattas] = await pool.query(
      `SELECT Distinct ts.regatta, ts.date, ts.season
      FROM TRScores ts
      JOIN SailorTeams st ON ts.sailorID = st.sailorID
      WHERE st.teamID = ? AND ts.season IN (${targetSeasons.split(',')[1]}) AND st.season IN (${targetSeasons.split(',')[1]})
      ORDER BY ts.date DESC
      LIMIT 50;`,
      [req.params.id],
    )
    console.log(`Regattas query took ${Date.now() - startReg}ms`)
    res.json({ members: members, data: info[0], regattas: [...regattas, ...teamRegattas] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

/**
 * @openapi
 * /teams/{id}/sailors:
 *   get:
 *     summary: List a team's sailors with their ratings
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Array of sailors on the team
 */
app.get('/teams/:id/sailors', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
          s.sailorID, 
          ANY_VALUE(s.name) AS name, 
          ANY_VALUE(s.sr) AS sr, 
          ANY_VALUE(s.cr) AS cr, 
          ANY_VALUE(s.wsr) AS wsr, 
          ANY_VALUE(s.wcr) AS wcr,
          ANY_VALUE(st.rankType) AS rankType
      FROM Sailors s 
      JOIN SailorTeams st ON s.sailorID = st.sailorID
      WHERE st.teamID = ? AND st.season IN (${targetSeasons})
      GROUP BY s.sailorID;`,
      [req.params.id],
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

/**
 * @openapi
 * /sailors/teams/{id}:
 *   get:
 *     summary: List the distinct team IDs a sailor has been on
 *     tags: [Sailors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Array of teamID rows
 */
app.get('/sailors/teams/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT DISTINCT teamID FROM SailorTeams WHERE sailorID = ?;`, [req.params.id])
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

/**
 * @openapi
 * /users/follows/{id}:
 *   get:
 *     summary: List sailors a user follows
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: userID
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Array of follow rows
 */
app.get('/users/follows/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM SailorFollows WHERE userID = ?;`, [req.params.id])
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

/**
 * @openapi
 * /sailors/follows/{id}:
 *   get:
 *     summary: Get how many users follow a sailor
 *     tags: [Sailors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: sailorID
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: "{ count: number }"
 */
app.get('/sailors/follows/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT COUNT(*) as count FROM SailorFollows WHERE sailorID = ?;`, [req.params.id])
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

/**
 * @openapi
 * /sailors/rivals/{id}:
 *   get:
 *     summary: List a sailor's rivals
 *     tags: [Sailors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: sailorID
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Array of rival rows
 */
app.get('/sailors/rivals/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM SailorRivals WHERE sailorID = ?;`, [req.params.id])
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: userID
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User object (undefined if not found)
 */
app.get('/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM Users WHERE userID = ? AND deleted = FALSE;`, [req.params.id])
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

/**
 * @openapi
 * /users/feed/{id}:
 *   get:
 *     summary: Get a user's activity feed of followed sailors' recent races
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: userID
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Array of followed sailors, each with a recent races[] array
 */
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
      [req.params.id],
    )
    await Promise.all(
      rows.map(async (sailor) => {
        const [recentRaces] = await pool.query(
          `SELECT season, regatta, sailorID, date, score, predicted, ratingType, oldRating, newRating, position, raceNumber, division, ratio FROM FleetScores fs WHERE fs.sailorID = ? UNION ALL
          SELECT season, regatta, sailorID, date, score, predicted, ratingType, oldRating, newRating, position, raceNumber, raceNumber as x, raceNumber as y FROM TRScores ts WHERE ts.sailorID = ?
          ORDER BY date DESC
          LIMIT 5;`,
          [sailor.sailorID, sailor.sailorID],
        )
        sailor.races = recentRaces
        resJson.push(sailor)
      }),
    )
    res.json(resJson)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

/**
 * @openapi
 * /users/username/{id}:
 *   get:
 *     summary: Get a user by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: username
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User object, or [] if not found
 */
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

/**
 * @openapi
 * /homestats:
 *   get:
 *     summary: Get aggregate homepage stats
 *     tags: [Misc]
 *     responses:
 *       200:
 *         description: HomePageStats row
 */
app.get('/homestats', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM HomePageStats`)
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

/**
 * @openapi
 * /follow:
 *   post:
 *     summary: Follow a sailor
 *     tags: [Follows]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [targetID, userID]
 *             properties:
 *               targetID: { type: string }
 *               targetName: { type: string }
 *               userID: { type: string }
 *     responses:
 *       201:
 *         description: Follow created
 */
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
/**
 * @openapi
 * /follow:
 *   delete:
 *     summary: Unfollow a sailor
 *     tags: [Follows]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [targetID, userID]
 *             properties:
 *               targetID: { type: string }
 *               userID: { type: string }
 *     responses:
 *       201:
 *         description: Follow removed
 */
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

/**
 * @openapi
 * /link:
 *   put:
 *     summary: Link a user's account to a Techscore ID
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userID, techscoreID, techscoreLink]
 *             properties:
 *               userID: { type: string }
 *               techscoreID: { type: string }
 *               techscoreLink: { type: string }
 *     responses:
 *       200:
 *         description: Link updated
 *       400:
 *         description: Missing required fields
 */
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
      [techscoreLink, techscoreID, userID],
    )
  } catch (err) {
    console.err(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

/**
 * @openapi
 * /link:
 *   delete:
 *     summary: Remove a user's Techscore link
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userID, techscoreID, techscoreLink]
 *             properties:
 *               userID: { type: string }
 *               techscoreID: { type: string }
 *               techscoreLink: { type: string }
 *     responses:
 *       200:
 *         description: Link removed
 *       400:
 *         description: Missing required fields
 */
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
      [userID],
    )
  } catch (err) {
    console.err(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userID, username, photoURL, displayName]
 *             properties:
 *               userID: { type: string }
 *               username: { type: string }
 *               photoURL: { type: string }
 *               displayName: { type: string }
 *     responses:
 *       200:
 *         description: User created
 *       400:
 *         description: Missing required fields
 */
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

/**
 * @openapi
 * /users:
 *   delete:
 *     summary: Soft-delete a user
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userID]
 *             properties:
 *               userID: { type: string }
 *     responses:
 *       200:
 *         description: User marked deleted
 *       400:
 *         description: Missing userID
 */
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

/**
 * @openapi
 * /regattas:
 *   get:
 *     summary: Get skipper scores for a regatta
 *     tags: [Regattas]
 *     parameters:
 *       - in: query
 *         name: season
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: regatta
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: "{ scores: [] }"
 */
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
      [season, season, regatta],
    )

    res.json({ scores: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

/**
 * @openapi
 * /regattas/race:
 *   get:
 *     summary: Get scores for a single race within a regatta
 *     tags: [Regattas]
 *     parameters:
 *       - in: query
 *         name: season
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: regatta
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: raceNum
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: division
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: position
 *         required: true
 *         schema: { type: string, enum: [Skipper, Crew] }
 *     responses:
 *       200:
 *         description: "{ scores: [] }"
 */
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
      [season, season, regatta, raceNum, division, position],
    )

    res.json({ scores: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

/**
 * @openapi
 * /compare/regattas:
 *   get:
 *     summary: Find regattas where two groups of sailors both competed
 *     tags: [Compare]
 *     parameters:
 *       - in: query
 *         name: selectedMembers
 *         schema: { type: string }
 *         description: Comma-separated sailorIDs (group A)
 *       - in: query
 *         name: selectedOpponents
 *         schema: { type: string }
 *         description: Comma-separated sailorIDs (group B)
 *     responses:
 *       200:
 *         description: "{ fleet: [], team: [] }"
 */
app.get('/compare/regattas', async (req, res) => {
  const { selectedMembers, selectedOpponents } = req.query
  try {
    const [fleetRegattas] = await pool.query(
      `SELECT fs.regatta
        FROM FleetScores fs
        JOIN SailorTeams st ON fs.sailorID = st.sailorID
        WHERE fs.season IN (?)
          AND fs.regAvg > 0
        GROUP BY fs.regatta
        HAVING
          COUNT(CASE WHEN fs.sailorID IN (?) THEN 1 END) > 0
          AND
          COUNT(CASE WHEN fs.sailorID IN (?) THEN 1 END) > 0;`,
      [['f25', 's26'], selectedMembers?.split(','), selectedOpponents?.split(',')],
    )

    const [teamRegattas] = await pool.query(
      `SELECT ts.regatta
        FROM TRScores ts
        JOIN SailorTeams st ON ts.sailorID = st.sailorID
        WHERE ts.season IN (?)
          AND ts.regAvg > 0
        GROUP BY ts.regatta
        HAVING
          COUNT(CASE WHEN ts.sailorID IN (?) THEN 1 END) > 0
          AND
          COUNT(CASE WHEN ts.sailorID IN (?) THEN 1 END) > 0;`,
      [['f25', 's26'], selectedMembers?.split(','), selectedOpponents?.split(',')],
    )

    res.json({ fleet: fleetRegattas, team: teamRegattas })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})
/**
 * @openapi
 * /compare/stats:
 *   get:
 *     summary: Head-to-head fleet and team stats between two groups of sailors
 *     tags: [Compare]
 *     parameters:
 *       - in: query
 *         name: team1
 *         schema: { type: string }
 *       - in: query
 *         name: team2
 *         schema: { type: string }
 *       - in: query
 *         name: selectedMembers
 *         schema: { type: string }
 *         description: Comma-separated sailorIDs (group A)
 *       - in: query
 *         name: selectedOpponents
 *         schema: { type: string }
 *         description: Comma-separated sailorIDs (group B)
 *       - in: query
 *         name: selectedFleetRegattas
 *         schema: { type: string }
 *       - in: query
 *         name: selectedTeamRegattas
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Combined fleet and team head-to-head stats
 */
app.get('/compare/stats', async (req, res) => {
  const { team1, team2, selectedMembers, selectedOpponents, selectedFleetRegattas, selectedTeamRegattas } = req.query
  try {
    const [fleetStats] = await pool.query(
      `WITH FleetRaceScores AS (
          SELECT
              CASE
                  WHEN fs.sailorID IN (?) THEN 'Group A'
                  WHEN fs.sailorID IN (?) THEN 'Group B'
              END AS groupName,
              st.teamID,
              fs.regatta,
              fs.raceNumber,
              fs.division,
              AVG(fs.score) AS team_avg_score
          FROM FleetScores fs
          JOIN SailorTeams st ON fs.sailorID = st.sailorID
          WHERE fs.regatta IN (?)
            AND (fs.sailorID IN (?) OR fs.sailorID IN (?))
          GROUP BY groupName, st.teamID, fs.regatta, fs.raceNumber, fs.division
      )
      SELECT
          t1.groupName AS side_a,
          t2.groupName AS side_b,
          COUNT(*) AS head_to_head_races,
          AVG(t1.team_avg_score - t2.team_avg_score) AS avg_score_diff,
          SUM(CASE WHEN t1.team_avg_score < t2.team_avg_score THEN 1 ELSE 0 END) AS wins_for_a,
          SUM(CASE WHEN t2.team_avg_score < t1.team_avg_score THEN 1 ELSE 0 END) AS wins_for_b
      FROM FleetRaceScores t1
      JOIN FleetRaceScores t2 ON t1.regatta = t2.regatta
          AND t1.raceNumber = t2.raceNumber
          AND t1.division = t2.division
      WHERE t1.groupName = 'Group A'
        AND t2.groupName = 'Group B'
      GROUP BY t1.groupName, t2.groupName;`,
      [selectedMembers.split(','), selectedOpponents?.split(','), selectedFleetRegattas?.split(','), selectedMembers.split(','), selectedOpponents?.split(',')],
    )
    const [teamStats] = await pool.query(
      `SELECT
          st.teamID,
          ts.opponentTeam,
          COUNT(DISTINCT CONCAT(ts.regatta, '-', ts.raceNumber)) AS races,
          COUNT(DISTINCT CASE WHEN ts.outcome = 'win'
              THEN CONCAT(ts.regatta, '-', ts.raceNumber)
          END) AS wins
      FROM TRScores ts
      JOIN SailorTeams st ON ts.sailorID = st.sailorID
      WHERE st.teamID = ? AND ts.opponentTeam = ? AND ts.regatta IN (?) AND (ts.sailorID IN (?) OR ts.sailorID IN (?))
      GROUP BY st.teamID, ts.opponentTeam
      ORDER BY wins DESC;`,
      [team1, team2, selectedTeamRegattas?.split(','), selectedMembers.split(','), selectedOpponents?.split(',')],
    )

    res.json({ ...fleetStats[0], ...teamStats[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query failed', dueTo: err.sql, why: err.sqlMessage })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

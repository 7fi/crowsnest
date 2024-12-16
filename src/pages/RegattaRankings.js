import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getRegattaElos } from '../lib/firebase'
import EloLineChart from '../components/EloLineChart'
import PosNegBarChart from '../components/PosNegBarChart'

export default function RegattaRankings() {
  const { season, regattaName, raceNum, pos } = useParams()
  const [sailors, setSailors] = useState([])
  const [raceIDs, setRaceIDs] = useState([])
  const [activeTab, setActiveTab] = useState('')
  const [position, setPosition] = useState('Skipper')
  const [divisions, setDivs] = useState(['A', 'B'])

  useEffect(() => {
    getRegattaElos(`${season}/${regattaName}`).then((sailors) => {
      setSailors(sailors?.data?.sailors)
      setRaceIDs(sailors?.data?.raceIDs)
      setActiveTab(sailors?.data?.raceIDs[0].split('/')[2])
      raceIDs.forEach((id) => {
        if (id.slice(-1) == 'C') {
          setDivs(['A', 'B', 'C'])
          console.log(divisions)
        }
      })

      if (raceNum) {
        setActiveTab(raceNum)
      }
      if (pos) {
        if (pos.toLowerCase() == 'skipper') {
          setPosition('Skipper')
        } else if (pos.toLowerCase() == 'crew') {
          setPosition('Crew')
        }
      }
    })
  }, [season, regattaName])

  const RaceBreakdown = ({ raceID, sailors, pos }) => {
    const filteredPeople = sailors.filter((person) => person.races.some((race) => race.raceID === raceID) && person.Position == pos)

    // Step 1: Sort filtered people based on the score of their matching race
    const sortedPeople = filteredPeople
      .map((sailor) => {
        // Find the matching race for the current raceID
        const matchingRace = sailor.races.find((race) => race.raceID === raceID)
        return {
          name: sailor.Name,
          position: sailor.Position,
          team: sailor.Teams[sailor.Teams.length - 1],
          score: matchingRace.score,
          predicted: matchingRace.predicted,
          curRating: matchingRace.newRating - matchingRace.change,
          change: matchingRace.change,
        }
      })
      .sort((a, b) => a.score - b.score) // Sort by score in descending order

    // Step 2: Generate race elements based on the sorted list
    const raceElements = sortedPeople.map((sailor, index) => (
      <Link to={`/crowsnest/rankings/${sailor.position.toLowerCase()}/${sailor.name}`} key={index}>
        <div className='contentBox raceEntryAligned'>
          <span>{sailor.name}</span>
          <span>{sailor.team}</span> <span className='secondaryText'>{sailor.curRating.toFixed(0)} </span>
          <span style={{ color: sailor.score < sailor.predicted ? 'green' : sailor.score > sailor.predicted ? 'red' : '' }}>
            {sailor.score}
            {sailor.score == 1 ? 'st' : sailor.score == 2 ? 'nd' : sailor.score == 3 ? 'rd' : 'th'}
          </span>
          <span>
            {sailor.predicted}
            {sailor.predicted == 1 ? 'st' : sailor.predicted == 2 ? 'nd' : sailor.predicted == 3 ? 'rd' : 'th'}
          </span>
          <span style={{ color: sailor.change > 0 ? 'green' : 'red', float: 'right' }}>
            {sailor.change > 0 ? '+' : ''}
            {sailor.change.toFixed(0)}
          </span>
        </div>
      </Link>
    ))

    return (
      <div>
        <div className='raceEntryAligned contentBox' style={{ position: 'sticky', fontWeight: 'bold' }}>
          <span>Name</span>
          <span>Team</span>
          <span>Rating</span>
          <span>Score</span>
          <span>Predicted</span>
          <span>Rating Change</span>
        </div>
        <div className='raceElementBox'>{raceElements}</div>
      </div>
    )
  }

  const AllScores = ({ division, sailors, pos }) => {
    const filteredPeople = sailors.filter((person) => person.races.some((race) => race.raceID.slice(-1) == division) && person.Position == pos)

    const summed = filteredPeople.map((person) => {
      const filteredRaces = person.races.filter((race) => race.raceID.endsWith(division))

      // Sum up the score and ratingChange for each filtered race
      const totals = filteredRaces.reduce(
        (acc, race) => {
          acc.totalScore += race.score
          acc.totalRatingChange += parseFloat(race.change)
          return acc
        },
        { totalScore: 0, totalRatingChange: 0 }
      )

      return {
        name: person.Name,
        position: person.Position,
        team: person.Teams[person.Teams.length - 1],
        races: filteredRaces,
        newRating: filteredRaces[filteredRaces.length - 1].newRating,
        totalScore: totals.totalScore,
        totalRatingChange: totals.totalRatingChange,
      }
    })
    console.log(summed)

    const colors = ['#ffc658', '#82ca9d', '#8884d8', '#ff8042', '#8dd1e1']

    return (
      <div>
        <div className='raceEntryAlignedFull contentBox' style={{ position: 'sticky', fontWeight: 'bold' }}>
          <span>Name</span>
          <span>Team</span>
          <span>New Rating</span>
          <span>Total Rating Change</span>
        </div>
        <div className='raceElementBox'>
          {summed
            .sort((a, b) => b.totalRatingChange - a.totalRatingChange)
            .map((person, index) => (
              <Link to={`/crowsnest/rankings/${person.position.toLowerCase()}/${person.name}`} key={index}>
                <div className='raceEntryAlignedFull contentBox'>
                  <span>{person.name}</span> <span>{person.team}</span>
                  <span>{person.newRating.toFixed(0)}</span>
                  <span style={{ color: person.totalRatingChange > 0 ? 'green' : 'red' }}>
                    {person.totalRatingChange > 0 ? '+' : ''}
                    {person.totalRatingChange.toFixed(0)}
                  </span>
                  <div style={{ gridColumnStart: 1, gridColumnEnd: 5 }}>
                    <PosNegBarChart data={person.races} dataKey={'change'} showLabels={false} color={colors[Math.floor(Math.random() * colors.length)]} pos={position} />
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    )
  }

  const TabList = () => {
    const handleTabClick = (tabName) => {
      setActiveTab(tabName)
    }
    return (
      <div className='flexRowContainer contentBox'>
        <Link to={`/crowsnest/rankings/regatta/${season}/${regattaName}/${activeTab}/${'Skipper'}`}>
          <button onClick={() => setPosition('Skipper')}>Skippers</button>
        </Link>
        <Link to={`/crowsnest/rankings/regatta/${season}/${regattaName}/${activeTab}/${'Crew'}`}>
          <button onClick={() => setPosition('Crew')}>Crews</button>
        </Link>
        {divisions.map((div) => (
          <Link to={`/crowsnest/rankings/regatta/${season}/${regattaName}/${activeTab.slice(0, -1) + div}/${position}`}>
            <button onClick={() => setActiveTab(activeTab.replace(/.$/, div))}>{div}</button>
          </Link>
        ))}
        {[...new Set(raceIDs.map((id) => id.split('/')[2].slice(0, -1)))].map((id, index) => (
          <Link key={index} to={`/crowsnest/rankings/regatta/${season}/${regattaName}/${id + activeTab.charAt(activeTab.length - 1)}/${position}`}>
            <button style={{ flexGrow: 1, textAlign: 'center' }} onClick={() => handleTabClick(id + activeTab.charAt(activeTab.length - 1))}>
              {id}
            </button>
          </Link>
        ))}
        <Link to={`/crowsnest/rankings/regatta/${season}/${regattaName}/${'All' + activeTab.charAt(activeTab.length - 1)}/${position}`}>
          <button onClick={() => setActiveTab('All' + activeTab.slice(-1))}>All</button>
        </Link>
      </div>
    )
  }

  const TabComponent = ({ raceIDs, pos }) => {
    return (
      <>
        <div className='contentBox' style={{ bottom: 5, top: 75, left: 5, right: 5, overflow: 'hidden', position: 'absolute' }}>
          <div>
            {raceIDs.map((id) => {
              // Render content only for the active tab
              if (activeTab === id.split('/')[2]) {
                return (
                  <div key={id}>
                    <a target='1' href={`https://scores.collegesailing.org/${season}/${regattaName}/full-scores`}>
                      <h2 style={{ textTransform: 'capitalize' }}>
                        {id.split('/')[1].split('-').join(' ')} Race: {id.split('/')[2]} ({pos}s)
                      </h2>
                    </a>
                    <TabList />
                    <RaceBreakdown raceID={id} sailors={sailors} pos={pos} />
                  </div>
                )
              }
              return null // No content for non-active tabs
            })}
            {activeTab.startsWith('All') ? (
              <div>
                <a target='1' href={`https://scores.collegesailing.org/${season}/${regattaName}/full-scores`}>
                  <h2>
                    {' '}
                    All Scores for {position}s in {activeTab.slice(-1)}{' '}
                  </h2>
                </a>
                <TabList />
                <AllScores sailors={sailors} division={activeTab.slice(-1)} pos={position} />
              </div>
            ) : null}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <TabComponent raceIDs={raceIDs} pos={position} />
    </>
  )
}

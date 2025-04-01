import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllTeams, getTop100 } from '../lib/firebase'
import useTeamCodes from '../lib/teamCodes'
import RatingNum from '../components/RatingNum'
import { TbDiamondsFilled } from 'react-icons/tb'
import { useMobileDetect } from '../lib/hooks'
// import heroImg from '/hero.jpeg'

export default function RankingsHome() {
  const [teams, setTeams] = useState([])
  const [topOpenSkippers, setTopOpenSkippers] = useState([])
  const [topWomenSkippers, setTopWomenSkippers] = useState([])
  const isMobile = useMobileDetect()

  const teamCodes = useTeamCodes()

  useEffect(() => {
    getAllTeams().then((teams) => {
      // console.log(teams.data.teams)
      setTeams(teams.data.teams)
    })
    getTop100('open', 'Skipper').then((sailors) => {
      setTopOpenSkippers(sailors.data.sailors)
    })
    getTop100('women', 'Skipper').then((sailors) => {
      setTopWomenSkippers(sailors.data.sailors)
    })
  }, [])

  const nav = useNavigate()

  return (
    <div>
      {/* <img src='https://carteranderson.dev/images/Deep1.png' className='heroImg' /> */}
      {/* <img src='./hero.jpeg' className='heroImg' /> */}
      <div className='heroContainer' style={{ backgroundImage: `url(/hero.jpeg)` }}>
        <div className='heroBlock'>
          <h1 className='heroTitle'>CrowsNest</h1>
          <h2 className='heroSubtitle'>Home of College Sailing Statistics</h2>
          <span style={{ color: '#eee' }}>15,309 Sailors | 823,650 Scores | 207 Teams</span>
          <Link style={{ color: '#eee' }} to={'/rankings/team'}>
            Last Score Update: 03-30-2025
          </Link>
          {/* <span className='heroExclaim'>Team Racing Coming Soon!</span> */}
          <Link className='heroExclaim' to={'/rankings/team'}>
            Team Racing!
          </Link>
        </div>
      </div>
      <div className='fullContentBox'>
        <div className='responsiveRowCol'>
          <div className='flexGrowChild contentBox' style={{ minHeight: 'fit-content' }}>
            <h2 style={{ margin: 10 }} onClick={() => nav(`/rankings/team`)} className='clickable'>
              Top Open Team Racing Teams
            </h2>
            <table className='raceByRaceTable'>
              <tbody>
                {teams
                  .sort((a, b) => {
                    return b.topRatingTR - a.topRatingTR
                  })
                  .slice(0, 10)
                  .map((team, index) => (
                    <tr key={index} className='clickable' onClick={() => nav(`/rankings/team/${team.name}`)}>
                      <td className='tableColFit' style={{ textAlign: 'right' }}>
                        {index + 1}
                      </td>
                      <td className='tableColFit'>
                        <img style={{ display: 'inline', maxHeight: '3rem', minHeight: 10, minWidth: '3rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[team.name]}.png`} />
                      </td>
                      <td>{team.name}</td>
                      <td className='tableColFit'>
                        <RatingNum ratingNum={team.topRatingTR} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className='flexGrowChild contentBox' style={{ minHeight: 'fit-content' }}>
            <h2 style={{ margin: 10 }} onClick={() => nav(`/rankings/team`)} className='clickable'>
              Top Women's Team Racing Teams
            </h2>
            <table className='raceByRaceTable'>
              <tbody>
                {teams
                  .sort((a, b) => {
                    return b.topWomenRatingTR - a.topWomenRatingTR
                  })
                  .slice(0, 10)
                  .map((team, index) => (
                    <tr key={index} className='clickable' onClick={() => nav(`/rankings/team/${team.name}`)}>
                      <td className='tableColFit' style={{ textAlign: 'right' }}>
                        {index + 1}
                      </td>
                      <td className='tableColFit'>
                        <img style={{ display: 'inline', maxHeight: '3rem', minHeight: 10, minWidth: '3rem' }} src={`https://scores.collegesailing.org/inc/img/schools/${teamCodes[team.name]}.png`} />
                      </td>
                      <td>{team.name}</td>
                      <td className='tableColFit'>
                        <RatingNum ratingNum={team.topWomenRatingTR} type='women' />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className='flexRowContainer ' style={{ width: '100%' }}>
          <button
            className='buttonBG flexGrowChild'
            onClick={() => {
              nav('/rankings/skipper')
            }}>
            Top Open Fleet Skippers
          </button>
          <button
            className='buttonBG flexGrowChild'
            onClick={() => {
              nav('/rankings/crew')
            }}>
            Top Open Fleet Crews
          </button>

          <button
            className='buttonBG flexGrowChild'
            onClick={() => {
              nav('/rankings/skipper/women')
            }}>
            Top Women's Fleet Skippers
          </button>

          <button
            className='buttonBG flexGrowChild'
            onClick={() => {
              nav('/rankings/crew/women')
            }}>
            Top Women's Fleet Crews
          </button>
        </div>
        {/* <div className='flexRowContainer ' style={{ width: '100%' }}>
          <button
            className='buttonBG flexGrowChild'
            onClick={() => {
              nav('/rankings/trskipper')
            }}>
            Top Open TR Skippers
          </button>
          <button
            className='buttonBG flexGrowChild'
            onClick={() => {
              nav('/rankings/trcrew')
            }}>
            Top Open TR Crews
          </button>

          <button
            className='buttonBG flexGrowChild'
            onClick={() => {
              nav('/rankings/trskipper/women')
            }}>
            Top Women's TR Skippers
          </button>

          <button
            className='buttonBG flexGrowChild'
            onClick={() => {
              nav('/rankings/trcrew/women')
            }}>
            Top Women's TR Crews
          </button>
        </div> */}
        <div className='flexRowContainer' style={{ flexBasis: 0 }}>
          <a className='flexGrowChild contentBox' href='https://discord.gg/RxVhg2aUQE'>
            Join or Discord for frequent updates and to ask questions!
          </a>
          <a className='flexGrowChild contentBox' href='https://instagram.com/crowsnest.club/'>
            Follow our Instagram!
          </a>
        </div>
        <div className='flexRowContainer'>
          {isMobile ? <></> : <img src='accent.png' style={{ maxWidth: '30%', borderRadius: 'var(--radius)', margin: '0.5rem' }} />}
          <div style={{ display: 'flex', flexDirection: 'column' }} className='flexGrowChild'>
            {/* <div className='contentBox flexGrowChild'>We are updating the site almost daily so make sure to check back frequently!</div> */}
            <div className='contentBox flexGrowChild'>
              Team racing is now released! There may still be bugs/errors so please report those{' '}
              <a style={{ textDecoration: 'underline' }} href='https://docs.google.com/forms/d/e/1FAIpQLSfTz5XO-7UM5vloq1Rs9Aly5IGqNvNJN1p7mXq-O1NzoVg6-Q/viewform?usp=header'>
                here
              </a>
              . The team racing features are also not fully finished, so bear with me as I fix bugs and add more features.
              <br />
              <br /> I am currently working on rewriting the backend for crowsnest, so the major website updates will slow down for a little bit. The scores will still be updated at least weekly (if not more often) so keep checking in! If you are interested in helping please reach on our{' '}
              <a style={{ textDecoration: 'underline' }} href='https://discord.gg/RxVhg2aUQE'>
                discord
              </a>
              !
            </div>
            <div className='contentBox flexGrowChild'>
              Data from 2016 onwards has been scraped from techscore and processed to assign each individual sailor a rating value. These ratings change based on performance in regattas, and the strength of the opponents.
              <br />
              <br />
              Keep in mind that all data is scraped straight from <a href='https://scores.collegesailing.org'>scores.collegesailing.org</a> so any inaccuracies in that data will be reflected here (such as inaccuate RP forms).
            </div>
            <div className='contentBox flexGrowChild'>
              {' '}
              Here are some common terms to remember:
              <ul>
                <li>
                  <TbDiamondsFilled className='' style={{ color: 'var(--women)' }} /> This symbol indicates a women's rating.
                </li>
                <li>
                  <strong>Rating:</strong> This is a number that changes based on performance each race. This system was originally invented for chess, but has been used in many other systems where it is necessary to rate individual participants (such as video games or tennis). The algorithm used is not the original ELO formula, it is based on the PlackettLuce model from Openskill.
                </li>
                <li>
                  <strong>Percentage:</strong> This is the percentage of the fleet that was beat in each race. If you placed last, you get 0%. If you place first, you get 100%.
                </li>
                <li>
                  <strong>Score:</strong> This is the finishing place in the fleet. First place is a score of 1. Tenth is a score of 10.
                </li>
              </ul>
            </div>
            <div className='contentBox flexGrowChild'>
              For more info check out our{' '}
              <Link to={'/about'} style={{ textDecoration: 'underline' }}>
                about page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

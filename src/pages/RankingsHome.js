import { Link } from 'react-router-dom'

export default function RankingsHome() {
  return (
    <div>
      <div className='contentBox' style={{ marginTop: 80 }}>
        Welcome to the custom rankings function of crowsnest. Check out these pages as a starting point:
        <div style={{ display: 'flex', gap: '0.5rem', margin: '0.8rem' }}>
          <Link to={`/crowsnest/rankings/team/`}>
            <button>All teams</button>
          </Link>
          <Link to={`/crowsnest/rankings/skipper/`}>
            <button>Top Skippers</button>
          </Link>
          <Link to={`/crowsnest/rankings/crew/`}>
            <button>Top Crews</button>
          </Link>
        </div>
        Data from 2020 onwards has been scraped from techscore and processed to assign each individual sailor a rating value. These ratings change based on regatta performance, and factors such as regatta difficulty, and opponent strength.
        <br />
        <br />
        <span style={{ color: '#777' }}>For those wondering, crowsnest is an unfinished project of mine, that this feature will eventually be an integrated part of.</span>
      </div>
    </div>
  )
}

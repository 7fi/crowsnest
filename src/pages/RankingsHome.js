import { Link } from 'react-router-dom'

export default function RankingsHome() {
  return (
    <div>
      <img src='https://carteranderson.dev/images/Deep1.png' className='heroImg' />
      <div className='heroBlock'>
        <h1 className='heroTitle'>CrowsNest</h1>
        <h2 className='heroSubtitle'>Home of College Sailing Statistics</h2>
        <span style={{ color: '#aaa' }}>15,020 Sailors | 788,908 Scores | 207 Teams</span>
        <span className='heroExclaim'>Women's Coming Soon!</span>
      </div>

      <div className='fullContentBox'>
        Welcome to the custom rankings function of crowsnest. Check out these pages as a starting point:
        <div style={{ display: 'flex', gap: '0.5rem', margin: '0.8rem' }}>
          <Link to={`/rankings/team/`}>
            <button>All teams</button>
          </Link>
          <Link to={`/rankings/skipper/`}>
            <button>Top Skippers</button>
          </Link>
          <Link to={`/rankings/crew/`}>
            <button>Top Crews</button>
          </Link>
        </div>
        Data from 2016 onwards has been scraped from techscore and processed to assign each individual sailor a rating value. These ratings change based on regatta performance, and factors such as regatta difficulty, and opponent strength.
        <br />
        <br />
        Here are some common terms to remember:
        <ul>
          <li>
            <strong>Rating (ELO):</strong> This is a number that changes based on performance each race. This system was originally invented for chess, but has been used in many other systems where it is necessary to rate individual participants (such as video games or tennis)
          </li>
          <li>
            <strong>Percentage (ratio):</strong> This is the percentage of the fleet that was beat in each race. If you placed last, you get 0%. If you place first, you should get 100% Sometimes the ratio will be displayed as a decimal value (such as .521) which is the same number divided by 100
          </li>
          <li>
            <strong>Score:</strong> This is the finishing place in the fleet. First place is a score of 1. Tenth is a score of 10.
          </li>
        </ul>
        <span style={{ color: '#777' }}>
          For those wondering, crowsnest is an unfinished project of mine, that this feature will eventually be an integrated part of. For more info, check out the{' '}
          <a href='https://github.com/7fi/crowsnest' style={{ textDecoration: 'underline' }}>
            GitHub
          </a>
          .
        </span>
      </div>
    </div>
  )
}

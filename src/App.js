import Navbar from './components/Navbar'
//eslint-disable-next-line
import { app } from './lib/firebase'
import { Route, Routes, useLocation } from 'react-router'
import { useUserData } from './lib/hooks'
import { UserContext } from './lib/context'
import { Toaster } from 'react-hot-toast'
import { checkTheme } from './lib/hooks'
import Home from './pages/Home'
import Enter from './pages/Enter'
import Profile from './pages/Profile'
import Team from './pages/Team'
import CreateTeam from './pages/CreateTeam'
import NotFound from './pages/NotFound'
import Teams from './pages/Teams'
import Pairs from './pages/Pairs'
import Scores from './pages/Scores'
import Event from './pages/Event'
import Events from './pages/Events'
import CreateEvent from './pages/CreateEvent'
import TestDrag from './pages/TestDrag'
import Rankings from './pages/Rankings'
import TeamRankings from './pages/TeamRankings'
import EloTeams from './pages/EloTeams'
import GlobalRankings from './pages/GlobalRankings'
import RankingsHome from './pages/RankingsHome'
import { useEffect } from 'react'
import VersusRanking from './pages/VersusRanking'
import EloSearch from './pages/EloSearch'
import ScrollToTop from './components/ScrollToTop'
import ScrollButton from './components/ScrollToTop'
import Claim from './pages/Claim'
import Footer from './components/Footer'
import About from './pages/About'
import PostHogPageviewTracker from './lib/PostHogPageviewTracker'
import posthog from 'posthog-js'
import Feed from './pages/Feed'
import Simulator from './pages/Simulator'
import SSTeams from './pages/SSTeams'
import History from './pages/History'
import RegattaRace from './pages/RegattaRace'

export default function App() {
  const userData = useUserData()
  const { pathname } = useLocation()

  checkTheme()

  // const isProduction = process.env.NODE_ENV === 'production'
  const isProduction = false // Force render
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    if (userData?.user?.uid) {
      posthog.identify(userData.user.uid, { name: userData.userVals.username })
    }
  }, [pathname])

  return (
    <>
      <UserContext.Provider value={userData}>
        {!isProduction ? (
          <>
            <Navbar />

            <PostHogPageviewTracker />
            <Routes>
              <Route path='/' element={<RankingsHome />} />
              <Route path='/about' element={<About />} />
              <Route path='/enter' element={<Enter />} />
              <Route path='/profile/:profileName' element={<Profile />} />
              {/* <Route path="/profile" element={<Navigate to={`/profile/${userData.username}`} />} /> */}
              {/* <Route path='/teams/:teamName' element={<Team />} /> */}
              {/* <Route path='/teams/:teamName/events' element={<Events />} /> */}
              {/* <Route path='/teams' element={<Teams />} /> */}
              {/* <Route path='/event/create' element={<CreateEvent />} />
              <Route path='/event/:eventID' element={<Event />} />
              <Route path='/createteam' element={<CreateTeam />} />
              <Route path='/teams/:teamName/pairs' element={<Pairs />} /> */}
              {/* <Route path='/scores' element={<Scores />} /> */}
              {/* Rankings */}
              <Route path='/rankings/' element={<RankingsHome />} />
              <Route path='/rankings/claim' element={<Claim />} />
              <Route path='/rankings/skipper' element={<GlobalRankings pos={'Skipper'} type={'open'} raceType={'fleet'} />} />
              <Route path='/rankings/crew' element={<GlobalRankings pos='Crew' type={'open'} raceType={'fleet'} />} />
              <Route path='/rankings/skipper/women' element={<GlobalRankings pos={'Skipper'} type={'women'} raceType={'fleet'} />} />
              <Route path='/rankings/crew/women' element={<GlobalRankings pos='Crew' type={'women'} raceType={'fleet'} />} />
              <Route path='/rankings/trskipper' element={<GlobalRankings pos={'Skipper'} type={'open'} raceType={'team'} />} />
              <Route path='/rankings/trcrew' element={<GlobalRankings pos='Crew' type={'open'} raceType={'team'} />} />
              <Route path='/rankings/trskipper/women' element={<GlobalRankings pos={'Skipper'} type={'women'} raceType={'team'} />} />
              <Route path='/rankings/trcrew/women' element={<GlobalRankings pos='Crew' type={'women'} raceType={'team'} />} />
              <Route path='/sailors/:key' element={<Rankings />} />
              <Route path='/sailors' element={<EloSearch />} />
              {/* <Route path='/rankings/:sailorAName/vs/:sailorBName' element={<VersusRanking />} /> */}
              <Route path='/teams' element={<EloTeams />} />
              <Route path='/teams/:teamName' element={<TeamRankings />} />
              <Route path='/regattas/:season/:regattaName' element={<RegattaRace />} />
              <Route path='/regattas/:season/:regattaName/:raceNum' element={<RegattaRace />} />
              {/* <Route path='/regattas/:season/:regattaName/:raceNum/:pos' element={<RegattaRankings />} /> */}
              {/* <Route path='/rankings/simulator' element={<Simulator />} />
              <Route path='/rankings/screenshot' element={<SSTeams />} />
              <Route path='/rankings/history' element={<History />} /> */}
              <Route path='/feed' element={<Feed />} />
              <Route path='/drag' element={<TestDrag />} />
              <Route path='/:text' element={<NotFound />} />
            </Routes>
            {pathname != '/teams' && pathname != '/sailors' ? <Footer /> : <></>}
            <Toaster position='top-center' reverseOrder={false} />
            <ScrollButton />
            {/* <div onClick={() => window.scrollTo(0, 0)} style={{ position: 'sticky', bottom: -20, right: 0, visibility: window.scrollX > 20 ? 'visible' : 'visible' }}>
              top
            </div> */}
          </>
        ) : (
          // <span>Crowsnest is under construction... </span>
          // <span>Crowsnest is experiencing technical difficulties... We will be back soon!</span>
          <span>Crowsnest is updating... We will be back soon!</span>
        )}
      </UserContext.Provider>
    </>
  )
}

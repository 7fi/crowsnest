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
import RegattaRankings from './pages/RegattaRankings'
import RankingsHome from './pages/RankingsHome'
import { useEffect } from 'react'
import VersusRanking from './pages/VersusRanking'
import EloSearch from './pages/EloSearch'
import ScrollToTop from './components/ScrollToTop'
import ScrollButton from './components/ScrollToTop'

export default function App() {
  const userData = useUserData()
  checkTheme()

  // const isProduction = process.env.NODE_ENV === 'production'
  const isProduction = false // Force render

  function ScrollToTop() {
    const { pathname } = useLocation()

    useEffect(() => {
      window.scrollTo(0, 0)
    }, [pathname])

    return null
  }

  return (
    <>
      <UserContext.Provider value={userData}>
        {!isProduction ? (
          <>
            <ScrollToTop />
            <Navbar />
            <Routes>
              <Route path="/" element={<RankingsHome />} />
              <Route path="/enter" element={<Enter />} />
              <Route path="/profile/:profileName" element={<Profile />} />
              {/* <Route path="/profile" element={<Navigate to={`/profile/${userData.username}`} />} /> */}
              <Route path="/team/:teamName" element={<Team />} />
              <Route path="/team/:teamName/events" element={<Events />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/event/create" element={<CreateEvent />} />
              <Route path="/event/:eventID" element={<Event />} />
              <Route path="/createteam" element={<CreateTeam />} />
              <Route path="/team/:teamName/pairs" element={<Pairs />} />
              <Route path="/scores" element={<Scores />} />
              {/* Rankings */}
              <Route path="/rankings/" element={<RankingsHome />} />
              <Route path="/rankings/skipper" element={<GlobalRankings pos={'Skipper'} type={'open'} />} />
              <Route path="/rankings/crew" element={<GlobalRankings pos="Crew" type={'open'} />} />
              <Route path="/rankings/skipper/women" element={<GlobalRankings pos={'Skipper'} type={'women'} />} />
              <Route path="/rankings/crew/women" element={<GlobalRankings pos="Crew" type={'women'} />} />
              <Route path="/rankings/:key" element={<Rankings />} />
              <Route path="/rankings/search" element={<EloSearch />} />
              <Route path="/rankings/:sailorAName/vs/:sailorBName" element={<VersusRanking />} />
              <Route path="/rankings/team" element={<EloTeams />} />
              <Route path="/rankings/team/:teamName" element={<TeamRankings />} />
              <Route path="/rankings/regatta/:season/:regattaName" element={<RegattaRankings />} />
              <Route path="/rankings/regatta/:season/:regattaName/:raceNum" element={<RegattaRankings />} />
              <Route path="/rankings/regatta/:season/:regattaName/:raceNum/:pos" element={<RegattaRankings />} />
              <Route path="/drag" element={<TestDrag />} />
              <Route path="/:text" element={<NotFound />} />
            </Routes>
            <Toaster position="top-center" reverseOrder={false} />
            <ScrollButton />
            {/* <div onClick={() => window.scrollTo(0, 0)} style={{ position: 'sticky', bottom: -20, right: 0, visibility: window.scrollX > 20 ? 'visible' : 'visible' }}>
              top
            </div> */}
          </>
        ) : (
          <span>Crowsnest is under construction... </span>
        )}
      </UserContext.Provider>
    </>
  )
}

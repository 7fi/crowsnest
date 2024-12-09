import Navbar from './components/Navbar'
//eslint-disable-next-line
import { app } from './lib/firebase'
import { Route, Routes } from 'react-router'
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

export default function App() {
  const userData = useUserData()
  checkTheme()

  return (
    <>
      <UserContext.Provider value={userData}>
        <Navbar />
        <Routes>
          <Route path='/crowsnest/' element={<Home />} />
          <Route path='/crowsnest/enter' element={<Enter />} />
          <Route path='/crowsnest/profile/:profileName' element={<Profile />} />
          {/* <Route path="/crowsnest/profile" element={<Navigate to={`/crowsnest/profile/${userData.username}`} />} /> */}
          <Route path='/crowsnest/team/:teamName' element={<Team />} />
          <Route path='/crowsnest/team/:teamName/events' element={<Events />} />
          <Route path='/crowsnest/teams' element={<Teams />} />
          <Route path='/crowsnest/event/create' element={<CreateEvent />} />
          <Route path='/crowsnest/event/:eventID' element={<Event />} />
          <Route path='/crowsnest/createteam' element={<CreateTeam />} />
          <Route path='/crowsnest/team/:teamName/pairs' element={<Pairs />} />
          <Route path='/crowsnest/scores' element={<Scores />} />
          <Route path='/crowsnest/rankings/' element={<RankingsHome />} />
          <Route path='/crowsnest/rankings/:position' element={<GlobalRankings />} />
          <Route path='/crowsnest/rankings/:position/:sailor' element={<Rankings />} />
          <Route path='/crowsnest/rankings/team' element={<EloTeams />} />
          <Route path='/crowsnest/rankings/team/:teamName' element={<TeamRankings />} />
          <Route path='/crowsnest/rankings/regatta/:regattaName' element={<RegattaRankings />} />
          <Route path='/crowsnest/drag' element={<TestDrag />} />
          <Route path='/crowsnest/:text' element={<NotFound />} />
        </Routes>
        <Toaster position='top-center' reverseOrder={false} />
      </UserContext.Provider>
    </>
  )
}

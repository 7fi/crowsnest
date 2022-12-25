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
          <Route path='/crowsnest/teams' element={<Teams />} />
          <Route path='/crowsnest/createteam' element={<CreateTeam />} />
          <Route path='/crowsnest/:text' element={<NotFound />} />
        </Routes>
        <Toaster position='top-center' reverseOrder={false} />
      </UserContext.Provider>
    </>
  )
}

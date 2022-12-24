import Navbar from './components/Navbar'
//eslint-disable-next-line
import { app } from './lib/firebase'
import { Route, Routes } from 'react-router'
import Home from './pages/Home'
import Enter from './pages/Enter'
import Profile from './pages/Profile'
import Team from './pages/Team'
import CreateTeam from './pages/CreateTeam'
import NotFound from './pages/CreateTeam'
import { useUserData } from './lib/hooks'
import { UserContext } from './lib/context'
import { Toaster } from 'react-hot-toast'
import { checkTheme } from './lib/hooks'

export default function App() {
    const userData = useUserData()
    checkTheme()

    return (
        <>
            <UserContext.Provider value={userData}>
                <Navbar />
                <Routes>
                    <Route path="/crowsnest/" element={<Home />} />
                    <Route path="/crowsnest/enter" element={<Enter />} />
                    <Route path="/crowsnest/profile/:username" element={<Profile />} />
                    <Route path="/crowsnest/team/:teamName" element={<Team />} />
                    <Route path="/crowsnest/createteam" element={<CreateTeam />} />
                    <Route path="/crowsnest/:text" element={<NotFound />} />
                </Routes>
                <Toaster />
            </UserContext.Provider>
        </>
    )
}

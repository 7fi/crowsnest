import Navbar from './components/Navbar'
//eslint-disable-next-line
import { app } from './lib/firebase'
import { Route, Routes } from 'react-router'
import Home from './pages/Home'
import Enter from './pages/Enter'
import Profile from './pages/Profile'
import Team from './pages/Team'
import CreateTeam from './pages/CreateTeam'
import { useUserData } from './lib/hooks'
import { UserContext } from './lib/context'

export default function App() {
    const userData = useUserData()

    return (
        <>
            <UserContext.Provider value={userData}>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/enter" element={<Enter />} />
                    <Route path="/profile/:username" element={<Profile />} />
                    <Route path="/team/:teamName" element={<Team />} />
                    <Route path="/createteam" element={<CreateTeam />} />
                </Routes>
            </UserContext.Provider>
        </>
    )
}

import AuthCheck from '../components/AuthCheck'
import { getTeamWithName } from '../lib/firebase'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { UserContext } from '../lib/context'
import { useContext } from 'react'

export default function Team() {
    const { user } = useContext(UserContext)
    const [team, setTeam] = useState({})
    const { teamName } = useParams()

    useEffect(() => {
        getTeamWithName(teamName).then((tempTeam) => setTeam(tempTeam))
    }, [])

    return (
        <main>
            <AuthCheck>
                {/* <img src={team?.photoURL} alt="Profile Image" referrerPolicy="no-referrer" /> */}
                <h1>{team?.teamName}</h1>
                <h3>Members:</h3>
                <ul>
                    {team?.memberNames?.map((name) => (
                        <li key={team?.members[team?.memberNames.indexOf(name)]}>{name}</li>
                    ))}
                </ul>
                {team?.owner == user?.uid && <TeamControls />}
            </AuthCheck>
        </main>
    )
}

function TeamControls() {
    return (
        <>
            <button>Add member</button>
            <button>Delete team</button>
        </>
    )
}

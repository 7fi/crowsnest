import AuthCheck from '../components/AuthCheck'
import { getTeamWithName } from '../lib/firebase'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { UserContext } from '../lib/context'
import { useContext } from 'react'

import { Firestore, updateDoc, doc, getFirestore, getDoc } from 'firebase/firestore'

export default function Team() {
    const { user } = useContext(UserContext)
    const [team, setTeam] = useState({})
    const [teamID, setTeamID] = useState('')
    const { teamName } = useParams()

    useEffect(() => {
        getTeamWithName(teamName).then((tempTeam) => {
            setTeam(tempTeam.data)
            setTeamID(tempTeam.id)
        })
    }, [])

    // console.log(teamID)

    return (
        <main>
            <AuthCheck>
                {/* <img src={team?.photoURL} alt="Profile Image" referrerPolicy="no-referrer" /> */}
                {Object.keys(team).length > 0 ? (
                    <>
                        <div className="contentBox">
                            <span className="text-title text-titlecase">{team?.teamName}</span>
                        </div>
                        <div className="contentBox">
                            <h3>Members:</h3>
                            <ul>
                                {team?.memberNames?.map((name) => (
                                    <li key={team?.members[team?.memberNames.indexOf(name)]}>{name}</li>
                                ))}
                            </ul>
                        </div>
                        {team?.owner == user?.uid && <TeamControls team={team} teamID={teamID} />}
                    </>
                ) : (
                    <h1>Team not found!</h1>
                )}
            </AuthCheck>
        </main>
    )
}

function TeamControls({ team, teamID }) {
    console.log(teamID)
    return (
        <div className="contentBox">
            <ul>
                {team?.requests?.map((request) => {
                    console.log(request)
                    return (
                        <li className="request" key={0}>
                            <button className="text-sucess" onClick={() => acceptRequest(request, teamID)}>
                                Accept
                            </button>
                            <button className="text-danger" onClick={() => denyRequest(request, teamID)}>
                                Deny
                            </button>
                        </li>
                    )
                })}
            </ul>

            {/* <button>Add member</button> */}
            <button className="text-danger">Delete team</button>
        </div>
    )
}

async function acceptRequest(request, teamID) {
    console.log(teamID)
    const db = getFirestore()
    let d = doc(db, `teams/${teamID}`)
    let docSnap = await getDoc(d)
    console.log(docSnap.data())
}
function denyRequest(request, team) {
    console.log(request)
}

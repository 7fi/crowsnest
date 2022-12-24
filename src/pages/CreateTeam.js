import { useContext, useState, useCallback, useEffect } from 'react'
import { getDoc, getFirestore, doc, writeBatch, collection } from 'firebase/firestore'
import debounce from 'lodash.debounce'
import AuthCheck from '../components/AuthCheck'
import { UserContext } from '../lib/context'
import { useNavigate } from 'react-router'

export default function Enter() {
    return (
        <main>
            <AuthCheck>
                <TeamNameForm />
            </AuthCheck>
        </main>
    )
}

function TeamNameForm() {
    const { user, displayname } = useContext(UserContext)
    const [teamnameValue, setTeamnameValue] = useState('')
    const [teamHomeValue, setTeamHomeValue] = useState('')
    const [isValid, setIsValid] = useState(false)
    const [loading, setLoading] = useState(false)

    const db = getFirestore()
    const navigate = useNavigate()

    const onChangeTeamname = (e) => {
        const val = e.target.value.toLowerCase()
        const re = /^(?=[a-zA-Z0-9._]{3,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/

        // Only set form value if length is < 3 OR it passes regex
        if (val.length < 3) {
            setTeamnameValue(val)
            setLoading(false)
            setIsValid(false)
        }

        if (re.test(val)) {
            setTeamnameValue(val)
            setLoading(true)
            setIsValid(false)
        }
    }
    const onChangeTeamHome = (e) => {
        const val = e.target.value

        if (val.length > 3 && val.length < 35) {
            setTeamHomeValue(val)
        } else {
            setTeamHomeValue(val)
        }
    }

    const checkTeamname = useCallback(
        debounce(async (teamname) => {
            if (teamname.length >= 3) {
                let docRef = doc(db, 'teamnames', teamname)
                const docSnap = await getDoc(docRef)
                console.log('Read executed!', docSnap.exists())
                setIsValid(!docSnap.exists())
                setLoading(false)
            }
        }, 500),
        []
    )

    useEffect(() => {
        checkTeamname(teamnameValue)
    }, [teamnameValue])

    const onSubmit = async (e) => {
        e.preventDefault()

        const teamDoc = doc(collection(db, 'teams'))
        const teamnameDoc = doc(db, 'teamnames', teamnameValue)

        const batch = writeBatch(db)

        batch.set(teamDoc, { teamName: teamnameValue, owner: user?.uid, members: [user?.uid], memberNames: [displayname] })
        batch.set(teamnameDoc, { id: teamDoc.id })

        await batch.commit()
        navigate(`/crowsnest/team/${teamnameValue}`)
    }

    return (
        <>
            <section>
                <h3>Create Team:</h3>
                <form onSubmit={onSubmit}>
                    <input name="Team Name" placeholder="Unique Team Name" value={teamnameValue} onChange={onChangeTeamname}></input>
                    <input name="Team Home" placeholder="Team Home City" value={teamHomeValue} onChange={onChangeTeamHome}></input>
                    <UsernameMessage teamname={teamnameValue} isValid={isValid} loading={loading} />
                    <button type="submit" className="btn-green" disabled={!isValid}>
                        Choose
                    </button>

                    {/* <h3>Debug State</h3>
                    <div>
                        Teamname: {teamnameValue}
                        <br />
                        Loading: {loading.toString()}
                        <br />
                        Valid Name: {isValid.toString()}
                    </div> */}
                </form>
            </section>
        </>
    )
}

function UsernameMessage({ teamname, isValid, loading }) {
    if (loading) {
        return <p>Checking...</p>
    } else if (isValid) {
        return <p className="text-success">{teamname} is available!</p>
    } else if (teamname.length < 3 && teamname.length > 0) {
        return <p className="text-danger">That teamname is too short!</p>
    } else if (teamname && !isValid) {
        return <p className="text-danger">That teamname is taken!</p>
    } else {
        return <p></p>
    }
}

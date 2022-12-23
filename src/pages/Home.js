import AuthCheck from '../components/AuthCheck'
export default function Home() {
    return (
        <main>
            <h1>Home</h1>
            <AuthCheck>
                <h1>Authenticated</h1>
            </AuthCheck>
        </main>
    )
}

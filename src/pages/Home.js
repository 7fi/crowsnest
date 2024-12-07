import { Link } from 'react-router-dom'
import AuthCheck from '../components/AuthCheck'
export default function Home() {
  return (
    <main>
      <h1>Welcome!</h1>
      <Link to={'/crowsnest/rankings/team'}>Rankings!</Link>
    </main>
  )
}

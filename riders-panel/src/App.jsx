import { useApp } from './AppContext'
import Splash from './pages/Splash'
import Auth from './pages/Auth'
import Home from './pages/Home'
import OnTrip from './pages/OnTrip'
import TripSummary from './pages/TripSummary'
import Earnings from './pages/Earnings'
import Profile from './pages/Profile'
import RideRequest from './pages/RideRequest'
import Toast from './components/Toast'
import Sidebar from './components/Sidebar'

const SIDEBAR_SCREENS = ['home', 'earnings', 'profile']

export default function App() {
  const { currentScreen, pendingRequest } = useApp()

  const screens = {
    splash: <Splash />,
    auth: <Auth />,
    home: <Home />,
    on_trip: <OnTrip />,
    trip_summary: <TripSummary />,
    earnings: <Earnings />,
    profile: <Profile />,
  }

  const hasSidebar = SIDEBAR_SCREENS.includes(currentScreen)

  return (
    <div className="bg-[#0D0D0D] min-h-screen font-body">
      {hasSidebar && <Sidebar />}
      <div className={hasSidebar ? 'pl-56' : ''}>
        <div className="screen-enter" key={currentScreen}>
          {screens[currentScreen] || <Splash />}
        </div>
      </div>
      {pendingRequest && currentScreen === 'home' && <RideRequest />}
      <Toast />
    </div>
  )
}

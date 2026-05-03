import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { connectSocket, disconnectSocket, getSocket } from './services/socket'

const AppContext = createContext(null)

const MOCK_RIDER = {
  _id: 'r001',
  name: 'Arjun Sharma',
  phone: '+91 98765 43210',
  email: 'arjun@example.com',
  rating: 4.8,
  total_rides: 342,
  acceptance_rate: 94,
  member_since: '2023-01-15',
  on_duty: false,
  vehicle_details: {
    vehicle_no: 'MH 12 AB 3456',
    vehicle_rc_no: 'RC2345678',
    puc_certificate_no: 'PUC987654',
    puc_validity: '2025-12-31',
    category: 'Bike',
  },
  bank_details: {
    bank_name: 'HDFC Bank',
    account_no: '50100123456789',
    ifsc_code: 'HDFC0001234',
  },
  driving_liscence_no: 'MH1220230012345',
  adhaar_card_no: '1234 5678 9012',
  pan_card_no: 'ABCDE1234F',
}

const MOCK_EARNINGS = {
  today: 847,
  rides_today: 6,
  online_hours: 5.5,
  week: [320, 540, 720, 480, 890, 1020, 847],
  month: 18420,
  breakdown: { cash: 45, upi: 40, wallet: 15 },
}

const MOCK_RIDE_HISTORY = [
  { id: 'rd1', time: '10:32 AM', pickup: 'Andheri West', drop: 'Bandra Kurla', fare: 142, status: 'Completed', payment: 'UPI' },
  { id: 'rd2', time: '09:15 AM', pickup: 'Malad East', drop: 'Goregaon West', fare: 98, status: 'Completed', payment: 'Cash' },
  { id: 'rd3', time: '08:04 AM', pickup: 'Borivali Station', drop: 'Kandivali East', fare: 75, status: 'Cancelled', payment: 'Wallet' },
  { id: 'rd4', time: '07:22 AM', pickup: 'Dahisar Toll', drop: 'Mira Road', fare: 123, status: 'Completed', payment: 'UPI' },
  { id: 'rd5', time: '06:50 AM', pickup: 'Vasai Road', drop: 'Naigaon', fare: 88, status: 'Completed', payment: 'Cash' },
  { id: 'rd6', time: '06:10 AM', pickup: 'Nalasopara', drop: 'Virar', fare: 65, status: 'Completed', payment: 'Cash' },
]

const MOCK_PENDING_REQUEST = {
  id: 'req_demo',
  passenger: { name: 'Priya Mehta', phone: '+91 91234 56789' },
  pickup: '14, Carter Road, Bandra West',
  drop: 'Phoenix Palladium, Lower Parel',
  distance: '11.2 km',
  duration: '28 min',
  fare: 187,
  vehicle_type: 'Bike',
}

export function AppProvider({ children }) {
  const savedRider = (() => {
    try { return JSON.parse(localStorage.getItem('rider_data')) } catch { return null }
  })()
  const savedToken = localStorage.getItem('rider_token')

  const [currentScreen, setCurrentScreen] = useState(savedRider ? 'home' : 'splash')
  const [rider, setRider] = useState(savedRider || null)
  const [token, setToken] = useState(savedToken || null)
  const [onDuty, setOnDuty] = useState(false)
  const [activeRide, setActiveRide] = useState(null)
  const [pendingRequest, setPendingRequest] = useState(null)
  const [ridePhase, setRidePhase] = useState('OnTheWay')
  const [earningsData] = useState(MOCK_EARNINGS)
  const [rideHistory] = useState(MOCK_RIDE_HISTORY)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pendingChatUser, setPendingChatUser] = useState(null)

  const navigate = useCallback((screen) => setCurrentScreen(screen), [])

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const login = useCallback((riderData, authToken) => {
    const data = riderData || MOCK_RIDER
    setRider(data)
    setToken(authToken || 'mock_token')
    localStorage.setItem('rider_data', JSON.stringify(data))
    localStorage.setItem('rider_token', authToken || 'mock_token')
    navigate('home')
  }, [navigate])

  const logout = useCallback(() => {
    disconnectSocket()
    setRider(null)
    setToken(null)
    setOnDuty(false)
    setActiveRide(null)
    setPendingRequest(null)
    localStorage.removeItem('rider_data')
    localStorage.removeItem('rider_token')
    navigate('splash')
  }, [navigate])

  const toggleDuty = useCallback(() => {
    setOnDuty(prev => {
      const next = !prev
      if (next) showToast('You are now ON DUTY', 'success')
      else showToast('You are now OFF DUTY', 'info')
      return next
    })
  }, [showToast])

  const acceptRide = useCallback(() => {
    if (!pendingRequest) return
    const socket = getSocket()
    if (socket) socket.emit('ride:accepted', { rideId: pendingRequest.id })
    setActiveRide(pendingRequest)
    setRidePhase('OnTheWay')
    setPendingRequest(null)
    navigate('on_trip')
  }, [pendingRequest, navigate])

  const rejectRide = useCallback(() => {
    if (!pendingRequest) return
    const socket = getSocket()
    if (socket) socket.emit('ride:rejected', { rideId: pendingRequest.id })
    setPendingRequest(null)
    showToast('Ride rejected', 'info')
  }, [pendingRequest, showToast])

  const advancePhase = useCallback(() => {
    const socket = getSocket()
    if (ridePhase === 'OnTheWay') {
      if (socket) socket.emit('ride:arrived', { rideId: activeRide?.id })
      setRidePhase('Arrived')
      showToast('Passenger notified — you have arrived', 'success')
    } else if (ridePhase === 'Arrived') {
      if (socket) socket.emit('ride:started', { rideId: activeRide?.id })
      setRidePhase('Started')
      showToast('Ride started!', 'success')
    } else if (ridePhase === 'Started') {
      if (socket) socket.emit('ride:completed', { rideId: activeRide?.id })
      navigate('trip_summary')
    }
  }, [ridePhase, activeRide, showToast, navigate])

  const completeTrip = useCallback(() => {
    setActiveRide(null)
    setRidePhase('OnTheWay')
    navigate('home')
  }, [navigate])

  // Demo: trigger a mock ride request after 8s when on duty
  useEffect(() => {
    if (!onDuty) return
    const t = setTimeout(() => {
      setPendingRequest(MOCK_PENDING_REQUEST)
    }, 8000)
    return () => clearTimeout(t)
  }, [onDuty])

  // Socket setup after login
  useEffect(() => {
    if (!token) return
    const socket = connectSocket(token)

    socket.on('connect', () => {
      const riderData = (() => {
        try { return JSON.parse(localStorage.getItem('rider_data')) } catch { return null }
      })()
      if (riderData?._id) {
        socket.emit('authenticate', { user_id: riderData._id, device_info: 'riders-panel' })
      }
    })

    socket.on('ride:requested', (data) => setPendingRequest(data))
    return () => {
      socket.off('connect')
      socket.off('ride:requested')
    }
  }, [token])

  const value = {
    currentScreen, navigate,
    rider, token, login, logout,
    onDuty, toggleDuty,
    activeRide, ridePhase, advancePhase, completeTrip,
    pendingRequest, setPendingRequest, acceptRide, rejectRide,
    earningsData, rideHistory,
    toast, showToast,
    loading, setLoading,
    pendingChatUser, setPendingChatUser,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

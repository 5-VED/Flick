import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

const MOCK_CAPTAIN = {
  id: 'cap_001',
  name: 'Ravi Kumar',
  initials: 'RK',
  rating: 4.8,
  totalRides: 2847,
  vehicleNumber: 'KA 05 AB 1234',
  vehicleModel: 'Honda Activa 6G',
  vehicleColor: 'Pearl Silver',
  phone: '+91 98765 43210',
  eta: 4,
};

const MOCK_RIDE_HISTORY = [
  {
    id: 'r1',
    date: '26 Apr 2026',
    time: '10:30 AM',
    from: 'Koramangala 5th Block',
    to: 'Phoenix MarketCity',
    distance: '5.2 km',
    duration: '18 min',
    fare: 89,
    status: 'completed',
    type: 'bike',
  },
  {
    id: 'r2',
    date: '25 Apr 2026',
    time: '08:15 AM',
    from: 'HSR Layout',
    to: 'Electronic City Phase 1',
    distance: '8.7 km',
    duration: '32 min',
    fare: 134,
    status: 'completed',
    type: 'bike',
  },
  {
    id: 'r3',
    date: '24 Apr 2026',
    time: '07:45 PM',
    from: 'Indiranagar 100ft Road',
    to: 'Koramangala 1st Block',
    distance: '4.1 km',
    duration: '22 min',
    fare: 72,
    status: 'completed',
    type: 'auto',
  },
  {
    id: 'r4',
    date: '23 Apr 2026',
    time: '09:00 AM',
    from: 'Whitefield ITPL',
    to: 'Marathahalli Bridge',
    distance: '6.3 km',
    duration: '28 min',
    fare: 98,
    status: 'cancelled',
    type: 'bike',
  },
  {
    id: 'r5',
    date: '22 Apr 2026',
    time: '06:30 PM',
    from: 'MG Road Metro',
    to: 'Jayanagar 4th Block',
    distance: '7.8 km',
    duration: '35 min',
    fare: 118,
    status: 'completed',
    type: 'cab',
  },
];

const MOCK_SUGGESTIONS = [
  { id: 's1', icon: '🏢', name: 'Electronic City', subtitle: 'Phase 1, Bengaluru', distance: '8.7 km' },
  { id: 's2', icon: '🛍️', name: 'Phoenix MarketCity', subtitle: 'Whitefield, Bengaluru', distance: '14.2 km' },
  { id: 's3', icon: '🏥', name: 'Manipal Hospital', subtitle: 'HAL Airport Road, Bengaluru', distance: '6.1 km' },
  { id: 's4', icon: '🚇', name: 'Silk Board Junction', subtitle: 'Hosur Road, Bengaluru', distance: '3.4 km' },
];

const MOCK_NEARBY = [
  { id: 'n1', name: 'Cubbon Park', subtitle: 'Park, Bengaluru', distance: '2.1 km', icon: '🌳' },
  { id: 'n2', name: 'Indiranagar', subtitle: 'Bengaluru', distance: '4.5 km', icon: '🏙️' },
];

export function AppProvider({ children }) {
  const [screen, setScreen] = useState('splash');
  const [prevScreen, setPrevScreen] = useState(null);
  const [user, setUser] = useState(null);
  const [pickup, setPickup] = useState('Koramangala 5th Block, Bengaluru');
  const [destination, setDestination] = useState('');
  const [selectedRide, setSelectedRide] = useState(null);
  const [captain, setCaptain] = useState(null);
  const [rideData, setRideData] = useState(null);
  const [walletBalance] = useState(250);

  const navigate = useCallback((screenName) => {
    setPrevScreen(screen);
    setScreen(screenName);
  }, [screen]);

  const startRide = useCallback((rideType) => {
    setSelectedRide(rideType);
    navigate('finding');
    setTimeout(() => {
      setCaptain(MOCK_CAPTAIN);
      navigate('tracking');
    }, 4000);
  }, [navigate]);

  const completeRide = useCallback(() => {
    const duration = Math.floor(Math.random() * 15) + 12;
    const dist = (Math.random() * 4 + 3).toFixed(1);
    setRideData({
      from: pickup,
      to: destination,
      distance: `${dist} km`,
      duration: `${duration} min`,
      fare: selectedRide?.price || 89,
      fareBreakdown: {
        baseFare: 30,
        distanceFare: Math.floor((selectedRide?.price || 89) * 0.55),
        platformFee: 5,
        gst: Math.floor((selectedRide?.price || 89) * 0.05),
      },
      captain: MOCK_CAPTAIN,
    });
    navigate('summary');
  }, [pickup, destination, selectedRide, navigate]);

  const resetRide = useCallback(() => {
    setDestination('');
    setSelectedRide(null);
    setCaptain(null);
    setRideData(null);
    navigate('home');
  }, [navigate]);

  return (
    <AppContext.Provider value={{
      screen, navigate, prevScreen,
      user, setUser,
      pickup, setPickup,
      destination, setDestination,
      selectedRide, setSelectedRide,
      captain, setCaptain,
      rideData, setRideData,
      walletBalance,
      startRide, completeRide, resetRide,
      MOCK_CAPTAIN,
      MOCK_RIDE_HISTORY,
      MOCK_SUGGESTIONS,
      MOCK_NEARBY,
    }}>
      {children}
    </AppContext.Provider>
  );
}

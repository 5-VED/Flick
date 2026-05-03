import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { ridesService } from '../services/rides.service';

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

const MOCK_RIDE_HISTORY = [
  { id: 'r1', date: '26 Apr 2026', time: '10:30 AM', from: 'Koramangala 5th Block', to: 'Phoenix MarketCity', distance: '5.2 km', duration: '18 min', fare: 89, status: 'completed', type: 'bike' },
  { id: 'r2', date: '25 Apr 2026', time: '08:15 AM', from: 'HSR Layout', to: 'Electronic City Phase 1', distance: '8.7 km', duration: '32 min', fare: 134, status: 'completed', type: 'bike' },
  { id: 'r3', date: '24 Apr 2026', time: '07:45 PM', from: 'Indiranagar 100ft Road', to: 'Koramangala 1st Block', distance: '4.1 km', duration: '22 min', fare: 72, status: 'completed', type: 'auto' },
  { id: 'r4', date: '23 Apr 2026', time: '09:00 AM', from: 'Whitefield ITPL', to: 'Marathahalli Bridge', distance: '6.3 km', duration: '28 min', fare: 98, status: 'cancelled', type: 'bike' },
  { id: 'r5', date: '22 Apr 2026', time: '06:30 PM', from: 'MG Road Metro', to: 'Jayanagar 4th Block', distance: '7.8 km', duration: '35 min', fare: 118, status: 'completed', type: 'cab' },
];

export function AppProvider({ children }) {
  const [screen, setScreen] = useState('splash');
  const [prevScreen, setPrevScreen] = useState(null);
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [pickup, setPickup] = useState('Koramangala 5th Block, Bengaluru');
  const [destination, setDestination] = useState('');
  const [selectedRide, setSelectedRide] = useState(null);
  const [captain, setCaptain] = useState(null);
  const [rideData, setRideData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(250);
  const [rideHistory, setRideHistory] = useState(MOCK_RIDE_HISTORY);
  const [activeRideId, setActiveRideId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [pendingChatUser, setPendingChatUser] = useState(null);

  useEffect(() => {
    // Auto-navigate based on stored session
    if (authService.getToken() && user) {
      setScreen('home');
    }
  }, []);

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const navigate = useCallback((screenName) => {
    setPrevScreen(screen);
    setScreen(screenName);
  }, [screen]);

  const login = useCallback((userData, token) => {
    setUser(userData);
    navigate('home');
  }, [navigate]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setPickup('');
    setDestination('');
    setSelectedRide(null);
    setCaptain(null);
    setRideData(null);
    setActiveRideId(null);
    navigate('auth');
  }, [navigate]);

  const loadRideHistory = useCallback(async () => {
    try {
      const result = await ridesService.getRideHistory();
      if (result.success && result.data.length > 0) {
        const mapped = result.data.map(r => ({
          id: r._id,
          date: new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          time: new Date(r.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          from: r.pickup_location,
          to: r.drop_location,
          distance: r.trip_distance || '—',
          duration: r.trip_duration || '—',
          fare: r.fare || 0,
          status: r.status?.toLowerCase() || 'completed',
          type: (r.vehicle_type || 'Bike').toLowerCase(),
        }));
        setRideHistory(mapped);
      }
    } catch {
      // Keep mock data on API failure
    }
  }, []);

  const startRide = useCallback(async (rideType) => {
    setSelectedRide(rideType);
    navigate('finding');

    try {
      const result = await ridesService.bookRide({
        pickup_location: pickup,
        drop_location: destination,
        vehicle_type: rideType?.type || 'Bike',
        fare: rideType?.price || 89,
        fare_breakdown: {
          base_fare: 30,
          distance_fare: Math.floor((rideType?.price || 89) * 0.55),
          platform_fee: 5,
          gst: Math.floor((rideType?.price || 89) * 0.05),
        },
      });
      if (result.success) setActiveRideId(result.data._id);
    } catch {
      // Continue with mock flow even if API fails
    }

    setTimeout(() => {
      setCaptain(MOCK_CAPTAIN);
      navigate('tracking');
    }, 4000);
  }, [pickup, destination, navigate]);

  const completeRide = useCallback(async () => {
    const duration = Math.floor(Math.random() * 15) + 12;
    const dist = (Math.random() * 4 + 3).toFixed(1);

    if (activeRideId) {
      try {
        await ridesService.updateStatus(activeRideId, 'Completed', {
          trip_distance: `${dist} km`,
          trip_duration: `${duration} min`,
        });
      } catch {}
    }

    setRideData({
      id: activeRideId,
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
  }, [pickup, destination, selectedRide, activeRideId, navigate]);

  const submitRating = useCallback(async (rating, review, tip, paymentMethod) => {
    if (activeRideId) {
      try {
        await ridesService.rateRide(activeRideId, rating, review, tip, paymentMethod);
      } catch {}
    }
    setActiveRideId(null);
    loadRideHistory();
  }, [activeRideId, loadRideHistory]);

  const resetRide = useCallback(() => {
    setDestination('');
    setSelectedRide(null);
    setCaptain(null);
    setRideData(null);
    setActiveRideId(null);
    navigate('home');
  }, [navigate]);

  return (
    <AppContext.Provider value={{
      screen, navigate, prevScreen,
      user, setUser, login, logout,
      pickup, setPickup,
      destination, setDestination,
      selectedRide, setSelectedRide,
      captain, setCaptain,
      rideData, setRideData,
      walletBalance, setWalletBalance,
      rideHistory, loadRideHistory,
      activeRideId,
      loading, setLoading,
      toast, showToast,
      pendingChatUser, setPendingChatUser,
      startRide, completeRide, submitRating, resetRide,
      MOCK_CAPTAIN,
      MOCK_SUGGESTIONS,
      MOCK_NEARBY,
    }}>
      {children}
    </AppContext.Provider>
  );
}

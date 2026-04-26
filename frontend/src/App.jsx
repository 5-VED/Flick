import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Splash from './pages/Splash';
import Auth from './pages/Auth';
import Home from './pages/Home';
import BookingFlow from './pages/BookingFlow';
import FindingCaptain from './pages/FindingCaptain';
import LiveTracking from './pages/LiveTracking';
import RideSummary from './pages/RideSummary';
import RideHistory from './pages/RideHistory';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';
import MapView from './components/MapView';
import './index.css';

const BOTTOM_NAV_SCREENS = new Set(['home', 'history', 'profile']);

const MAP_SCREEN_CONFIGS = {
  home: { showBikes: true },
  booking: { showRoute: true, showDestination: true },
  finding: { showBikes: true, _dimmed: true },
  tracking: { showRoute: true, showDestination: true, showCaptain: true, captainMoving: true },
};

const FlickLogoLg = () => (
  <svg width="80" height="80" viewBox="0 0 72 72" fill="none">
    <rect width="72" height="72" rx="20" fill="#FFD700" />
    <path d="M42 12L24 36H36L30 60L50 32H38L42 12Z" fill="#1A1A1A" strokeLinejoin="round" />
  </svg>
);

function DesktopRightPanel({ screen }) {
  const config = MAP_SCREEN_CONFIGS[screen];

  if (config) {
    const { _dimmed, ...mapProps } = config;
    return (
      <div className="flex-1 relative h-full">
        <MapView {...mapProps} />
        {_dimmed && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'rgba(26,26,26,0.65)' }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 relative h-full overflow-hidden">
      <MapView />
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-8"
        style={{ background: 'rgba(8, 8, 8, 0.83)' }}
      >
        <div
          className="rounded-[24px] p-1"
          style={{ boxShadow: '0 0 80px rgba(255,215,0,0.35), 0 0 160px rgba(255,215,0,0.1)' }}
        >
          <FlickLogoLg />
        </div>

        <div className="flex flex-col items-center gap-3">
          <h1
            className="leading-none tracking-wider text-white"
            style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(72px, 8vw, 108px)' }}
          >
            FLICK
          </h1>
          <p className="text-[#555] tracking-[0.28em] uppercase text-sm font-medium">
            Zip Through The City
          </p>
        </div>

        <div className="flex items-center gap-12">
          {[
            { val: '10K+', label: 'Daily Rides' },
            { val: '500+', label: 'Captains' },
            { val: '4.9★', label: 'Rating' },
          ].map(({ val, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <span
                className="font-bold text-[#FFD700]"
                style={{ fontFamily: 'Bebas Neue', fontSize: '2.6rem', letterSpacing: '0.05em' }}
              >
                {val}
              </span>
              <span className="text-[#444] text-xs uppercase tracking-[0.2em]">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center max-w-sm">
          {['⚡ Fast Rides', '🛡️ Safe & Verified', '💰 Best Fares', '🌆 City-wide'].map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold text-[#555] px-4 py-2 rounded-full"
              style={{ background: 'rgba(28,28,28,0.9)', border: '1px solid #2A2A2A' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppShell() {
  const { screen } = useApp();

  return (
    <div className="app-shell lg:flex lg:flex-row">
      {/* Left content panel — full viewport on mobile, 440 px sidebar on desktop */}
      <div
        className="relative bg-[#1A1A1A] overflow-hidden w-full lg:w-[440px] lg:flex-shrink-0 lg:border-r lg:border-[#252525]"
        style={{ height: '100dvh' }}
      >
        {screen === 'splash'   && <Splash key="splash" />}
        {screen === 'auth'     && <Auth key="auth" />}
        {screen === 'home'     && <Home key="home" />}
        {screen === 'booking'  && <BookingFlow key="booking" />}
        {screen === 'finding'  && <FindingCaptain key="finding" />}
        {screen === 'tracking' && <LiveTracking key="tracking" />}
        {screen === 'summary'  && <RideSummary key="summary" />}
        {screen === 'history'  && <RideHistory key="history" />}
        {screen === 'profile'  && <Profile key="profile" />}

        {BOTTOM_NAV_SCREENS.has(screen) && <BottomNav />}
      </div>

      {/* Right panel — desktop only */}
      <div className="hidden lg:flex lg:flex-1" style={{ height: '100dvh' }}>
        <DesktopRightPanel screen={screen} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

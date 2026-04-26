import React, { useEffect, useState } from 'react';

const BikeIcon = ({ x, y, size = 18, color = '#FFD700', animate = false }) => (
  <g transform={`translate(${x - size / 2}, ${y - size / 2})`} className={animate ? 'bike-float' : ''}>
    <rect width={size} height={size} rx={size / 4} fill="#1A1A1A" opacity="0.85" />
    <text
      x={size / 2}
      y={size / 2 + 4}
      textAnchor="middle"
      fontSize={size * 0.65}
      fill={color}
    >
      🏍
    </text>
  </g>
);

const LocationPin = ({ x, y }) => (
  <g>
    <circle cx={x} cy={y} r={20} fill="#FFD700" opacity={0.06} className="location-ring" />
    <circle cx={x} cy={y} r={14} fill="#FFD700" opacity={0.12} />
    <circle cx={x} cy={y} r={9} fill="#FFD700" opacity={0.3} />
    <circle cx={x} cy={y} r={6} fill="#FFD700" />
    <circle cx={x} cy={y} r={2.5} fill="white" />
  </g>
);

const DestinationPin = ({ x, y }) => (
  <g>
    <circle cx={x} cy={y} r={8} fill="#22C55E" />
    <circle cx={x} cy={y} r={3} fill="white" />
    <line x1={x} y1={y + 8} x2={x} y2={y + 18} stroke="#22C55E" strokeWidth={2} />
    <circle cx={x} cy={y + 20} r={2} fill="#22C55E" />
  </g>
);

export default function MapView({
  showRoute = false,
  showDestination = false,
  showCaptain = false,
  captainMoving = false,
  className = '',
}) {
  const [routeVisible, setRouteVisible] = useState(false);

  useEffect(() => {
    if (showRoute) {
      const t = setTimeout(() => setRouteVisible(true), 200);
      return () => clearTimeout(t);
    } else {
      setRouteVisible(false);
    }
  }, [showRoute]);

  return (
    <div className={`relative w-full h-full overflow-hidden map-bg ${className}`}>
      <svg
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <filter id="mapGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="routeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* ── Map base ── */}
        <rect width="400" height="600" fill="#1B2617" />

        {/* ── City blocks ── */}
        <rect x="0" y="0" width="82" height="92" fill="#1D2B1A" />
        <rect x="98" y="0" width="105" height="92" fill="#1D2B1A" />
        <rect x="219" y="0" width="75" height="92" fill="#1D2B1A" />
        <rect x="310" y="0" width="90" height="92" fill="#1D2B1A" />

        <rect x="0" y="108" width="82" height="92" fill="#1D2B1A" />
        <rect x="98" y="108" width="105" height="62" fill="#1D2B1A" />
        <rect x="219" y="108" width="75" height="92" fill="#1D2B1A" />
        <rect x="310" y="108" width="90" height="92" fill="#1D2B1A" />

        <rect x="0" y="218" width="82" height="92" fill="#1D2B1A" />
        <rect x="98" y="218" width="175" height="92" fill="#1D2B1A" />
        <rect x="289" y="218" width="111" height="92" fill="#1D2B1A" />

        <rect x="0" y="328" width="82" height="92" fill="#1D2B1A" />
        <rect x="98" y="328" width="105" height="92" fill="#1D2B1A" />
        <rect x="219" y="328" width="75" height="92" fill="#1D2B1A" />
        <rect x="310" y="328" width="90" height="92" fill="#1D2B1A" />

        <rect x="0" y="438" width="82" height="92" fill="#1D2B1A" />
        <rect x="98" y="438" width="105" height="92" fill="#1D2B1A" />
        <rect x="219" y="438" width="75" height="92" fill="#1D2B1A" />
        <rect x="310" y="438" width="90" height="92" fill="#1D2B1A" />

        <rect x="0" y="548" width="82" height="52" fill="#1D2B1A" />
        <rect x="98" y="548" width="105" height="52" fill="#1D2B1A" />
        <rect x="219" y="548" width="75" height="52" fill="#1D2B1A" />
        <rect x="310" y="548" width="90" height="52" fill="#1D2B1A" />

        {/* ── Parks ── */}
        <rect x="98" y="170" width="120" height="48" rx="4" fill="#1E3B17" />
        <rect x="219" y="0" width="75" height="92" rx="2" fill="#1E3B17" />
        <text x="155" y="199" textAnchor="middle" fill="#2A5220" fontSize="8" fontFamily="sans-serif">
          ▲ ▲ ▲ Cubbon Park
        </text>

        {/* ── Water feature ── */}
        <rect x="0" y="400" width="82" height="30" rx="3" fill="#0D1F2D" />

        {/* ── Main roads (horizontal) ── */}
        <rect x="0" y="92" width="400" height="16" fill="#2C2C2C" />
        <rect x="0" y="202" width="400" height="16" fill="#2C2C2C" />
        <rect x="0" y="318" width="400" height="10" fill="#262626" />
        <rect x="0" y="420" width="400" height="18" fill="#2C2C2C" />
        <rect x="0" y="530" width="400" height="18" fill="#2C2C2C" />

        {/* ── Main roads (vertical) ── */}
        <rect x="82" y="0" width="16" height="600" fill="#2C2C2C" />
        <rect x="203" y="0" width="16" height="600" fill="#2C2C2C" />
        <rect x="294" y="0" width="16" height="600" fill="#262626" />

        {/* ── Road center lines ── */}
        {[100, 210, 328, 429, 539].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="400"
            y2={y}
            stroke="#3A3A3A"
            strokeWidth="1"
            strokeDasharray="12,8"
            opacity="0.5"
          />
        ))}
        {[90, 211, 302].map((x) => (
          <line
            key={x}
            x1={x}
            y1="0"
            x2={x}
            y2="600"
            stroke="#3A3A3A"
            strokeWidth="1"
            strokeDasharray="12,8"
            opacity="0.5"
          />
        ))}

        {/* ── Diagonal flyover ── */}
        <path
          d="M 0 218 Q 140 280 211 328"
          stroke="#333"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 0 218 Q 140 280 211 328"
          stroke="#2A2A2A"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />

        {/* ── Street labels ── */}
        <text x="90" y="104" fill="#3A3A3A" fontSize="6.5" fontFamily="sans-serif" fontWeight="600">
          INNER RING ROAD
        </text>
        <text x="90" y="214" fill="#3A3A3A" fontSize="6.5" fontFamily="sans-serif" fontWeight="600">
          HOSUR ROAD
        </text>
        <text x="90" y="432" fill="#3A3A3A" fontSize="6.5" fontFamily="sans-serif" fontWeight="600">
          OUTER RING ROAD
        </text>

        {/* ── Location area label ── */}
        <text x="135" y="378" textAnchor="middle" fill="#3D4D3D" fontSize="7.5" fontFamily="sans-serif">
          KORAMANGALA
        </text>

        {/* ── Route overlay ── */}
        {routeVisible && (
          <>
            <path
              d="M 155 430 C 155 380 175 320 185 260 C 195 200 200 160 190 100"
              stroke="url(#routeGrad)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="route-path"
            />
            <path
              d="M 155 430 C 155 380 175 320 185 260 C 195 200 200 160 190 100"
              stroke="#FFD700"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="600"
              className="route-path"
              opacity="0.7"
            />
          </>
        )}

        {/* ── Nearby bikes (scattered) ── */}
        {!showCaptain && (
          <>
            <BikeIcon x={120} y={350} size={20} animate />
            <BikeIcon x={240} y={390} size={20} animate />
            <BikeIcon x={310} y={360} size={20} animate />
            <BikeIcon x={80} y={460} size={18} />
            <BikeIcon x={280} y={270} size={18} />
          </>
        )}

        {/* ── Captain icon (moving) ── */}
        {showCaptain && (
          <g className={captainMoving ? 'captain-icon' : ''}>
            <circle cx={195} cy={390} r={14} fill="#FF6B00" opacity={0.2} />
            <circle cx={195} cy={390} r={9} fill="#FF6B00" opacity={0.4} />
            <BikeIcon x={195} y={390} size={22} color="#FF6B00" />
          </g>
        )}

        {/* ── Destination pin ── */}
        {showDestination && <DestinationPin x={190} y={108} />}

        {/* ── Current location ── */}
        <LocationPin x={155} y={430} />

        {/* ── Map overlay gradient (bottom fade for bottom sheet) ── */}
        <defs>
          <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1B2617" stopOpacity="0" />
            <stop offset="100%" stopColor="#1A1A1A" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <rect x="0" y="480" width="400" height="120" fill="url(#bottomFade)" />
      </svg>

      {/* Compass */}
      <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-[#333] flex items-center justify-center">
        <span className="text-[#FFD700] text-sm font-bold" style={{ fontFamily: 'DM Sans' }}>
          N
        </span>
      </div>
    </div>
  );
}

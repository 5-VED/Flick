import { useState } from 'react';
import { Car, Users, UserCheck, IndianRupee, XCircle, Star, Clock, CheckCircle, AlertTriangle, UserPlus } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { ridesChartData, riders, activityFeed } from '../data/mockData';

const topRiders = [...riders].sort((a, b) => b.totalRides - a.totalRides).slice(0, 5);

const ACTIVITY_ICON = { booked: Car, assigned: UserCheck, completed: CheckCircle, dispute: AlertTriangle, joined: UserPlus };
const ACTIVITY_COLOR = {
  booked: 'text-blue-400 bg-blue-400/10',
  assigned: 'text-[#FFD700] bg-[#FFD700]/10',
  completed: 'text-emerald-400 bg-emerald-400/10',
  dispute: 'text-red-400 bg-red-400/10',
  joined: 'text-purple-400 bg-purple-400/10',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-sm">
      <p className="font-display text-[#FFD700] tracking-wider text-base mb-1">{label}</p>
      <p className="text-white">{payload[0].value} rides</p>
    </div>
  );
};

export default function Dashboard() {
  const [period, setPeriod] = useState('7d');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Car} label="Total Rides Today" value="43" delta="+12%" deltaType="up" />
        <StatCard icon={UserCheck} label="Active Riders" value="28" delta="+3" deltaType="up" />
        <StatCard icon={Users} label="Active Customers" value="156" delta="+8%" deltaType="up" />
        <StatCard icon={IndianRupee} label="Revenue Today" value="₹4,890" delta="+15%" deltaType="up" />
        <StatCard icon={XCircle} label="Cancelled Rides" value="6" delta="-2" deltaType="up" />
        <StatCard icon={Star} label="Avg Rating" value="4.6" delta="+0.1" deltaType="up" />
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl tracking-wider text-white">RIDES OVER TIME</h2>
            <div className="flex bg-[#1A1A1A] rounded-lg p-1 gap-1">
              {['7d', '30d'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                    period === p ? 'bg-[#FFD700] text-black' : 'text-[#888888] hover:text-white'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ridesChartData[period]} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2F2F2F" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#666', fontSize: 10, fontFamily: 'DM Sans' }}
                axisLine={false} tickLine={false}
                interval={period === '30d' ? 4 : 0}
              />
              <YAxis
                tick={{ fill: '#666', fontSize: 10, fontFamily: 'DM Sans' }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="rides" stroke="#FFD700" strokeWidth={2}
                dot={false} activeDot={{ r: 4, fill: '#FFD700', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Feed */}
        <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-5 flex flex-col">
          <h2 className="font-display text-xl tracking-wider text-white mb-4">LIVE ACTIVITY</h2>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-72">
            {activityFeed.map(item => {
              const Icon = ACTIVITY_ICON[item.type] ?? Car;
              const color = ACTIVITY_COLOR[item.type] ?? 'text-white bg-white/10';
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}>
                    <Icon size={13} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs leading-relaxed">{item.message}</p>
                    <p className="text-[#555555] text-[10px] mt-0.5 flex items-center gap-1">
                      <Clock size={9} />{item.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map + Leaderboard */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl tracking-wider text-white">LIVE RIDES MAP</h2>
            <div className="flex items-center gap-4 text-[11px] text-[#888888]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FFD700]" />Active</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />Completed</span>
            </div>
          </div>
          <CityMap />
        </div>

        {/* Top Riders */}
        <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-5">
          <h2 className="font-display text-xl tracking-wider text-white mb-4">TOP RIDERS</h2>
          <div className="space-y-2">
            {topRiders.map((rider, i) => (
              <div key={rider.id} className="flex items-center gap-3 py-2.5 border-b border-[#3A3A3A] last:border-0">
                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                  i === 0 ? 'bg-[#FFD700] text-black'
                  : i === 1 ? 'bg-[#C0C0C0] text-black'
                  : i === 2 ? 'bg-[#CD7F32] text-white'
                  : 'bg-[#333] text-[#888888]'
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{rider.name}</p>
                  <p className="text-[#888888] text-[11px]">
                    {rider.totalRides} rides · ⭐ {rider.rating}
                  </p>
                </div>
                <StatusBadge status={rider.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const ACTIVE_DOTS = [
  { x: 95,  y: 72  }, { x: 195, y: 118 }, { x: 295, y: 65  },
  { x: 72,  y: 148 }, { x: 372, y: 94  }, { x: 258, y: 172 },
  { x: 148, y: 212 }, { x: 338, y: 192 }, { x: 430, y: 140 },
];

const COMPLETED_DOTS = [
  { x: 140, y: 95 }, { x: 230, y: 140 }, { x: 310, y: 190 },
  { x: 68,  y: 200 }, { x: 400, y: 70 },
];

function CityMap() {
  return (
    <svg viewBox="0 0 480 270" className="w-full rounded-lg" style={{ background: '#111' }}>
      {/* Major roads */}
      {[40, 90, 140, 190, 240].map(y => (
        <line key={`h${y}`} x1="0" y1={y} x2="480" y2={y} stroke="#2A2A2A" strokeWidth="10" />
      ))}
      {[60, 120, 180, 240, 300, 360, 420].map(x => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2="270" stroke="#2A2A2A" strokeWidth="10" />
      ))}
      {/* Minor roads */}
      {[65, 115, 165, 215].map(y => (
        <line key={`hm${y}`} x1="0" y1={y} x2="480" y2={y} stroke="#222" strokeWidth="4" />
      ))}
      {[30, 90, 150, 210, 270, 330, 390, 450].map(x => (
        <line key={`vm${x}`} x1={x} y1="0" x2={x} y2="270" stroke="#222" strokeWidth="4" />
      ))}
      {/* District tint */}
      <rect x="40" y="40" width="130" height="90" rx="2" fill="#FFD700" opacity="0.025" />
      <rect x="210" y="40" width="150" height="75" rx="2" fill="#4A9EFF" opacity="0.025" />
      <rect x="75" y="155" width="190" height="80" rx="2" fill="#4ECDC4" opacity="0.025" />
      {/* Completed dots */}
      {COMPLETED_DOTS.map((d, i) => (
        <circle key={`c${i}`} cx={d.x} cy={d.y} r="3.5" fill="#34D399" opacity="0.7" />
      ))}
      {/* Active ride pulse dots */}
      {ACTIVE_DOTS.map((d, i) => (
        <g key={`a${i}`}>
          <circle cx={d.x} cy={d.y} r="10" fill="#FFD700" opacity="0">
            <animate attributeName="r" values="5;18;5" dur={`${1.8 + i * 0.2}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur={`${1.8 + i * 0.2}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={d.x} cy={d.y} r="4" fill="#FFD700" />
        </g>
      ))}
      {/* Labels */}
      <text x="50" y="82" fill="#555" fontSize="8" fontFamily="DM Sans" fontWeight="600" letterSpacing="1">ANDHERI</text>
      <text x="225" y="72" fill="#555" fontSize="8" fontFamily="DM Sans" fontWeight="600" letterSpacing="1">BANDRA</text>
      <text x="88" y="190" fill="#555" fontSize="8" fontFamily="DM Sans" fontWeight="600" letterSpacing="1">DADAR</text>
      <text x="315" y="160" fill="#555" fontSize="8" fontFamily="DM Sans" fontWeight="600" letterSpacing="1">KURLA</text>
      <text x="390" y="105" fill="#555" fontSize="8" fontFamily="DM Sans" fontWeight="600" letterSpacing="1">POWAI</text>
    </svg>
  );
}

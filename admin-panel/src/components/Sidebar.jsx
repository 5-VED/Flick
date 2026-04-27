import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Car, CreditCard,
  AlertTriangle, Settings, ChevronLeft, ChevronRight, Zap,
} from 'lucide-react';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/riders', icon: UserCheck, label: 'Riders' },
  { to: '/rides', icon: Car, label: 'Rides' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/disputes', icon: AlertTriangle, label: 'Disputes' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className="fixed top-0 left-0 h-screen bg-[#2A2A2A] border-r border-[#3A3A3A] flex flex-col z-50 transition-all duration-300"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-[#3A3A3A] px-4 gap-3 overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-[#FFD700] rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap size={17} className="text-black fill-black" />
        </div>
        {!collapsed && (
          <span className="font-display text-2xl text-white tracking-widest whitespace-nowrap">
            FLICK<span className="text-[#FFD700]">.</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `relative flex items-center gap-3 mx-2 mb-1 rounded-lg transition-all duration-150 ${
                collapsed ? 'justify-center p-3' : 'px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-[#FFD700]/10 text-[#FFD700]'
                  : 'text-[#888888] hover:text-white hover:bg-white/[0.05]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#FFD700] rounded-r-full" />
                )}
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">{label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="m-3 p-2 rounded-lg border border-[#3A3A3A] text-[#888888] hover:text-[#FFD700] hover:border-[#FFD700]/40 transition-colors flex items-center justify-center"
      >
        {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
      </button>
    </aside>
  );
}

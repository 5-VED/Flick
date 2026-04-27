import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Riders from './pages/Riders';
import Rides from './pages/Rides';
import Payments from './pages/Payments';
import Disputes from './pages/Disputes';
import Settings from './pages/Settings';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/customers': 'Customers',
  '/riders': 'Riders',
  '/rides': 'Rides',
  '/payments': 'Earnings & Payments',
  '/disputes': 'Disputes & Support',
  '/settings': 'Settings',
};

function AppContent() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  return (
    <div className="flex min-h-screen bg-[#1A1A1A]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: collapsed ? 64 : 240 }}
      >
        <TopBar title={title} />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/riders" element={<Riders />} />
            <Route path="/rides" element={<Rides />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/disputes" element={<Disputes />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

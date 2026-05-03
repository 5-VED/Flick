import { useState, useMemo } from 'react';
import { Search, Eye, Flag } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useAdmin } from '../context/AdminContext';

function fmt(dt) {
  return new Date(dt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const TIMELINE = [
  { step: 'Booked', desc: 'Customer placed ride request' },
  { step: 'Assigned', desc: 'Rider accepted the request' },
  { step: 'Started', desc: 'Rider reached pickup & started ride' },
  { step: 'Completed', desc: 'Ride completed & fare collected' },
];

export default function Rides() {
  const { rides: rawRides } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const rides = useMemo(() => rawRides.map(r => ({
    id: r._id || r.id,
    customer: r.customer || (r.boked_by ? `${r.boked_by.first_name || ''} ${r.boked_by.last_name || ''}`.trim() : 'Unknown'),
    rider: r.rider || (r.captain ? `${r.captain.first_name || ''} ${r.captain.last_name || ''}`.trim() : 'Unassigned'),
    pickup: r.pickup || r.pickup_location || '—',
    drop: r.drop || r.drop_location || '—',
    fare: r.fare || 0,
    status: r.status || 'Requested',
    vehicle: r.vehicle || r.vehicle_type || 'Bike',
    date: r.date || r.createdAt || new Date().toISOString(),
    duration: r.duration || r.trip_duration || '—',
    distance: r.distance || r.trip_distance || '—',
    platformFee: r.platformFee || Math.round((r.fare || 0) * 0.1),
    riderEarning: r.riderEarning || Math.round((r.fare || 0) * 0.9),
  })), [rawRides]);

  const filtered = useMemo(() => rides.filter(r => {
    const q = search.toLowerCase();
    const idStr = String(r.id || '');
    return (
      (idStr.toLowerCase().includes(q) || (r.customer || '').toLowerCase().includes(q) || (r.rider || '').toLowerCase().includes(q)) &&
      (statusFilter === 'All' || r.status === statusFilter) &&
      (vehicleFilter === 'All' || r.vehicle === vehicleFilter)
    );
  }), [rides, search, statusFilter, vehicleFilter]);

  const columns = [
    { key: 'id', label: 'Ride ID', render: v => <span className="font-mono text-xs text-[#FFD700]">{v}</span> },
    {
      key: 'customer', label: 'Customer', sortable: true,
      render: v => <span className="font-medium text-white">{v}</span>,
    },
    { key: 'rider', label: 'Rider', sortable: true, render: v => <span className="text-[#aaa]">{v}</span> },
    {
      key: 'pickup', label: 'Route',
      render: (v, row) => (
        <div className="text-xs">
          <p className="text-white truncate max-w-40">{v}</p>
          <p className="text-[#888888]">→ {row.drop}</p>
        </div>
      ),
    },
    {
      key: 'fare', label: 'Fare', sortable: true,
      render: v => <span className="text-emerald-400 font-semibold">₹{v}</span>,
    },
    { key: 'vehicle', label: 'Type', sortable: true, render: v => <span className="text-[#aaa] text-xs">{v}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'date', label: 'Date', sortable: true, render: v => <span className="text-[#888888] text-xs">{fmt(v)}</span> },
    {
      key: '_actions', label: '',
      render: (_, row) => (
        <button
          onClick={() => setSelected(row)}
          className="p-1.5 rounded-lg text-[#666] hover:text-[#FFD700] hover:bg-[#FFD700]/10 opacity-0 group-hover:opacity-100 transition-all"
          title="View Details"
        >
          <Eye size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-56">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search ride ID, customer, rider…"
            className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#FFD700] transition-colors"
          />
        </div>
        <Sel value={statusFilter} onChange={setStatusFilter} options={['All', 'Completed', 'Ongoing', 'Cancelled']} />
        <Sel value={vehicleFilter} onChange={setVehicleFilter} options={['All', 'Bike', 'Auto', 'Cab']} />
        <span className="ml-auto text-xs text-[#888888]">{filtered.length} rides</span>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Completed', color: 'text-emerald-400 bg-emerald-400/10', count: rides.filter(r => r.status === 'Completed').length },
          { label: 'Ongoing', color: 'text-blue-400 bg-blue-400/10', count: rides.filter(r => r.status === 'Ongoing').length },
          { label: 'Cancelled', color: 'text-red-400 bg-red-400/10', count: rides.filter(r => r.status === 'Cancelled').length },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => setStatusFilter(statusFilter === s.label ? 'All' : s.label)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${s.color} ${statusFilter === s.label ? 'ring-1 ring-current' : 'opacity-70 hover:opacity-100'}`}
          >
            {s.count} {s.label}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} pageSize={10} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Ride ${selected?.id ?? ''}`} width="max-w-xl">
        {selected && <RideDetail ride={selected} />}
      </Modal>
    </div>
  );
}

function Sel({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD700] transition-colors">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function RideDetail({ ride: r }) {
  const completedSteps = r.status === 'Completed' ? 4 : r.status === 'Ongoing' ? 3 : 1;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[#FFD700] text-sm">{r.id}</p>
          <p className="text-[#888888] text-xs mt-0.5">{fmt(r.date)}</p>
        </div>
        <StatusBadge status={r.status} />
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1A1A1A] rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">Customer</p>
          <p className="text-white font-semibold">{r.customer}</p>
        </div>
        <div className="bg-[#1A1A1A] rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">Rider</p>
          <p className="text-white font-semibold">{r.rider}</p>
        </div>
      </div>

      {/* Route */}
      <div className="bg-[#1A1A1A] rounded-xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-0 mt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFD700] flex-shrink-0" />
            <div className="w-px h-6 bg-[#3A3A3A]" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#555]">Pickup</p>
              <p className="text-white text-sm">{r.pickup}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#555]">Drop</p>
              <p className="text-white text-sm">{r.drop}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4 text-sm pt-1 border-t border-[#2A2A2A]">
          <span className="text-[#888888]">{r.distance}</span>
          <span className="text-[#888888]">{r.duration}</span>
          <span className="text-[#888888]">{r.vehicle}</span>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h4 className="font-display text-lg text-white tracking-wider mb-3">TIMELINE</h4>
        <div className="space-y-1">
          {TIMELINE.map((step, i) => {
            const done = i < completedSteps;
            const active = i === completedSteps - 1;
            return (
              <div key={step.step} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    done ? 'bg-[#FFD700] text-black' : 'bg-[#2A2A2A] border border-[#3A3A3A] text-[#555]'
                  }`}>
                    {done ? '✓' : i + 1}
                  </div>
                  {i < TIMELINE.length - 1 && <div className={`w-px h-6 ${done ? 'bg-[#FFD700]/30' : 'bg-[#2A2A2A]'}`} />}
                </div>
                <div className="pb-2">
                  <p className={`text-sm font-semibold ${done ? 'text-white' : 'text-[#555]'}`}>{step.step}</p>
                  <p className={`text-xs ${done ? 'text-[#888888]' : 'text-[#444]'}`}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fare Breakdown */}
      <div>
        <h4 className="font-display text-lg text-white tracking-wider mb-2">FARE BREAKDOWN</h4>
        <div className="bg-[#1A1A1A] rounded-xl p-4 space-y-2 text-sm">
          {[
            { label: 'Total Fare', value: `₹${r.fare}` },
            { label: 'Platform Commission (10%)', value: `₹${r.platformFee}` },
            { label: 'Rider Earning', value: `₹${r.riderEarning}`, highlight: true },
          ].map(item => (
            <div key={item.label} className={`flex justify-between ${item.highlight ? 'pt-2 border-t border-[#2A2A2A] mt-1' : ''}`}>
              <span className="text-[#888888]">{item.label}</span>
              <span className={item.highlight ? 'text-[#FFD700] font-bold' : 'text-white'}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-400/10 transition-colors">
        <Flag size={14} /> Flag as Dispute
      </button>
    </div>
  );
}

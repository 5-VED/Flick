import { useState, useMemo } from 'react';
import { Search, Eye, Ban, Trash2, CheckCircle, ShieldCheck, ShieldX } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { riders } from '../data/mockData';

function fmt(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const VEHICLE_ICON = { Bike: '🏍️', Auto: '🛺', Cab: '🚖' };

export default function Riders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState(riders);

  const filtered = useMemo(() => data.filter(r => {
    const q = search.toLowerCase();
    return (
      (r.name.toLowerCase().includes(q) || r.phone.includes(q)) &&
      (statusFilter === 'All' || r.status === statusFilter) &&
      (vehicleFilter === 'All' || r.vehicle === vehicleFilter)
    );
  }), [data, search, statusFilter, vehicleFilter]);

  function toggleBlock(r) {
    setData(prev => prev.map(x => x.id === r.id ? { ...x, status: x.status === 'Blocked' ? 'Offline' : 'Blocked' } : x));
    if (selected?.id === r.id) setSelected(s => ({ ...s, status: s.status === 'Blocked' ? 'Offline' : 'Blocked' }));
  }

  function deleteRider(r) {
    if (!window.confirm(`Delete ${r.name}?`)) return;
    setData(prev => prev.filter(x => x.id !== r.id));
    if (selected?.id === r.id) setSelected(null);
  }

  const columns = [
    {
      key: 'name', label: 'Rider', sortable: true,
      render: (v, row) => (
        <div>
          <p className="font-semibold text-white">{v}</p>
          <p className="text-[11px] text-[#888888]">{row.phone}</p>
        </div>
      ),
    },
    {
      key: 'vehicle', label: 'Vehicle', sortable: true,
      render: v => (
        <span className="flex items-center gap-1.5 text-[#aaa]">
          <span>{VEHICLE_ICON[v]}</span>{v}
        </span>
      ),
    },
    {
      key: 'rating', label: 'Rating', sortable: true,
      render: v => <span className="text-[#FFD700] font-semibold">⭐ {v}</span>,
    },
    { key: 'totalRides', label: 'Rides', sortable: true, render: v => <span className="font-semibold">{v}</span> },
    {
      key: 'earnings', label: 'Earnings', sortable: true,
      render: v => <span className="text-emerald-400 font-semibold">₹{v.toLocaleString('en-IN')}</span>,
    },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    {
      key: 'docVerified', label: 'Docs',
      render: v => v
        ? <span className="flex items-center gap-1 text-emerald-400 text-xs"><ShieldCheck size={13} />Verified</span>
        : <span className="flex items-center gap-1 text-red-400 text-xs"><ShieldX size={13} />Pending</span>,
    },
    { key: 'joined', label: 'Joined', sortable: true, render: v => <span className="text-[#888888] text-xs">{fmt(v)}</span> },
    {
      key: '_actions', label: '',
      render: (_, row) => (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Btn icon={Eye} title="View" color="yellow" onClick={() => setSelected(row)} />
          <Btn
            icon={row.status === 'Blocked' ? CheckCircle : Ban}
            title={row.status === 'Blocked' ? 'Unblock' : 'Block'}
            color={row.status === 'Blocked' ? 'green' : 'red'}
            onClick={() => toggleBlock(row)}
          />
          <Btn icon={Trash2} title="Delete" color="red" onClick={() => deleteRider(row)} />
        </div>
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
            placeholder="Search rider name or phone…"
            className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#FFD700] transition-colors"
          />
        </div>
        <Sel value={statusFilter} onChange={setStatusFilter} options={['All', 'Online', 'Offline', 'Blocked']} />
        <Sel value={vehicleFilter} onChange={setVehicleFilter} options={['All', 'Bike', 'Auto', 'Cab']} />
        <span className="ml-auto text-xs text-[#888888]">{filtered.length} of {data.length}</span>
      </div>

      <DataTable columns={columns} data={filtered} pageSize={8} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''} width="max-w-xl">
        {selected && <RiderDetail rider={selected} onBlock={() => toggleBlock(selected)} />}
      </Modal>
    </div>
  );
}

function Btn({ icon: Icon, title, color, onClick }) {
  const cls = { yellow: 'hover:text-[#FFD700] hover:bg-[#FFD700]/10', red: 'hover:text-red-400 hover:bg-red-400/10', green: 'hover:text-emerald-400 hover:bg-emerald-400/10' }[color];
  return <button onClick={onClick} title={title} className={`p-1.5 rounded-lg text-[#666] transition-colors ${cls}`}><Icon size={14} /></button>;
}

function Sel({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD700] transition-colors">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function RiderDetail({ rider: r, onBlock }) {
  const stats = [
    { label: 'Total Rides', value: r.totalRides },
    { label: 'Earnings', value: `₹${r.earnings.toLocaleString('en-IN')}` },
    { label: 'Rating', value: `⭐ ${r.rating}` },
  ];

  const earningsBreakdown = [
    { label: 'Gross Earnings', value: `₹${r.earnings.toLocaleString('en-IN')}` },
    { label: 'Platform Fee (10%)', value: `−₹${Math.round(r.earnings * 0.1).toLocaleString('en-IN')}` },
    { label: 'Net Payout', value: `₹${Math.round(r.earnings * 0.9).toLocaleString('en-IN')}`, highlight: true },
  ];

  const recentRides = [
    { from: 'Andheri West', to: 'Bandra', fare: 120, date: 'Jan 15', status: 'Completed' },
    { from: 'Powai', to: 'Thane', fare: 155, date: 'Jan 10', status: 'Completed' },
    { from: 'Borivali', to: 'Andheri', fare: 90, date: 'Jan 13', status: 'Completed' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center flex-shrink-0">
          <span className="font-display text-3xl text-[#FFD700] leading-none">{r.name[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white font-semibold text-base">{r.name}</p>
            <span className="text-sm">{VEHICLE_ICON[r.vehicle]}</span>
          </div>
          <p className="text-[#888888] text-sm">{r.phone}</p>
          <p className="text-[#888888] text-sm">{r.vehicleNo}</p>
        </div>
        <StatusBadge status={r.status} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-[#1A1A1A] rounded-xl p-3 text-center">
            <p className="font-display text-2xl text-[#FFD700] leading-none">{s.value}</p>
            <p className="text-[10px] text-[#888888] mt-1 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {[
          { label: 'City', value: r.city },
          { label: 'Vehicle Type', value: r.vehicle },
          { label: 'Rider ID', value: r.id },
          { label: 'Documents', value: r.docVerified ? '✅ Verified' : '⏳ Pending' },
          { label: 'Joined', value: new Date(r.joined).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) },
        ].map(item => (
          <div key={item.label}>
            <p className="text-[10px] uppercase tracking-wider text-[#555555] mb-0.5">{item.label}</p>
            <p className="text-white font-medium">{item.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h4 className="font-display text-lg text-white tracking-wider mb-2">EARNINGS BREAKDOWN</h4>
        <div className="bg-[#1A1A1A] rounded-xl p-4 space-y-2">
          {earningsBreakdown.map(e => (
            <div key={e.label} className={`flex justify-between text-sm ${e.highlight ? 'border-t border-[#3A3A3A] pt-2 mt-2' : ''}`}>
              <span className="text-[#888888]">{e.label}</span>
              <span className={e.highlight ? 'text-[#FFD700] font-bold' : 'text-white'}>{e.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-display text-lg text-white tracking-wider mb-3">RECENT RIDES</h4>
        <div className="space-y-2">
          {recentRides.map((ride, i) => (
            <div key={i} className="flex items-center justify-between bg-[#1A1A1A] rounded-lg px-4 py-3">
              <div>
                <p className="text-white text-sm font-medium">{ride.from} → {ride.to}</p>
                <p className="text-[#888888] text-xs">{ride.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-semibold text-sm">₹{ride.fare}</span>
                <StatusBadge status={ride.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onBlock}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors border ${
          r.status === 'Blocked'
            ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-400/10'
            : 'border-red-500/30 text-red-400 hover:bg-red-400/10'
        }`}
      >
        {r.status === 'Blocked' ? 'Unblock Rider' : 'Block Rider'}
      </button>
    </div>
  );
}

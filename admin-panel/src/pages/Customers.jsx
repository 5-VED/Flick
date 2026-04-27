import { useState, useMemo } from 'react';
import { Search, Eye, Ban, Trash2, CheckCircle } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { customers } from '../data/mockData';

function fmt(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Customers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState(customers);

  const cities = useMemo(() => ['All', ...new Set(customers.map(c => c.city))], []);

  const filtered = useMemo(() => data.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q)) &&
      (statusFilter === 'All' || c.status === statusFilter) &&
      (cityFilter === 'All' || c.city === cityFilter)
    );
  }), [data, search, statusFilter, cityFilter]);

  function toggleBlock(c) {
    setData(prev => prev.map(r => r.id === c.id ? { ...r, status: r.status === 'Active' ? 'Blocked' : 'Active' } : r));
    if (selected?.id === c.id) setSelected(s => ({ ...s, status: s.status === 'Active' ? 'Blocked' : 'Active' }));
  }

  function deleteCustomer(c) {
    if (!window.confirm(`Delete ${c.name}? This cannot be undone.`)) return;
    setData(prev => prev.filter(r => r.id !== c.id));
    if (selected?.id === c.id) setSelected(null);
  }

  const columns = [
    {
      key: 'name', label: 'Customer', sortable: true,
      render: (v, row) => (
        <div>
          <p className="font-semibold text-white">{v}</p>
          <p className="text-[11px] text-[#888888]">{row.phone}</p>
        </div>
      ),
    },
    { key: 'city', label: 'City', sortable: true, render: v => <span className="text-[#aaa]">{v}</span> },
    { key: 'totalRides', label: 'Rides', sortable: true, render: v => <span className="font-semibold">{v}</span> },
    {
      key: 'totalSpent', label: 'Total Spent', sortable: true,
      render: v => <span className="text-emerald-400 font-semibold">₹{v.toLocaleString('en-IN')}</span>,
    },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'joined', label: 'Joined', sortable: true, render: v => <span className="text-[#888888] text-xs">{fmt(v)}</span> },
    {
      key: '_actions', label: '',
      render: (_, row) => (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionBtn icon={Eye} title="View Profile" color="yellow" onClick={() => setSelected(row)} />
          <ActionBtn
            icon={row.status === 'Blocked' ? CheckCircle : Ban}
            title={row.status === 'Blocked' ? 'Unblock' : 'Block'}
            color={row.status === 'Blocked' ? 'green' : 'red'}
            onClick={() => toggleBlock(row)}
          />
          <ActionBtn icon={Trash2} title="Delete" color="red" onClick={() => deleteCustomer(row)} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-56">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, email…"
            className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#FFD700] transition-colors"
          />
        </div>
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={['All', 'Active', 'Blocked']} />
        <FilterSelect value={cityFilter} onChange={setCityFilter} options={cities} />
        <span className="ml-auto text-xs text-[#888888]">{filtered.length} of {data.length}</span>
      </div>

      <DataTable columns={columns} data={filtered} pageSize={8} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''} width="max-w-xl">
        {selected && <CustomerDetail customer={selected} onBlock={() => toggleBlock(selected)} />}
      </Modal>
    </div>
  );
}

function ActionBtn({ icon: Icon, title, color, onClick }) {
  const cls = {
    yellow: 'hover:text-[#FFD700] hover:bg-[#FFD700]/10',
    red: 'hover:text-red-400 hover:bg-red-400/10',
    green: 'hover:text-emerald-400 hover:bg-emerald-400/10',
  }[color];
  return (
    <button onClick={onClick} title={title} className={`p-1.5 rounded-lg text-[#666] transition-colors ${cls}`}>
      <Icon size={14} />
    </button>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)}
      className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD700] transition-colors"
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function CustomerDetail({ customer: c, onBlock }) {
  const stats = [
    { label: 'Total Rides', value: c.totalRides },
    { label: 'Total Spent', value: `₹${c.totalSpent.toLocaleString('en-IN')}` },
    { label: 'Wallet', value: `₹${c.wallet}` },
  ];

  const recentRides = [
    { from: 'Andheri West', to: 'Bandra', fare: 120, date: 'Jan 15', status: 'Completed' },
    { from: 'Powai', to: 'Thane', fare: 155, date: 'Jan 10', status: 'Completed' },
    { from: 'Kurla', to: 'Andheri', fare: 90, date: 'Jan 13', status: 'Cancelled' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center flex-shrink-0">
          <span className="font-display text-3xl text-[#FFD700] leading-none">{c.name[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-base">{c.name}</p>
          <p className="text-[#888888] text-sm">{c.email}</p>
          <p className="text-[#888888] text-sm">{c.phone}</p>
        </div>
        <StatusBadge status={c.status} />
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
          { label: 'City', value: c.city },
          { label: 'Referral Code', value: c.referralCode },
          { label: 'Customer ID', value: c.id },
          { label: 'Member Since', value: new Date(c.joined).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) },
        ].map(item => (
          <div key={item.label}>
            <p className="text-[10px] uppercase tracking-wider text-[#555555] mb-0.5">{item.label}</p>
            <p className="text-white font-medium">{item.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h4 className="font-display text-lg text-white tracking-wider mb-3">RECENT RIDES</h4>
        <div className="space-y-2">
          {recentRides.map((r, i) => (
            <div key={i} className="flex items-center justify-between bg-[#1A1A1A] rounded-lg px-4 py-3">
              <div>
                <p className="text-white text-sm font-medium">{r.from} → {r.to}</p>
                <p className="text-[#888888] text-xs mt-0.5">{r.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-semibold text-sm">₹{r.fare}</span>
                <StatusBadge status={r.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onBlock}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors border ${
          c.status === 'Blocked'
            ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-400/10'
            : 'border-red-500/30 text-red-400 hover:bg-red-400/10'
        }`}
      >
        {c.status === 'Blocked' ? 'Unblock Customer' : 'Block Customer'}
      </button>
    </div>
  );
}

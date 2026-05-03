import { useState, useMemo } from 'react';
import { Search, CheckCircle, RefreshCw, AlertOctagon } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useAdmin } from '../context/AdminContext';

export default function Disputes() {
  const { disputes: rawDisputes, resolveDispute } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const data = useMemo(() => rawDisputes.map(d => ({
    id: d._id || d.id,
    customer: d.customer || (d.raised_by ? `${d.raised_by.first_name || ''} ${d.raised_by.last_name || ''}`.trim() : 'Unknown'),
    rider: d.rider || (d.against ? `${d.against.first_name || ''} ${d.against.last_name || ''}`.trim() : 'Unknown'),
    rideId: d.rideId || d.ride_id?._id || d.ride_id || '—',
    issue: d.issue || d.issue_type || 'Other',
    status: d.status || 'Open',
    date: d.date || d.createdAt || new Date().toISOString(),
    description: d.description || '',
  })), [rawDisputes]);

  const counts = useMemo(() => ({
    All: data.length,
    Open: data.filter(d => d.status === 'Open').length,
    Resolved: data.filter(d => d.status === 'Resolved').length,
    Escalated: data.filter(d => d.status === 'Escalated').length,
  }), [data]);

  const filtered = useMemo(() => data.filter(d => {
    const q = search.toLowerCase();
    return (
      (d.customer.toLowerCase().includes(q) || d.rider.toLowerCase().includes(q) ||
       d.rideId.toLowerCase().includes(q) || d.issue.toLowerCase().includes(q)) &&
      (statusFilter === 'All' || d.status === statusFilter)
    );
  }), [data, search, statusFilter]);

  function resolve(id) {
    resolveDispute(id, 'Resolved', 'Resolved by admin');
    if (selected?.id === id) setSelected(s => ({ ...s, status: 'Resolved' }));
  }

  function escalate(id) {
    resolveDispute(id, 'Escalated', 'Escalated for review');
    if (selected?.id === id) setSelected(s => ({ ...s, status: 'Escalated' }));
  }

  const columns = [
    { key: 'id', label: 'ID', render: v => <span className="font-mono text-xs text-[#FFD700]">{v}</span> },
    { key: 'customer', label: 'Customer', sortable: true, render: v => <span className="font-medium text-white">{v}</span> },
    { key: 'rider', label: 'Rider', sortable: true, render: v => <span className="text-[#aaa]">{v}</span> },
    { key: 'rideId', label: 'Ride ID', render: v => <span className="font-mono text-xs text-[#888888]">{v}</span> },
    { key: 'issue', label: 'Issue', sortable: true, render: v => <span className="text-white">{v}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'date', label: 'Date', sortable: true, render: v => <span className="text-[#888888] text-xs">{v}</span> },
    {
      key: '_actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {row.status !== 'Resolved' && (
            <ActionBtn icon={CheckCircle} label="Resolve" color="green" onClick={() => resolve(row.id)} />
          )}
          <ActionBtn icon={RefreshCw} label="Refund" color="yellow" onClick={() => setSelected(row)} />
          {row.status !== 'Escalated' && (
            <ActionBtn icon={AlertOctagon} label="Penalize" color="red" onClick={() => escalate(row.id)} />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Status Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {['All', 'Open', 'Escalated', 'Resolved'].map(s => {
          const color = s === 'Open' ? 'text-[#FFD700]' : s === 'Resolved' ? 'text-emerald-400' : s === 'Escalated' ? 'text-red-400' : 'text-white';
          const active = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                active
                  ? 'bg-[#2A2A2A] border border-[#3A3A3A] ' + color
                  : 'text-[#888888] hover:text-white hover:bg-white/5'
              }`}
            >
              {s}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-md ${active ? 'bg-white/10' : 'bg-[#2A2A2A]'}`}>
                {counts[s]}
              </span>
            </button>
          );
        })}

        <div className="ml-auto relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#FFD700] transition-colors w-52"
          />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} pageSize={8} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Dispute ${selected?.id ?? ''}`} width="max-w-lg">
        {selected && <DisputeDetail dispute={selected} onResolve={() => resolve(selected.id)} onEscalate={() => escalate(selected.id)} />}
      </Modal>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, color, onClick }) {
  const cls = {
    green: 'hover:text-emerald-400 hover:bg-emerald-400/10',
    red: 'hover:text-red-400 hover:bg-red-400/10',
    yellow: 'hover:text-[#FFD700] hover:bg-[#FFD700]/10',
  }[color];
  return (
    <button onClick={onClick} title={label} className={`p-1.5 rounded-lg text-[#666] transition-colors ${cls}`}>
      <Icon size={14} />
    </button>
  );
}

function DisputeDetail({ dispute: d, onResolve, onEscalate }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[#FFD700] text-sm">{d.id}</p>
          <p className="text-[#888888] text-xs mt-0.5">{d.date}</p>
        </div>
        <StatusBadge status={d.status} />
      </div>

      <div className="bg-[#1A1A1A] rounded-xl p-4 space-y-3 text-sm">
        {[
          { label: 'Customer', value: d.customer },
          { label: 'Rider', value: d.rider },
          { label: 'Ride ID', value: d.rideId, mono: true },
          { label: 'Issue Type', value: d.issue },
        ].map(item => (
          <div key={item.label} className="flex justify-between">
            <span className="text-[#888888]">{item.label}</span>
            <span className={`text-white font-medium ${item.mono ? 'font-mono text-[#FFD700]' : ''}`}>{item.value}</span>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-[#555] mb-2">Description</p>
        <p className="text-[#aaa] text-sm leading-relaxed bg-[#1A1A1A] rounded-xl p-4">{d.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onResolve}
          disabled={d.status === 'Resolved'}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCircle size={14} /> Resolve
        </button>
        <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#FFD700]/10 text-[#FFD700] text-sm font-semibold hover:bg-[#FFD700]/20 transition-colors">
          <RefreshCw size={14} /> Refund
        </button>
        <button
          onClick={onEscalate}
          disabled={d.status === 'Escalated'}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-500/10 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <AlertOctagon size={14} /> Penalize
        </button>
      </div>
    </div>
  );
}

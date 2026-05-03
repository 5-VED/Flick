import { useState } from 'react';
import { IndianRupee, TrendingUp, Users, Download, CheckCircle, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { revenueChartData, payouts } from '../data/mockData';
// Payments page uses mock chart data for visualization; real API data feeds the payout table via AdminContext

const gross = revenueChartData.reduce((s, d) => s + d.gross, 0);
const commission = revenueChartData.reduce((s, d) => s + d.commission, 0);
const payout = revenueChartData.reduce((s, d) => s + d.payout, 0);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2.5 text-xs space-y-1">
      <p className="font-display text-[#FFD700] tracking-wider text-sm mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: ₹{p.value.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

export default function Payments() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [data, setData] = useState(payouts);

  const filtered = data.filter(p => statusFilter === 'All' || p.status === statusFilter);

  function markPaid(row) {
    setData(prev => prev.map(p => p.id === row.id ? { ...p, status: 'Paid' } : p));
  }

  const columns = [
    { key: 'rider', label: 'Rider', sortable: true, render: v => <span className="font-semibold text-white">{v}</span> },
    { key: 'rides', label: 'Rides', sortable: true, render: v => <span className="font-semibold">{v}</span> },
    {
      key: 'amount', label: 'Amount', sortable: true,
      render: v => <span className="text-emerald-400 font-semibold">₹{v.toLocaleString('en-IN')}</span>,
    },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'period', label: 'Period', render: v => <span className="text-[#888888] text-xs">{v}</span> },
    {
      key: '_actions', label: '',
      render: (_, row) => row.status === 'Pending' ? (
        <button
          onClick={() => markPaid(row)}
          className="px-3 py-1.5 rounded-lg bg-[#FFD700]/10 text-[#FFD700] text-xs font-semibold hover:bg-[#FFD700]/20 transition-colors opacity-0 group-hover:opacity-100"
        >
          Mark Paid
        </button>
      ) : (
        <span className="flex items-center gap-1 text-emerald-400 text-xs opacity-0 group-hover:opacity-100">
          <CheckCircle size={12} /> Paid
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          icon={IndianRupee} label="Gross Revenue (7 days)"
          value={`₹${gross.toLocaleString('en-IN')}`}
          sub="All rides combined" color="yellow"
        />
        <SummaryCard
          icon={TrendingUp} label="Platform Commission"
          value={`₹${commission.toLocaleString('en-IN')}`}
          sub="10% of gross revenue" color="orange"
        />
        <SummaryCard
          icon={Users} label="Rider Payouts"
          value={`₹${payout.toLocaleString('en-IN')}`}
          sub="Net to riders" color="green"
        />
      </div>

      {/* Bar Chart */}
      <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-5">
        <h2 className="font-display text-xl tracking-wider text-white mb-5">DAILY REVENUE BREAKDOWN</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={revenueChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2F2F2F" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,215,0,0.04)' }} />
            <Legend
              wrapperStyle={{ paddingTop: 12, fontSize: 11, color: '#888' }}
              formatter={v => v.charAt(0).toUpperCase() + v.slice(1)}
            />
            <Bar dataKey="gross" fill="#FFD700" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Bar dataKey="commission" fill="#FF6B35" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Bar dataKey="payout" fill="#4ECDC4" radius={[3, 3, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Payout Table */}
      <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl tracking-wider text-white">RIDER PAYOUTS</h2>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFD700] transition-colors"
            >
              {['All', 'Paid', 'Pending'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#3A3A3A] text-[#888888] text-sm hover:text-[#FFD700] hover:border-[#FFD700]/40 transition-colors">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} pageSize={8} />
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    yellow: { bg: 'bg-[#FFD700]/10', icon: 'text-[#FFD700]', val: 'text-[#FFD700]' },
    orange: { bg: 'bg-orange-500/10', icon: 'text-orange-400', val: 'text-orange-400' },
    green: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', val: 'text-emerald-400' },
  }[color];

  return (
    <div className="bg-[#2A2A2A] border border-[#3A3A3A] hover:border-[#FFD700]/20 rounded-xl p-5 transition-colors">
      <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center mb-4`}>
        <Icon size={19} className={colors.icon} />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#888888] mb-1">{label}</p>
      <p className={`font-display text-3xl leading-none ${colors.val}`}>{value}</p>
      <p className="text-[#555555] text-xs mt-2">{sub}</p>
    </div>
  );
}

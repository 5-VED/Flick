import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, delta, deltaType = 'up' }) {
  const positive = deltaType === 'up';

  return (
    <div className="bg-[#2A2A2A] border border-[#3A3A3A] hover:border-[#FFD700]/25 rounded-xl p-5 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-[#FFD700]/10 flex items-center justify-center">
          <Icon size={19} className="text-[#FFD700]" />
        </div>
        {delta && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {delta}
          </span>
        )}
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#888888] mb-1">{label}</p>
      <p className="font-display text-[2rem] leading-none text-white tracking-wide">{value}</p>
    </div>
  );
}

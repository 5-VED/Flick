const CONFIG = {
  Active:    { pill: 'bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-400' },
  Blocked:   { pill: 'bg-red-500/10 text-red-400',         dot: 'bg-red-400' },
  Online:    { pill: 'bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-400' },
  Offline:   { pill: 'bg-[#555]/20 text-[#888888]',        dot: 'bg-[#555555]' },
  Completed: { pill: 'bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-400' },
  Cancelled: { pill: 'bg-red-500/10 text-red-400',         dot: 'bg-red-400' },
  Ongoing:   { pill: 'bg-blue-500/10 text-blue-400',       dot: 'bg-blue-400' },
  Open:      { pill: 'bg-[#FFD700]/10 text-[#FFD700]',     dot: 'bg-[#FFD700]' },
  Resolved:  { pill: 'bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-400' },
  Escalated: { pill: 'bg-red-500/10 text-red-400',         dot: 'bg-red-400' },
  Paid:      { pill: 'bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-400' },
  Pending:   { pill: 'bg-[#FFD700]/10 text-[#FFD700]',     dot: 'bg-[#FFD700]' },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] ?? { pill: 'bg-white/5 text-[#888888]', dot: 'bg-[#888888]' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[11px] font-semibold ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {status}
    </span>
  );
}

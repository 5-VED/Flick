import { Bell } from 'lucide-react';

export default function TopBar({ title }) {
  return (
    <header className="sticky top-0 z-40 h-16 bg-[#1A1A1A]/95 backdrop-blur border-b border-[#3A3A3A] flex items-center justify-between px-6">
      <h1 className="font-display text-3xl text-white tracking-widest">{title}</h1>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg text-[#888888] hover:text-white hover:bg-white/[0.06] transition-colors">
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FFD700] rounded-full text-[10px] font-bold text-black flex items-center justify-center leading-none">
            3
          </span>
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-[#3A3A3A]">
          <div className="w-9 h-9 rounded-full bg-[#FFD700] flex items-center justify-center">
            <span className="font-display text-lg text-black leading-none">A</span>
          </div>
          <div className="hidden sm:block leading-none">
            <p className="text-sm font-semibold text-white">Admin</p>
            <p className="text-[11px] text-[#888888] mt-0.5">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

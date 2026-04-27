import { useState } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';

export default function Settings() {
  const [commission, setCommission] = useState(10);
  const [surgeEnabled, setSurgeEnabled] = useState(false);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.5);
  const [vehicles, setVehicles] = useState({ Bike: true, Auto: true, Cab: true });
  const [admin, setAdmin] = useState({ name: 'Admin User', email: 'admin@flickapp.in', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState('');

  function save(section) {
    setSaved(section);
    setTimeout(() => setSaved(''), 2000);
  }

  function toggleVehicle(v) {
    setVehicles(prev => ({ ...prev, [v]: !prev[v] }));
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      {/* Commission */}
      <Section title="Platform Commission" desc="Percentage deducted from each ride as platform fee.">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs uppercase tracking-wider text-[#888888] mb-2 block">Commission Rate (%)</label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={1} max={30} value={commission}
                onChange={e => setCommission(+e.target.value)}
                className="flex-1 accent-[#FFD700]"
              />
              <div className="w-16 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-center">
                <span className="font-display text-xl text-[#FFD700]">{commission}</span>
                <span className="text-[#888888] text-xs">%</span>
              </div>
            </div>
            <p className="text-xs text-[#555555] mt-2">
              On a ₹100 fare → Platform earns ₹{commission}, Rider earns ₹{100 - commission}
            </p>
          </div>
        </div>
        <SaveBtn saved={saved === 'commission'} onClick={() => save('commission')} />
      </Section>

      {/* Surge Pricing */}
      <Section title="Surge Pricing" desc="Automatically increase fares during high-demand periods.">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Enable Surge Pricing</p>
              <p className="text-[#888888] text-xs">Multiplier applied when demand exceeds capacity</p>
            </div>
            <Toggle enabled={surgeEnabled} onToggle={() => setSurgeEnabled(v => !v)} />
          </div>

          {surgeEnabled && (
            <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#FFD700]/20 animate-fade-in">
              <label className="text-xs uppercase tracking-wider text-[#888888] mb-3 block">Surge Multiplier</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={1.1} max={3.0} step={0.1} value={surgeMultiplier}
                  onChange={e => setSurgeMultiplier(+parseFloat(e.target.value).toFixed(1))}
                  className="flex-1 accent-[#FFD700]"
                />
                <div className="w-16 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-center">
                  <span className="font-display text-xl text-[#FFD700]">{surgeMultiplier}x</span>
                </div>
              </div>
              <p className="text-xs text-[#555555] mt-2">
                ₹100 base fare → ₹{Math.round(100 * surgeMultiplier)} with surge
              </p>
            </div>
          )}
        </div>
        <SaveBtn saved={saved === 'surge'} onClick={() => save('surge')} />
      </Section>

      {/* Vehicle Types */}
      <Section title="Vehicle Management" desc="Enable or disable vehicle categories on the platform.">
        <div className="space-y-3">
          {[
            { key: 'Bike', label: 'Bike', icon: '🏍️', desc: 'Two-wheeler rides for solo commuters' },
            { key: 'Auto', label: 'Auto', icon: '🛺', desc: 'Three-wheeler auto-rickshaws' },
            { key: 'Cab', label: 'Cab', icon: '🚖', desc: 'Four-wheeler cab rides' },
          ].map(v => (
            <div key={v.key} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
              vehicles[v.key] ? 'bg-[#1A1A1A] border-[#3A3A3A]' : 'bg-[#1A1A1A]/50 border-[#2A2A2A]'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{v.icon}</span>
                <div>
                  <p className={`text-sm font-semibold ${vehicles[v.key] ? 'text-white' : 'text-[#555]'}`}>{v.label}</p>
                  <p className="text-[#888888] text-xs">{v.desc}</p>
                </div>
              </div>
              <Toggle enabled={vehicles[v.key]} onToggle={() => toggleVehicle(v.key)} />
            </div>
          ))}
        </div>
        <SaveBtn saved={saved === 'vehicles'} onClick={() => save('vehicles')} />
      </Section>

      {/* Admin Account */}
      <Section title="Admin Account" desc="Update your admin profile and change password.">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Display Name" value={admin.name} onChange={v => setAdmin(a => ({ ...a, name: v }))} />
            <Field label="Email Address" type="email" value={admin.email} onChange={v => setAdmin(a => ({ ...a, email: v }))} />
          </div>
          <div className="border-t border-[#3A3A3A] pt-4">
            <p className="text-xs uppercase tracking-wider text-[#888888] mb-3">Change Password</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Field
                  label="New Password" type={showPass ? 'text' : 'password'}
                  value={admin.password} onChange={v => setAdmin(a => ({ ...a, password: v }))}
                />
                <button
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-8 text-[#555] hover:text-[#888] transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <Field
                label="Confirm Password" type={showPass ? 'text' : 'password'}
                value={admin.confirm} onChange={v => setAdmin(a => ({ ...a, confirm: v }))}
              />
            </div>
            {admin.password && admin.confirm && admin.password !== admin.confirm && (
              <p className="text-red-400 text-xs mt-2">Passwords do not match</p>
            )}
          </div>
        </div>
        <SaveBtn saved={saved === 'account'} onClick={() => save('account')} />
      </Section>
    </div>
  );
}

function Section({ title, desc, children }) {
  return (
    <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-6 space-y-4">
      <div className="border-b border-[#3A3A3A] pb-4">
        <h2 className="font-display text-xl text-white tracking-wider">{title.toUpperCase()}</h2>
        <p className="text-[#888888] text-sm mt-0.5">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#888888] mb-1.5 block">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#FFD700] transition-colors"
      />
    </div>
  );
}

function Toggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${enabled ? 'bg-[#FFD700]' : 'bg-[#3A3A3A]'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${enabled ? 'left-5.5 left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

function SaveBtn({ saved, onClick }) {
  return (
    <div className="flex justify-end pt-2">
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          saved
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-[#FFD700] text-black hover:bg-[#E6C200]'
        }`}
      >
        <Save size={14} />
        {saved ? 'Saved!' : 'Save Changes'}
      </button>
    </div>
  );
}

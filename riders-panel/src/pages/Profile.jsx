import { useState } from 'react'
import { useApp } from '../AppContext'

function mask(str, keep = 4) {
  if (!str) return '—'
  const s = String(str).replace(/\s/g, '')
  return '•'.repeat(Math.max(0, s.length - keep)) + s.slice(-keep)
}

function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-surface rounded-2xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <span className="font-body font-semibold text-white text-sm">{title}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-white/5 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value, badge }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-white/5 last:border-0">
      <span className="text-muted text-xs font-body">{label}</span>
      <div className="text-right">
        <span className="text-white text-xs font-body font-medium">{value}</span>
        {badge && (
          <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-body ${
            badge === 'Verified' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
          }`}>{badge}</span>
        )}
      </div>
    </div>
  )
}

export default function Profile() {
  const { rider, logout } = useApp()
  const r = rider || {
    name: 'Arjun Sharma', phone: '+91 98765 43210', email: 'arjun@example.com',
    rating: 4.8, total_rides: 342, member_since: '2023-01-15',
    vehicle_details: { vehicle_no: 'MH 12 AB 3456', vehicle_rc_no: 'RC2345678', puc_certificate_no: 'PUC987654', puc_validity: '2025-12-31', category: 'Bike' },
    bank_details: { bank_name: 'HDFC Bank', account_no: '50100123456789', ifsc_code: 'HDFC0001234' },
    driving_liscence_no: 'MH1220230012345', adhaar_card_no: '123456789012', pan_card_no: 'ABCDE1234F',
  }

  const initials = r.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const memberYear = new Date(r.member_since).getFullYear()

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="w-full px-8 pt-8 pb-8">

        <h1 className="font-display text-4xl text-white mb-6">PROFILE</h1>

        <div className="grid grid-cols-3 gap-6">

          {/* Left column: Avatar + Stats */}
          <div className="col-span-1 flex flex-col gap-4">
            <div className="bg-surface rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center font-display text-black text-3xl shadow-[0_0_24px_rgba(255,215,0,0.25)] mb-3">
                {initials}
              </div>
              <h2 className="font-display text-2xl text-white">{r.name}</h2>
              <p className="text-muted text-sm font-body mt-1">{r.phone}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Total Rides', value: r.total_rides },
                { label: 'Rating', value: `★ ${r.rating}` },
                { label: 'Member Since', value: memberYear },
              ].map(s => (
                <div key={s.label} className="bg-surface rounded-xl px-5 py-3 flex items-center justify-between">
                  <p className="text-muted text-xs font-body">{s.label}</p>
                  <p className="font-display text-xl text-white">{s.value}</p>
                </div>
              ))}
            </div>

            <button
              onClick={logout}
              className="w-full py-3 border border-red-500/40 text-red-400 font-display text-lg tracking-wider rounded-2xl hover:bg-red-500/5 transition-colors"
            >
              LOGOUT
            </button>
          </div>

          {/* Right column: Sections */}
          <div className="col-span-2">
            <Section title="Vehicle Details" defaultOpen>
              <InfoRow label="Vehicle No." value={r.vehicle_details?.vehicle_no} />
              <InfoRow label="Category" value={r.vehicle_details?.category || 'Bike'} />
              <InfoRow label="RC Number" value={mask(r.vehicle_details?.vehicle_rc_no, 5)} />
              <InfoRow label="PUC No." value={mask(r.vehicle_details?.puc_certificate_no, 4)} />
              <InfoRow label="PUC Validity" value={r.vehicle_details?.puc_validity} />
            </Section>

            <Section title="Documents">
              <InfoRow label="Driving Licence" value={mask(r.driving_liscence_no, 5)} badge="Verified" />
              <InfoRow label="Aadhaar Card" value={mask(r.adhaar_card_no, 4)} badge="Verified" />
              <InfoRow label="PAN Card" value={mask(r.pan_card_no, 4)} badge="Pending" />
            </Section>

            <Section title="Bank Details">
              <InfoRow label="Bank" value={r.bank_details?.bank_name} />
              <InfoRow label="Account No." value={mask(r.bank_details?.account_no, 4)} />
              <InfoRow label="IFSC Code" value={r.bank_details?.ifsc_code} />
            </Section>

            <Section title="Account">
              <InfoRow label="Email" value={r.email} />
              <InfoRow label="Member Since" value={new Date(r.member_since).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })} />
            </Section>
          </div>

        </div>
      </div>
    </div>
  )
}

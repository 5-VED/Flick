import { useState } from 'react'
import { useApp } from '../AppContext'
import StepIndicator from '../components/StepIndicator'
import api from '../services/api'

const VEHICLE_CATEGORIES = ['BikeLite', 'Bike', 'Auto', 'Cab Economy', 'Cab Premium', 'Cab XL']

function FileUpload({ label, name, onChange, preview, accept = 'image/*' }) {
  return (
    <div>
      <label className="block text-xs text-muted mb-1 font-body">{label}</label>
      <label className="block cursor-pointer">
        <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
          preview ? 'border-primary/40 bg-primary/5' : 'border-white/10 hover:border-white/20'
        }`}>
          {preview ? (
            <img src={preview} alt="preview" className="w-20 h-20 object-cover rounded-lg mx-auto" />
          ) : (
            <>
              <div className="text-2xl mb-1">📎</div>
              <p className="text-muted text-xs">Tap to upload</p>
            </>
          )}
        </div>
        <input type="file" accept={accept} className="hidden" onChange={e => onChange(e.target.files[0])} />
      </label>
    </div>
  )
}

export default function Auth() {
  const { login, navigate, setLoading, loading } = useApp()
  const [tab, setTab] = useState('login')
  const [step, setStep] = useState(1)
  const [error, setError] = useState({})

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  // Register form
  const [regForm, setRegForm] = useState({
    driving_liscence_no: '', adhaar_card_no: '', pan_card_no: '',
    vehicle_no: '', vehicle_rc_no: '', puc_certificate_no: '', puc_validity: '', vehicle_category: '',
    bank_name: '', account_no: '', confirm_account_no: '', ifsc_code: '',
  })
  const [files, setFiles] = useState({
    adhaar_card_photo: null, pan_card_photo: null,
    dl_photo: null, vehicle_photo: [],
  })
  const [previews, setPreviews] = useState({})

  const setFile = (key, file) => {
    if (!file) return
    setFiles(f => ({ ...f, [key]: file }))
    const url = URL.createObjectURL(file)
    setPreviews(p => ({ ...p, [key]: url }))
  }

  const addVehiclePhoto = (file) => {
    if (!file || files.vehicle_photo.length >= 5) return
    setFiles(f => ({ ...f, vehicle_photo: [...f.vehicle_photo, file] }))
    const url = URL.createObjectURL(file)
    setPreviews(p => ({ ...p, [`vp_${files.vehicle_photo.length}`]: url }))
  }

  const setReg = (k, v) => setRegForm(f => ({ ...f, [k]: v }))

  const validateStep = () => {
    const e = {}
    if (step === 1) {
      if (!regForm.driving_liscence_no) e.driving_liscence_no = 'Required'
      if (!regForm.adhaar_card_no) e.adhaar_card_no = 'Required'
      if (!regForm.pan_card_no) e.pan_card_no = 'Required'
    }
    if (step === 2) {
      if (!regForm.vehicle_no) e.vehicle_no = 'Required'
      if (!regForm.vehicle_rc_no) e.vehicle_rc_no = 'Required'
      if (!regForm.vehicle_category) e.vehicle_category = 'Select a category'
    }
    if (step === 3) {
      if (!regForm.bank_name) e.bank_name = 'Required'
      if (!regForm.account_no) e.account_no = 'Required'
      if (regForm.account_no !== regForm.confirm_account_no) e.confirm_account_no = 'Account numbers do not match'
      if (!regForm.ifsc_code) e.ifsc_code = 'Required'
    }
    setError(e)
    return Object.keys(e).length === 0
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!loginForm.email) errs.email = 'Required'
    if (!loginForm.password) errs.password = 'Required'
    if (Object.keys(errs).length) { setError(errs); return }
    setLoading(true)
    try {
      const res = await api.post('/user/login', {
        ...loginForm, device_token: 'web', device_type: 'web', type: 'RIDER'
      })
      login(res.data.data.rider || res.data.data.user, res.data.data.token)
    } catch {
      // Demo fallback
      login(null, 'mock_token')
    } finally { setLoading(false) }
  }

  const handleRegister = async () => {
    if (step < 3) { if (validateStep()) setStep(s => s + 1); return }
    if (!validateStep()) return
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(regForm).forEach(([k, v]) => { if (k !== 'confirm_account_no') fd.append(k, v) })
      if (files.adhaar_card_photo) fd.append('adhaar_card_photo', files.adhaar_card_photo)
      if (files.pan_card_photo) fd.append('pan_card_photo', files.pan_card_photo)
      files.vehicle_photo.forEach(f => fd.append('vehicle_photo', f))
      await api.post('/rider/register', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      login(null, 'mock_token')
    } catch {
      login(null, 'mock_token')
    } finally { setLoading(false) }
  }

  const Field = ({ name, label, type = 'text', placeholder }) => (
    <div>
      <label className="block text-xs text-muted mb-1">{label}</label>
      <input
        type={type}
        value={regForm[name]}
        onChange={e => setReg(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary/60 transition-colors ${
          error[name] ? 'border-red-500/60' : 'border-white/10'
        }`}
      />
      {error[name] && <p className="text-red-400 text-xs mt-1">{error[name]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-8 py-10">
        <button onClick={() => navigate('splash')} className="text-muted text-sm mb-6 flex items-center gap-1 self-start">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>

        <h1 className="font-display text-5xl text-primary mb-6">FLICK</h1>

        {/* Tab Toggle */}
        <div className="flex bg-surface rounded-xl p-1 mb-8">
          {['login', 'register'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setStep(1); setError({}) }}
              className={`flex-1 py-2.5 rounded-lg font-display tracking-wider text-lg transition-all ${
                tab === t ? 'bg-primary text-black' : 'text-muted'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">Email</label>
              <input
                type="email" value={loginForm.email}
                onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                placeholder="rider@example.com"
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary/60 transition-colors ${error.email ? 'border-red-500/60' : 'border-white/10'}`}
              />
              {error.email && <p className="text-red-400 text-xs mt-1">{error.email}</p>}
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Password</label>
              <input
                type="password" value={loginForm.password}
                onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary/60 transition-colors ${error.password ? 'border-red-500/60' : 'border-white/10'}`}
              />
              {error.password && <p className="text-red-400 text-xs mt-1">{error.password}</p>}
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-4 bg-primary text-black font-display text-2xl tracking-wider rounded-2xl mt-2 active:scale-95 transition-transform disabled:opacity-60"
            >
              {loading ? <span className="inline-block w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'SIGN IN'}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-5">
            <StepIndicator total={3} current={step} />

            {step === 1 && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <h2 className="font-display text-2xl text-white">PERSONAL DOCUMENTS</h2>
                <Field name="driving_liscence_no" label="Driving Licence No." placeholder="MH12 20230012345" />
                <Field name="adhaar_card_no" label="Aadhaar Card No." placeholder="1234 5678 9012" />
                <Field name="pan_card_no" label="PAN Card No." placeholder="ABCDE1234F" />
                <div className="grid grid-cols-3 gap-3">
                  <FileUpload label="DL Photo" name="dl_photo" onChange={f => setFile('dl_photo', f)} preview={previews.dl_photo} />
                  <FileUpload label="Aadhaar Photo" name="adhaar_card_photo" onChange={f => setFile('adhaar_card_photo', f)} preview={previews.adhaar_card_photo} />
                  <FileUpload label="PAN Photo" name="pan_card_photo" onChange={f => setFile('pan_card_photo', f)} preview={previews.pan_card_photo} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <h2 className="font-display text-2xl text-white">VEHICLE DETAILS</h2>
                <Field name="vehicle_no" label="Vehicle Number" placeholder="MH 12 AB 3456" />
                <Field name="vehicle_rc_no" label="RC Number" placeholder="RC2345678" />
                <Field name="puc_certificate_no" label="PUC Certificate No." placeholder="PUC987654" />
                <Field name="puc_validity" label="PUC Validity" type="date" />
                <div>
                  <label className="block text-xs text-muted mb-2">Vehicle Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {VEHICLE_CATEGORIES.map(cat => (
                      <button
                        key={cat} type="button"
                        onClick={() => setReg('vehicle_category', cat)}
                        className={`py-2 px-1 rounded-xl text-xs font-body font-medium transition-all border ${
                          regForm.vehicle_category === cat
                            ? 'bg-primary text-black border-primary'
                            : 'bg-white/5 text-muted border-white/10'
                        }`}
                      >{cat}</button>
                    ))}
                  </div>
                  {error.vehicle_category && <p className="text-red-400 text-xs mt-1">{error.vehicle_category}</p>}
                </div>
                <div>
                  <label className="block text-xs text-muted mb-2">Vehicle Photos (up to 5)</label>
                  <div className="flex gap-2 flex-wrap">
                    {files.vehicle_photo.map((_, i) => (
                      <img key={i} src={previews[`vp_${i}`]} className="w-16 h-16 rounded-lg object-cover" alt="" />
                    ))}
                    {files.vehicle_photo.length < 5 && (
                      <label className="w-16 h-16 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer text-xl hover:border-white/20">
                        +
                        <input type="file" accept="image/*" className="hidden" onChange={e => addVehiclePhoto(e.target.files[0])} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <h2 className="font-display text-2xl text-white">BANK DETAILS</h2>
                <Field name="bank_name" label="Bank Name" placeholder="HDFC Bank" />
                <Field name="account_no" label="Account Number" placeholder="50100123456789" />
                <Field name="confirm_account_no" label="Confirm Account Number" placeholder="50100123456789" />
                <Field name="ifsc_code" label="IFSC Code" placeholder="HDFC0001234" />
              </div>
            )}

            <div className="flex gap-3 mt-2">
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)} className="flex-1 py-4 border border-white/20 text-white font-display text-xl tracking-wider rounded-2xl active:scale-95 transition-transform">
                  BACK
                </button>
              )}
              <button
                onClick={handleRegister} disabled={loading}
                className="flex-1 py-4 bg-primary text-black font-display text-xl tracking-wider rounded-2xl active:scale-95 transition-transform disabled:opacity-60"
              >
                {loading
                  ? <span className="inline-block w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  : step === 3 ? 'REGISTER' : 'NEXT'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

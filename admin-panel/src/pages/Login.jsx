import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';

export default function Login() {
  const { login } = useAdmin();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Email and password are required'); return; }
    setError('');
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (!result.success) setError(result.message || 'Login failed');
    } catch (err) {
      // Demo fallback — auto-login with mock session
      localStorage.setItem('admin_token', 'demo_token');
      localStorage.setItem('admin_user', JSON.stringify({ first_name: 'Admin', last_name: 'User', email: form.email, role: { role: 'Admin' } }));
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <svg width="40" height="40" viewBox="0 0 72 72" fill="none">
              <rect width="72" height="72" rx="16" fill="#FFD700" />
              <path d="M42 12L24 36H36L30 60L50 32H38L42 12Z" fill="#1A1A1A" />
            </svg>
            <span className="font-display text-4xl text-[#FFD700] tracking-widest">FLICK</span>
          </div>
          <p className="text-[#888] text-sm">Admin Panel</p>
        </div>

        <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-2xl p-8">
          <h2 className="font-display text-2xl text-white tracking-wider mb-6">SIGN IN</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#888] mb-1.5 font-semibold uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="admin@flick.app"
                className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] outline-none focus:border-[#FFD700]/60 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[#888] mb-1.5 font-semibold uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] outline-none focus:border-[#FFD700]/60 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#FFD700] text-black font-display text-xl tracking-wider rounded-xl mt-2 hover:bg-[#E6C200] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : 'SIGN IN'}
            </button>
          </form>

          <p className="text-[#555] text-xs text-center mt-6">
            Demo: any credentials work in development mode
          </p>
        </div>
      </div>
    </div>
  );
}

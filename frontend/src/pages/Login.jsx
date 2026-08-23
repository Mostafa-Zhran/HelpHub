import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Shield, Users, AlertCircle, Eye, EyeOff } from 'lucide-react'

const API = 'https://helphub-production-3b59.up.railway.app/api/'

export default function Login() {
  const [tab, setTab] = useState('admin')   // 'admin' | 'volunteer'
  const navigate = useNavigate()

  // Admin form
  const [adminForm, setAdminForm] = useState({ usernameOrEmail: '', password: '' })
  // Volunteer form
  const [volForm, setVolForm] = useState({ email: '', password: '' })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handleAdmin = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: adminForm.usernameOrEmail, password: adminForm.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Authentication failed.')
      sessionStorage.setItem('helphub_admin', JSON.stringify({ username: data.admin?.username || adminForm.usernameOrEmail, email: data.admin?.email, token: data.token }))
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVolunteer = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch(`${API}/volunteer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(volForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Authentication failed.')
      sessionStorage.setItem('helphub_volunteer', JSON.stringify({ ...data.volunteer, token: data.token }))
      navigate('/volunteer-dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 animate-fade-in">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center mx-auto shadow-lg">
            <Shield size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">HelpHub Portal</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Select your role to sign in</p>
        </div>

        {/* Role Tabs */}
        <div className="flex rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button
            onClick={() => { setTab('admin'); setError('') }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all ${tab === 'admin'
              ? 'bg-blue-700 text-white'
              : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <Shield size={14} /> Admin
          </button>
          <button
            onClick={() => { setTab('volunteer'); setError('') }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all border-l border-slate-200 dark:border-slate-800 ${tab === 'volunteer'
              ? 'bg-blue-700 text-white'
              : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <Users size={14} /> Volunteer
          </button>
        </div>

        {/* ── ADMIN FORM ── */}
        {tab === 'admin' && (
          <div className="card-formal p-8 space-y-5">
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield size={15} className="text-blue-600 dark:text-blue-400" />
                Admin Sign In
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Access the administrative control panel</p>
            </div>

            <form onSubmit={handleAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Email or Username</label>
                <input
                  id="admin-username"
                  type="text"
                  value={adminForm.usernameOrEmail}
                  onChange={e => setAdminForm(f => ({ ...f, usernameOrEmail: e.target.value }))}
                  required
                  placeholder="admin@helphub.edu or Mostafa"
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Password</label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPwd ? 'text' : 'password'}
                    value={adminForm.password}
                    onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))}
                    required
                    placeholder="••••••••"
                    className="form-input pr-10"
                  />
                  <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                  <AlertCircle size={14} className="shrink-0" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                <Lock size={15} />
                {loading ? 'Authenticating…' : 'Sign In as Admin'}
              </button>
            </form>
          </div>
        )}

        {/* ── VOLUNTEER FORM ── */}
        {tab === 'volunteer' && (
          <div className="card-formal p-8 space-y-5">
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users size={15} className="text-blue-600 dark:text-blue-400" />
                Volunteer Sign In
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Use the email and password set by your administrator</p>
            </div>

            <form onSubmit={handleVolunteer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Registered Email</label>
                <input
                  id="volunteer-email"
                  type="email"
                  value={volForm.email}
                  onChange={e => setVolForm(f => ({ ...f, email: e.target.value }))}
                  required
                  placeholder="your@email.com"
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Password</label>
                <div className="relative">
                  <input
                    id="volunteer-password"
                    type={showPwd ? 'text' : 'password'}
                    value={volForm.password}
                    onChange={e => setVolForm(f => ({ ...f, password: e.target.value }))}
                    required
                    placeholder="••••••••"
                    className="form-input pr-10"
                  />
                  <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                  <AlertCircle size={14} className="shrink-0" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                <Lock size={15} />
                {loading ? 'Authenticating…' : 'Sign In as Volunteer'}
              </button>

              <p className="text-center text-[11px] text-slate-400">
                Don't have login credentials? Contact your administrator.
              </p>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}

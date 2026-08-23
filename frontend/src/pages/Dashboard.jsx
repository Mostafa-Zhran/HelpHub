import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, HeartHandshake, Mail, MessageSquare,
  LogOut, LayoutDashboard, CheckCircle, XCircle, Eye,
  RefreshCw, ChevronRight, Search, Shield, UserPlus, Trash2, KeyRound
} from 'lucide-react'

import API from '../config'

function useAdminAuth() {
  const navigate = useNavigate()
  const [admin] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('helphub_admin')) } catch { return null }
  })
  useEffect(() => { if (!admin) navigate('/login') }, [admin, navigate])
  return admin
}

function StatusBadge({ value }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-bold capitalize ${value === 'approved' ? 'status-approved' :
      value === 'rejected' ? 'status-rejected' :
        value === 'completed' ? 'status-completed' :
          value === 'urgent' || value === 'critical' ? 'status-unread' :
            value === 'unread' ? 'status-unread' :
              value === 'read' ? 'status-completed' :
                'status-pending'
      }`}>
      {value}
    </span>
  )
}

const NAV = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'volunteers', label: 'Volunteers', icon: Users },
  { key: 'helprequests', label: 'Help Requests', icon: HeartHandshake },
  { key: 'messages', label: 'Messages', icon: Mail },
  { key: 'admins', label: 'Admins', icon: Shield },
]

export default function Dashboard() {
  const admin = useAdminAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [data, setData] = useState({ volunteers: [], helpRequests: [], messages: [], stats: {} })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  // state for set-password modal: { id, name } | null
  const [setVolPwd, setSetVolPwd] = useState(null)
  const [newPwd, setNewPwd] = useState('')
  const [pwdMsg, setPwdMsg] = useState({ text: '', ok: false })
  const [pwdLoading, setPwdLoading] = useState(false)

  // admins sub-state
  const [adminList, setAdminList] = useState([])
  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [adminMsg, setAdminMsg] = useState({ text: '', ok: false })
  const [adminLoading, setAdminLoading] = useState(false)

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${admin?.token ?? ''}` }

  const fetchAll = useCallback(async () => {
    if (!admin) return
    setLoading(true)
    try {
      const [vs, hs, ms, ss] = await Promise.all([
        fetch(`${API}/admin/volunteers`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/admin/help-requests`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/admin/messages`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/admin/stats`, { headers: authHeaders }).then(r => r.json()),
      ])
      setData({
        volunteers: vs.data ?? [],
        helpRequests: hs.data ?? [],
        messages: ms.data ?? [],
        stats: ss.data ?? {},
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [admin])

  const fetchAdmins = useCallback(async () => {
    if (!admin) return
    const res = await fetch(`${API}/admin/admins`, { headers: authHeaders }).then(r => r.json())
    setAdminList(res.data ?? [])
  }, [admin])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => { if (tab === 'admins') fetchAdmins() }, [tab, fetchAdmins])

  const logout = () => { sessionStorage.removeItem('helphub_admin'); navigate('/login') }

  const updateStatus = async (endpoint, id, status) => {
    await fetch(`${API}/admin/${endpoint}/${id}/status`, {
      method: 'PATCH', headers: authHeaders, body: JSON.stringify({ status }),
    })
    fetchAll(); setSelected(null)
  }

  const deleteRecord = async (endpoint, id) => {
    if (!window.confirm('Delete this record?')) return
    await fetch(`${API}/admin/${endpoint}/${id}`, { method: 'DELETE', headers: authHeaders })
    fetchAll()
  }

  // ── CREATE ADMIN ────────────────────────────────────────────────────────
  const handleCreateAdmin = async e => {
    e.preventDefault()
    setAdminMsg({ text: '', ok: false })
    if (newAdmin.password !== newAdmin.confirmPassword) {
      return setAdminMsg({ text: 'Passwords do not match.', ok: false })
    }
    setAdminLoading(true)
    try {
      const res = await fetch(`${API}/admin/admins`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ username: newAdmin.username, email: newAdmin.email, password: newAdmin.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setAdminMsg({ text: `Admin "${newAdmin.username}" created successfully.`, ok: true })
      setNewAdmin({ username: '', email: '', password: '', confirmPassword: '' })
      fetchAdmins()
    } catch (err) {
      setAdminMsg({ text: err.message, ok: false })
    } finally {
      setAdminLoading(false)
    }
  }

  const handleDeleteAdmin = async id => {
    if (!window.confirm('Delete this admin account?')) return
    await fetch(`${API}/admin/admins/${id}`, { method: 'DELETE', headers: authHeaders })
    fetchAdmins()
  }

  // ── OVERVIEW ────────────────────────────────────────────────────────────
  const Overview = () => {
    const cards = [
      { label: 'Total Volunteers', value: data.stats.volunteers ?? data.volunteers.length, icon: Users },
      { label: 'Help Requests', value: data.stats.helpRequests ?? data.helpRequests.length, icon: HeartHandshake },
      { label: 'Messages', value: data.stats.messages ?? data.messages.length, icon: Mail },
      { label: 'Pending Requests', value: data.helpRequests.filter(r => r.status === 'pending').length, icon: ChevronRight },
    ]
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Executive Overview</h2>
          <span className="badge-formal">Live System Sync</span>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
          {cards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="card-formal p-6 border-l-4 border-l-blue-600 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
                <Icon size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Help Requests</h3>
          <div className="card-formal overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  {['Student', 'Service', 'Urgency', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.helpRequests.slice(0, 6).map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">{r.name || r.full_name}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{r.service || r.service_type}</td>
                    <td className="px-5 py-3.5"><StatusBadge value={r.urgency} /></td>
                    <td className="px-5 py-3.5"><StatusBadge value={r.status ?? 'pending'} /></td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ── VOLUNTEERS TAB ──────────────────────────────────────────────────────
  const VolunteersTab = () => {
    const filtered = data.volunteers.filter(v =>
      (v.name || v.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.service || v.service_type || '').toLowerCase().includes(search.toLowerCase())
    )
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Volunteer Roster ({filtered.length})</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter roster…" className="form-input pl-10 py-2 text-xs w-64" />
          </div>
        </div>
        <div className="card-formal overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                {['Volunteer', 'Email', 'Service Area', 'Availability', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">{v.name || v.full_name}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{v.email}</td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">{v.service || v.service_type}</td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 text-xs capitalize">{v.availability}</td>
                  <td className="px-5 py-3.5"><StatusBadge value={v.status ?? 'pending'} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={() => setSelected({ type: 'Volunteer', item: v })} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" title="View"><Eye size={14} /></button>
                      <button onClick={() => updateStatus('volunteers', v.id, 'approved')} className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-300" title="Approve"><CheckCircle size={14} /></button>
                      <button onClick={() => updateStatus('volunteers', v.id, 'rejected')} className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-800/40 dark:text-rose-300" title="Reject"><XCircle size={14} /></button>
                      <button onClick={() => { setSetVolPwd({ id: v.id, name: v.name || v.full_name }); setNewPwd(''); setPwdMsg({ text: '', ok: false }) }} className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:border-amber-800/40 dark:text-amber-300" title="Set Login Password"><KeyRound size={14} /></button>
                      <button onClick={() => deleteRecord('volunteers', v.id)} className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ── HELP REQUESTS TAB ───────────────────────────────────────────────────
  const HelpRequestsTab = () => {
    const filtered = data.helpRequests.filter(r =>
      (r.name || r.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.service || r.service_type || '').toLowerCase().includes(search.toLowerCase())
    )
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Help Requests ({filtered.length})</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter requests…" className="form-input pl-10 py-2 text-xs w-64" />
          </div>
        </div>
        <div className="card-formal overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                {['Student', 'Service', 'Urgency', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">{r.name || r.full_name}</td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">{r.service || r.service_type}</td>
                  <td className="px-5 py-3.5"><StatusBadge value={r.urgency} /></td>
                  <td className="px-5 py-3.5"><StatusBadge value={r.status ?? 'pending'} /></td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5">
                      <button onClick={() => setSelected({ type: 'Help Request', item: r })} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" title="View"><Eye size={14} /></button>
                      <button onClick={() => updateStatus('help-requests', r.id, 'approved')} className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-300" title="Approve"><CheckCircle size={14} /></button>
                      <button onClick={() => updateStatus('help-requests', r.id, 'completed')} className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:border-blue-800/40 dark:text-blue-300" title="Complete"><ChevronRight size={14} /></button>
                      <button onClick={() => deleteRecord('help-requests', r.id)} className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ── MESSAGES TAB ────────────────────────────────────────────────────────
  const MessagesTab = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Messages ({data.messages.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.messages.map(m => (
          <div key={m.id} className="card-formal p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-900 dark:text-white">{m.name}</p>
              <StatusBadge value={m.status ?? 'unread'} />
            </div>
            {m.subject && <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{m.subject}</p>}
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">{m.message}</p>
            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-mono">{new Date(m.created_at).toLocaleDateString()}</span>
              <button onClick={() => setSelected({ type: 'Message', item: m })} className="btn-outline py-1 px-3 text-xs">Read</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // ── ADMINS TAB ──────────────────────────────────────────────────────────
  const AdminsTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <Shield size={22} className="text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Management</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Create Admin Form */}
        <div className="card-formal p-7 space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus size={18} className="text-blue-600 dark:text-blue-400" />
              Create New Admin
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New admins can log in to the dashboard with the credentials you provide.
            </p>
          </div>

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Username</label>
              <input
                type="text"
                value={newAdmin.username}
                onChange={e => setNewAdmin(a => ({ ...a, username: e.target.value }))}
                required
                placeholder="Enter username"
                className="form-input"
                minLength={3}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Admin Email</label>
              <input
                type="email"
                value={newAdmin.email}
                onChange={e => setNewAdmin(a => ({ ...a, email: e.target.value }))}
                required
                placeholder="admin@helphub.edu"
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Password</label>
              <input
                type="password"
                value={newAdmin.password}
                onChange={e => setNewAdmin(a => ({ ...a, password: e.target.value }))}
                required
                placeholder="Min. 6 characters"
                className="form-input"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Confirm Password</label>
              <input
                type="password"
                value={newAdmin.confirmPassword}
                onChange={e => setNewAdmin(a => ({ ...a, confirmPassword: e.target.value }))}
                required
                placeholder="Repeat password"
                className="form-input"
                minLength={6}
              />
            </div>

            {adminMsg.text && (
              <p className={`text-xs font-semibold ${adminMsg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                {adminMsg.ok ? '✓ ' : '⚠ '}{adminMsg.text}
              </p>
            )}

            <button type="submit" disabled={adminLoading} className="btn-primary w-full justify-center">
              {adminLoading ? 'Creating…' : <><UserPlus size={15} /> Create Admin Account</>}
            </button>
          </form>
        </div>

        {/* Existing Admins List */}
        <div className="card-formal p-7 space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Existing Admins</h3>
          <div className="space-y-2">
            {adminList.length === 0 && (
              <p className="text-slate-400 text-sm">No admin accounts in database yet.</p>
            )}
            {adminList.map(a => (
              <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="space-y-0.5">
                  <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield size={14} className="text-blue-600 dark:text-blue-400" />
                    {a.username}
                  </p>
                  {a.email && <p className="text-xs text-slate-500 font-mono">{a.email}</p>}
                  <p className="text-[11px] text-slate-400 font-mono">
                    Added {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAdmin(a.id)}
                  className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-800/40 dark:text-rose-300"
                  title="Delete Admin"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // ── RECORD DETAIL MODAL ─────────────────────────────────────────────────
  const Modal = () => {
    if (!selected) return null
    const { type, item } = selected
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <div className="card-formal p-8 max-w-lg w-full space-y-6 shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{type} — Record Detail</h3>
            <button onClick={() => setSelected(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white">✕</button>
          </div>
          <div className="space-y-2.5">
            {Object.entries(item).map(([k, v]) => (
              <div key={k} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{k.replace(/_/g, ' ')}</span>
                <p className="text-xs font-semibold text-slate-900 dark:text-white break-words mt-0.5">{String(v ?? '—')}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setSelected(null)} className="btn-primary w-full justify-center text-xs">Close Panel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors animate-fade-in">

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shrink-0">
        <div className="p-6 font-extrabold text-lg border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Shield size={16} />
          </div>
          HelpHub Admin
        </div>

        <nav className="flex-grow p-4 space-y-1">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSearch('') }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${tab === key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 mb-2 px-2">Signed in as <strong>{admin?.username ?? 'Admin'}</strong></p>
          <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow overflow-auto">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider">Administrative Session</p>
            <p className="text-base font-bold text-slate-900 dark:text-white">HelpHub Control Panel</p>
          </div>
          <button onClick={fetchAll} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" title="Refresh data">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        {/* Mobile nav */}
        <div className="lg:hidden flex gap-2 px-6 pt-4 overflow-x-auto">
          {NAV.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSearch('') }}
              className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold ${tab === key ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {loading
            ? <div className="flex items-center gap-3 text-slate-400 py-20 justify-center"><RefreshCw size={20} className="animate-spin" /> Fetching Records…</div>
            : tab === 'overview' ? <Overview />
              : tab === 'volunteers' ? <VolunteersTab />
                : tab === 'helprequests' ? <HelpRequestsTab />
                  : tab === 'messages' ? <MessagesTab />
                    : tab === 'admins' ? <AdminsTab />
                      : null
          }
        </div>
      </div>

      {/* Set-Password Modal */}
      {setVolPwd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="card-formal p-8 max-w-md w-full space-y-5 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <KeyRound size={16} className="text-amber-600 dark:text-amber-400" />
                  Set Volunteer Password
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Volunteer: <strong>{setVolPwd.name}</strong></p>
              </div>
              <button onClick={() => setSetVolPwd(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={async e => {
              e.preventDefault()
              setPwdMsg({ text: '', ok: false })
              if (newPwd.length < 6) return setPwdMsg({ text: 'Password must be at least 6 characters.', ok: false })
              setPwdLoading(true)
              try {
                const res = await fetch(`${API}/admin/volunteers/${setVolPwd.id}/set-password`, {
                  method: 'PATCH', headers: authHeaders, body: JSON.stringify({ password: newPwd })
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.message)
                setPwdMsg({ text: `Password set! ${setVolPwd.name} can now log in.`, ok: true })
                setNewPwd('')
              } catch (err) {
                setPwdMsg({ text: err.message, ok: false })
              } finally {
                setPwdLoading(false)
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">New Password</label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="form-input"
                />
              </div>

              {pwdMsg.text && (
                <p className={`text-xs font-semibold ${pwdMsg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {pwdMsg.ok ? '✓ ' : '⚠ '}{pwdMsg.text}
                </p>
              )}

              <div className="flex gap-3">
                <button type="submit" disabled={pwdLoading} className="btn-primary flex-1 justify-center text-xs">
                  <KeyRound size={14} />
                  {pwdLoading ? 'Setting…' : 'Set Password'}
                </button>
                <button type="button" onClick={() => setSetVolPwd(null)} className="btn-outline text-xs">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal />
    </div>
  )
}

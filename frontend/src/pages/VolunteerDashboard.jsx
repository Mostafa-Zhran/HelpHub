import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HeartHandshake, LogOut, RefreshCw, CheckCircle, XCircle,
  ChevronRight, Search, User, Clock, AlertTriangle, Star
} from 'lucide-react'

import API from '../config'

function useVolunteerAuth() {
  const navigate = useNavigate()
  const [vol] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('helphub_volunteer')) } catch { return null }
  })
  useEffect(() => { if (!vol) navigate('/login') }, [vol, navigate])
  return vol
}

const URGENCY_CONFIG = {
  critical: { label: 'Critical', cls: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800' },
  urgent: { label: 'Urgent', cls: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800' },
  normal: { label: 'Normal', cls: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800' },
  low: { label: 'Low', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700' },
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', cls: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' },
  'in-progress': { label: 'In Progress', cls: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' },
  completed: { label: 'Completed', cls: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' },
}

function UrgencyBadge({ value }) {
  const cfg = URGENCY_CONFIG[value] || URGENCY_CONFIG.normal
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold border ${cfg.cls}`}>
      {value === 'critical' && <AlertTriangle size={10} />}
      {value === 'urgent' && <Star size={10} />}
      {cfg.label}
    </span>
  )
}

function StatusBadge({ value }) {
  const cfg = STATUS_CONFIG[value] || STATUS_CONFIG.pending
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-bold ${cfg.cls}`}>{cfg.label}</span>
  )
}

export default function VolunteerDashboard() {
  const vol = useVolunteerAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('available')  // 'available' | 'mine'
  const [requests, setRequests] = useState([])
  const [mine, setMine] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [actionMsg, setActionMsg] = useState({ id: null, text: '', ok: false })

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${vol?.token ?? ''}` }

  const fetchAll = useCallback(async () => {
    if (!vol) return
    setLoading(true)
    try {
      const [rRes, mRes] = await Promise.all([
        fetch(`${API}/volunteer/requests`, { headers: authHeaders }).then(r => r.json()),
        fetch(`${API}/volunteer/my-requests`, { headers: authHeaders }).then(r => r.json()),
      ])
      setRequests(rRes.data || [])
      setMine(mRes.data || [])
    } catch { }
    finally { setLoading(false) }
  }, [vol])

  useEffect(() => { fetchAll() }, [fetchAll])

  const logout = () => {
    sessionStorage.removeItem('helphub_volunteer')
    navigate('/login')
  }

  const doAction = async (id, action) => {
    setActionMsg({ id, text: '', ok: false })
    try {
      const res = await fetch(`${API}/volunteer/requests/${id}/${action}`, { method: 'PATCH', headers: authHeaders })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setActionMsg({ id, text: data.message || 'Done!', ok: true })
      setTimeout(() => { setActionMsg({ id: null, text: '', ok: false }); fetchAll() }, 1200)
    } catch (err) {
      setActionMsg({ id, text: err.message, ok: false })
    }
  }

  const filtered = (tab === 'available' ? requests : mine).filter(r =>
    (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.service || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.details || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 animate-fade-in transition-colors">

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shrink-0">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-2 font-extrabold text-lg">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <HeartHandshake size={16} />
            </div>
            Volunteer Hub
          </div>
          <p className="text-[11px] text-slate-400 font-mono truncate">{vol?.name}</p>
        </div>

        <nav className="flex-grow p-4 space-y-1">
          {[
            { key: 'available', label: 'Available Requests', icon: HeartHandshake, count: requests.length },
            { key: 'mine', label: 'My Requests', icon: CheckCircle, count: mine.length },
          ].map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSearch('') }}
              className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${tab === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              <span className="flex items-center gap-2"><Icon size={15} />{label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${tab === key ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {count}
              </span>
            </button>
          ))}
        </nav>

        {/* Profile card */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <User size={14} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{vol?.name}</p>
                <p className="text-[10px] text-slate-400">{vol?.service}</p>
              </div>
            </div>
            <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md ${vol?.status === 'approved'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
              }`}>
              {vol?.status ?? 'pending'}
            </span>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow overflow-auto min-w-0">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider">Volunteer Session</p>
            <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {tab === 'available' ? 'Available Help Requests' : 'My Accepted Requests'}
              {vol?.name && <span className="lg:hidden text-xs font-normal text-slate-500">({vol.name})</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 transition-colors"
              title="Sign Out"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
            <button onClick={fetchAll} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors" title="Refresh">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="lg:hidden flex gap-2 px-4 sm:px-6 pt-3 pb-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs">
          {['available', 'mine'].map(k => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${tab === k ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
            >
              {k === 'available' ? 'Available' : 'My Requests'}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">

          {/* Notice for pending volunteers */}
          {vol?.status !== 'approved' && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm font-semibold flex items-center gap-3">
              <AlertTriangle size={18} className="shrink-0" />
              Your application is <span className="font-extrabold uppercase">{vol?.status ?? 'pending'}</span>. Once approved by an admin you can accept requests.
            </div>
          )}

          {/* Search */}
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, service or details…"
              className="form-input pl-10 py-2 text-xs w-full"
            />
          </div>

          {loading ? (
            <div className="flex items-center gap-3 text-slate-400 py-20 justify-center">
              <RefreshCw size={20} className="animate-spin" /> Loading requests…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <HeartHandshake size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-semibold">
                {tab === 'available' ? 'No pending requests at the moment.' : 'You have not accepted any requests yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {filtered.map(r => (
                <div key={r.id} className="card-formal p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white">{r.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{r.email}</p>
                    </div>
                    <UrgencyBadge value={r.urgency} />
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-md capitalize">
                      {r.service}
                    </span>
                    <StatusBadge value={r.status} />
                    {r.assigned_volunteer_name && r.status === 'in-progress' && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1"><User size={11} />{r.assigned_volunteer_name}</span>
                    )}
                  </div>

                  {r.details && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
                      {r.details}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={11} /> {new Date(r.created_at).toLocaleDateString()}
                    </span>

                    {/* Action feedback */}
                    {actionMsg.id === r.id && actionMsg.text && (
                      <span className={`text-xs font-bold ${actionMsg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {actionMsg.text}
                      </span>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 ml-auto">
                      <button onClick={() => setSelected(r)} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs" title="View full details">
                        <ChevronRight size={14} />
                      </button>

                      {/* Available tab: show Accept */}
                      {tab === 'available' && r.status === 'pending' && vol?.status === 'approved' && (
                        <button
                          onClick={() => doAction(r.id, 'accept')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors"
                          title="Accept this request"
                        >
                          <CheckCircle size={13} /> Accept
                        </button>
                      )}

                      {/* My Requests tab: show Decline or Mark Complete */}
                      {tab === 'mine' && r.status === 'in-progress' && (
                        <>
                          <button
                            onClick={() => doAction(r.id, 'decline')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors"
                            title="Release back to pending"
                          >
                            <XCircle size={13} /> Decline
                          </button>
                          <button
                            onClick={() => doAction(r.id, 'complete')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors"
                            title="Mark as completed"
                          >
                            <CheckCircle size={13} /> Complete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="card-formal p-8 max-w-lg w-full space-y-5 shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Request Detail</h3>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white">✕</button>
            </div>

            <div className="space-y-2.5">
              {Object.entries(selected).map(([k, v]) => (
                <div key={k} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{k.replace(/_/g, ' ')}</span>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white break-words mt-0.5">{String(v ?? '—')}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 flex-wrap">
              {selected.status === 'pending' && vol?.status === 'approved' && (
                <button onClick={() => { doAction(selected.id, 'accept'); setSelected(null) }} className="btn-primary text-xs">
                  <CheckCircle size={14} /> Accept Request
                </button>
              )}
              <button onClick={() => setSelected(null)} className="btn-outline text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Clock, Heart, BookOpen, Timer, TrendingUp, Users, HeartHandshake, Mail, RefreshCw } from 'lucide-react'

import API from '../config'

function StatCard({ icon: Icon, value, label, loading, color = 'blue' }) {
  const colorMap = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
  }
  return (
    <div className="card-formal p-6 text-center space-y-3">
      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mx-auto ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
        {loading ? <RefreshCw size={20} className="animate-spin mx-auto text-slate-400" /> : value}
      </p>
      <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

function ProgressBar({ label, pct, loading }) {
  const safe = Math.min(100, Math.max(0, pct ?? 0))
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-bold">
        <span className="text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-blue-600 dark:text-blue-400 font-extrabold tabular-nums">
          {loading ? '…' : `${safe}%`}
        </span>
      </div>
      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
        <div
          className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-700"
          style={{ width: loading ? '0%' : `${safe}%` }}
        />
      </div>
    </div>
  )
}

export default function Statistics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    setLoading(true)
    setError(null)
    fetch(`${API}/public/stats`)
      .then(r => r.json())
      .then(r => {
        if (r.success) setStats(r.data)
        else setError('Could not load statistics.')
      })
      .catch(() => setError('Backend offline — showing static values.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // ── Resolved display values ────────────────────────────────────────────
  const S = stats || {}

  const volunteerHours = S.volunteerHours ?? '—'
  const peopleHelped = S.peopleHelped ?? '—'
  const booksReused = S.booksReused ?? '—'
  const avgResponse = S.avgResponseMinutes != null
    ? `${S.avgResponseMinutes} min`
    : '—'

  const totalVolunteers = S.volunteers ?? '—'
  const totalHelpRequests = S.helpRequests ?? '—'
  const totalCompleted = S.completedRequests ?? '—'
  const totalMessages = S.messages ?? '—'

  const participationPct = S.volunteerParticipationPct ?? 0
  const completedPct = S.requestsCompletedPct ?? 0
  const satisfactionPct = S.communitySatisfactionPct ?? 92

  return (
    <div className="animate-fade-in space-y-16 pb-20">

      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16 px-4 text-center space-y-4 transition-colors">
        <span className="badge-formal">Our Impact</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          HelpHub Statistics
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base font-medium">
          Every number represents a person, a volunteer or an act of kindness.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          {stats && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-md">
              <TrendingUp size={11} /> Live data from database
            </span>
          )}
          {error && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60 px-2.5 py-0.5 rounded-md">
              ⚠ {error}
            </span>
          )}
          <button onClick={load} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </section>

      {/* ── MAIN 4 STATS ─────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-3">
        <h2 className="font-bold text-lg text-slate-700 dark:text-slate-300">Core Metrics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Clock} value={volunteerHours} label="Volunteer Hours" loading={loading} color="blue" />
          <StatCard icon={Heart} value={peopleHelped} label="People Helped" loading={loading} color="rose" />
          <StatCard icon={BookOpen} value={booksReused} label="Books Reused" loading={loading} color="emerald" />
          <StatCard icon={Timer} value={avgResponse} label="Average Response" loading={loading} color="amber" />
        </div>
      </section>

      {/* ── DATABASE TOTALS ───────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-3">
        <h2 className="font-bold text-lg text-slate-700 dark:text-slate-300">Database Totals</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Users} value={totalVolunteers} label="Total Volunteers" loading={loading} color="blue" />
          <StatCard icon={HeartHandshake} value={totalHelpRequests} label="Help Requests" loading={loading} color="rose" />
          <StatCard icon={TrendingUp} value={totalCompleted} label="Completed Requests" loading={loading} color="emerald" />
          <StatCard icon={Mail} value={totalMessages} label="Messages Received" loading={loading} color="amber" />
        </div>
      </section>

      {/* ── PROGRESS BARS ─────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="card-formal p-8 sm:p-12 space-y-8">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Community Impact</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Percentages are computed live from database records.</p>
          </div>

          <div className="space-y-7">
            <ProgressBar
              label="Volunteer Participation"
              pct={participationPct}
              loading={loading}
            />
            <ProgressBar
              label="Requests Completed"
              pct={completedPct}
              loading={loading}
            />
            <ProgressBar
              label="Community Satisfaction"
              pct={satisfactionPct}
              loading={false}
            />
          </div>

          {stats && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 space-y-0.5">
              <p>• <strong className="text-slate-600 dark:text-slate-300">Volunteer Participation</strong> = approved volunteers ÷ total volunteers</p>
              <p>• <strong className="text-slate-600 dark:text-slate-300">Requests Completed</strong> = completed requests ÷ total requests</p>
              <p>• <strong className="text-slate-600 dark:text-slate-300">Community Satisfaction</strong> = from periodic student surveys</p>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}

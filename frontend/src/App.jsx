import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom'
import { Sun, Moon, Menu, X, Shield, ArrowRight } from 'lucide-react'

import Home           from './pages/Home'
import About          from './pages/About'
import Services       from './pages/Services'
import Statistics     from './pages/Statistics'
import Contact        from './pages/Contact'
import BecomeVolunteer from './pages/BecomeVolunteer'
import RequestHelp    from './pages/RequestHelp'
import Login               from './pages/Login'
import Dashboard           from './pages/Dashboard'
import VolunteerDashboard  from './pages/VolunteerDashboard'

const NAV_LINKS = [
  { to: '/',            label: 'Home'       },
  { to: '/services',    label: 'Services'   },
  { to: '/about',       label: 'About'      },
  { to: '/statistics',  label: 'Statistics' },
  { to: '/contact',     label: 'Contact'    },
  { to: '/login',       label: 'Portal Sign In' },
]

export default function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('helphub_theme')
    if (saved) return saved === 'dark'
    return false // Default to clean formal light mode
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('helphub_theme', dark ? 'dark' : 'light')
  }, [dark])

  const linkClass = ({ isActive }) =>
    `px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 ${
      isActive
        ? 'text-blue-700 bg-blue-50 dark:bg-blue-950/70 dark:text-blue-400 font-bold'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
    }`

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">

        {/* ── TOP ANNOUNCEMENT BAR ── */}
        <div className="bg-slate-900 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
          <span>Official University Volunteer & Peer Assistance Network</span>
          <span className="hidden sm:inline text-slate-400">| Emergency requests prioritized 24/7</span>
        </div>

        {/* ── NAVBAR ── */}
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">

            {/* Logo & Institution Branding */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center shadow-sm group-hover:bg-blue-800 transition-colors">
                <Shield size={20} className="fill-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white leading-tight">
                  Help<span className="text-blue-600 dark:text-blue-400">Hub</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                  Community Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(l => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
                  {l.label}
                </NavLink>
              ))}
            </nav>

            {/* Right Action & Theme Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDark(d => !d)}
                aria-label="Toggle theme"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Toggle Theme"
              >
                {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
              </button>

              <Link to="/request-help" className="hidden sm:inline-flex btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-4">
                Request Assistance
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                aria-label="Toggle Navigation Menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {mobileOpen && (
            <nav className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 flex flex-col gap-1.5 shadow-lg">
              {NAV_LINKS.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <Link
                to="/request-help"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full justify-center text-xs uppercase tracking-wider font-bold py-3 mt-2"
              >
                Request Assistance <ArrowRight size={16} />
              </Link>
            </nav>
          )}
        </header>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-grow">
          <Routes>
            <Route path="/"             element={<Home />} />
            <Route path="/about"        element={<About />} />
            <Route path="/services"     element={<Services />} />
            <Route path="/statistics"   element={<Statistics />} />
            <Route path="/contact"      element={<Contact />} />
            <Route path="/volunteer"    element={<BecomeVolunteer />} />
            <Route path="/request-help" element={<RequestHelp />} />
            <Route path="/login"                element={<Login />} />
            <Route path="/dashboard"             element={<Dashboard />} />
            <Route path="/volunteer-dashboard"   element={<VolunteerDashboard />} />
          </Routes>
        </main>

        {/* ── FOOTER ── */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-8 border-b border-slate-800">
              
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                    <Shield size={18} />
                  </div>
                  <span className="font-extrabold text-xl tracking-tight">HelpHub</span>
                </div>
                <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                  The official university peer assistance network. Dedicated to facilitating structured volunteering, student welfare support, and campus community engagement.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm text-slate-400 font-medium">
                  <li><Link to="/services" className="hover:text-white transition-colors">Services Directory</Link></li>
                  <li><Link to="/about" className="hover:text-white transition-colors">About the Platform</Link></li>
                  <li><Link to="/statistics" className="hover:text-white transition-colors">Community Analytics</Link></li>
                  <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Get Involved</h4>
                <ul className="space-y-2 text-sm text-slate-400 font-medium">
                  <li><Link to="/request-help" className="hover:text-white transition-colors">Request Support</Link></li>
                  <li><Link to="/volunteer" className="hover:text-white transition-colors">Volunteer Application</Link></li>
                  <li><Link to="/login" className="hover:text-white transition-colors">Admin Sign In</Link></li>
                  <li><Link to="/login" className="hover:text-white transition-colors">Volunteer Sign In</Link></li>
                </ul>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium gap-4">
              <p>© 2026 HelpHub University Community Platform. All rights reserved.</p>
              <div className="flex gap-6">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Campus Guidelines</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </Router>
  )
}

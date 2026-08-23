import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Users, Clock, BookOpen, Zap, Droplet, Pill, Book, Accessibility, Car, Utensils, GraduationCap, Laptop, Shirt, RefreshCw } from 'lucide-react'

const API = 'http://localhost:5000/api'

const SERVICES = [
  { icon: Droplet,       title: 'Blood Donation',            desc: 'Connect blood donors with people who need urgent support.',                            link: '/services#blood' },
  { icon: Pill,          title: 'Medicine Delivery',         desc: 'Help deliver essential medicines to people who need them.',                           link: '/services#medicine' },
  { icon: Book,          title: 'Books Sharing',             desc: 'Share educational books and resources with other students.',                           link: '/services#books' },
  { icon: Accessibility, title: 'Disability Support',        desc: 'Support people with disabilities in their daily activities.',                        link: '/services#disability' },
  { icon: Car,           title: 'Transportation Support',    desc: 'Help people reach hospitals, universities, and important appointments.',              link: '/services#transportation' },
  { icon: Utensils,      title: 'Food Support',              desc: 'Provide food and essential meals to people and families who need support.',           link: '/services#food' },
  { icon: GraduationCap, title: 'Tutoring & Study Support',  desc: 'Connect students with volunteers who can provide academic support.',                  link: '/services#tutoring' },
  { icon: Laptop,        title: 'Technology Support',        desc: 'Help students and community members solve common technology problems.',               link: '/services#technology' },
  { icon: Shirt,         title: 'Clothes Donation',          desc: 'Donate useful clothes and help provide them to people who need them.',                link: '/services#clothing' },
]

export default function Home() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/public/stats`)
      .then(r => r.json())
      .then(r => { if (r.success) setStats(r.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const S = stats || {}
  const volunteerHours = S.volunteerHours    ?? 0
  const peopleHelped   = S.peopleHelped       ?? 0
  const booksReused    = S.booksReused        ?? 0
  const avgResponse    = S.avgResponseMinutes != null ? `${S.avgResponseMinutes} min` : '—'

  return (
    <div className="animate-fade-in space-y-16 pb-20">

      {/* ── HERO SECTION ── */}
      <section className="bg-gradient-to-b from-blue-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="badge-formal inline-flex items-center gap-2">
              <Heart size={14} className="text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
              University Community Platform
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-slate-900 dark:text-white">
              Connecting People Who Need Help{' '}
              <span className="text-blue-600 dark:text-blue-400 block sm:inline">
                With Those Ready To Help
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              A university community platform that organizes volunteering, connects helpers with people in need, and creates real social impact.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
              <Link to="/request-help" className="btn-primary py-3.5 px-6 text-sm">
                <Heart size={16} /> Request Help
              </Link>
              <Link to="/volunteer" className="btn-outline py-3.5 px-6 text-sm">
                <Users size={16} /> Become Volunteer
              </Link>
            </div>
          </div>

          {/* Hero Image Illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="card-formal p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-lg space-y-6 text-center w-full max-w-md">
              <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                <Heart size={48} className="fill-blue-600 dark:fill-blue-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">HelpHub Community</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Empowering students through structured volunteering and active peer support.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-950/60 dark:border-blue-800/60 dark:text-blue-300 text-xs font-semibold">
                Together We Create Real Social Impact
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── SERVICES SECTION ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="badge-formal">What We Do</span>
          <h2 className="section-title">Our Services</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium">
            Simple ways to help students and members of our community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="card-formal card-hover p-7 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{s.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link to={s.link} className="btn-outline text-xs py-2 px-4 w-full justify-center">
                    View Service
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── STATS SECTION (DYNAMIC FROM BACKEND) ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-formal p-6 text-center space-y-2 border-l-4 border-l-blue-600">
            <Clock size={24} className="mx-auto text-blue-600 dark:text-blue-400" />
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {loading ? <RefreshCw size={20} className="animate-spin mx-auto text-slate-400" /> : volunteerHours}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">Volunteer Hours</p>
          </div>

          <div className="card-formal p-6 text-center space-y-2 border-l-4 border-l-blue-600">
            <Users size={24} className="mx-auto text-blue-600 dark:text-blue-400" />
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {loading ? <RefreshCw size={20} className="animate-spin mx-auto text-slate-400" /> : peopleHelped}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">People Helped</p>
          </div>

          <div className="card-formal p-6 text-center space-y-2 border-l-4 border-l-blue-600">
            <BookOpen size={24} className="mx-auto text-blue-600 dark:text-blue-400" />
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {loading ? <RefreshCw size={20} className="animate-spin mx-auto text-slate-400" /> : booksReused}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">Books Reused</p>
          </div>

          <div className="card-formal p-6 text-center space-y-2 border-l-4 border-l-blue-600">
            <Zap size={24} className="mx-auto text-blue-600 dark:text-blue-400" />
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {loading ? <RefreshCw size={20} className="animate-spin mx-auto text-slate-400" /> : avgResponse}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">Average Response</p>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY SECTION ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="card-formal p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="badge-formal inline-flex items-center gap-2">
              <Users size={14} /> Together We Can Help
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Small Actions Can Create Real Impact
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              HelpHub makes it easier for students and community members to request support, volunteer their time, and contribute to a stronger and more connected community.
            </p>
            <Link to="/about" className="btn-primary py-3 px-6 text-sm inline-flex">
              Learn More
            </Link>
          </div>

          <div className="p-8 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto text-2xl font-bold">
              🤝
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Join Our Volunteer Network</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Connect with peers across campus and provide assistance to those in need.</p>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="card-formal p-10 sm:p-14 bg-gradient-to-r from-blue-700 to-indigo-800 text-white border-none shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Ready to Make a Difference?</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Whether you need help or want to help someone, HelpHub is here for you.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <Link to="/request-help" className="btn-secondary bg-white text-blue-900 hover:bg-blue-50 py-3.5 px-6">
              Request Help
            </Link>
            <Link to="/volunteer" className="btn-outline border-blue-300 text-white hover:bg-blue-800/60 py-3.5 px-6">
              Join Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

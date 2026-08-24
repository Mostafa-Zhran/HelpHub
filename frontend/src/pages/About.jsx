import { Target, Eye, Users } from 'lucide-react'

export default function About() {
  return (
    <div className="animate-fade-in space-y-16 pb-20">

      {/* Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16 px-4 text-center space-y-4 transition-colors">
        <span className="badge-formal">
          About HelpHub
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">We Believe Everyone Can Help</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base font-medium">
          HelpHub is a university community platform designed to make volunteering simple, organized and accessible.
        </p>
      </section>

      {/* About Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card-formal p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Target size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Our mission is to connect people who need help with volunteers who are ready to make a positive difference.
          </p>
        </div>

        <div className="card-formal p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Eye size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Vision</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            We want to build a stronger university community where helping others becomes easy and accessible to everyone.
          </p>
        </div>

        <div className="card-formal p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Community</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Students, volunteers and community members can work together through one simple platform.
          </p>
        </div>
      </section>

      {/* Image Banner Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 group">
          <img
            src="/images/community.jpg"
            alt="HelpHub Community"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent flex items-center p-8 sm:p-12">
            <div className="max-w-lg space-y-3">
              <span className="badge-formal bg-blue-600 text-white border-none">Community Spirit</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Building Stronger University Ties</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Students, volunteers, and community members working together through one simple platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="card-formal p-8 sm:p-12 space-y-8">
          <div className="text-center space-y-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <span className="badge-formal">Simple Process</span>
            <h2 className="section-title">How HelpHub Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <span className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center mx-auto text-base">
                1
              </span>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Request or Offer</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Request support or register as a volunteer.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <span className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center mx-auto text-base">
                2
              </span>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Get Connected</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                We connect people based on their needs and services.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <span className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center mx-auto text-base">
                3
              </span>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Make an Impact</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Volunteers provide support and create real community impact.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

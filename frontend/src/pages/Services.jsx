import { Link } from 'react-router-dom'
import { Droplet, Pill, Book, Accessibility, Car, Utensils, GraduationCap, Laptop, Shirt, ArrowRight } from 'lucide-react'

const SERVICES = [
  { id: 'blood', icon: Droplet, title: 'Blood Donation', desc: 'Our blood donation service connects donors with people who need blood support. Volunteers can register their blood type and availability.', cta: 'Become a Donor' },
  { id: 'medicine', icon: Pill, title: 'Medicine Delivery', desc: 'Volunteers can help deliver essential medicines to people who cannot easily reach a pharmacy or hospital.', cta: 'Request Delivery' },
  { id: 'books', icon: Book, title: 'Books Sharing', desc: 'Students can share books, notes and educational materials with other members of the university community.', cta: 'Share Books' },
  { id: 'disability', icon: Accessibility, title: 'Disability Support', desc: 'We connect volunteers with people who need assistance with transportation, university activities and daily tasks.', cta: 'Request Support' },
  { id: 'transportation', icon: Car, title: 'Transportation Support', desc: 'Help people reach hospitals, universities, important appointments, and other essential destinations when transportation is difficult.', cta: 'Request Transportation' },
  { id: 'food', icon: Utensils, title: 'Food Support', desc: 'Connect volunteers and donors with people and families who need food or meal support.', cta: 'Request Food Support' },
  { id: 'tutoring', icon: GraduationCap, title: 'Tutoring & Study Support', desc: 'Connect students with volunteers who can provide academic support, study assistance, and help with different subjects.', cta: 'Become a Tutor' },
  { id: 'technology', icon: Laptop, title: 'Technology Support', desc: 'Help students and community members with common computer, software, device, and technology-related problems.', cta: 'Request Technology Support' },
  { id: 'clothing', icon: Shirt, title: 'Clothes Donation', desc: 'Donate useful clothes and help make them available to people and families who need them.', cta: 'Donate Clothes' },
]

export default function Services() {
  return (
    <div className="animate-fade-in space-y-16 pb-20">

      {/* Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16 px-4 text-center space-y-4 transition-colors">
        <span className="badge-formal">
          HelpHub Services
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">How We Can Help</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base font-medium">
          Explore our community services and find the right way to request or provide help.
        </p>
      </section>

      {/* Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {SERVICES.map(({ id, icon: Icon, title, desc, cta }) => (
            <div key={id} id={id} className="card-formal card-hover p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Icon size={24} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link to="/request-help" className="btn-primary text-xs w-full justify-center">
                  {cta} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}

import { Link } from 'react-router-dom'
import { Droplet, Pill, Book, Accessibility, Car, Utensils, GraduationCap, Laptop, Shirt, ArrowRight } from 'lucide-react'

const SERVICES = [
  { 
    id: 'blood', 
    image: '/images/blood-donation.jpg', 
    icon: Droplet, 
    title: 'Blood Donation', 
    desc: 'Our blood donation service connects donors with people who need blood support. Volunteers can register their blood type and availability.', 
    cta: 'Become a Donor' 
  },
  { 
    id: 'medicine', 
    image: '/images/medicine-delivery.jpg', 
    icon: Pill, 
    title: 'Medicine Delivery', 
    desc: 'Volunteers can help deliver essential medicines to people who cannot easily reach a pharmacy or hospital.', 
    cta: 'Request Delivery' 
  },
  { 
    id: 'books', 
    image: '/images/books-sharing.jpg', 
    icon: Book, 
    title: 'Books Sharing', 
    desc: 'Students can share books, notes and educational materials with other members of the university community.', 
    cta: 'Share Books' 
  },
  { 
    id: 'disability', 
    image: '/images/disability-support.jpg', 
    icon: Accessibility, 
    title: 'Disability Support', 
    desc: 'We connect volunteers with people who need assistance with transportation, university activities and daily tasks.', 
    cta: 'Request Support' 
  },
  { 
    id: 'transportation', 
    image: '/images/transportation.jpg', 
    icon: Car, 
    title: 'Transportation Support', 
    desc: 'Help people reach hospitals, universities, important appointments, and other essential destinations when transportation is difficult.', 
    cta: 'Request Transportation' 
  },
  { 
    id: 'food', 
    image: '/images/food-support.jpg', 
    icon: Utensils, 
    title: 'Food Support', 
    desc: 'Connect volunteers and donors with people and families who need food or meal support.', 
    cta: 'Request Food Support' 
  },
  { 
    id: 'tutoring', 
    image: '/images/tutoring.jpg', 
    icon: GraduationCap, 
    title: 'Tutoring & Study Support', 
    desc: 'Connect students with volunteers who can provide academic support, study assistance, and help with different subjects.', 
    cta: 'Become a Tutor' 
  },
  { 
    id: 'technology', 
    image: '/images/technology.jpg', 
    icon: Laptop, 
    title: 'Technology Support', 
    desc: 'Help students and community members with common computer, software, device, and technology-related problems.', 
    cta: 'Request Technology Support' 
  },
  { 
    id: 'clothing', 
    image: '/images/clothes-donation.jpg', 
    icon: Shirt, 
    title: 'Clothes Donation', 
    desc: 'Donate useful clothes and help make them available to people and families who need them.', 
    cta: 'Donate Clothes' 
  },
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {SERVICES.map(({ id, image, icon: Icon, title, desc, cta }) => (
            <div key={id} id={id} className="card-formal card-hover overflow-hidden flex flex-col justify-between group">
              <div>
                {/* Service Original Image Banner */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
                  
                  {/* Floating Icon Badge */}
                  <div className="absolute bottom-3 left-4 flex items-center gap-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-3.5 py-2 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-800/50">
                    <Icon size={18} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{title}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-3">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>

              {/* Action Button Footer */}
              <div className="p-6 pt-0">
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link to="/request-help" className="btn-primary text-xs w-full justify-center">
                    {cta} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

    </div>
  )
}

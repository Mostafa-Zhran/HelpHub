import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react'

const API = 'https://helphub-production-3b59.up.railway.app/'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('')
  const [errMsg, setErrMsg] = useState('')

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch(`${API}/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Sending failed.')
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setErrMsg(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="animate-fade-in space-y-16 pb-20">

      {/* Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16 px-4 text-center space-y-4 transition-colors">
        <span className="badge-formal">
          Get In Touch
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">Contact Us</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base font-medium">
          Have a question or suggestion? Send us a message.
        </p>
      </section>

      {/* Main Form & Info Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">

        <div className="lg:col-span-2 card-formal p-8 space-y-6">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                <Mail size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Email</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">support@helphub.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                <Phone size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Phone</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">+20 100 000 0000</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Location</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">University Community</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {status === 'success' ? (
            <div className="card-formal p-10 text-center space-y-4">
              <CheckCircle2 size={48} className="text-emerald-600 mx-auto" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Message Sent</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Thank you for reaching out. We will process your message shortly.</p>
              <button onClick={() => setStatus('')} className="btn-outline text-xs mt-2">Send Another Message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} id="contactForm" className="card-formal p-8 space-y-5">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Full Name</label>
                <input type="text" id="name" value={form.name} onChange={set('name')} required placeholder="Enter your name" className="form-input" />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Email</label>
                <input type="email" id="email" value={form.email} onChange={set('email')} required placeholder="Enter your email" className="form-input" />
              </div>

              <div>
                <label htmlFor="subject" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Subject</label>
                <input type="text" id="subject" value={form.subject} onChange={set('subject')} required placeholder="Message subject" className="form-input" />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Message</label>
                <textarea id="message" value={form.message} onChange={set('message')} required rows={6} placeholder="Write your message" className="form-input resize-none" />
              </div>

              {status === 'error' && <p className="text-rose-600 text-xs font-semibold">⚠ {errMsg}</p>}

              <button type="submit" className="btn-primary w-full justify-center">
                {status === 'loading' ? 'Sending…' : <><Send size={16} /> Send Message</>}
              </button>

              <p id="formMessage" className="text-xs text-slate-500"></p>
            </form>
          )}
        </div>

      </section>

    </div>
  )
}

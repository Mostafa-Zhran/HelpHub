import { useState } from 'react'
import { Shield, CheckCircle2 } from 'lucide-react'

const API = 'http://localhost:5000/api'

const INIT = {
  full_name:    '',
  email:        '',
  service_type: '',
  description:  '',
  urgency:      '',
}

export default function RequestHelp() {
  const [form, setForm]     = useState(INIT)
  const [status, setStatus] = useState('')
  const [errMsg, setErrMsg] = useState('')

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch(`${API}/public/help-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Submission failed.')
      setStatus('success')
    } catch (err) {
      setErrMsg(err.message)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 animate-fade-in">
        <div className="card-formal p-10 max-w-lg w-full text-center space-y-4">
          <CheckCircle2 size={48} className="text-emerald-600 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Request Submitted</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Thank you. Your request has been submitted and our community will try to connect you with the right volunteer.</p>
          <button onClick={() => { setStatus(''); setForm(INIT) }} className="btn-primary mx-auto">Submit Another Request</button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-16 pb-20">

      {/* Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16 px-4 text-center space-y-4 transition-colors">
        <span className="badge-formal">
          We're Here For You
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">Request Help</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base font-medium">
          Tell us what you need and our community will try to connect you with the right volunteer.
        </p>
      </section>

      {/* Form */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <form id="helpForm" onSubmit={handleSubmit} className="card-formal p-8 sm:p-10 space-y-6">

          <div>
            <label htmlFor="helpName" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Full Name</label>
            <input
              type="text"
              id="helpName"
              value={form.full_name}
              onChange={set('full_name')}
              required
              placeholder="Enter your full name"
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="helpEmail" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Email</label>
            <input
              type="email"
              id="helpEmail"
              value={form.email}
              onChange={set('email')}
              required
              placeholder="Enter your email"
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="service" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">What kind of help do you need?</label>
            <select
              id="service"
              value={form.service_type}
              onChange={set('service_type')}
              required
              className="form-input"
            >
              <option value="">Select a service</option>
              <option value="blood">Blood Donation</option>
              <option value="medicine">Medicine Delivery</option>
              <option value="books">Books Sharing</option>
              <option value="disability">Disability Support</option>
              <option value="transportation">Transportation Support</option>
              <option value="food">Food Support</option>
              <option value="tutoring">Tutoring & Study Support</option>
              <option value="technology">Technology Support</option>
              <option value="clothing">Clothes Donation</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="urgency" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Urgency</label>
            <select
              id="urgency"
              value={form.urgency}
              onChange={set('urgency')}
              required
              className="form-input"
            >
              <option value="">Select urgency</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="helpDetails" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Describe what you need</label>
            <textarea
              id="helpDetails"
              value={form.description}
              onChange={set('description')}
              rows={7}
              required
              placeholder="Tell us more about your request"
              className="form-input resize-none"
            />
          </div>

          {status === 'error' && <p className="text-rose-600 text-xs font-semibold">⚠ {errMsg}</p>}

          <button type="submit" className="btn-primary w-full justify-center">
            {status === 'loading' ? 'Submitting…' : 'Submit Request'}
          </button>

          <p id="helpMessage" className="text-xs text-slate-500"></p>

        </form>
      </section>

    </div>
  )
}

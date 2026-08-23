import { useState } from 'react'
import { Shield, CheckCircle2 } from 'lucide-react'

const API = 'https://helphub-production-3b59.up.railway.app/api/'

const INIT = {
  full_name: '',
  email: '',
  password: '',
  phone: '',
  service_type: '',
  availability: '',
  motivation: '',
}

export default function BecomeVolunteer() {
  const [form, setForm] = useState(INIT)
  const [status, setStatus] = useState('')
  const [errMsg, setErrMsg] = useState('')

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password && form.password.length < 6) {
      setErrMsg('Password must be at least 6 characters.')
      setStatus('error')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch(`${API}/public/volunteer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed.')
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Registration Successful</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Thank you for applying to become a volunteer. You can log in once an administrator approves your account.</p>
          <button onClick={() => { setStatus(''); setForm(INIT) }} className="btn-primary mx-auto">Register Another Volunteer</button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-16 pb-20">

      {/* Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16 px-4 text-center space-y-4 transition-colors">
        <span className="badge-formal">
          Join Our Community
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">Become a Volunteer</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base font-medium">
          Give your time, skills and kindness to help people around you.
        </p>
      </section>

      {/* Form */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <form id="volunteerForm" onSubmit={handleSubmit} className="card-formal p-8 sm:p-10 space-y-6">

          <div>
            <label htmlFor="volunteerName" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Full Name</label>
            <input
              type="text"
              id="volunteerName"
              value={form.full_name}
              onChange={set('full_name')}
              required
              placeholder="Enter your full name"
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="volunteerEmail" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Email</label>
            <input
              type="email"
              id="volunteerEmail"
              value={form.email}
              onChange={set('email')}
              required
              placeholder="Enter your email"
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="volunteerPassword" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Account Password (For Sign In)</label>
            <input
              type="password"
              id="volunteerPassword"
              value={form.password}
              onChange={set('password')}
              required
              minLength={6}
              placeholder="Create a password (min. 6 characters)"
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Phone Number</label>
            <input
              type="tel"
              id="phone"
              value={form.phone}
              onChange={set('phone')}
              required
              placeholder="Enter your phone number"
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="volunteerService" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">How would you like to help?</label>
            <select
              id="volunteerService"
              value={form.service_type}
              onChange={set('service_type')}
              required
              className="form-input"
            >
              <option value="">Select an area</option>
              <option value="blood">Blood Donation</option>
              <option value="medicine">Medicine Delivery</option>
              <option value="books">Books Sharing</option>
              <option value="disability">Disability Support</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="availability" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Availability</label>
            <select
              id="availability"
              value={form.availability}
              onChange={set('availability')}
              required
              className="form-input"
            >
              <option value="">Select availability</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekends">Weekends</option>
              <option value="both">Weekdays & Weekends</option>
            </select>
          </div>

          <div>
            <label htmlFor="volunteerMessage" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Tell us about yourself</label>
            <textarea
              id="volunteerMessage"
              value={form.motivation}
              onChange={set('motivation')}
              rows={6}
              placeholder="Your skills, experience or anything else..."
              className="form-input resize-none"
            />
          </div>

          {status === 'error' && <p className="text-rose-600 text-xs font-semibold">⚠ {errMsg}</p>}

          <button type="submit" className="btn-primary w-full justify-center">
            {status === 'loading' ? 'Submitting…' : 'Join as Volunteer'}
          </button>

          <p id="volunteerMessageResult" className="text-xs text-slate-500"></p>

        </form>
      </section>

    </div>
  )
}

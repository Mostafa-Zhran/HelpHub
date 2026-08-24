import { useState } from 'react'
import { Shield, CheckCircle2, CreditCard, Smartphone, ExternalLink, X, AlertCircle } from 'lucide-react'

import API from '../config'

const INIT = {
  full_name: '',
  email: '',
  service_type: '',
  description: '',
  urgency: '',
}

export default function RequestHelp() {
  const [form, setForm] = useState(INIT)
  const [paymentMethod, setPaymentMethod] = useState('card') // 'card' or 'wallet'
  const [walletNumber, setWalletNumber] = useState('')
  const [status, setStatus] = useState('')
  const [errMsg, setErrMsg] = useState('')
  
  // Paymob modal state
  const [paymentData, setPaymentData] = useState(null)
  const [createdRequestId, setCreatedRequestId] = useState(null)

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('loading')
    setErrMsg('')

    if (paymentMethod === 'wallet' && !walletNumber.trim()) {
      setErrMsg('Please enter your Vodafone Cash phone number.')
      setStatus('error')
      return
    }

    try {
      // 1. Submit Help Request to backend
      const res = await fetch(`${API}/public/help-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Submission failed.')

      const requestId = data.data?.id || null
      setCreatedRequestId(requestId)

      // 2. Initiate Paymob Payment for the request (Card or Vodafone Cash)
      let payRes, payData
      try {
        payRes = await fetch(`${API}/public/paymob/initiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            help_request_id: requestId,
            name: form.full_name,
            email: form.email,
            amount: 5, // 5.00 EGP nominal fee
            payment_method: paymentMethod,
            wallet_number: walletNumber.trim()
          })
        })
        payData = await payRes.json()
      } catch (payErr) {
        setErrMsg('Could not connect to the payment gateway. Please check your connection and try again.')
        setStatus('error')
        return
      }

      if (payRes.ok && payData?.success && (payData.data?.iframeUrl || payData.data?.redirectUrl)) {
        setPaymentData(payData.data)
        setStatus('paymob')
        return
      }

      // Payment initiation returned an error response
      const payErrMsg = payData?.message || 'Payment gateway error. Please try again.'
      setErrMsg(`Payment error: ${payErrMsg}`)
      setStatus('error')
    } catch (err) {
      setErrMsg(err.message)
      setStatus('error')
    }
  }

  const cancelPayment = async () => {
    if (paymentData && (paymentData.paymentId || paymentData.orderId)) {
      try {
        await fetch(`${API}/public/paymob/complete-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: paymentData.paymentId,
            orderId: paymentData.orderId,
            status: 'failed'
          })
        })
      } catch (e) { console.warn(e) }
    }
    setStatus('')
    setPaymentData(null)
  }

  const completeSuccess = async () => {
    if (paymentData && (paymentData.paymentId || paymentData.orderId)) {
      try {
        await fetch(`${API}/public/paymob/complete-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: paymentData.paymentId,
            orderId: paymentData.orderId,
            status: 'success'
          })
        })
      } catch (e) { console.warn(e) }
    }
    setStatus('success')
    setPaymentData(null)
    setForm(INIT)
    setWalletNumber('')
  }

  if (status === 'success') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 animate-fade-in">
        <div className="card-formal p-6 sm:p-10 max-w-lg w-full text-center space-y-4">
          <CheckCircle2 size={48} className="text-emerald-600 mx-auto" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Request Submitted</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Thank you. Your request has been submitted and registered into our network. Our volunteers will connect with you soon.
          </p>
          <button onClick={() => { setStatus(''); setForm(INIT); setPaymentData(null); setWalletNumber(''); }} className="btn-primary mx-auto">
            Submit Another Request
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-12 sm:space-y-16 pb-20">

      {/* Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12 sm:py-16 px-4 text-center space-y-4 transition-colors">
        <span className="badge-formal">
          We're Here For You
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">Request Help</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-xs sm:text-base font-medium">
          Tell us what you need and our community will connect you with the right volunteer.
        </p>
      </section>

      {/* Form */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <form id="helpForm" onSubmit={handleSubmit} className="card-formal p-5 sm:p-10 space-y-5 sm:space-y-6">

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
              rows={4}
              required
              placeholder="Tell us more about your request"
              className="form-input resize-none"
            />
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
              Select Paymob Payment Method (5.00 EGP Fee)
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border transition-all text-left ${
                  paymentMethod === 'card'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/60 dark:border-blue-500 text-blue-950 dark:text-blue-100 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${paymentMethod === 'card' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  <CreditCard size={20} />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs sm:text-sm block truncate">Credit / Debit Card</span>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">Visa / Mastercard (Paymob)</span>
                </div>
              </button>

              {/* Vodafone Cash / Wallet option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border transition-all text-left ${
                  paymentMethod === 'wallet'
                    ? 'border-rose-600 bg-rose-50/70 dark:bg-rose-950/60 dark:border-rose-500 text-rose-950 dark:text-rose-100 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${paymentMethod === 'wallet' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  <Smartphone size={20} />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs sm:text-sm block truncate">Vodafone Cash / Wallet</span>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate">Mobile Wallets (Paymob)</span>
                </div>
              </button>
            </div>

            {/* Wallet phone number input */}
            {paymentMethod === 'wallet' && (
              <div className="pt-2 animate-fade-in space-y-1">
                <label htmlFor="walletPhone" className="block text-xs font-bold text-rose-700 dark:text-rose-400 uppercase">Vodafone Cash / Wallet Phone Number</label>
                <input
                  type="tel"
                  id="walletPhone"
                  value={walletNumber}
                  onChange={e => setWalletNumber(e.target.value)}
                  required
                  placeholder="010XXXXXXXX or 011XXXXXXXX"
                  className="form-input border-rose-300 dark:border-rose-800 focus:border-rose-600 text-xs sm:text-sm"
                />
              </div>
            )}
          </div>

          {status === 'error' && <p className="text-rose-600 text-xs font-semibold">⚠ {errMsg}</p>}

          <button type="submit" disabled={status === 'loading'} className="btn-primary w-full justify-center text-xs sm:text-sm py-3.5 font-bold">
            {status === 'loading'
              ? 'Processing Request…'
              : paymentMethod === 'wallet'
              ? 'Submit & Pay with Vodafone Cash (5 EGP)'
              : 'Submit & Pay with Card (5 EGP)'}
          </button>

        </form>
      </section>

      {/* Paymob Payment Modal */}
      {status === 'paymob' && paymentData && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 relative max-h-[94vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${paymentData.isWallet ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'}`}>
                  {paymentData.isWallet ? <Smartphone size={18} /> : <CreditCard size={18} />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    {paymentData.isWallet ? 'Vodafone Cash Gateway' : 'Paymob Card Payment'}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 truncate">Order #{paymentData.orderId} • Amount: {paymentData.amount} {paymentData.currency}</p>
                </div>
              </div>
              <button 
                onClick={cancelPayment}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
                title="Cancel Payment"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main iframe or direct URL checkout window */}
            <div className="flex-1 min-h-[350px] sm:min-h-[440px] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col relative">
              {(paymentData.redirectUrl || paymentData.iframeUrl) ? (
                <iframe
                  src={paymentData.redirectUrl || paymentData.iframeUrl}
                  className="w-full min-h-[350px] sm:min-h-[450px] h-full border-0"
                  title="Paymob Vodafone Cash Checkout"
                />
              ) : (
                <div className="p-6 sm:p-8 text-center space-y-4 my-auto">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                    <Smartphone size={24} />
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Vodafone Cash Gateway Ready</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Vodafone Cash Number: <strong>{walletNumber}</strong>. Please complete the OTP verification prompt.
                  </p>
                  <button onClick={completeSuccess} className="btn-primary justify-center text-xs py-2.5 px-4 mx-auto">
                    Complete Request
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <a
                href={paymentData.redirectUrl || paymentData.iframeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 font-semibold flex items-center justify-center sm:justify-start gap-1 hover:underline text-xs py-1"
              >
                Open in New Window <ExternalLink size={13} />
              </a>
              <div className="flex items-center gap-2">
                <button 
                  onClick={cancelPayment}
                  className="w-1/2 sm:w-auto px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold text-center border border-rose-200 sm:border-0"
                >
                  Cancel Payment
                </button>
                <button 
                  onClick={completeSuccess}
                  className="w-1/2 sm:w-auto btn-primary text-xs py-2 px-4 justify-center"
                >
                  Done / Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

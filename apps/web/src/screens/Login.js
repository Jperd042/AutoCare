'use client'

import { useState } from 'react'
import { Eye, EyeOff, AlertCircle, Cog, Mail, Lock, Info, Loader2 } from 'lucide-react'
import OtpModal from '@/components/OtpModal'

const ADMIN_ACCOUNTS = [
  { email: 'admin@cruiserscrib.com',   password: 'Admin@123',  name: 'Renan Castro',    role: 'Service Manager', initials: 'RC' },
  { email: 'staff@cruiserscrib.com',   password: 'Staff@123',  name: 'Dennis Ocampo',   role: 'Service Staff',   initials: 'DO' },
  { email: 'manager@cruiserscrib.com', password: 'Mgr@123',    name: 'Jose Villanueva', role: 'Branch Manager',  initials: 'JV' },
]

const STATS = [
  { value: '500+', label: 'Vehicles Served' },
  { value: '3',    label: 'Branches'        },
  { value: '98%',  label: 'Satisfaction'    },
]

export default function Login({ onLogin, onGoToRegister }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showOtp,  setShowOtp]  = useState(false)
  const [pendingUser, setPendingUser] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const acct = ADMIN_ACCOUNTS.find(
        a => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
      )
      if (acct) {
        // Store matched account and show OTP for 2FA
        setPendingUser({ name: acct.name, role: acct.role, email: acct.email, initials: acct.initials })
        setLoading(false)
        setShowOtp(true)
      } else {
        setError('Invalid credentials. Please try again.')
        setLoading(false)
      }
    }, 600)
  }

  function handleOtpVerify() {
    setShowOtp(false)
    if (pendingUser) {
      onLogin(pendingUser)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">

      {/* ════════════════════════════════════════════════════
          LEFT — Hero panel (60%)
      ════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[60%] flex-col justify-between relative overflow-hidden"
        style={{
          backgroundImage: 'url(/21352.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Multi-layer dark overlay for readability */}
        <div className="absolute inset-0"
             style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(10,6,0,0.70) 50%, rgba(0,0,0,0.78) 100%)' }} />
        {/* Left-edge fade so content pops */}
        <div className="absolute inset-y-0 left-0 w-32"
             style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.45), transparent)' }} />
        {/* Subtle orange vignette top-right */}
        <div className="absolute top-0 right-0 w-[480px] h-[480px] pointer-events-none"
             style={{ background: 'radial-gradient(circle at top right, rgba(179,84,30,0.18) 0%, transparent 65%)' }} />

        {/* ── Branding ───────────────────────── */}
        <div className="relative z-10 px-12 pt-12">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg,#f07c00,#b3541e)', boxShadow: '0 0 24px rgba(240,124,0,0.35)' }}>
              <Cog size={22} className="text-white" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-white tracking-tight leading-none">CRUISERS CRIB</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] mt-0.5" style={{ color: 'rgba(240,124,0,0.75)' }}>
                Auto Care Center
              </p>
            </div>
          </div>
        </div>

        {/* ── Headline ───────────────────────── */}
        <div className="relative z-10 px-12 py-8">
          {/* Accent line */}
          <div className="w-10 h-1 rounded-full mb-6" style={{ background: 'linear-gradient(90deg,#f07c00,#b3541e)' }} />

          <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
            Welcome Back,<br />
            <span style={{
              background: 'linear-gradient(90deg,#f07c00 0%,#c9951a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              TEAM.
            </span>
          </h1>

          <p className="mt-5 text-base font-medium leading-relaxed max-w-md"
             style={{ color: 'rgba(255,255,255,0.60)' }}>
            Empowering CruisersCrib operations with<br />precision and speed.
          </p>
        </div>

        {/* ── Stats ──────────────────────────── */}
        <div className="relative z-10 px-12 pb-12">
          {/* Glass stat bar */}
          <div className="flex items-stretch rounded-2xl overflow-hidden"
               style={{
                 background: 'rgba(255,255,255,0.04)',
                 border: '1px solid rgba(255,255,255,0.08)',
                 backdropFilter: 'blur(12px)',
               }}>
            {STATS.map((s, i) => (
              <div key={s.label}
                   className={`flex-1 px-6 py-5 ${i < STATS.length - 1 ? 'border-r' : ''}`}
                   style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <p className="text-3xl font-black leading-none"
                   style={{
                     background: 'linear-gradient(90deg,#f07c00,#c9951a)',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent',
                   }}>
                  {s.value}
                </p>
                <p className="text-xs font-semibold mt-1.5 uppercase tracking-wider"
                   style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          RIGHT — Login form (40%)
      ════════════════════════════════════════════════════ */}
      <div className="flex-1 lg:w-[40%] flex items-center justify-center px-6 py-10"
           style={{ background: '#111111' }}>
        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg,#f07c00,#b3541e)' }}>
              <Cog size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">CRUISERS CRIB</p>
              <p className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(240,124,0,0.7)' }}>Auto Care Center</p>
            </div>
          </div>

          {/* Heading */}
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#f07c00' }}>
            Admin Portal
          </p>
          <h2 className="text-3xl font-black text-white leading-tight">Sign In</h2>
          <p className="text-sm mt-2 mb-8" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Enter your credentials to continue.
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 mb-5 rounded-xl px-4 py-3"
                 style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}>
              <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@cruiserscrib.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-[rgba(255,255,255,0.22)] outline-none transition-all duration-150"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(240,124,0,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,0,0.10)' }}
                  onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder-[rgba(255,255,255,0.22)] outline-none transition-all duration-150"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(240,124,0,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,0,0.10)' }}
                  onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-150 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? 'rgba(179,84,30,0.5)'
                  : 'linear-gradient(135deg,#f07c00 0%,#b3541e 100%)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(179,84,30,0.35)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Signing in...
                </span>
              ) : (
                'Sign In \u2192'
              )}
            </button>
          </form>

          {/* Create Account link */}
          <p className="text-center mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Don&apos;t have an account?{' '}
            <button
              onClick={onGoToRegister}
              className="font-bold hover:underline transition-colors"
              style={{ color: '#f07c00' }}
            >
              Create Account
            </button>
          </p>

          {/* Demo credentials info card */}
          <div className="mt-7 rounded-xl p-4"
               style={{
                 background: 'rgba(255,255,255,0.03)',
                 border: '1px solid rgba(255,255,255,0.07)',
               }}>
            <div className="flex items-center gap-2 mb-3">
              <Info size={13} style={{ color: 'rgba(240,124,0,0.7)' }} />
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Demo Credentials
              </p>
            </div>
            <div className="space-y-2">
              {[
                { email: 'admin@cruiserscrib.com',   pass: 'Admin@123', role: 'Service Manager' },
                { email: 'staff@cruiserscrib.com',   pass: 'Staff@123', role: 'Service Staff'   },
                { email: 'manager@cruiserscrib.com', pass: 'Mgr@123',   role: 'Branch Manager'  },
              ].map(c => (
                <div key={c.email}
                     className="flex items-center justify-between gap-3 cursor-pointer rounded-lg px-3 py-2 transition-colors"
                     style={{ background: 'rgba(255,255,255,0.03)' }}
                     onClick={() => { setEmail(c.email); setPassword(c.pass) }}
                     onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,124,0,0.06)'}
                     onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  <div>
                    <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.55)' }}>{c.email}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{c.role}</p>
                  </div>
                  <span className="text-xs font-mono font-bold" style={{ color: 'rgba(240,124,0,0.6)' }}>{c.pass}</span>
                </div>
              ))}
            </div>
            <p className="text-[9px] mt-3 text-center" style={{ color: 'rgba(255,255,255,0.18)' }}>
              Click any row to auto-fill credentials
            </p>
          </div>

        </div>
      </div>

      {/* OTP Modal for 2FA */}
      <OtpModal
        isOpen={showOtp}
        onClose={() => { setShowOtp(false); setPendingUser(null) }}
        onVerify={handleOtpVerify}
        email={pendingUser?.email || email}
        purpose="login"
      />
    </div>
  )
}

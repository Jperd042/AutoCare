'use client'

import { useState, useMemo } from 'react'
import { Eye, EyeOff, AlertCircle, Cog, Mail, Lock, User, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { getPasswordChecks, validateEmail, validatePassword } from '@autocare/shared'
import OtpModal from '@/components/OtpModal'

const CHECKLIST = [
  { key: 'hasSpecialCharacter', label: 'At least 1 Special Character' },
  { key: 'hasNumber',           label: 'At least 1 Number' },
  { key: 'hasUppercase',        label: 'Mixture of Uppercase and Lowercase' },
  { key: 'hasValidLength',      label: 'Minimum 8 characters' },
]

const STATS = [
  { value: '500+', label: 'Vehicles Served' },
  { value: '3',    label: 'Branches'        },
  { value: '98%',  label: 'Satisfaction'    },
]

function buildInitials(fullName) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase()
}

export default function Register({ onRegister, onGoToLogin }) {
  const [name,         setName]         = useState('')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [confirmPass,  setConfirmPass]  = useState('')
  const [showPass,     setShowPass]     = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [error,        setError]        = useState('')
  const [fieldErrors,  setFieldErrors]  = useState({})
  const [loading,      setLoading]      = useState(false)
  const [showOtp,      setShowOtp]      = useState(false)
  const nameInputId = 'register-full-name'
  const emailInputId = 'register-email'
  const passwordInputId = 'register-password'
  const confirmPasswordInputId = 'register-confirm-password'

  const checks = useMemo(() => getPasswordChecks(password), [password])
  const passwordsMatch = confirmPass.length > 0 && password === confirmPass

  function validate() {
    const errors = {}
    if (!name.trim()) errors.name = 'Enter your full name.'
    const emailErr = validateEmail(email)
    if (emailErr) errors.email = emailErr
    const passErr = validatePassword(password)
    if (passErr) errors.password = passErr
    if (!confirmPass) errors.confirm = 'Re-enter your password.'
    else if (password !== confirmPass) errors.confirm = 'Passwords do not match.'
    return errors
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    setShowOtp(true)
  }

  function handleOtpVerify() {
    setShowOtp(false)
    setLoading(true)
    // Mock registration
    setTimeout(() => {
      const trimmedName = name.trim()
      onRegister({
        name: trimmedName,
        email: email.trim().toLowerCase(),
        role: 'Administrator',
        initials: buildInitials(trimmedName),
      })
    }, 400)
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">

      {/* ═══ LEFT — Hero panel (60%) ═══ */}
      <div
        className="hidden lg:flex lg:w-[60%] flex-col justify-between relative overflow-hidden"
        style={{
          backgroundImage: 'url(/21352.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0"
             style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(10,6,0,0.70) 50%, rgba(0,0,0,0.78) 100%)' }} />
        <div className="absolute inset-y-0 left-0 w-32"
             style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.45), transparent)' }} />
        <div className="absolute top-0 right-0 w-[480px] h-[480px] pointer-events-none"
             style={{ background: 'radial-gradient(circle at top right, rgba(179,84,30,0.18) 0%, transparent 65%)' }} />

        {/* Branding */}
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

        {/* Headline */}
        <div className="relative z-10 px-12 py-8">
          <div className="w-10 h-1 rounded-full mb-6" style={{ background: 'linear-gradient(90deg,#f07c00,#b3541e)' }} />
          <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
            Join the<br />
            <span style={{
              background: 'linear-gradient(90deg,#f07c00 0%,#c9951a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              CREW.
            </span>
          </h1>
          <p className="mt-5 text-base font-medium leading-relaxed max-w-md"
             style={{ color: 'rgba(255,255,255,0.60)' }}>
            Create your admin account and start managing<br />CruisersCrib operations today.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 px-12 pb-12">
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

      {/* ═══ RIGHT — Registration form (40%) ═══ */}
      <div
        className="flex-1 lg:w-[40%] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10 overflow-y-auto relative"
        style={{
          background: 'radial-gradient(circle at top, rgba(240,124,0,0.08), transparent 36%), linear-gradient(180deg, #121212 0%, #0f0f0f 100%)',
        }}
      >
        <div
          className="w-full max-w-[420px] rounded-[28px] border px-5 py-6 sm:px-8 sm:py-8 shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-md"
          style={{
            background: 'rgba(17,17,17,0.92)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >

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
            Create Account
          </p>
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white leading-tight">Register</h2>
            <p className="text-sm mt-2 max-w-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>
              Set up your admin credentials and get access to the Cruisers Crib portal.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 mb-5 rounded-xl px-4 py-3"
                 style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}>
              <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Full Name */}
            <div>
              <label htmlFor={nameInputId} className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Full Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input
                  id={nameInputId}
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setFieldErrors(p => ({...p, name: ''})) }}
                  placeholder="Juan Dela Cruz"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm text-white placeholder-[rgba(255,255,255,0.22)] outline-none transition-all duration-150"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: fieldErrors.name ? '1px solid rgba(239,68,68,0.52)' : '1px solid rgba(255,255,255,0.10)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(240,124,0,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,0,0.10)' }}
                  onBlur={e  => { e.target.style.borderColor = fieldErrors.name ? 'rgba(239,68,68,0.52)' : 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              {fieldErrors.name && <p className="text-xs text-red-400 mt-1.5">{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor={emailInputId} className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input
                  id={emailInputId}
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({...p, email: ''})) }}
                  placeholder="you@cruiserscrib.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm text-white placeholder-[rgba(255,255,255,0.22)] outline-none transition-all duration-150"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: fieldErrors.email ? '1px solid rgba(239,68,68,0.52)' : '1px solid rgba(255,255,255,0.10)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(240,124,0,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,0,0.10)' }}
                  onBlur={e  => { e.target.style.borderColor = fieldErrors.email ? 'rgba(239,68,68,0.52)' : 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-red-400 mt-1.5">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor={passwordInputId} className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input
                  id={passwordInputId}
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({...p, password: ''})) }}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-11 py-3.5 rounded-2xl text-sm text-white placeholder-[rgba(255,255,255,0.22)] outline-none transition-all duration-150"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: fieldErrors.password ? '1px solid rgba(239,68,68,0.52)' : '1px solid rgba(255,255,255,0.10)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(240,124,0,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,0,0.10)' }}
                  onBlur={e  => { e.target.style.borderColor = fieldErrors.password ? 'rgba(239,68,68,0.52)' : 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none' }}
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
              {fieldErrors.password && <p className="text-xs text-red-400 mt-1.5">{fieldErrors.password}</p>}

              {/* Password checklist */}
              {password.length > 0 && (
                <div className="mt-3 space-y-1.5 rounded-xl px-4 py-3"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {CHECKLIST.map(item => {
                    const met = checks[item.key]
                    return (
                      <div key={item.key} className="flex items-center gap-2.5">
                        {met
                          ? <CheckCircle2 size={14} className="flex-shrink-0" style={{ color: '#34d399' }} />
                          : <Circle size={14} className="flex-shrink-0 text-ink-dim" />
                        }
                        <span className={`text-xs ${met ? 'text-emerald-300' : 'text-ink-muted'}`}>
                          {item.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Re-enter Password */}
            <div>
              <label htmlFor={confirmPasswordInputId} className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Re-enter Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input
                  id={confirmPasswordInputId}
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={e => { setConfirmPass(e.target.value); setFieldErrors(p => ({...p, confirm: ''})) }}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-11 py-3.5 rounded-2xl text-sm text-white placeholder-[rgba(255,255,255,0.22)] outline-none transition-all duration-150"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: (fieldErrors.confirm || (confirmPass && !passwordsMatch))
                      ? '1px solid rgba(239,68,68,0.52)'
                      : confirmPass && passwordsMatch
                        ? '1px solid rgba(16,185,129,0.52)'
                        : '1px solid rgba(255,255,255,0.10)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(240,124,0,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,0,0.10)' }}
                  onBlur={e  => {
                    const borderColor = (fieldErrors.confirm || (confirmPass && !passwordsMatch))
                      ? 'rgba(239,68,68,0.52)'
                      : confirmPass && passwordsMatch
                        ? 'rgba(16,185,129,0.52)'
                        : 'rgba(255,255,255,0.10)'
                    e.target.style.borderColor = borderColor
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.confirm && <p className="text-xs text-red-400 mt-1.5">{fieldErrors.confirm}</p>}
              {!fieldErrors.confirm && confirmPass && !passwordsMatch && (
                <p className="text-xs text-red-400 mt-1.5">Passwords do not match.</p>
              )}
              {confirmPass && passwordsMatch && (
                <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Passwords match
                </p>
              )}
            </div>
            
            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-150 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? 'rgba(179,84,30,0.5)'
                  : 'linear-gradient(135deg,#f07c00 0%,#b3541e 100%)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(179,84,30,0.35)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Go to Login */}
          <p className="text-center mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Already have an account?{' '}
            <button
              onClick={onGoToLogin}
              className="font-bold hover:underline transition-colors"
              style={{ color: '#f07c00' }}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>

      {/* OTP Modal */}
      <OtpModal
        isOpen={showOtp}
        onClose={() => setShowOtp(false)}
        onVerify={handleOtpVerify}
        email={email}
        purpose="registration"
      />
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import {
  Shield, User, Phone, Lock, Eye, EyeOff, Save,
  CheckCircle2, Circle, Loader2,
} from 'lucide-react'
import { useUserContext } from '@/lib/userContext.jsx'
import { useToast } from '@/components/Toast.jsx'
import { getPasswordChecks, validatePassword, validatePhoneNumber, normalizePhoneNumber } from '@autocare/shared'
import OtpModal from '@/components/OtpModal'

const CHECKLIST = [
  { key: 'hasSpecialCharacter', label: 'At least 1 Special Character' },
  { key: 'hasNumber',           label: 'At least 1 Number' },
  { key: 'hasUppercase',        label: 'Mixture of Uppercase and Lowercase' },
  { key: 'hasValidLength',      label: 'Minimum 8 characters' },
]

// Mock current passwords for demo accounts
const MOCK_PASSWORDS = {
  'admin@cruiserscrib.com':   'Admin@123',
  'staff@cruiserscrib.com':   'Staff@123',
  'manager@cruiserscrib.com': 'Mgr@123',
}

export default function AccountSecurity() {
  const { user, updateUser } = useUserContext()
  const { toast } = useToast()
  const profileNameInputId = 'account-security-name'
  const profilePhoneInputId = 'account-security-phone'
  const profileEmailInputId = 'account-security-email'
  const currentPasswordInputId = 'account-security-current-password'
  const newPasswordInputId = 'account-security-new-password'
  const confirmPasswordInputId = 'account-security-confirm-password'

  // Profile state
  const [name,  setName]  = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [profileLoading, setProfileLoading] = useState(false)

  // Password state
  const [currentPass,  setCurrentPass]  = useState('')
  const [newPass,      setNewPass]      = useState('')
  const [confirmPass,  setConfirmPass]  = useState('')
  const [showCurrent,  setShowCurrent]  = useState(false)
  const [showNew,      setShowNew]      = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [passErrors,   setPassErrors]   = useState({})
  const [passLoading,  setPassLoading]  = useState(false)
  const [showOtp,      setShowOtp]      = useState(false)

  const checks = useMemo(() => getPasswordChecks(newPass), [newPass])
  const passwordsMatch = confirmPass.length > 0 && newPass === confirmPass

  function handleProfileSave() {
    if (!name.trim()) {
      toast({ type: 'error', title: 'Validation Error', message: 'Name cannot be empty.' })
      return
    }
    if (phone) {
      const phoneErr = validatePhoneNumber(phone)
      if (phoneErr) {
        toast({ type: 'error', title: 'Invalid Phone', message: phoneErr })
        return
      }
    }
    setProfileLoading(true)
    setTimeout(() => {
      const initials = name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
      updateUser({ name: name.trim(), phone: normalizePhoneNumber(phone), initials })
      setProfileLoading(false)
      toast({ type: 'success', title: 'Profile Updated', message: 'Your information has been saved.' })
    }, 500)
  }

  function handlePasswordSubmit() {
    const errors = {}
    if (!currentPass) errors.current = 'Enter your current password.'
    else {
      const expected = MOCK_PASSWORDS[user?.email]
      if (expected && currentPass !== expected) errors.current = 'Current password is incorrect.'
    }
    const passErr = validatePassword(newPass)
    if (passErr) errors.newPass = passErr
    if (!confirmPass) errors.confirm = 'Re-enter your new password.'
    else if (newPass !== confirmPass) errors.confirm = 'Passwords do not match.'
    if (newPass && currentPass && newPass === currentPass) errors.newPass = 'New password must be different from current.'

    setPassErrors(errors)
    if (Object.keys(errors).length > 0) return

    // Show OTP for verification
    setShowOtp(true)
  }

  function handleOtpVerify() {
    setShowOtp(false)
    setPassLoading(true)
    setTimeout(() => {
      setPassLoading(false)
      setCurrentPass('')
      setNewPass('')
      setConfirmPass('')
      setPassErrors({})
      toast({ type: 'success', title: 'Password Changed', message: 'Your password has been updated successfully.' })
    }, 600)
  }

  return (
    <div className="max-w-2xl space-y-6">

      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Shield size={22} style={{ color: '#f07c00' }} />
          <h1 className="text-xl font-bold text-ink-primary">Account Security</h1>
        </div>
        <p className="text-sm text-ink-muted">Manage your profile information and password.</p>
      </div>

      {/* ═══ Profile Information ═══ */}
      <div className="card">
        <div className="px-5 py-4 border-b border-surface-border">
          <p className="card-title flex items-center gap-2">
            <User size={16} className="text-ink-muted" /> Profile Information
          </p>
          <p className="text-xs text-ink-muted mt-0.5">Update your basic details.</p>
        </div>
        <div className="p-5 space-y-4">

          {/* Name */}
          <div>
            <label htmlFor={profileNameInputId} className="label">Full Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-dim" />
              <input
                id={profileNameInputId}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input pl-10"
                placeholder="Your full name"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor={profilePhoneInputId} className="label">Phone Number</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-dim" />
              <input
                id={profilePhoneInputId}
                type="tel"
                value={phone}
                onChange={e => setPhone(normalizePhoneNumber(e.target.value))}
                className="input pl-10"
                placeholder="09XXXXXXXXX"
                maxLength={11}
              />
            </div>
            <p className="text-[10px] text-ink-dim mt-1">11-digit PH mobile number starting with 09</p>
          </div>

          {/* Email (read-only) */}
          <div>
            <label htmlFor={profileEmailInputId} className="label">Email Address</label>
            <input
              id={profileEmailInputId}
              type="email"
              value={user?.email || ''}
              disabled
              className="input opacity-60 cursor-not-allowed"
            />
            <p className="text-[10px] text-ink-dim mt-1">Email cannot be changed.</p>
          </div>

          <button
            onClick={handleProfileSave}
            disabled={profileLoading}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {profileLoading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ═══ Change Password ═══ */}
      <div className="card">
        <div className="px-5 py-4 border-b border-surface-border">
          <p className="card-title flex items-center gap-2">
            <Lock size={16} className="text-ink-muted" /> Change Password
          </p>
          <p className="text-xs text-ink-muted mt-0.5">You will need to verify via OTP before the change takes effect.</p>
        </div>
        <div className="p-5 space-y-4">

          {/* Current Password */}
          <div>
            <label htmlFor={currentPasswordInputId} className="label">Current Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-dim" />
              <input
                id={currentPasswordInputId}
                type={showCurrent ? 'text' : 'password'}
                value={currentPass}
                onChange={e => { setCurrentPass(e.target.value); setPassErrors(p => ({...p, current: ''})) }}
                className={`input pl-10 pr-10 ${passErrors.current ? 'border-red-500/50' : ''}`}
                placeholder="Enter current password"
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink-secondary transition-colors">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passErrors.current && <p className="text-xs text-red-400 mt-1.5">{passErrors.current}</p>}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor={newPasswordInputId} className="label">New Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-dim" />
              <input
                id={newPasswordInputId}
                type={showNew ? 'text' : 'password'}
                value={newPass}
                onChange={e => { setNewPass(e.target.value); setPassErrors(p => ({...p, newPass: ''})) }}
                className={`input pl-10 pr-10 ${passErrors.newPass ? 'border-red-500/50' : ''}`}
                placeholder="Enter new password"
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink-secondary transition-colors">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passErrors.newPass && <p className="text-xs text-red-400 mt-1.5">{passErrors.newPass}</p>}

            {/* Password checklist */}
            {newPass.length > 0 && (
              <div className="mt-3 space-y-1.5 rounded-xl px-4 py-3 bg-surface-input border border-surface-border">
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

          {/* Confirm New Password */}
          <div>
            <label htmlFor={confirmPasswordInputId} className="label">Confirm New Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-dim" />
              <input
                id={confirmPasswordInputId}
                type={showConfirm ? 'text' : 'password'}
                value={confirmPass}
                onChange={e => { setConfirmPass(e.target.value); setPassErrors(p => ({...p, confirm: ''})) }}
                className={`input pl-10 pr-10 ${
                  passErrors.confirm || (confirmPass && !passwordsMatch)
                    ? 'border-red-500/50'
                    : confirmPass && passwordsMatch ? 'border-emerald-500/50' : ''
                }`}
                placeholder="Re-enter new password"
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink-secondary transition-colors">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passErrors.confirm && <p className="text-xs text-red-400 mt-1.5">{passErrors.confirm}</p>}
            {!passErrors.confirm && confirmPass && !passwordsMatch && (
              <p className="text-xs text-red-400 mt-1.5">Passwords do not match.</p>
            )}
            {confirmPass && passwordsMatch && (
              <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1.5">
                <CheckCircle2 size={12} /> Passwords match
              </p>
            )}
          </div>

          <button
            onClick={handlePasswordSubmit}
            disabled={passLoading}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {passLoading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
            {passLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* OTP Modal for password change verification */}
      <OtpModal
        isOpen={showOtp}
        onClose={() => setShowOtp(false)}
        onVerify={handleOtpVerify}
        onInvalidCode={() =>
          toast({
            type: 'error',
            title: 'Wrong Code',
            message: 'The verification code is incorrect. Please try again.',
          })
        }
        email={user?.email}
        purpose="password-change"
      />
    </div>
  )
}

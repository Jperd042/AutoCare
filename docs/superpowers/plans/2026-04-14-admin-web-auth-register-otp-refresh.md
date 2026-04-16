# Admin Web Auth Register and OTP Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the web admin registration flow and shared OTP experience so registration matches the new reference direction, OTP uses a polished six-box flow, registration lands in the dashboard after successful verification, and password-change OTP shows stronger failure feedback.

**Architecture:** Keep the existing AppShell auth split and shared OTP modal architecture, but strengthen the OTP boundary. Add a small Vitest + Testing Library harness first, then update `OtpInput` and `OtpModal`, then refresh `Register`, and finally wire `AccountSecurity` into the upgraded OTP callbacks for password-change feedback.

**Tech Stack:** Next.js 15, React 19, Tailwind utility classes, Framer Motion, Vitest, React Testing Library, Testing Library User Event, jsdom

---

## File Structure

### Existing files to modify

- `apps/web/package.json`
  Purpose: add test scripts and web test dev dependencies.
- `apps/web/src/components/OtpInput.js`
  Purpose: always render six boxes and harden keyboard/paste behavior.
- `apps/web/src/components/OtpModal.js`
  Purpose: upgrade shared OTP presentation, error handling, purpose-specific copy, and optional invalid-code callback support.
- `apps/web/src/screens/Register.js`
  Purpose: refresh the register UI and emit an admin session payload after OTP success.
- `apps/web/src/screens/AccountSecurity.js`
  Purpose: use the new OTP failure callback to show a toast on wrong password-change codes.

### New files to create

- `apps/web/vitest.config.mjs`
  Purpose: Vitest config with React plugin, jsdom environment, and path aliases.
- `apps/web/src/test/setup.js`
  Purpose: Testing Library and DOM matcher setup.
- `apps/web/src/test/renderWithProviders.js`
  Purpose: shared render helper for toast and user-context driven screens.
- `apps/web/src/lib/otp.js`
  Purpose: shared OTP constants, purpose-specific copy, and email masking helper.
- `apps/web/src/components/__tests__/OtpInput.test.jsx`
  Purpose: lock six-box rendering, paste, and backspace behavior.
- `apps/web/src/components/__tests__/OtpModal.test.jsx`
  Purpose: lock shared modal copy, invalid-code handling, and success callback behavior.
- `apps/web/src/screens/__tests__/Register.test.jsx`
  Purpose: lock register validation and post-OTP admin payload behavior.
- `apps/web/src/screens/__tests__/AccountSecurity.test.jsx`
  Purpose: lock wrong-code toast behavior and successful password-change cleanup.

## Task 1: Bootstrap the Web Test Harness While Fixing OTP Input Behavior

**Files:**
- Create: `apps/web/vitest.config.mjs`
- Create: `apps/web/src/test/setup.js`
- Create: `apps/web/src/test/renderWithProviders.js`
- Create: `apps/web/src/components/__tests__/OtpInput.test.jsx`
- Modify: `apps/web/package.json`
- Modify: `apps/web/src/components/OtpInput.js`

- [ ] **Step 1: Write the failing OTP input tests**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OtpInput from '@/components/OtpInput'

test('renders six inputs for an empty value', () => {
  render(<OtpInput value="" onChange={() => {}} />)

  expect(screen.getAllByRole('textbox')).toHaveLength(6)
})

test('pastes a full code into the six boxes', async () => {
  const user = userEvent.setup()
  const handleChange = vi.fn()

  render(<OtpInput value="" onChange={handleChange} />)

  const [firstBox] = screen.getAllByRole('textbox')
  await user.click(firstBox)
  await user.paste('123456')

  expect(handleChange).toHaveBeenLastCalledWith('123456')
})

test('moves backward and clears the previous digit on backspace from an empty box', async () => {
  const user = userEvent.setup()
  const handleChange = vi.fn()

  render(<OtpInput value="12" onChange={handleChange} />)

  const boxes = screen.getAllByRole('textbox')
  await user.click(boxes[2])
  await user.keyboard('{Backspace}')

  expect(handleChange).toHaveBeenLastCalledWith('1')
})
```

- [ ] **Step 2: Run the OTP input test to verify it fails**

Run:

```bash
npm -w @autocare/web run test -- src/components/__tests__/OtpInput.test.jsx
```

Expected:
- FAIL because the web package does not have a `test` script yet or Vitest is not installed.

- [ ] **Step 3: Add the web test scripts, dependencies, and configuration**

`apps/web/package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.19",
    "eslint": "^8",
    "eslint-config-next": "^15.3.0",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.6",
    "vitest": "^2.1.8"
  }
}
```

`apps/web/vitest.config.mjs`

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@autocare/shared': fileURLToPath(new URL('../../packages/shared/index.js', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    css: true,
  },
})
```

`apps/web/src/test/setup.js`

```js
import '@testing-library/jest-dom/vitest'
```

`apps/web/src/test/renderWithProviders.js`

```jsx
import { render } from '@testing-library/react'
import { vi } from 'vitest'
import { ToastProvider } from '@/components/Toast'
import { UserProvider } from '@/lib/userContext'

export function renderWithProviders(
  ui,
  {
    user = null,
    updateUser = vi.fn(),
    ...options
  } = {},
) {
  return render(
    <ToastProvider>
      <UserProvider user={user} updateUser={updateUser}>
        {ui}
      </UserProvider>
    </ToastProvider>,
    options,
  )
}
```

Install:

```bash
npm install -D -w @autocare/web vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @vitejs/plugin-react
```

- [ ] **Step 4: Run the OTP input test again to verify it still fails for the real behavior**

Run:

```bash
npm -w @autocare/web run test -- src/components/__tests__/OtpInput.test.jsx
```

Expected:
- FAIL on `renders six inputs for an empty value`
- Failure should show that fewer than 6 inputs are rendered by the current implementation.

- [ ] **Step 5: Write the minimal OTP input implementation**

`apps/web/src/components/OtpInput.js`

```jsx
'use client'

import { useRef, useCallback } from 'react'

const OTP_LENGTH = 6

export default function OtpInput({ value = '', onChange, disabled = false, error = false }) {
  const inputsRef = useRef([])
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? '')

  const focusAt = useCallback((index) => {
    requestAnimationFrame(() => {
      inputsRef.current[index]?.focus()
    })
  }, [])

  function updateDigits(nextDigits) {
    onChange(nextDigits.join('').replace(/\s/g, ''))
  }

  function handleChange(event, index) {
    const raw = event.target.value.replace(/\D/g, '')
    if (!raw) {
      const next = [...digits]
      next[index] = ''
      updateDigits(next)
      return
    }

    const next = [...digits]
    raw
      .slice(0, OTP_LENGTH - index)
      .split('')
      .forEach((digit, offset) => {
        next[index + offset] = digit
      })

    updateDigits(next)

    const nextIndex = Math.min(index + raw.length, OTP_LENGTH - 1)
    if (index + raw.length < OTP_LENGTH) {
      focusAt(nextIndex)
    } else {
      inputsRef.current[OTP_LENGTH - 1]?.blur()
    }
  }

  function handleKeyDown(event, index) {
    if (event.key === 'Backspace') {
      event.preventDefault()

      if (digits[index]) {
        const next = [...digits]
        next[index] = ''
        updateDigits(next)
        return
      }

      if (index > 0) {
        const next = [...digits]
        next[index - 1] = ''
        updateDigits(next)
        focusAt(index - 1)
      }
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      focusAt(index - 1)
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault()
      focusAt(index + 1)
    }
  }

  function handlePaste(event, index) {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH - index)
    if (!pasted) return

    const next = [...digits]
    pasted.split('').forEach((digit, offset) => {
      next[index + offset] = digit
    })

    updateDigits(next)

    const lastIndex = Math.min(index + pasted.length - 1, OTP_LENGTH - 1)
    focusAt(lastIndex)
  }

  return (
    <div className="flex gap-2.5 justify-center">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element
          }}
          aria-label={`OTP digit ${index + 1}`}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          value={digit}
          onChange={(event) => handleChange(event, index)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          onPaste={(event) => handlePaste(event, index)}
          onFocus={(event) => event.target.select()}
          className={`w-12 h-14 rounded-xl border text-center text-xl font-black outline-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? 'border-red-500/60 text-red-300 bg-red-500/5'
              : 'border-surface-border text-ink-primary bg-surface-input focus:border-brand-orange/60 focus:ring-2 focus:ring-brand-orange/15'
          }`}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 6: Run the OTP input tests to verify they pass**

Run:

```bash
npm -w @autocare/web run test -- src/components/__tests__/OtpInput.test.jsx
```

Expected:
- PASS for all three OTP input tests.

- [ ] **Step 7: Commit the OTP input and test harness work**

```bash
git add apps/web/package.json apps/web/vitest.config.mjs apps/web/src/test/setup.js apps/web/src/test/renderWithProviders.js apps/web/src/components/OtpInput.js apps/web/src/components/__tests__/OtpInput.test.jsx
git commit -m "test: add web auth test harness and otp input coverage"
```

## Task 2: Upgrade the Shared OTP Modal

**Files:**
- Create: `apps/web/src/lib/otp.js`
- Create: `apps/web/src/components/__tests__/OtpModal.test.jsx`
- Modify: `apps/web/src/components/OtpModal.js`

- [ ] **Step 1: Write the failing OTP modal tests**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OtpModal from '@/components/OtpModal'

test('shows registration-specific copy and verify action text', () => {
  render(
    <OtpModal
      isOpen
      onClose={() => {}}
      onVerify={() => {}}
      email="lead@cruiserscrib.com"
      purpose="registration"
    />,
  )

  expect(screen.getByRole('dialog', { name: /verify admin email/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /verify registration code/i })).toBeInTheDocument()
})

test('keeps the modal open and shows the invalid-code message when the code is wrong', async () => {
  vi.useFakeTimers()
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  const handleVerify = vi.fn()
  const handleInvalidCode = vi.fn()

  render(
    <OtpModal
      isOpen
      onClose={() => {}}
      onVerify={handleVerify}
      onInvalidCode={handleInvalidCode}
      email="lead@cruiserscrib.com"
      purpose="password-change"
    />,
  )

  for (const digit of '654321') {
    await user.keyboard(digit)
  }

  await user.click(screen.getByRole('button', { name: /verify password change code/i }))
  await vi.advanceTimersByTimeAsync(800)

  expect(handleVerify).not.toHaveBeenCalled()
  expect(handleInvalidCode).toHaveBeenCalledTimes(1)
  expect(screen.getByText(/the verification code is incorrect\. please try again\./i)).toBeInTheDocument()
  expect(screen.getByRole('dialog', { name: /confirm password change/i })).toBeInTheDocument()
})

test('calls onVerify when the correct six-digit code is submitted', async () => {
  vi.useFakeTimers()
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  const handleVerify = vi.fn()

  render(
    <OtpModal
      isOpen
      onClose={() => {}}
      onVerify={handleVerify}
      email="lead@cruiserscrib.com"
      purpose="registration"
    />,
  )

  for (const digit of '123456') {
    await user.keyboard(digit)
  }

  await user.click(screen.getByRole('button', { name: /verify registration code/i }))
  await vi.advanceTimersByTimeAsync(800)

  expect(handleVerify).toHaveBeenCalledTimes(1)
})
```

- [ ] **Step 2: Run the OTP modal tests to verify they fail**

Run:

```bash
npm -w @autocare/web run test -- src/components/__tests__/OtpModal.test.jsx
```

Expected:
- FAIL because the current modal uses generic copy, lacks an accessible dialog label, and does not expose `onInvalidCode`.

- [ ] **Step 3: Write the minimal OTP modal support module**

`apps/web/src/lib/otp.js`

```js
export const MOCK_OTP = '123456'
export const RESEND_SECONDS = 60

export const OTP_CONTENT = {
  login: {
    title: 'Two-Factor Auth',
    subtitle: 'Enter the secure code sent to',
    label: 'Prototype code',
    buttonLabel: 'Verify Sign-In Code',
    invalidMessage: 'Wrong code. Please try again.',
  },
  registration: {
    title: 'Verify Admin Email',
    subtitle: 'Enter the secure code sent to',
    label: 'Prototype code',
    buttonLabel: 'Verify Registration Code',
    invalidMessage: 'Wrong code. Please try again.',
  },
  'password-change': {
    title: 'Confirm Password Change',
    subtitle: 'Verify the 6-digit code sent to',
    label: 'Prototype code',
    buttonLabel: 'Verify Password Change Code',
    invalidMessage: 'Wrong code. Please try again.',
  },
}

export function getOtpContent(purpose = 'login') {
  return OTP_CONTENT[purpose] || OTP_CONTENT.login
}

export function maskEmail(email) {
  if (!email) return '***'

  const [local, domain] = email.split('@')
  if (!domain) return '***'

  const maskedLocal =
    local.length <= 2
      ? `${local[0] || '*'}*`
      : `${local[0]}***${local.slice(-1)}`

  return `${maskedLocal}@${domain}`
}
```

- [ ] **Step 4: Write the minimal OTP modal implementation**

`apps/web/src/components/OtpModal.js`

```jsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShieldCheck, Mail, Loader2, AlertCircle } from 'lucide-react'
import OtpInput from './OtpInput'
import { MOCK_OTP, RESEND_SECONDS, getOtpContent, maskEmail } from '@/lib/otp'

export default function OtpModal({
  isOpen,
  onClose,
  onVerify,
  onInvalidCode,
  email,
  purpose = 'login',
}) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS)
  const [sent, setSent] = useState(false)

  const content = getOtpContent(purpose)

  useEffect(() => {
    if (!isOpen) return

    setCode('')
    setError('')
    setLoading(false)
    setResendTimer(RESEND_SECONDS)
    setSent(false)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || resendTimer <= 0) return

    const timer = setInterval(() => {
      setResendTimer((current) => current - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, resendTimer])

  const handleVerify = useCallback(async () => {
    if (code.length !== 6) {
      setError('Enter all 6 digits.')
      return
    }

    setLoading(true)
    setError('')

    await new Promise((resolve) => setTimeout(resolve, 800))

    if (code !== MOCK_OTP) {
      setLoading(false)
      setError(content.invalidMessage)
      onInvalidCode?.(content.invalidMessage)
      return
    }

    onVerify()
  }, [code, content.invalidMessage, onInvalidCode, onVerify])

  const handleResend = useCallback(() => {
    setResendTimer(RESEND_SECONDS)
    setSent(true)
    setError('')
    setTimeout(() => setSent(false), 2000)
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.76)', backdropFilter: 'blur(10px)' }}
          onClick={(event) => {
            if (event.target === event.currentTarget && !loading) onClose()
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={content.title}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="w-full max-w-md rounded-3xl border p-6 md:p-7"
            style={{
              background: 'linear-gradient(180deg, rgba(17,17,19,0.96) 0%, rgba(11,11,12,0.98) 100%)',
              borderColor: 'rgba(255,255,255,0.08)',
              boxShadow: '0 28px 80px rgba(0,0,0,0.6)',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(240,124,0,0.14)', border: '1px solid rgba(240,124,0,0.22)' }}
              >
                <ShieldCheck size={20} style={{ color: '#f07c00' }} />
              </div>
              <div>
                <h3 className="text-xl font-black text-ink-primary">{content.title}</h3>
                <p className="text-xs text-ink-muted">{content.subtitle}</p>
              </div>
            </div>

            <div
              className="flex items-center gap-2 rounded-2xl px-4 py-3.5 mb-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Mail size={14} className="text-ink-dim" />
              <p className="text-sm font-mono text-ink-secondary">{maskEmail(email)}</p>
            </div>

            <div
              className="rounded-2xl px-4 py-4 mb-5"
              style={{ background: 'rgba(240,124,0,0.08)', border: '1px solid rgba(240,124,0,0.16)' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] mb-2" style={{ color: '#f07c00' }}>
                {content.label}
              </p>
              <p className="text-3xl font-black tracking-[0.34em] text-ink-primary">123456</p>
            </div>

            <div className="mb-4">
              <OtpInput value={code} onChange={setCode} disabled={loading} error={Boolean(error)} />
            </div>

            {error && (
              <div
                className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 mb-4"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}
              >
                <AlertCircle size={14} className="text-red-400" />
                <p className="text-xs font-semibold text-red-300">{error}</p>
              </div>
            )}

            {sent && <p className="text-xs text-emerald-400 text-center mb-4">A fresh code has been sent.</p>}

            <div className="text-center mb-5">
              {resendTimer > 0 ? (
                <p className="text-xs text-ink-muted">
                  Resend code in <span className="font-bold text-ink-secondary">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="text-xs font-bold hover:underline disabled:opacity-50"
                  style={{ color: '#f07c00' }}
                >
                  Resend Code
                </button>
              )}
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="w-full rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading ? 'rgba(179,84,30,0.5)' : 'linear-gradient(135deg,#f07c00 0%,#b3541e 100%)',
                boxShadow: loading ? 'none' : '0 10px 26px rgba(179,84,30,0.34)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Verifying...
                </span>
              ) : (
                content.buttonLabel
              )}
            </button>

            <button
              onClick={onClose}
              disabled={loading}
              className="w-full mt-2.5 py-2.5 text-xs font-semibold text-ink-muted hover:text-ink-secondary disabled:opacity-50"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 5: Run the OTP modal tests to verify they pass**

Run:

```bash
npm -w @autocare/web run test -- src/components/__tests__/OtpModal.test.jsx
```

Expected:
- PASS for all OTP modal tests.

- [ ] **Step 6: Commit the shared OTP modal work**

```bash
git add apps/web/src/lib/otp.js apps/web/src/components/OtpModal.js apps/web/src/components/__tests__/OtpModal.test.jsx
git commit -m "feat: refresh shared web otp modal"
```

## Task 3: Refresh the Register Screen and Emit an Admin Session Payload

**Files:**
- Create: `apps/web/src/screens/__tests__/Register.test.jsx`
- Modify: `apps/web/src/screens/Register.js`

- [ ] **Step 1: Write the failing register tests**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Register from '@/screens/Register'

test('does not open the OTP modal when register validation fails', async () => {
  const user = userEvent.setup()

  render(<Register onRegister={vi.fn()} onGoToLogin={() => {}} />)

  await user.click(screen.getByRole('button', { name: /create account/i }))

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByText(/enter your full name/i)).toBeInTheDocument()
})

test('submits an administrator session payload after a successful OTP verification', async () => {
  vi.useFakeTimers()
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  const handleRegister = vi.fn()

  render(<Register onRegister={handleRegister} onGoToLogin={() => {}} />)

  await user.type(screen.getByLabelText(/full name/i), 'Juan Dela Cruz')
  await user.type(screen.getByLabelText(/email address/i), 'juan@cruiserscrib.com')
  await user.type(screen.getByLabelText(/^password$/i), 'Admin@123')
  await user.type(screen.getByLabelText(/re-enter password/i), 'Admin@123')

  await user.click(screen.getByRole('button', { name: /create account/i }))

  expect(screen.getByRole('dialog', { name: /verify admin email/i })).toBeInTheDocument()

  for (const digit of '123456') {
    await user.keyboard(digit)
  }

  await user.click(screen.getByRole('button', { name: /verify registration code/i }))
  await vi.advanceTimersByTimeAsync(800)
  await vi.advanceTimersByTimeAsync(400)

  expect(handleRegister).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'Juan Dela Cruz',
      email: 'juan@cruiserscrib.com',
      role: 'Administrator',
      initials: 'JD',
    }),
  )
})
```

- [ ] **Step 2: Run the register tests to verify they fail**

Run:

```bash
npm -w @autocare/web run test -- src/screens/__tests__/Register.test.jsx
```

Expected:
- FAIL on the successful register test because the current screen still emits `role: 'Customer'` and uses the old OTP copy.

- [ ] **Step 3: Write the minimal register implementation**

`apps/web/src/screens/Register.js`

```jsx
function handleOtpVerify() {
  setShowOtp(false)
  setLoading(true)

  setTimeout(() => {
    const fullName = name.trim()
    const initials = fullName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    onRegister({
      name: fullName,
      email: email.trim().toLowerCase(),
      role: 'Administrator',
      initials,
    })
  }, 400)
}
```

Refresh the right-side auth surface so the form matches the approved admin-portal direction more closely:

```jsx
<div
  className="flex-1 lg:w-[40%] flex items-center justify-center px-6 py-10 overflow-y-auto"
  style={{ background: 'radial-gradient(circle at top, rgba(179,84,30,0.12), transparent 40%), #101010' }}
>
  <div
    className="w-full max-w-[430px] rounded-[28px] px-6 py-7 md:px-8 md:py-9"
    style={{
      background: 'linear-gradient(180deg, rgba(20,20,21,0.96) 0%, rgba(14,14,15,0.98) 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
    }}
  >
    <div className="flex justify-center mb-7">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#f07c00,#b3541e)', boxShadow: '0 0 24px rgba(240,124,0,0.28)' }}
      >
        <Cog size={20} className="text-white" />
      </div>
    </div>

    <h2 className="text-4xl font-black text-white text-center leading-tight">Create Account</h2>
    <p className="text-sm text-center mt-2 mb-7" style={{ color: 'rgba(255,255,255,0.48)' }}>
      Register an admin or employee portal account.
    </p>
```

Keep the existing hero panel, validation logic, password checklist, and OTP open behavior intact while tightening spacing and form chrome to match the new direction.

- [ ] **Step 4: Run the register tests to verify they pass**

Run:

```bash
npm -w @autocare/web run test -- src/screens/__tests__/Register.test.jsx
```

Expected:
- PASS for both register tests.

- [ ] **Step 5: Commit the register refresh**

```bash
git add apps/web/src/screens/Register.js apps/web/src/screens/__tests__/Register.test.jsx
git commit -m "feat: refresh admin register flow"
```

## Task 4: Wire Password-Change OTP Failure Feedback Into the Shared Flow

**Files:**
- Create: `apps/web/src/screens/__tests__/AccountSecurity.test.jsx`
- Modify: `apps/web/src/screens/AccountSecurity.js`

- [ ] **Step 1: Write the failing password-change OTP tests**

```jsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccountSecurity from '@/screens/AccountSecurity'
import { renderWithProviders } from '@/test/renderWithProviders'

const mockUser = {
  name: 'Renan Castro',
  email: 'admin@cruiserscrib.com',
  role: 'Service Manager',
  initials: 'RC',
}

test('shows a wrong-code toast and keeps the password values when OTP verification fails', async () => {
  vi.useFakeTimers()
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

  renderWithProviders(<AccountSecurity />, { user: mockUser })

  await user.type(screen.getByLabelText(/current password/i), 'Admin@123')
  await user.type(screen.getByLabelText(/new password/i), 'Safer@123')
  await user.type(screen.getByLabelText(/confirm new password/i), 'Safer@123')
  await user.click(screen.getByRole('button', { name: /update password/i }))

  for (const digit of '654321') {
    await user.keyboard(digit)
  }

  await user.click(screen.getByRole('button', { name: /verify password change code/i }))
  await vi.advanceTimersByTimeAsync(800)

  expect(screen.getByText(/wrong code/i)).toBeInTheDocument()
  expect(screen.getByDisplayValue('Admin@123')).toBeInTheDocument()
  expect(screen.getByDisplayValue('Safer@123')).toBeInTheDocument()
})

test('clears the password fields after a successful password-change OTP verification', async () => {
  vi.useFakeTimers()
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

  renderWithProviders(<AccountSecurity />, { user: mockUser })

  await user.type(screen.getByLabelText(/current password/i), 'Admin@123')
  await user.type(screen.getByLabelText(/new password/i), 'Safer@123')
  await user.type(screen.getByLabelText(/confirm new password/i), 'Safer@123')
  await user.click(screen.getByRole('button', { name: /update password/i }))

  for (const digit of '123456') {
    await user.keyboard(digit)
  }

  await user.click(screen.getByRole('button', { name: /verify password change code/i }))
  await vi.advanceTimersByTimeAsync(800)
  await vi.advanceTimersByTimeAsync(600)

  expect(screen.getByText(/password changed/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/current password/i)).toHaveValue('')
  expect(screen.getByLabelText(/new password/i)).toHaveValue('')
  expect(screen.getByLabelText(/confirm new password/i)).toHaveValue('')
})
```

- [ ] **Step 2: Run the password-change tests to verify they fail**

Run:

```bash
npm -w @autocare/web run test -- src/screens/__tests__/AccountSecurity.test.jsx
```

Expected:
- FAIL because the current screen does not pass an `onInvalidCode` callback into `OtpModal`, so the wrong-code toast expectation is not satisfied.

- [ ] **Step 3: Write the minimal account security integration**

`apps/web/src/screens/AccountSecurity.js`

```jsx
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
```

Keep the rest of the password-change flow the same so successful OTP verification still:
- closes the modal,
- clears all three password fields,
- clears local field errors,
- shows the existing success toast.

- [ ] **Step 4: Run the password-change tests to verify they pass**

Run:

```bash
npm -w @autocare/web run test -- src/screens/__tests__/AccountSecurity.test.jsx
```

Expected:
- PASS for both password-change OTP tests.

- [ ] **Step 5: Commit the password-change integration**

```bash
git add apps/web/src/screens/AccountSecurity.js apps/web/src/screens/__tests__/AccountSecurity.test.jsx
git commit -m "feat: add password otp failure feedback"
```

## Task 5: Verify the Whole Web Auth Refresh

**Files:**
- Test: `apps/web/src/components/__tests__/OtpInput.test.jsx`
- Test: `apps/web/src/components/__tests__/OtpModal.test.jsx`
- Test: `apps/web/src/screens/__tests__/Register.test.jsx`
- Test: `apps/web/src/screens/__tests__/AccountSecurity.test.jsx`

- [ ] **Step 1: Run the full web auth test suite**

Run:

```bash
npm -w @autocare/web run test
```

Expected:
- PASS for all four new auth-focused test files.

- [ ] **Step 2: Run lint**

Run:

```bash
npm -w @autocare/web run lint
```

Expected:
- PASS with no new lint errors.

- [ ] **Step 3: Run the production build**

Run:

```bash
npm -w @autocare/web run build
```

Expected:
- PASS with a successful Next.js production build.

- [ ] **Step 4: Manually verify the visual and behavioral flows**

Run:

```bash
npm -w @autocare/web run dev
```

Manual checklist:
- Open the register screen from the login view and verify the refreshed admin-card styling on desktop.
- Narrow the viewport and verify the register layout still works on mobile widths.
- Submit an invalid register form and confirm field-level validation prevents the OTP modal from opening.
- Submit a valid register form, enter `123456`, and confirm the dashboard appears immediately after verification.
- Reopen the register flow, enter an invalid OTP, and confirm the modal stays open with the wrong-code banner.
- Open Account Security, submit a password change, enter an invalid OTP, and confirm the toast appears while the entered password values remain intact.
- Repeat with `123456` and confirm the success toast appears and the password fields clear.

- [ ] **Step 5: Commit the verified auth refresh**

```bash
git add apps/web
git commit -m "feat: refresh admin web register and otp flows"
```

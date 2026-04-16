import userEvent from '@testing-library/user-event'
import { act, screen } from '@testing-library/react'
import AccountSecurity from '../AccountSecurity.js'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'

jest.mock('framer-motion', () => {
  const React = require('react')

  function sanitizeProps(props) {
    const {
      animate,
      exit,
      initial,
      layout,
      transition,
      whileHover,
      whileTap,
      ...rest
    } = props

    return rest
  }

  return {
    AnimatePresence: ({ children }) => <>{children}</>,
    motion: new Proxy(
      {},
      {
        get: (_, tag) =>
          React.forwardRef(function MotionMock({ children, ...props }, ref) {
            return React.createElement(tag, { ...sanitizeProps(props), ref }, children)
          }),
      }
    ),
  }
})

const mockUser = {
  name: 'Renan Castro',
  email: 'admin@cruiserscrib.com',
  role: 'Service Manager',
  initials: 'RC',
}

describe('AccountSecurity', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.clearAllTimers()
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('shows a wrong-code toast and keeps password values when OTP verification fails', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    renderWithProviders(<AccountSecurity />, { user: mockUser })

    await user.type(screen.getByLabelText(/current password/i), 'Admin@123')
    await user.type(screen.getByLabelText(/^new password$/i), 'Safer@123')
    await user.type(screen.getByLabelText(/^confirm new password$/i), 'Safer@123')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(screen.getByRole('dialog', { name: /confirm password change/i })).toBeInTheDocument()

    for (const [index, digit] of ['6', '5', '4', '3', '2', '1'].entries()) {
      await user.type(screen.getByLabelText(`OTP digit ${index + 1}`), digit)
    }

    await user.click(screen.getByRole('button', { name: /confirm password change/i }))

    await act(async () => {
      jest.advanceTimersByTime(300)
    })

    expect(screen.getByText(/wrong code/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/current password/i)).toHaveValue('Admin@123')
    expect(screen.getByLabelText(/^new password$/i)).toHaveValue('Safer@123')
    expect(screen.getByLabelText(/^confirm new password$/i)).toHaveValue('Safer@123')
  })

  it('clears password fields after a successful password-change OTP verification', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    renderWithProviders(<AccountSecurity />, { user: mockUser })

    await user.type(screen.getByLabelText(/current password/i), 'Admin@123')
    await user.type(screen.getByLabelText(/^new password$/i), 'Safer@123')
    await user.type(screen.getByLabelText(/^confirm new password$/i), 'Safer@123')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(screen.getByRole('dialog', { name: /confirm password change/i })).toBeInTheDocument()

    for (const [index, digit] of ['1', '2', '3', '4', '5', '6'].entries()) {
      await user.type(screen.getByLabelText(`OTP digit ${index + 1}`), digit)
    }

    await user.click(screen.getByRole('button', { name: /confirm password change/i }))

    await act(async () => {
      jest.advanceTimersByTime(300)
    })

    await act(async () => {
      jest.advanceTimersByTime(600)
    })

    expect(screen.getByText(/password changed/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/current password/i)).toHaveValue('')
    expect(screen.getByLabelText(/^new password$/i)).toHaveValue('')
    expect(screen.getByLabelText(/^confirm new password$/i)).toHaveValue('')
  })
})

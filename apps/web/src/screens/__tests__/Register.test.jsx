import userEvent from '@testing-library/user-event'
import { act, render, screen } from '@testing-library/react'
import Register from '../Register.js'

describe('Register', () => {
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

  it('keeps the OTP modal closed when the form is invalid and shows the name validation message', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const onRegister = jest.fn()

    render(<Register onRegister={onRegister} onGoToLogin={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText(/enter your full name\./i)).toBeInTheDocument()
    expect(onRegister).not.toHaveBeenCalled()
  })

  it('registers an administrator session payload after OTP verification', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const onRegister = jest.fn()

    render(<Register onRegister={onRegister} onGoToLogin={jest.fn()} />)

    await user.type(screen.getByLabelText(/full name/i), '  Juan Dela Cruz  ')
    await user.type(screen.getByLabelText(/email address/i), 'juan@cruiserscrib.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Admin123!')
    await user.type(screen.getByLabelText(/re-enter password/i), 'Admin123!')

    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByRole('dialog', { name: /verify your email/i })).toBeInTheDocument()

    for (const [index, digit] of ['1', '2', '3', '4', '5', '6'].entries()) {
      await user.type(screen.getByLabelText(`OTP digit ${index + 1}`), digit)
    }

    await user.click(screen.getByRole('button', { name: /verify email/i }))

    await act(async () => {
      jest.advanceTimersByTime(300)
    })

    await act(async () => {
      jest.advanceTimersByTime(400)
    })

    expect(onRegister).toHaveBeenCalledWith({
      name: 'Juan Dela Cruz',
      email: 'juan@cruiserscrib.com',
      role: 'Administrator',
      initials: 'JD',
    })
  })
})

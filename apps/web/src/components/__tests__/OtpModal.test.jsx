import userEvent from '@testing-library/user-event'
import { act, render, screen } from '@testing-library/react'
import OtpModal from '../OtpModal.js'

describe('OtpModal', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('shows registration-specific copy and button label', () => {
    render(
      <OtpModal
        isOpen
        onClose={jest.fn()}
        onVerify={jest.fn()}
        email="jane.doe@example.com"
        purpose="registration"
      />,
    )

    expect(screen.getByRole('dialog', { name: /verify your email/i })).toBeInTheDocument()
    expect(screen.getByText(/registration code/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /verify email/i })).toBeInTheDocument()
  })

  it('keeps the modal open on a wrong code, shows the invalid message, and calls onInvalidCode', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const onClose = jest.fn()
    const onVerify = jest.fn()
    const onInvalidCode = jest.fn()

    render(
      <OtpModal
        isOpen
        onClose={onClose}
        onVerify={onVerify}
        onInvalidCode={onInvalidCode}
        email="jane.doe@example.com"
        purpose="registration"
      />,
    )

    for (const [index, digit] of ['1', '2', '3', '4', '5', '0'].entries()) {
      await user.type(screen.getByLabelText(`OTP digit ${index + 1}`), digit)
    }

    await user.click(screen.getByRole('button', { name: /verify email/i }))

    await act(async () => {
      jest.advanceTimersByTime(300)
    })

    expect(screen.getByRole('dialog', { name: /verify your email/i })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(/verification code is not correct/i)
    expect(onInvalidCode).toHaveBeenCalledWith('That verification code is not correct. Try again.')
    expect(onVerify).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onVerify when the code is correct', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const onVerify = jest.fn()

    render(
      <OtpModal
        isOpen
        onClose={jest.fn()}
        onVerify={onVerify}
        email="jane.doe@example.com"
        purpose="registration"
      />,
    )

    for (const [index, digit] of ['1', '2', '3', '4', '5', '6'].entries()) {
      await user.type(screen.getByLabelText(`OTP digit ${index + 1}`), digit)
    }

    await user.click(screen.getByRole('button', { name: /verify email/i }))

    await act(async () => {
      jest.advanceTimersByTime(300)
    })

    expect(onVerify).toHaveBeenCalled()
  })
})

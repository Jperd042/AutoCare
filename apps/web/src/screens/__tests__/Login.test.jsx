import { render, screen } from '@testing-library/react'
import Login from '../Login.js'

describe('Login', () => {
  it('wraps the admin form in a premium card and uses roomier field spacing', () => {
    render(<Login onLogin={jest.fn()} onGoToRegister={jest.fn()} />)

    const card = screen.getByTestId('admin-login-card')
    const portalEyebrow = screen.getByTestId('admin-portal-eyebrow')
    const emailInput = screen.getByPlaceholderText('you@cruiserscrib.com')
    const passwordInput = screen.getByPlaceholderText('Enter your password')

    expect(card).toBeInTheDocument()
    expect(card.className).toContain('rounded-2xl')
    expect(card.className).toContain('border')
    expect(card.className).toContain('border-neutral-800')
    expect(card.className).toContain('bg-neutral-900')
    expect(portalEyebrow.className).toContain('font-semibold')
    expect(portalEyebrow.className).toContain('tracking-[0.24em]')
    expect(emailInput.className).toContain('py-3.5')
    expect(passwordInput.className).toContain('py-3.5')
  })
})

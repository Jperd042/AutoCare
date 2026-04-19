import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import SettingsWorkspace from '../SettingsWorkspace.js'

const mockUser = {
  name: 'Renan Castro',
  email: 'admin@cruiserscrib.com',
  role: 'Service Manager',
  initials: 'RC',
  phone: '09123456789',
}

describe('SettingsWorkspace', () => {
  it('renders profile information first and lets the admin switch to account security', async () => {
    const user = userEvent.setup()

    renderWithProviders(<SettingsWorkspace />, { user: mockUser })

    expect(screen.getByRole('heading', { name: /profile information/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Renan Castro')

    await user.click(screen.getByRole('button', { name: /account security/i }))

    expect(screen.getByRole('heading', { name: /account security/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument()
    expect(screen.getByText('8-14 characters')).toBeInTheDocument()
  })
})

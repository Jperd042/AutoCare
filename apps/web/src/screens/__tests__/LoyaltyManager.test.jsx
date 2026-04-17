import userEvent from '@testing-library/user-event'
import { screen, within } from '@testing-library/react'
import LoyaltyManager from '../LoyaltyManager.js'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'

describe('LoyaltyManager', () => {
  it('creates a new active discount deal for a target tier', async () => {
    const user = userEvent.setup()

    renderWithProviders(<LoyaltyManager />)

    await user.click(screen.getByRole('button', { name: /discount deals/i }))
    await user.click(screen.getByRole('button', { name: /create deal/i }))

    await user.type(screen.getByLabelText(/deal title/i), 'Gold PMS Weekend')
    await user.selectOptions(screen.getByLabelText(/target tier/i), 'Gold')
    await user.selectOptions(screen.getByLabelText(/discount type/i), 'percentage')
    await user.clear(screen.getByLabelText(/discount value/i))
    await user.type(screen.getByLabelText(/discount value/i), '15')
    await user.type(screen.getByLabelText(/promo code/i), 'GOLD15')
    await user.type(screen.getByLabelText(/valid until/i), '2026-05-31')
    await user.type(screen.getByLabelText(/deal summary/i), 'Weekend-only PMS discount for gold members.')

    await user.click(screen.getByRole('button', { name: /^save deal$/i }))

    const dealsTable = screen.getByRole('table', { name: /discount deals table/i })
    const createdRow = within(dealsTable).getByText('Gold PMS Weekend').closest('tr')

    expect(createdRow).not.toBeNull()
    expect(within(createdRow).getByText('GOLD15')).toBeInTheDocument()
    expect(within(createdRow).getByText('Gold')).toBeInTheDocument()
  })
})

import React from 'react'
import userEvent from '@testing-library/user-event'
import { act, render, screen, waitFor } from '@testing-library/react'
import { archiveInventoryProduct, resetOperationsState } from '@autocare/shared'
import Topbar from '@/components/layout/Topbar.js'

const pushMock = jest.fn()
let pathnameMock = '/'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathnameMock,
}))

describe('Topbar', () => {
  beforeEach(() => {
    resetOperationsState()
    pushMock.mockReset()
    pathnameMock = '/'
  })

  it('shows Catalog Admin as the title for /admin/catalog', () => {
    pathnameMock = '/admin/catalog'

    render(<Topbar user={{ name: 'Admin User', role: 'Administrator', email: 'admin@test.local' }} />)

    expect(screen.getByRole('heading', { name: /catalog admin/i })).toBeInTheDocument()
  })

  it('keeps product search pointed at inventory results even when a product is archived', async () => {
    const user = userEvent.setup()

    act(() => {
      archiveInventoryProduct('p1')
    })

    render(<Topbar user={{ name: 'Admin User', role: 'Administrator', email: 'admin@test.local' }} />)

    await user.type(screen.getByPlaceholderText(/search/i), 'Castrol GTX')

    const productResult = await screen.findByRole('button', { name: /castrol gtx 10w-40/i })

    await user.click(productResult)

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/admin/inventory')
    })
  }, 15000)
})

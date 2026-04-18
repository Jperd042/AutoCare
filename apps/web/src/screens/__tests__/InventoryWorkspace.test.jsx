import React from 'react'
import { act, screen, within } from '@testing-library/react'
import { checkoutCart, resetOperationsState } from '@autocare/shared'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import InventoryWorkspace from '../InventoryWorkspace.js'

jest.mock('framer-motion', () => {
  const React = require('react')

  function sanitizeProps(props) {
    const {
      animate,
      exit,
      initial,
      layout,
      transition,
      variants,
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

describe('InventoryWorkspace', () => {
  beforeEach(() => {
    resetOperationsState()
  })

  it('highlights a row with a low-stock alert after a shared mobile checkout reduces inventory', () => {
    renderWithProviders(<InventoryWorkspace />)

    act(() => {
      checkoutCart({
        customerId: 'lp1',
        items: [{ productId: 'p2', quantity: 4 }],
      })
    })

    const inventoryTable = screen.getByRole('table', { name: /inventory table/i })
    const productRow = within(inventoryTable).getByText(/bridgestone ecopia ep300 205\/55r16/i).closest('tr')

    expect(productRow).not.toBeNull()
    expect(within(productRow).getByText(/4/)).toBeInTheDocument()
    expect(within(productRow).getByText(/low stock alert/i)).toBeInTheDocument()
  })
})

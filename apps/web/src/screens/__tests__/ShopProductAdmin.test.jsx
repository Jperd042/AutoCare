import React from 'react'
import userEvent from '@testing-library/user-event'
import { screen, waitFor, within } from '@testing-library/react'
import {
  getCatalogCategoriesSnapshot,
  getPublishedCatalogProductsSnapshot,
  resetOperationsState,
} from '@autocare/shared'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import ShopProductAdmin from '../ShopProductAdmin.js'

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

describe('ShopProductAdmin', () => {
  beforeEach(() => {
    resetOperationsState()
  })

  it('creates a new category and publishes a product immediately', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ShopProductAdmin />)

    await user.type(screen.getByLabelText(/new category name/i), 'Accessories')
    await user.click(screen.getByRole('button', { name: /add category/i }))

    await waitFor(() => {
      expect(getCatalogCategoriesSnapshot().some((category) => category.name === 'Accessories')).toBe(true)
    })

    await user.type(screen.getByLabelText(/product name/i), 'Seat Cover Deluxe')
    await user.selectOptions(screen.getByLabelText(/^category$/i), 'Accessories')
    await user.type(screen.getByLabelText(/price/i), '1499')
    await user.type(screen.getByLabelText(/stock/i), '12')
    await user.type(screen.getByLabelText(/sku/i), 'ACC-101')
    await user.type(
      screen.getByLabelText(/description/i),
      'Premium stitched seat covers for immediate catalog launch.'
    )
    await user.type(
      screen.getByLabelText(/image urls/i),
      'https://example.test/seat-cover-front.jpg\nhttps://example.test/seat-cover-back.jpg'
    )

    await user.click(screen.getByRole('button', { name: /publish product/i }))

    await waitFor(() => {
      expect(getPublishedCatalogProductsSnapshot().some((product) => product.name === 'Seat Cover Deluxe')).toBe(true)
    })

    const productRow = within(screen.getByRole('table', { name: /published products/i }))
      .getByText(/seat cover deluxe/i)
      .closest('tr')

    expect(productRow).not.toBeNull()
    expect(within(productRow).getByText(/accessories/i)).toBeInTheDocument()
    expect(within(productRow).getByText(/published/i)).toBeInTheDocument()
  }, 15000)

  it('archives a published product from the admin list', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ShopProductAdmin />)

    const productRow = within(screen.getByRole('table', { name: /published products/i }))
      .getByText(/bridgestone ecopia ep300 205\/55r16/i)
      .closest('tr')

    expect(productRow).not.toBeNull()

    await user.click(within(productRow).getByRole('button', { name: /archive bridgestone ecopia ep300 205\/55r16/i }))

    await waitFor(() => {
      expect(
        getPublishedCatalogProductsSnapshot().some(
          (product) => product.name === 'Bridgestone Ecopia EP300 205/55R16'
        )
      ).toBe(false)
    })

    expect(
      within(screen.getByRole('table', { name: /published products/i })).queryByText(
        /bridgestone ecopia ep300 205\/55r16/i
      )
    ).not.toBeInTheDocument()
  })
})

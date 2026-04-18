import React from 'react'
import userEvent from '@testing-library/user-event'
import { act, screen, within } from '@testing-library/react'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import Shop from '../Shop.js'

let mockProducts = []
let mockCategories = []
const mockListeners = new Set()

function emitMockStoreChange() {
  mockListeners.forEach((listener) => listener())
}

jest.mock('@/hooks/useOperationsStore.js', () => ({
  useInventoryProducts: () => {
    const React = require('react')

    return React.useSyncExternalStore(
      (listener) => {
        mockListeners.add(listener)
        return () => mockListeners.delete(listener)
      },
      () => mockProducts,
      () => mockProducts
    )
  },
  usePublishedCatalogProducts: () => {
    const React = require('react')

    return React.useSyncExternalStore(
      (listener) => {
        mockListeners.add(listener)
        return () => mockListeners.delete(listener)
      },
      () => mockProducts.filter((product) => product.status === 'published'),
      () => mockProducts.filter((product) => product.status === 'published')
    )
  },
  useCatalogCategories: () => {
    const React = require('react')

    return React.useSyncExternalStore(
      (listener) => {
        mockListeners.add(listener)
        return () => mockListeners.delete(listener)
      },
      () => mockCategories,
      () => mockCategories
    )
  },
}))

function buildProducts() {
  return [
    {
      id: 'p1',
      name: 'Castrol GTX 10W-40 (4L)',
      category: 'Lubricants',
      price: 895,
      stock: 48,
      sku: 'LUB-001',
      status: 'published',
      publishedAt: '2026-04-01T09:15:00.000Z',
      createdAt: '2026-04-01T09:00:00.000Z',
    },
    {
      id: 'p9',
      name: 'Premium Valve Cap Set',
      category: 'Accessories',
      price: 250,
      stock: 0,
      sku: '',
      status: 'published',
      publishedAt: '2026-04-08T10:05:00.000Z',
      createdAt: '2026-04-08T10:00:00.000Z',
    },
    {
      id: 'p10',
      name: 'Hidden Draft Cleaner',
      category: 'Detailing',
      price: 640,
      stock: 9,
      sku: 'DET-404',
      status: 'draft',
      publishedAt: null,
      createdAt: '2026-04-09T12:00:00.000Z',
    },
  ]
}

describe('Shop', () => {
  beforeEach(() => {
    mockProducts = buildProducts()
    mockCategories = ['Accessories', 'Detailing', 'Lubricants']
    mockListeners.clear()
  })

  it('shows only published products and keeps zero-stock products visible as out of stock', () => {
    renderWithProviders(<Shop />)

    expect(screen.getByText(/castrol gtx 10w-40 \(4l\)/i)).toBeInTheDocument()
    expect(screen.getByText(/premium valve cap set/i)).toBeInTheDocument()
    expect(screen.queryByText(/hidden draft cleaner/i)).not.toBeInTheDocument()
    expect(screen.getAllByText(/out of stock/i).length).toBeGreaterThan(0)
  })

  it('sorts by price low to high', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Shop />)

    await user.selectOptions(screen.getByLabelText(/sort products/i), 'price-low')

    const productTitles = screen.getAllByTestId('shop-product-title').map((node) => node.textContent)
    expect(productTitles).toEqual([
      'Premium Valve Cap Set',
      'Castrol GTX 10W-40 (4L)',
    ])
  })

  it('removes an archived product from the customer shop and its cart entry while repricing from live catalog data', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Shop />)

    await user.click(screen.getByRole('button', { name: /add castrol gtx 10w-40 \(4l\) to cart/i }))
    await user.click(screen.getByRole('button', { name: /^cart$/i }))

    const cartDrawer = screen.getByLabelText(/shopping cart drawer/i)

    expect(within(cartDrawer).getByText(/castrol gtx 10w-40 \(4l\)/i)).toBeInTheDocument()
    expect(within(cartDrawer).getAllByText(/895/).length).toBeGreaterThan(0)

    act(() => {
      mockProducts = mockProducts.map((product) =>
        product.id === 'p1' ? { ...product, price: 1295 } : product
      )
      emitMockStoreChange()
    })

    const repricedCartDrawer = screen.getByLabelText(/shopping cart drawer/i)
    expect(within(repricedCartDrawer).getAllByText(/1,295/).length).toBeGreaterThan(0)

    act(() => {
      mockProducts = mockProducts.map((product) =>
        product.id === 'p1' ? { ...product, status: 'archived' } : product
      )
      emitMockStoreChange()
    })

    expect(screen.queryByText(/castrol gtx 10w-40 \(4l\)/i)).not.toBeInTheDocument()
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
  })
})

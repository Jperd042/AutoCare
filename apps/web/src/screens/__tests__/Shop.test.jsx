import React from 'react'
import userEvent from '@testing-library/user-event'
import { act, screen, within } from '@testing-library/react'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import Shop from '../Shop.js'

let mockState
let receiptCounter = 1
const mockListeners = new Set()

function withDerivedState(state) {
  return {
    ...state,
    publishedProducts: state.products.filter((product) => product.status === 'published'),
  }
}

function updateMockState(updater) {
  const nextState = typeof updater === 'function' ? updater(mockState) : updater
  mockState = withDerivedState(nextState)
}

const checkoutCartMock = jest.fn((payload) => {
  const productsById = new Map(mockState.products.map((product) => [product.id, product]))
  const normalizedItems = payload.items.map((item) => {
    const product = productsById.get(item.productId)

    if (!product) {
      throw new Error(`Product ${item.productId} does not exist.`)
    }

    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}.`)
    }

    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: product.price,
    }
  })

  updateMockState((current) => ({
    ...current,
    products: current.products.map((product) => {
      const matchedItem = normalizedItems.find((item) => item.productId === product.id)
      if (!matchedItem) {
        return product
      }

      return {
        ...product,
        stock: product.stock - matchedItem.quantity,
      }
    }),
  }))

  emitMockStoreChange()

  const receipt = {
    id: `co-${String(receiptCounter).padStart(4, '0')}`,
    customerId: payload.customerId,
    items: normalizedItems,
  }

  receiptCounter += 1
  return receipt
})

function emitMockStoreChange() {
  mockListeners.forEach((listener) => listener())
}

function subscribeMockStore(listener) {
  mockListeners.add(listener)
  return () => mockListeners.delete(listener)
}

function getPublishedProductsSnapshot() {
  return mockState.publishedProducts
}

function getCategoriesSnapshot() {
  return mockState.categories
}

jest.mock('@autocare/shared', () => ({
  checkoutCart: (payload) => checkoutCartMock(payload),
}))

jest.mock('@/hooks/useOperationsStore.js', () => {
  const React = require('react')

  return {
    useInventoryProducts: () => {
      throw new Error('Shop should not use useInventoryProducts')
    },
    usePublishedCatalogProducts: () =>
      React.useSyncExternalStore(
        subscribeMockStore,
        getPublishedProductsSnapshot,
        getPublishedProductsSnapshot
      ),
    useCatalogCategories: () =>
      React.useSyncExternalStore(
        subscribeMockStore,
        getCategoriesSnapshot,
        getCategoriesSnapshot
      ),
  }
})

function buildState() {
  return {
    products: [
      {
        id: 'p1',
        name: 'Castrol GTX 10W-40 (4L)',
        category: 'Lubricants',
        price: 895,
        stock: 3,
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
    ],
    categories: ['Accessories', 'Electrical', 'Lubricants'],
  }
}

describe('Shop', () => {
  beforeEach(() => {
    mockState = withDerivedState(buildState())
    receiptCounter = 1
    checkoutCartMock.mockClear()
    mockListeners.clear()
  })

  it('uses published catalog hooks so only published products show while shared categories stay visible', () => {
    renderWithProviders(<Shop />)

    expect(screen.getByRole('button', { name: /electrical/i })).toBeInTheDocument()
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

  it('removes archived products from the customer shop and cart entry', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Shop />)

    await user.click(screen.getByRole('button', { name: /add castrol gtx 10w-40 \(4l\) to cart/i }))
    await user.click(screen.getByRole('button', { name: /^cart$/i }))

    expect(screen.getByLabelText(/shopping cart drawer/i)).toBeInTheDocument()

    act(() => {
      updateMockState((current) => ({
        ...current,
        products: current.products.map((product) =>
          product.id === 'p1' ? { ...product, status: 'archived' } : product
        ),
      }))
      emitMockStoreChange()
    })

    expect(screen.queryByText(/castrol gtx 10w-40 \(4l\)/i)).not.toBeInTheDocument()
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
  })

  it('reconciles cart quantities against live stock changes and checks out through the shared store', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Shop />)

    await user.click(screen.getByRole('button', { name: /add castrol gtx 10w-40 \(4l\) to cart/i }))
    await user.click(screen.getByRole('button', { name: /increase castrol gtx 10w-40 \(4l\) quantity/i }))

    const productQuantityControls = screen
      .getByRole('button', { name: /increase castrol gtx 10w-40 \(4l\) quantity/i })
      .parentElement

    expect(productQuantityControls).not.toBeNull()
    expect(within(productQuantityControls).getByText('2')).toBeInTheDocument()

    act(() => {
      updateMockState((current) => ({
        ...current,
        products: current.products.map((product) =>
          product.id === 'p1' ? { ...product, stock: 1 } : product
        ),
      }))
      emitMockStoreChange()
    })

    expect(within(productQuantityControls).getByText('1')).toBeInTheDocument()

    const increaseButton = screen.getByRole('button', { name: /increase castrol gtx 10w-40 \(4l\) quantity/i })
    expect(increaseButton).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /^cart$/i }))

    const cartDrawer = screen.getByLabelText(/shopping cart drawer/i)
    const cartIncreaseButton = within(cartDrawer).getByRole('button', {
      name: /increase castrol gtx 10w-40 \(4l\) quantity/i,
    })

    expect(cartIncreaseButton).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /proceed to invoice checkout/i }))
    await user.click(screen.getByRole('button', { name: /complete checkout/i }))

    expect(checkoutCartMock).toHaveBeenCalledWith({
      customerId: 'web-shop-customer',
      items: [{ productId: 'p1', quantity: 1 }],
    })
    expect(screen.getByText(/checkout complete/i)).toBeInTheDocument()
    expect(screen.getByText(/receipt co-0001 updated shared inventory stock/i)).toBeInTheDocument()
    expect(screen.getAllByText(/out of stock/i).length).toBeGreaterThan(0)
  })
})

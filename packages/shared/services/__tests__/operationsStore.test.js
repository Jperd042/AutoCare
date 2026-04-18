import { beforeEach, describe, expect, jest, test } from '@jest/globals'
import * as shared from '../../index.js'

describe('operations store', () => {
  beforeEach(() => {
    shared.resetOperationsState?.()
  })

  test('deducts stock when checkoutCart succeeds', () => {
    const before = shared.getInventoryProductsSnapshot?.()
    const tire = before.find((product) => product.id === 'p2')

    expect(tire?.stock).toBe(8)

    const receipt = shared.checkoutCart?.({
      customerId: 'lp1',
      items: [{ productId: 'p2', quantity: 4 }],
    })

    expect(receipt?.totalItems).toBe(4)
    expect(receipt?.id).toBe('co-0001')

    const after = shared.getInventoryProductsSnapshot?.()
    expect(after.find((product) => product.id === 'p2')?.stock).toBe(4)
    expect(shared.getLowStockProducts?.().some((product) => product.id === 'p2')).toBe(true)
  })

  test('aggregates duplicate checkout lines before validating stock', () => {
    expect(() =>
      shared.checkoutCart?.({
        customerId: 'lp1',
        items: [
          { productId: 'p2', quantity: 5 },
          { productId: 'p2', quantity: 4 },
        ],
      })
    ).toThrow(/Insufficient stock/i)

    expect(shared.getInventoryProductsSnapshot?.().find((product) => product.id === 'p2')?.stock).toBe(8)
  })

  test('creates a pending appointment from self-service booking data', () => {
    const created = shared.createAppointment?.({
      customerId: 'lp1',
      vehicleId: 'v1',
      slot: '2026-04-20T09:00:00',
      chosenServices: ['PMS 10,000 km Package'],
      notes: 'Please inspect front brakes too.',
      shopName: 'CruisersCrib Makati',
    })

    expect(created?.status).toBe('pending')
    expect(created?.jobOrderId).toBeNull()

    const appointments = shared.getAppointmentsSnapshot?.()
    expect(appointments.some((appointment) => appointment.id === created.id)).toBe(true)
  })

  test('rejects invalid appointment slots before sorting or job order conversion', () => {
    expect(() =>
      shared.createAppointment?.({
        customerId: 'lp1',
        vehicleId: 'v1',
        slot: 'not-a-date',
        chosenServices: ['PMS 10,000 km Package'],
        notes: '',
        shopName: 'CruisersCrib Makati',
      })
    ).toThrow(/slot/i)
  })

  test('converts an appointment into a job order lifecycle entry', () => {
    const created = shared.createAppointment?.({
      customerId: 'lp1',
      vehicleId: 'v1',
      slot: '2026-04-22T13:00:00',
      chosenServices: ['Oil Change (Engine Oil + Filter)'],
      notes: '',
      shopName: 'CruisersCrib BGC',
    })

    const converted = shared.convertAppointmentToJobOrder?.(created.id)

    expect(converted?.jobOrderId).toMatch(/^JO-2026-/)
    expect(converted?.serviceStage).toBe('intake')
    expect(converted?.status).toBe('confirmed')
  })

  test('published catalog snapshot returns only published products and keeps zero-stock items visible', () => {
    const published = shared.getPublishedCatalogProductsSnapshot?.()

    expect(Array.isArray(published)).toBe(true)
    expect(published.every((product) => product.status === 'published')).toBe(true)
    expect(published.some((product) => product.id === 'p8' && product.stock === 0 && product.sku === '')).toBe(true)
    expect(published.some((product) => product.status !== 'published')).toBe(false)
  })

  test('creates a catalog category and publishes a new product with optional sku and required catalog fields', () => {
    const category = shared.addCatalogCategory?.('Accessories')

    const created = shared.addInventoryProduct?.({
      category: 'Accessories',
      name: 'Ultra Fresh Cabin Filter',
      price: 1450,
      description: 'Activated carbon cabin filter for cleaner interior air.',
      images: ['https://mock.autocare.local/shop-products/ultra-fresh-cabin-filter.jpg'],
      stock: 12,
    })

    expect(category?.name).toBe('Accessories')
    expect(shared.getCatalogCategoriesSnapshot?.().some((item) => item.id === category.id)).toBe(true)
    expect(created?.id).toBe('p9')
    expect(created?.categoryId).toBe(category.id)
    expect(created?.sku).toBe('')
    expect(created?.status).toBe('published')
    expect(created?.publishedAt).toEqual(expect.any(String))
    expect(created?.description).toBe('Activated carbon cabin filter for cleaner interior air.')
    expect(created?.images).toEqual(['https://mock.autocare.local/shop-products/ultra-fresh-cabin-filter.jpg'])
    expect(created?.stock).toBe(12)
    expect(shared.getPublishedCatalogProductsSnapshot?.().some((product) => product.id === created.id)).toBe(true)
  })

  test('resolves catalog categories by normalized casing and spacing when creating inventory products', () => {
    const category = shared.addCatalogCategory?.('Accessories')

    const created = shared.addInventoryProduct?.({
      category: '  ACCESSORIES  ',
      name: 'Accessory Organizer Tray',
      price: 950,
      description: 'Compact organizer tray for loose interior items.',
      images: ['https://mock.autocare.local/shop-products/accessory-organizer-tray.jpg'],
      stock: 4,
    })

    expect(created?.categoryId).toBe(category.id)
  })

  test('archives a product and removes it from the published catalog snapshot', () => {
    const archived = shared.archiveInventoryProduct?.('p1')
    const published = shared.getPublishedCatalogProductsSnapshot?.()
    const inventory = shared.getInventoryProductsSnapshot?.()

    expect(archived?.id).toBe('p1')
    expect(archived?.status).toBe('archived')
    expect(published.some((product) => product.id === 'p1')).toBe(false)
    expect(inventory.find((product) => product.id === 'p1')?.status).toBe('archived')
  })

  test('notifies subscribers when catalog categories and inventory products change', () => {
    const listener = jest.fn()
    const unsubscribe = shared.subscribeOperations?.(listener)

    const category = shared.addCatalogCategory?.('Accessories')
    const created = shared.addInventoryProduct?.({
      categoryId: category.id,
      name: 'Cabin Fresh Spray',
      price: 450,
      description: 'Fast-acting interior deodorizer.',
      images: ['https://mock.autocare.local/shop-products/cabin-fresh-spray.jpg'],
      stock: 9,
    })
    shared.archiveInventoryProduct?.(created.id)

    expect(listener).toHaveBeenCalledTimes(3)

    unsubscribe?.()
  })

  test('snapshot APIs return clones that do not mutate store state in place', () => {
    const products = shared.getInventoryProductsSnapshot?.()
    const categories = shared.getCatalogCategoriesSnapshot?.()
    const published = shared.getPublishedCatalogProductsSnapshot?.()

    products[0].stock = 999
    categories[0].name = 'Mutated Category'
    published[0].status = 'archived'
    published[0].images.push('https://example.test/mutated.jpg')

    expect(shared.getInventoryProductsSnapshot?.()[0].stock).not.toBe(999)
    expect(shared.getCatalogCategoriesSnapshot?.()[0].name).not.toBe('Mutated Category')
    expect(shared.getPublishedCatalogProductsSnapshot?.()[0].status).toBe('published')
    expect(shared.getPublishedCatalogProductsSnapshot?.()[0].images).not.toContain('https://example.test/mutated.jpg')
  })
})

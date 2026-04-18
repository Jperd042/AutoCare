import { beforeEach, describe, expect, test } from '@jest/globals'
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

    const after = shared.getInventoryProductsSnapshot?.()
    expect(after.find((product) => product.id === 'p2')?.stock).toBe(4)
    expect(shared.getLowStockProducts?.().some((product) => product.id === 'p2')).toBe(true)
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
})

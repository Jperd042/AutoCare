import { appointments as initialAppointments, shopProducts as initialProducts } from './mockData.js'

export const LOW_STOCK_THRESHOLD = 5

function cloneProducts() {
  return initialProducts.map((product) => ({ ...product }))
}

function cloneAppointments() {
  return initialAppointments.map((appointment) => ({
    ...appointment,
    chosenServices: [...appointment.chosenServices],
  }))
}

function buildInitialState() {
  return {
    products: cloneProducts(),
    appointments: cloneAppointments(),
    activity: [],
    counters: {
      appointment: initialAppointments.length + 1,
      checkout: 1,
      jobOrder: 7,
      activity: 1,
    },
  }
}

function getStore() {
  if (!globalThis.__AUTOCARE_OPERATIONS_STORE__) {
    globalThis.__AUTOCARE_OPERATIONS_STORE__ = {
      state: buildInitialState(),
      listeners: new Set(),
    }
  }

  return globalThis.__AUTOCARE_OPERATIONS_STORE__
}

function emitChange() {
  getStore().listeners.forEach((listener) => listener())
}

function addActivity(event) {
  const store = getStore()
  const nextEvent = {
    id: `evt-${store.state.counters.activity}`,
    createdAt: new Date().toISOString(),
    ...event,
  }

  store.state = {
    ...store.state,
    counters: {
      ...store.state.counters,
      activity: store.state.counters.activity + 1,
    },
    activity: [nextEvent, ...store.state.activity].slice(0, 12),
  }
}

export function subscribeOperations(listener) {
  const store = getStore()
  store.listeners.add(listener)

  return () => {
    store.listeners.delete(listener)
  }
}

export function getInventoryProductsSnapshot() {
  return getStore().state.products
}

export function getAppointmentsSnapshot() {
  return getStore().state.appointments
}

export function getOperationsActivitySnapshot() {
  return getStore().state.activity
}

export function getLowStockProducts(threshold = LOW_STOCK_THRESHOLD) {
  return getInventoryProductsSnapshot().filter((product) => product.stock < threshold)
}

export function checkoutCart({ customerId, items }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Cart must contain at least one item.')
  }

  const store = getStore()
  const productsById = new Map(store.state.products.map((product) => [product.id, product]))
  const normalizedItems = items.map((item) => {
    const product = productsById.get(item.productId)
    const quantity = Number(item.quantity)

    if (!product) {
      throw new Error(`Product ${item.productId} does not exist.`)
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error('Quantity must be greater than zero.')
    }

    if (product.stock < quantity) {
      throw new Error(`Insufficient stock for ${product.name}.`)
    }

    return {
      productId: product.id,
      name: product.name,
      quantity,
      unitPrice: product.price,
      subtotal: product.price * quantity,
    }
  })

  store.state = {
    ...store.state,
    counters: {
      ...store.state.counters,
      checkout: store.state.counters.checkout + 1,
    },
    products: store.state.products.map((product) => {
      const matchedItem = normalizedItems.find((item) => item.productId === product.id)

      if (!matchedItem) {
        return product
      }

      return {
        ...product,
        stock: product.stock - matchedItem.quantity,
      }
    }),
  }

  const receipt = {
    id: `co-${String(store.state.counters.checkout).padStart(4, '0')}`,
    customerId,
    totalItems: normalizedItems.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: normalizedItems.reduce((sum, item) => sum + item.subtotal, 0),
    items: normalizedItems,
  }

  addActivity({
    type: 'checkout',
    title: 'Mobile checkout completed',
    message: `${receipt.totalItems} item(s) sold from the customer app.`,
    referenceId: receipt.id,
  })

  emitChange()
  return receipt
}

export function createAppointment({
  customerId,
  vehicleId,
  slot,
  chosenServices,
  notes = '',
  shopName,
}) {
  if (!vehicleId || !slot || !Array.isArray(chosenServices) || chosenServices.length === 0 || !shopName) {
    throw new Error('Appointment details are incomplete.')
  }

  const store = getStore()
  const nextAppointment = {
    id: `a${store.state.counters.appointment}`,
    vehicleId,
    customerId,
    slot,
    status: 'pending',
    serviceStage: null,
    chosenServices: [...chosenServices],
    notes,
    shopName,
    jobOrderId: null,
  }

  store.state = {
    ...store.state,
    counters: {
      ...store.state.counters,
      appointment: store.state.counters.appointment + 1,
    },
    appointments: [...store.state.appointments, nextAppointment].sort(
      (left, right) => new Date(left.slot).getTime() - new Date(right.slot).getTime()
    ),
  }

  addActivity({
    type: 'appointment',
    title: 'Mobile booking received',
    message: `${chosenServices[0]} scheduled for ${slot}.`,
    referenceId: nextAppointment.id,
  })

  emitChange()
  return nextAppointment
}

export function convertAppointmentToJobOrder(appointmentId) {
  const store = getStore()
  const target = store.state.appointments.find((appointment) => appointment.id === appointmentId)

  if (!target) {
    throw new Error(`Appointment ${appointmentId} does not exist.`)
  }

  if (target.jobOrderId) {
    return target
  }

  const year = new Date(target.slot).getFullYear()
  const nextJobOrderId = `JO-${year}-${String(store.state.counters.jobOrder).padStart(3, '0')}`
  let convertedAppointment = null

  store.state = {
    ...store.state,
    counters: {
      ...store.state.counters,
      jobOrder: store.state.counters.jobOrder + 1,
    },
    appointments: store.state.appointments.map((appointment) => {
      if (appointment.id !== appointmentId) {
        return appointment
      }

      convertedAppointment = {
        ...appointment,
        jobOrderId: nextJobOrderId,
        status: 'confirmed',
        serviceStage: 'intake',
      }

      return convertedAppointment
    }),
  }

  addActivity({
    type: 'job-order',
    title: 'Appointment converted to job order',
    message: `${convertedAppointment.chosenServices[0]} now starts the service lifecycle.`,
    referenceId: convertedAppointment.jobOrderId,
  })

  emitChange()
  return convertedAppointment
}

const STAGE_ORDER = ['intake', 'in_repair', 'qc', 'ready']

export function updateAppointmentStage(appointmentId, stage) {
  if (!STAGE_ORDER.includes(stage)) {
    throw new Error(`Unknown service stage: ${stage}`)
  }

  const store = getStore()
  const target = store.state.appointments.find((a) => a.id === appointmentId)
  if (!target) {
    throw new Error(`Appointment ${appointmentId} does not exist.`)
  }

  const nextStatus = stage === 'ready' ? 'completed' : 'in_progress'
  let updated = null

  store.state = {
    ...store.state,
    appointments: store.state.appointments.map((a) => {
      if (a.id !== appointmentId) return a
      updated = { ...a, serviceStage: stage, status: nextStatus }
      return updated
    }),
  }

  addActivity({
    type: 'service-stage',
    title: 'Service stage updated',
    message: `${updated.chosenServices[0]} is now at ${stage.replace('_', ' ')}.`,
    referenceId: updated.jobOrderId ?? updated.id,
  })

  emitChange()
  return updated
}

export function resetOperationsState() {
  const store = getStore()
  store.state = buildInitialState()
  emitChange()
}

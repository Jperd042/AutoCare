'use client'

import { useSyncExternalStore } from 'react'
import {
  getAppointmentsSnapshot,
  getInventoryProductsSnapshot,
  getOperationsActivitySnapshot,
  subscribeOperations,
} from '@autocare/shared'

export function useInventoryProducts() {
  return useSyncExternalStore(
    subscribeOperations,
    getInventoryProductsSnapshot,
    getInventoryProductsSnapshot
  )
}

export function useAppointmentsStore() {
  return useSyncExternalStore(
    subscribeOperations,
    getAppointmentsSnapshot,
    getAppointmentsSnapshot
  )
}

export function useOperationsActivity() {
  return useSyncExternalStore(
    subscribeOperations,
    getOperationsActivitySnapshot,
    getOperationsActivitySnapshot
  )
}

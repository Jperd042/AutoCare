'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  Car,
  Gauge,
  PlusCircle,
  Search,
} from 'lucide-react'
import { useVehicles } from '@/hooks/useVehicles'
import RegisterVehicleModal from '@/components/RegisterVehicleModal'

const STATUS_META = {
  active: { label: 'Active', cls: 'badge-green' },
  maintenance: { label: 'Maintenance', cls: 'badge-orange' },
  inactive: { label: 'Inactive', cls: 'badge-gray' },
}

const overviewCardMeta = [
  {
    key: 'total',
    label: 'Total Vehicles',
    detail: 'Fleet records currently tracked in AutoCare',
    icon: Car,
    accent: '#ff7a00',
  },
  {
    key: 'active',
    label: 'Active Units',
    detail: 'Road-ready vehicles with no current hold',
    icon: Activity,
    accent: '#22c55e',
  },
  {
    key: 'maintenance',
    label: 'In Service',
    detail: 'Needs coordination from the admin team',
    icon: AlertTriangle,
    accent: '#f59e0b',
  },
  {
    key: 'mileage',
    label: 'Avg. Mileage',
    detail: 'Average tracked usage across visible records',
    icon: Gauge,
    accent: '#3b82f6',
  },
]

function OverviewCard({ icon: Icon, label, value, detail, accent, index }) {
  return (
    <motion.div
      custom={index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: index * 0.04, ease: 'easeOut' }}
      className="card p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">{label}</p>
          <p className="text-3xl font-bold text-ink-primary mt-3">{value}</p>
          <p className="text-xs text-ink-secondary mt-2 leading-5">{detail}</p>
        </div>
        <div
          className="w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accent}18`, borderColor: `${accent}33`, color: accent }}
        >
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  )
}

export default function VehicleRecords() {
  const { vehicles, loading } = useVehicles()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showRegister, setShowRegister] = useState(false)

  const filtered = useMemo(() => {
    return vehicles
      .filter((vehicle) => statusFilter === 'all' || vehicle.status === statusFilter)
      .filter((vehicle) => {
        const normalizedQuery = query.toLowerCase()

        return (
          vehicle.plate.toLowerCase().includes(normalizedQuery) ||
          vehicle.owner.toLowerCase().includes(normalizedQuery) ||
          vehicle.model.toLowerCase().includes(normalizedQuery)
        )
      })
  }, [query, statusFilter, vehicles])

  const summary = useMemo(() => {
    const activeCount = vehicles.filter((vehicle) => vehicle.status === 'active').length
    const maintenanceCount = vehicles.filter((vehicle) => vehicle.status === 'maintenance').length
    const inactiveCount = vehicles.filter((vehicle) => vehicle.status === 'inactive').length
    const averageMileage = vehicles.length
      ? Math.round(vehicles.reduce((sum, vehicle) => sum + vehicle.mileage, 0) / vehicles.length)
      : 0

    return {
      total: vehicles.length,
      active: activeCount,
      maintenance: maintenanceCount,
      inactive: inactiveCount,
      averageMileage,
    }
  }, [vehicles])

  const overviewCards = [
    { ...overviewCardMeta[0], value: summary.total },
    { ...overviewCardMeta[1], value: summary.active },
    { ...overviewCardMeta[2], value: summary.maintenance },
    { ...overviewCardMeta[3], value: `${summary.averageMileage.toLocaleString()} km` },
  ]

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="card p-6 md:p-7 relative overflow-hidden"
      >
        <div className="absolute inset-y-0 right-0 w-72 bg-gradient-to-l from-brand-orange/10 to-transparent pointer-events-none" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.24em] text-brand-orange font-semibold">Fleet Overview</p>
            <h1 className="text-3xl font-bold text-ink-primary mt-3">Vehicle records and status visibility</h1>
            <p className="text-sm text-ink-secondary mt-3 leading-6">
              Monitor active vehicles, service holds, and mileage trends from one cleaner admin workspace.
            </p>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface-raised/70 px-4 py-3 min-w-[210px]">
            <p className="text-xs uppercase tracking-[0.22em] text-ink-muted">Parked / Inactive</p>
            <p className="text-3xl font-bold text-ink-primary mt-2">{summary.inactive}</p>
            <p className="text-xs text-ink-secondary mt-2">Units temporarily unavailable for booking or service intake.</p>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 rounded-2xl bg-surface-raised animate-pulse" />
            ))
          : overviewCards.map(({ key, ...card }, index) => <OverviewCard key={key} index={index} {...card} />)}
      </section>

      <section className="card p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-raised border border-surface-border rounded-2xl px-3.5 py-3 flex-1 min-w-[220px] max-w-md">
            <Search size={15} className="text-ink-muted flex-shrink-0" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by plate, owner, or vehicle model"
              className="bg-transparent text-sm text-ink-secondary placeholder-ink-muted outline-none w-full"
              aria-label="Search vehicles"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', 'active', 'maintenance', 'inactive'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all capitalize ${
                  statusFilter === status
                    ? 'text-white border-transparent shadow-glow-sm'
                    : 'border-surface-border text-ink-muted hover:bg-surface-hover hover:text-ink-primary'
                }`}
                style={
                  statusFilter === status
                    ? { backgroundColor: '#ff7a00', borderColor: '#ff7a00' }
                    : undefined
                }
              >
                {status === 'all' ? `All (${vehicles.length})` : status}
              </button>
            ))}
          </div>

          <button type="button" className="btn-primary ml-auto" onClick={() => setShowRegister(true)}>
            <PlusCircle size={15} /> Register Vehicle
          </button>
        </div>
      </section>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]" aria-label="Vehicle records table">
            <thead>
              <tr className="text-left text-xs text-ink-muted border-b border-surface-border bg-surface-raised">
                <th className="px-5 py-3.5 font-semibold">Owner</th>
                <th className="px-5 py-3.5 font-semibold">Plate No.</th>
                <th className="px-5 py-3.5 font-semibold">Vehicle</th>
                <th className="px-5 py-3.5 font-semibold">Type</th>
                <th className="px-5 py-3.5 font-semibold">Year</th>
                <th className="px-5 py-3.5 font-semibold">Mileage</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {loading
                ? Array.from({ length: 5 }).map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {Array.from({ length: 7 }).map((__, cellIndex) => (
                        <td key={cellIndex} className="px-5 py-4">
                          <div className="h-3.5 bg-surface-raised rounded animate-pulse w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-ink-muted text-sm">
                        No vehicles match your current search or status filter.
                      </td>
                    </tr>
                  )
                  : filtered.map((vehicle) => {
                      const meta = STATUS_META[vehicle.status] ?? { label: vehicle.status, cls: 'badge-gray' }
                      const initials = vehicle.owner
                        .split(' ')
                        .map((word) => word[0])
                        .slice(0, 2)
                        .join('')

                      return (
                        <tr key={vehicle.id} className="hover:bg-surface-hover transition-colors cursor-pointer">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: 'rgba(255, 122, 0, 0.12)' }}
                              >
                                <span className="text-[10px] font-bold text-brand-orange">{initials}</span>
                              </div>
                              <span className="font-semibold text-ink-primary">{vehicle.owner}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl"
                              style={{ backgroundColor: 'rgba(255, 122, 0, 0.12)', color: '#ff7a00' }}
                            >
                              {vehicle.plate}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-ink-secondary">{vehicle.model}</td>
                          <td className="px-5 py-4"><span className="badge badge-gray">{vehicle.type}</span></td>
                          <td className="px-5 py-4 text-ink-secondary">{vehicle.year}</td>
                          <td className="px-5 py-4 text-ink-secondary tabular-nums">{vehicle.mileage.toLocaleString()} km</td>
                          <td className="px-5 py-4"><span className={`badge ${meta.cls}`}>{meta.label}</span></td>
                        </tr>
                      )
                    })}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 ? (
          <div className="px-5 py-3 border-t border-surface-border text-xs text-ink-muted flex flex-wrap items-center justify-between gap-2">
            <span>Showing {filtered.length} of {vehicles.length} records</span>
            <span>{summary.maintenance} vehicles currently tagged for maintenance coordination</span>
          </div>
        ) : null}
      </div>

      {showRegister ? (
        <RegisterVehicleModal
          onClose={() => setShowRegister(false)}
          onRegistered={() => setShowRegister(false)}
        />
      ) : null}
    </div>
  )
}

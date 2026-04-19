'use client'

import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Shield,
  ShoppingBag,
  Sparkles,
  Wrench,
} from 'lucide-react'
import {
  getMaintenanceAlerts,
  getVehicleSummary,
  timelineEvents,
  vehicles as allVehicles,
} from '@autocare/shared'

const eventMeta = {
  service: { icon: Wrench, color: '#22c55e', label: 'Service' },
  inspection: { icon: BadgeCheck, color: '#3b82f6', label: 'Inspection' },
  repair: { icon: Wrench, color: '#ff7a00', label: 'Repair' },
  alert: { icon: AlertTriangle, color: '#ef4444', label: 'Alert' },
  insurance: { icon: Shield, color: '#06b6d4', label: 'Insurance' },
  purchase: { icon: ShoppingBag, color: '#8b5cf6', label: 'Purchase' },
  admin: { icon: CalendarClock, color: '#94a3b8', label: 'Administrative' },
}

function InsightPanel({ vehicle, summary, alerts }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr,1fr]">
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl border border-brand-orange/20 bg-brand-orange/10 flex items-center justify-center">
            <Sparkles size={18} className="text-brand-orange" />
          </div>
          <div>
            <p className="card-title">Insight Card</p>
            <p className="text-xs text-ink-muted mt-1">Decision support explanation for the selected vehicle</p>
          </div>
        </div>
        <p className="text-sm text-ink-secondary leading-6">
          {summary}
        </p>
        <div className="mt-4 rounded-2xl border border-surface-border bg-surface-raised/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Why this matters</p>
          <p className="text-sm text-ink-secondary mt-2">
            Based on the current mileage, prior service history, and the latest verified events for {vehicle.owner},
            AutoCare surfaces maintenance context instead of leaving staff with raw timeline text only.
          </p>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="card-title">Vehicle Health</p>
            <p className="text-xs text-ink-muted mt-1">Color-coded expert-system status cards</p>
          </div>
          <span className="badge badge-orange">{alerts.length} alerts</span>
        </div>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-sm font-semibold text-ink-primary">Vehicle looks healthy</p>
              <p className="text-sm text-ink-secondary mt-1">No immediate maintenance alerts were generated for this record.</p>
            </div>
          ) : (
            alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className={`rounded-2xl p-4 border ${
                  alert.severity === 'High Priority'
                    ? 'border-red-500/20 bg-red-500/10'
                    : 'border-amber-500/20 bg-amber-500/10'
                }`}
              >
                <p className="text-sm font-semibold text-ink-primary">{alert.title}</p>
                <p className="text-sm text-ink-secondary mt-2">{alert.detail}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function TimelineCard({ event, isLast }) {
  const meta = eventMeta[event.type] || eventMeta.admin
  const Icon = meta.icon

  return (
    <div className="relative pl-12">
      {!isLast ? <div className="absolute left-[19px] top-10 bottom-0 w-px bg-surface-border" /> : null}
      <div
        className="absolute left-0 top-1 w-10 h-10 rounded-2xl border flex items-center justify-center"
        style={{ backgroundColor: `${meta.color}12`, borderColor: `${meta.color}33`, color: meta.color }}
      >
        <Icon size={16} />
      </div>
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="badge badge-gray">{meta.label}</span>
            {event.isVerified ? <span className="badge badge-green">Verified</span> : null}
          </div>
          <p className="text-xs text-ink-muted">{event.date}</p>
        </div>
        <p className="text-sm text-ink-primary leading-6">{event.description}</p>
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-ink-secondary">
          {event.technicianName ? <span>Technician: {event.technicianName}</span> : null}
          {event.jobOrderId ? <span>JO: {event.jobOrderId}</span> : null}
          {event.isVerified ? <span className="inline-flex items-center gap-1 text-brand-orange">View record <ArrowRight size={12} /></span> : null}
        </div>
      </div>
    </div>
  )
}

export default function VehicleTimeline() {
  const [selectedVehicleId, setSelectedVehicleId] = useState(allVehicles[0]?.id || '')
  const vehicle = allVehicles.find((item) => item.id === selectedVehicleId) || allVehicles[0]

  const history = useMemo(
    () =>
      timelineEvents
        .filter((event) => event.vehicleId === vehicle.id)
        .sort((left, right) => new Date(right.date) - new Date(left.date)),
    [vehicle.id],
  )

  const summary = getVehicleSummary(vehicle, history)
  const alerts = getMaintenanceAlerts(vehicle, history)

  return (
    <div className="space-y-6 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-3xl font-bold text-ink-primary">Vehicle Timeline</p>
            <p className="text-sm text-ink-muted mt-2">A cleaner chronological service view with expert-system context built into the timeline.</p>
          </div>
          <select
            value={selectedVehicleId}
            onChange={(event) => setSelectedVehicleId(event.target.value)}
            className="select ml-auto max-w-sm"
          >
            {allVehicles.map((item) => (
              <option key={item.id} value={item.id}>
                {item.plate} - {item.owner}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      <InsightPanel vehicle={vehicle} summary={summary} alerts={alerts} />

      <div className="space-y-4">
        {history.map((event, index) => (
          <TimelineCard key={event.id} event={event} isLast={index === history.length - 1} />
        ))}
      </div>
    </div>
  )
}

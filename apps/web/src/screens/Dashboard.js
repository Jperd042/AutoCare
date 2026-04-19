'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  Car,
  Clock3,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wrench,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAppointments } from '@/hooks/useAppointments'
import { useVehicles } from '@/hooks/useVehicles'
import { useUser } from '@/lib/userContext.jsx'
import {
  bookingVolume,
  getMaintenanceAlerts,
  getRecommendation,
  monthlyRevenue,
  peakHourData,
  shopProducts,
  timelineEvents,
} from '@autocare/shared'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, delay: index * 0.05, ease: 'easeOut' },
  }),
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function CardSkeleton() {
  return <div className="h-28 rounded-2xl bg-surface-raised animate-pulse" />
}

function StatCard({ icon: Icon, label, value, detail, accent, index }) {
  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={fadeIn}>
      <div className="card p-5 h-full">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-ink-muted">{label}</p>
            <p className="text-3xl font-bold text-ink-primary mt-3">{value}</p>
            <p className="text-xs text-ink-secondary mt-2">{detail}</p>
          </div>
          <div
            className="w-12 h-12 rounded-2xl border flex items-center justify-center"
            style={{ backgroundColor: `${accent}1A`, borderColor: `${accent}33`, color: accent }}
          >
            <Icon size={20} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function InsightCard({ title, detail, badge, accent = '#ff7a00', index }) {
  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={fadeIn}>
      <div className="card p-5 h-full">
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${accent}14`, borderColor: `${accent}33`, color: accent }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <p className="text-sm font-semibold text-ink-primary">{title}</p>
              {badge ? <span className="badge badge-orange">{badge}</span> : null}
            </div>
            <p className="text-sm text-ink-secondary leading-6">{detail}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="card-title">{title}</p>
          <p className="text-xs text-ink-muted mt-1">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const user = useUser()
  const { vehicles, loading: vehiclesLoading } = useVehicles()
  const { appointments, loading: appointmentsLoading } = useAppointments()

  const firstName = user?.name?.split(' ')[0] ?? 'Admin'
  const pendingAppointments = appointments.filter((appointment) => appointment.status === 'pending')
  const activeBookings = appointments.filter((appointment) =>
    ['confirmed', 'pending', 'in_progress'].includes(appointment.status),
  ).length
  const lowStockProducts = shopProducts.filter((product) => product.stock < 10)
  const urgentAlerts = vehicles.flatMap((vehicle) =>
    getMaintenanceAlerts(
      vehicle,
      timelineEvents.filter((event) => event.vehicleId === vehicle.id),
    ),
  )

  const recommendationInsights = appointments
    .map((appointment) => {
      const vehicle = vehicles.find((item) => item.id === appointment.vehicleId)
      return getRecommendation(
        appointment,
        vehicle,
        timelineEvents.filter((event) => event.vehicleId === appointment.vehicleId),
      )
    })
    .filter(Boolean)

  const statusCards = [
    {
      icon: CalendarCheck,
      label: 'Active Bookings',
      value: activeBookings,
      detail: `${pendingAppointments.length} still awaiting approval`,
      accent: '#ff7a00',
    },
    {
      icon: AlertTriangle,
      label: 'Maintenance Alerts',
      value: urgentAlerts.length,
      detail: 'Vehicles with upcoming or overdue service needs',
      accent: '#ef4444',
    },
    {
      icon: ShieldCheck,
      label: 'Low Stock Risks',
      value: lowStockProducts.length,
      detail: 'Inventory lines that need replenishment attention',
      accent: '#f59e0b',
    },
    {
      icon: TrendingUp,
      label: '6-Month Revenue',
      value: `PHP ${Math.round(monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0) / 1000)}k`,
      detail: 'Combined service and parts revenue',
      accent: '#22c55e',
    },
  ]

  const insightCards = [
    urgentAlerts[0]
      ? {
          title: 'Expert System Insight',
          detail: urgentAlerts[0].detail,
          badge: urgentAlerts[0].severity,
          accent: urgentAlerts[0].severity === 'High Priority' ? '#ef4444' : '#ff7a00',
        }
      : null,
    recommendationInsights[0]
      ? {
          title: 'Recommended Upsell',
          detail: recommendationInsights[0].message,
          badge: recommendationInsights[0].suggestedService,
          accent: '#3b82f6',
        }
      : null,
    pendingAppointments[0]
      ? {
          title: 'Operational Focus',
          detail: `${pendingAppointments[0].chosenServices.join(', ')} needs confirmation for ${new Date(
            pendingAppointments[0].slot,
          ).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.`,
          badge: 'Pending',
          accent: '#f59e0b',
        }
      : null,
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="card p-6 md:p-7 overflow-hidden relative"
      >
        <div className="absolute inset-y-0 right-0 w-72 bg-gradient-to-l from-brand-orange/10 to-transparent pointer-events-none" />
        <div className="relative">
          <p className="text-sm uppercase tracking-[0.24em] text-brand-orange font-semibold">Operations Overview</p>
          <h1 className="text-3xl font-bold text-ink-primary mt-3">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-sm text-ink-secondary mt-3 max-w-2xl leading-6">
            Your AutoCare dashboard now surfaces vehicle health, booking workload, and expert-system guidance in one
            cleaner workspace.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link href="/bookings" className="btn-primary">
              <CalendarCheck size={15} />
              Review Bookings
            </Link>
            <Link href="/timeline" className="btn-ghost">
              <Sparkles size={15} />
              Open Timeline Insights
            </Link>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {vehiclesLoading || appointmentsLoading
          ? Array.from({ length: 4 }).map((_, index) => <CardSkeleton key={index} />)
          : statusCards.map((card, index) => <StatCard key={card.label} index={index} {...card} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {insightCards.map((card, index) => (
          <InsightCard key={`${card.title}-${index}`} index={index} {...card} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Revenue Trend" subtitle="Monthly service and parts sales">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff7a00" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#ff7a00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#223047" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#ff7a00" fill="url(#revenueFill)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Booking Mix" subtitle="Most requested service categories">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bookingVolume}>
              <CartesianGrid stroke="#223047" vertical={false} />
              <XAxis dataKey="type" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#f5b84d" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <ChartCard title="Peak Hour Analysis" subtitle="Average bookings by hour">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={peakHourData}>
              <CartesianGrid stroke="#223047" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="bookings" fill="#3b82f6" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="card-title">Priority Watchlist</p>
              <p className="text-xs text-ink-muted mt-1">Items that need action soonest</p>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-brand-orange inline-flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {urgentAlerts.slice(0, 2).map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={15} className="text-red-400" />
                  <p className="text-sm font-semibold text-ink-primary">{alert.title}</p>
                </div>
                <p className="text-sm text-ink-secondary">{alert.detail}</p>
              </div>
            ))}
            {lowStockProducts.slice(0, 2).map((product) => (
              <div key={product.id} className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock3 size={15} className="text-amber-400" />
                  <p className="text-sm font-semibold text-ink-primary">{product.name}</p>
                </div>
                <p className="text-sm text-ink-secondary">{product.stock} left in stock. Reorder before the next booking spike.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

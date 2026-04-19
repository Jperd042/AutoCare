'use client'

import { useMemo, useState } from 'react'
import {
  Award,
  BadgePercent,
  CalendarClock,
  Gift,
  History,
  Plus,
  Search,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import {
  loyaltyAccounts,
  loyaltyDeals,
  redemptionLog,
  rewardCatalog,
} from '@autocare/shared'

const tierMeta = {
  Bronze: { members: 342, minPoints: 0, discount: '5%', tone: 'badge-orange' },
  Silver: { members: 156, minPoints: 500, discount: '10%', tone: 'badge-gray' },
  Gold: { members: 87, minPoints: 1000, discount: '15%', tone: 'badge-gold' },
  Platinum: { members: 23, minPoints: 2000, discount: '20%', tone: 'badge-blue' },
}

const defaultDealForm = {
  title: '',
  targetTier: 'Gold',
  discountType: 'percentage',
  discountValue: '15',
  code: '',
  validUntil: '',
  summary: '',
  status: 'active',
}

function SurfaceCard({ children, className = '' }) {
  return <div className={`card p-5 ${className}`}>{children}</div>
}

function StatCard({ icon: Icon, label, value, meta, accentClass }) {
  return (
    <SurfaceCard className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-ink-muted">{label}</p>
        <p className="text-3xl font-bold text-ink-primary mt-3">{value}</p>
        {meta ? <p className="text-xs text-emerald-400 mt-2">{meta}</p> : null}
      </div>
      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${accentClass}`}>
        <Icon size={20} />
      </div>
    </SurfaceCard>
  )
}

function TierOverview() {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {Object.entries(tierMeta).map(([tier, meta]) => (
        <SurfaceCard key={tier} className="bg-surface-card/95">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-orange/12 border border-brand-orange/15 flex items-center justify-center">
              <Trophy size={18} className="text-brand-orange" />
            </div>
            <div>
              <p className="text-lg font-semibold text-ink-primary">{tier}</p>
              <p className="text-xs text-ink-muted">{meta.members} members</p>
            </div>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-ink-muted">Min. Points</dt>
              <dd className="font-semibold text-ink-primary">{meta.minPoints}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-muted">Discount</dt>
              <dd className="font-semibold text-brand-orange">{meta.discount}</dd>
            </div>
          </dl>
        </SurfaceCard>
      ))}
    </div>
  )
}

function DealsTab() {
  const [deals, setDeals] = useState(loyaltyDeals)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(defaultDealForm)

  function resetForm() {
    setForm(defaultDealForm)
  }

  function handleSaveDeal() {
    setDeals((currentDeals) => [
      {
        id: `ld${Date.now()}`,
        title: form.title.trim(),
        targetTiers: [form.targetTier],
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        code: form.code.trim().toUpperCase(),
        validUntil: form.validUntil,
        status: form.status,
        summary: form.summary.trim(),
      },
      ...currentDeals,
    ])

    resetForm()
    setShowCreate(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-ink-primary">Discount Deals</p>
          <p className="text-sm text-ink-muted">Create tier-targeted promos that feel premium, simple, and trackable.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="btn-primary"
        >
          <Plus size={15} />
          Create Deal
        </button>
      </div>

      {showCreate ? (
        <SurfaceCard className="border-brand-orange/20 bg-brand-orange/5">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <p className="card-title">New Discount Deal</p>
              <p className="text-sm text-ink-muted mt-1">Build a clean, member-targeted promo with a clear validity window.</p>
            </div>
            <button type="button" className="btn-ghost" onClick={() => { resetForm(); setShowCreate(false) }}>Cancel</button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="deal-title" className="label">Deal Title</label>
              <input
                id="deal-title"
                aria-label="Deal Title"
                className="input"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Gold PMS Weekend"
              />
            </div>

            <div>
              <label htmlFor="deal-target-tier" className="label">Target Tier</label>
              <select
                id="deal-target-tier"
                aria-label="Target Tier"
                className="select"
                value={form.targetTier}
                onChange={(event) => setForm((current) => ({ ...current, targetTier: event.target.value }))}
              >
                {Object.keys(tierMeta).map((tier) => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="deal-discount-type" className="label">Discount Type</label>
              <select
                id="deal-discount-type"
                aria-label="Discount Type"
                className="select"
                value={form.discountType}
                onChange={(event) => setForm((current) => ({ ...current, discountType: event.target.value }))}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label htmlFor="deal-discount-value" className="label">Discount Value</label>
              <input
                id="deal-discount-value"
                aria-label="Discount Value"
                type="number"
                className="input"
                value={form.discountValue}
                onChange={(event) => setForm((current) => ({ ...current, discountValue: event.target.value }))}
                placeholder="15"
              />
            </div>

            <div>
              <label htmlFor="deal-code" className="label">Promo Code</label>
              <input
                id="deal-code"
                aria-label="Promo Code"
                className="input"
                value={form.code}
                onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
                placeholder="GOLD15"
              />
            </div>

            <div>
              <label htmlFor="deal-valid-until" className="label">Valid Until</label>
              <input
                id="deal-valid-until"
                aria-label="Valid Until"
                type="date"
                className="input"
                value={form.validUntil}
                onChange={(event) => setForm((current) => ({ ...current, validUntil: event.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="deal-status" className="label">Status</label>
              <select
                id="deal-status"
                aria-label="Deal Status"
                className="select"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="deal-summary" className="label">Deal Summary</label>
              <textarea
                id="deal-summary"
                aria-label="Deal Summary"
                className="input min-h-[110px]"
                value={form.summary}
                onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
                placeholder="Weekend-only PMS discount for gold members."
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleSaveDeal}
              disabled={!form.title || !form.code || !form.validUntil || !form.summary}
              className="btn-primary disabled:opacity-50"
            >
              <Sparkles size={15} />
              Save Deal
            </button>
          </div>
        </SurfaceCard>
      ) : null}

      <SurfaceCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm" aria-label="Discount deals table">
            <thead>
              <tr className="bg-surface-raised text-left text-xs uppercase tracking-[0.18em] text-ink-muted">
                <th className="px-5 py-4 font-semibold">Deal</th>
                <th className="px-5 py-4 font-semibold">Tier</th>
                <th className="px-5 py-4 font-semibold">Value</th>
                <th className="px-5 py-4 font-semibold">Code</th>
                <th className="px-5 py-4 font-semibold">Valid Until</th>
                <th className="px-5 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink-primary">{deal.title}</p>
                    <p className="text-xs text-ink-muted mt-1">{deal.summary}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-secondary">{deal.targetTiers.join(', ')}</td>
                  <td className="px-5 py-4 font-semibold text-brand-orange">
                    {deal.discountType === 'percentage' ? `${deal.discountValue}%` : `PHP ${deal.discountValue}`}
                  </td>
                  <td className="px-5 py-4 text-ink-primary font-mono">{deal.code}</td>
                  <td className="px-5 py-4 text-ink-secondary">{deal.validUntil}</td>
                  <td className="px-5 py-4">
                    <span className={`badge ${deal.status === 'active' ? 'badge-green' : deal.status === 'draft' ? 'badge-orange' : 'badge-gray'}`}>
                      {deal.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  )
}

function MembersTab() {
  const [query, setQuery] = useState('')

  const filteredAccounts = useMemo(
    () => loyaltyAccounts.filter((account) => account.owner.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-2xl border border-surface-border bg-surface-raised px-4 py-3 w-full max-w-sm">
          <Search size={15} className="text-ink-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customer..."
            className="bg-transparent outline-none w-full text-sm text-ink-secondary placeholder:text-ink-muted"
          />
        </div>
      </div>

      <SurfaceCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-surface-raised text-left text-xs uppercase tracking-[0.18em] text-ink-muted">
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Tier</th>
                <th className="px-5 py-4 font-semibold">Points</th>
                <th className="px-5 py-4 font-semibold">Next Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-5 py-4 font-semibold text-ink-primary">{account.owner}</td>
                  <td className="px-5 py-4">
                    <span className={`badge ${tierMeta[account.tier]?.tone || 'badge-gray'}`}>{account.tier}</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-brand-orange">{account.points.toLocaleString()}</td>
                  <td className="px-5 py-4 text-ink-secondary">
                    {account.points >= 1000 ? 'Free Oil Change' : 'PMS Discount 20%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  )
}

function RewardsTab() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {rewardCatalog.map((reward) => (
        <SurfaceCard key={reward.id}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-ink-primary">{reward.name}</p>
              <p className="text-sm text-ink-muted mt-1">
                {reward.type === 'discount' ? 'Discount promo' : 'Service reward'} for {reward.pointsRequired} points
              </p>
            </div>
            <span className={`badge ${reward.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
              {reward.status}
            </span>
          </div>
        </SurfaceCard>
      ))}
    </div>
  )
}

function RedemptionTab() {
  return (
    <SurfaceCard className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-surface-raised text-left text-xs uppercase tracking-[0.18em] text-ink-muted">
              <th className="px-5 py-4 font-semibold">Customer</th>
              <th className="px-5 py-4 font-semibold">Reward</th>
              <th className="px-5 py-4 font-semibold">Points Used</th>
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {redemptionLog.map((entry) => (
              <tr key={entry.id} className="hover:bg-surface-hover transition-colors">
                <td className="px-5 py-4 font-semibold text-ink-primary">{entry.customerName}</td>
                <td className="px-5 py-4 text-ink-secondary">{entry.rewardName}</td>
                <td className="px-5 py-4 font-semibold text-brand-orange">{entry.pointsUsed}</td>
                <td className="px-5 py-4 text-ink-secondary">{entry.date}</td>
                <td className="px-5 py-4">
                  <span className={`badge ${entry.status === 'used' ? 'badge-gray' : 'badge-orange'}`}>{entry.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  )
}

export default function LoyaltyManager() {
  const [activeTab, setActiveTab] = useState('deals')

  const statCards = [
    { icon: Users, label: 'Total Members', value: '608', meta: '+8% from last month', accentClass: 'bg-brand-orange/10 border-brand-orange/15 text-brand-orange' },
    { icon: Trophy, label: 'Active Platinum', value: '23', meta: 'Highest tier members', accentClass: 'bg-blue-500/10 border-blue-500/15 text-blue-400' },
    { icon: Gift, label: 'Points Redeemed', value: '12,450', meta: 'Across all promos', accentClass: 'bg-amber-500/10 border-amber-500/15 text-amber-400' },
    { icon: BadgePercent, label: 'Avg. Tier Value', value: 'PHP 8,340', meta: 'Estimated customer value', accentClass: 'bg-emerald-500/10 border-emerald-500/15 text-emerald-400' },
  ]

  const tabs = [
    { key: 'deals', label: 'Discount Deals', icon: BadgePercent },
    { key: 'members', label: 'Customer Accounts', icon: Users },
    { key: 'rewards', label: 'Reward Catalog', icon: Award },
    { key: 'redemptions', label: 'Redemption Log', icon: History },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-3xl font-bold text-ink-primary">Loyalty & Rewards</p>
          <p className="text-sm text-ink-muted mt-2">Manage tier perks, member deals, redemptions, and high-value promotions in one clean workspace.</p>
        </div>
        <button className="btn-primary">
          <CalendarClock size={15} />
          Send Rewards
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <TierOverview />

      <div className="flex flex-wrap gap-2 rounded-2xl border border-surface-border bg-surface-card p-2 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = tab.key === activeTab

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                active ? 'bg-brand-orange text-white shadow-glow-sm' : 'text-ink-muted hover:bg-surface-hover hover:text-ink-primary'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'deals' ? <DealsTab /> : null}
      {activeTab === 'members' ? <MembersTab /> : null}
      {activeTab === 'rewards' ? <RewardsTab /> : null}
      {activeTab === 'redemptions' ? <RedemptionTab /> : null}
    </div>
  )
}
